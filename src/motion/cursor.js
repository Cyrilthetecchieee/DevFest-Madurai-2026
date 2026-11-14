/**
 * Fluid Ring Cursor, Magnetic Controls & Touch Ripple Feedback (S11)
 * - Active ring cursor on pointer:fine desktop devices with dynamic action labels.
 * - Subtle magnetic translation on buttons/links marked [data-magnetic] or .btn-discover.
 * - Cyan/violet shockwave touch ripples on mobile & click feedback on desktop.
 * - Automatically suspends when prefers-reduced-motion or HUD Motion OFF is set.
 */
import { prefersReducedMotion } from '../utils/env.js';
import { stageBus } from './stageBus.js';

export function initFluidCursor() {
  if (prefersReducedMotion()) return { setPaused() {}, destroy() {} };

  const finePointer = window.matchMedia?.('(pointer: fine)').matches ?? false;
  let paused = false;

  // Create lightweight ripple layer (touch + click)
  const rippleHost = document.createElement('div');
  rippleHost.id = 'hud-ripple-layer';
  rippleHost.setAttribute('aria-hidden', 'true');
  document.body.appendChild(rippleHost);

  function spawnRipple(x, y, accent = 'cyan') {
    if (paused) return;
    const dot = document.createElement('span');
    dot.className = `hud-touch-ripple hud-touch-ripple--${accent}`;
    dot.style.left = `${x}px`;
    dot.style.top = `${y}px`;
    rippleHost.appendChild(dot);
    window.setTimeout(() => dot.remove(), 680);
  }

  const onPointerDown = (e) => {
    spawnRipple(e.clientX, e.clientY, e.pointerType === 'touch' ? 'violet' : 'cyan');
  };
  window.addEventListener('pointerdown', onPointerDown, { passive: true });

  if (!finePointer) {
    return {
      setPaused(next) {
        paused = Boolean(next);
      },
      destroy() {
        window.removeEventListener('pointerdown', onPointerDown);
        rippleHost.remove();
      },
    };
  }

  // Morphing ring cursor for desktop pointer:fine
  const cursor = document.createElement('div');
  cursor.id = 'hud-cursor';
  cursor.setAttribute('aria-hidden', 'true');
  cursor.innerHTML = `<span class="hud-cursor-ring"></span><span class="hud-cursor-tag"></span>`;
  document.body.appendChild(cursor);
  const tagEl = cursor.querySelector('.hud-cursor-tag');

  let curX = window.innerWidth / 2;
  let curY = window.innerHeight / 2;
  let targetX = curX;
  let targetY = curY;
  let prevX = curX;
  let prevY = curY;
  let rafId = 0;
  let activeMagnet = null;

  const MAGNET_SELECTOR = '.btn-discover, .btn-secondary-hud, .hud-menu-btn, .hud-motion-btn, [data-magnetic]';

  function updateCursorLabel(target) {
    const labeled = target?.closest?.('[data-cursor-label]');
    const label = labeled?.getAttribute('data-cursor-label') || '';
    const interactive = target?.closest?.('a, button, [role="button"], input');
    cursor.classList.toggle('is-active', Boolean(interactive));
    cursor.classList.toggle('has-label', Boolean(label));
    if (tagEl && tagEl.textContent !== label) tagEl.textContent = label;
  }

  const onMove = (e) => {
    targetX = e.clientX;
    targetY = e.clientY;
    cursor.classList.add('is-visible');

    stageBus.pointerActive = true;
    stageBus.pointerX = e.clientX / Math.max(1, window.innerWidth);
    stageBus.pointerY = e.clientY / Math.max(1, window.innerHeight);

    updateCursorLabel(e.target);

    if (paused) return;
    const mag = e.target?.closest?.(MAGNET_SELECTOR);
    if (activeMagnet && activeMagnet !== mag) {
      activeMagnet.style.removeProperty('--mag-x');
      activeMagnet.style.removeProperty('--mag-y');
      activeMagnet.classList.remove('is-magnet-active');
    }
    activeMagnet = mag || null;
    if (mag) {
      const rect = mag.getBoundingClientRect();
      const dx = (e.clientX - (rect.left + rect.width / 2)) * 0.22;
      const dy = (e.clientY - (rect.top + rect.height / 2)) * 0.22;
      mag.style.setProperty('--mag-x', `${dx.toFixed(1)}px`);
      mag.style.setProperty('--mag-y', `${dy.toFixed(1)}px`);
      mag.classList.add('is-magnet-active');
    }
  };

  const onLeave = () => {
    cursor.classList.remove('is-visible');
    if (activeMagnet) {
      activeMagnet.style.removeProperty('--mag-x');
      activeMagnet.style.removeProperty('--mag-y');
      activeMagnet.classList.remove('is-magnet-active');
      activeMagnet = null;
    }
  };

  window.addEventListener('pointermove', onMove, { passive: true });
  document.addEventListener('pointerleave', onLeave, { passive: true });

  function tick() {
    if (!paused) {
      curX += (targetX - curX) * 0.24;
      curY += (targetY - curY) * 0.24;
      const vx = curX - prevX;
      const vy = curY - prevY;
      prevX = curX;
      prevY = curY;

      const speed = Math.min(1, Math.hypot(vx, vy) / 28);
      stageBus.pointerVx = vx;
      stageBus.pointerVy = vy;
      stageBus.pointerSpeed = stageBus.pointerSpeed * 0.85 + speed * 0.15;

      const stretch = 1 + speed * 0.18;
      cursor.style.transform = `translate3d(${curX.toFixed(1)}px, ${curY.toFixed(1)}px, 0) scale(${stretch.toFixed(3)})`;
    }
    rafId = window.requestAnimationFrame(tick);
  }
  rafId = window.requestAnimationFrame(tick);

  return {
    setPaused(next) {
      paused = Boolean(next);
      cursor.classList.toggle('is-paused', paused);
    },
    destroy() {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerleave', onLeave);
      cursor.remove();
      rippleHost.remove();
    },
  };
}
