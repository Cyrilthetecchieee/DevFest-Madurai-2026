/**
 * Kinetic Typography & Text Motion Controller
 * - Cursor-reactive hero display characters
 * - Interactive drag-flow oversized marquee bands with velocity skew
 * - Fast HUD glyph scramble decode (< 650ms) on scroll entry
 * - Subtle scroll outline-to-fill progression
 * - Mechanical drum-roll counter helper for countdown digits
 */
import { prefersReducedMotion } from '../utils/env.js';

const SCRAMBLE_GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/+-*';

function mountHeroKineticHeadline(root) {
  const heading = root.querySelector('.hero-main-heading');
  if (!heading) return () => {};

  const fullText = (heading.textContent || '').trim();
  if (!fullText) return () => {};

  heading.setAttribute('aria-label', fullText);
  heading.textContent = '';

  const chars = [];
  Array.from(fullText).forEach((ch) => {
    const span = document.createElement('span');
    span.className = ch === ' ' ? 'k-ch k-ch--space' : 'k-ch';
    span.setAttribute('aria-hidden', 'true');
    span.textContent = ch === ' ' ? '\u00A0' : ch;
    heading.appendChild(span);
    if (ch !== ' ') chars.push(span);
  });

  if (!chars.length) return () => {};

  const onMove = (e) => {
    const px = e.clientX;
    const py = e.clientY;
    chars.forEach((span) => {
      const r = span.getBoundingClientRect();
      const cx = r.left + r.width * 0.5;
      const cy = r.top + r.height * 0.5;
      const dist = Math.hypot(px - cx, py - cy);
      if (dist < 130) {
        const pull = 1 - dist / 130;
        const lift = -pull * 7.5;
        const scale = 1 + pull * 0.1;
        span.style.transform = `translate3d(0, ${lift.toFixed(1)}px, 0) scale(${scale.toFixed(3)})`;
        span.style.color = pull > 0.35 ? '#5ef3ff' : '#ffffff';
      } else if (span.style.transform) {
        span.style.transform = '';
        span.style.color = '';
      }
    });
  };

  const onLeave = () => {
    chars.forEach((span) => {
      span.style.transform = '';
      span.style.color = '';
    });
  };

  heading.addEventListener('pointermove', onMove, { passive: true });
  heading.addEventListener('pointerleave', onLeave, { passive: true });

  return () => {
    heading.removeEventListener('pointermove', onMove);
    heading.removeEventListener('pointerleave', onLeave);
    heading.textContent = fullText;
    heading.removeAttribute('aria-label');
  };
}

function runScramble(el) {
  if (el.dataset.scrambledDone === 'true') return;
  el.dataset.scrambledDone = 'true';

  const original = el.dataset.origText || el.textContent || '';
  el.dataset.origText = original;
  if (!original || prefersReducedMotion()) return;

  const durationMs = 520;
  const start = performance.now();

  const tick = (now) => {
    const t = Math.min(1, (now - start) / durationMs);
    const resolved = Math.floor(t * original.length);
    let out = '';
    for (let i = 0; i < original.length; i++) {
      const ch = original[i];
      if (ch === ' ' || ch === '/' || ch === '+' || ch === '·' || i < resolved) {
        out += ch;
      } else {
        out += SCRAMBLE_GLYPHS[(i + Math.floor(now * 0.04)) % SCRAMBLE_GLYPHS.length];
      }
    }
    el.textContent = out;
    if (t < 1 && el.isConnected) {
      window.requestAnimationFrame(tick);
    } else {
      el.textContent = original;
    }
  };

  window.requestAnimationFrame(tick);
}

function mountScrambleReveals(root) {
  const targets = Array.from(root.querySelectorAll('[data-scramble="true"]'));
  if (!targets.length || prefersReducedMotion()) return () => {};

  if (typeof IntersectionObserver !== 'function') {
    targets.forEach(runScramble);
    return () => {};
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          runScramble(entry.target);
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 },
  );

  targets.forEach((el) => io.observe(el));
  return () => io.disconnect();
}

function mountScrollOutlineToFill(root) {
  const displays = Array.from(root.querySelectorAll('.stage-display[data-reveal="mask"]'));
  if (!displays.length || prefersReducedMotion()) return () => {};

  const updateAll = () => {
    const vh = window.innerHeight || 800;
    displays.forEach((el) => {
      const r = el.getBoundingClientRect();
      const center = r.top + r.height * 0.5;
      // Approaches 1.0 nicely as heading enters the main 78% reading band
      const progress = Math.max(0.28, Math.min(1, 1 - Math.abs(center - vh * 0.45) / (vh * 0.72)));
      el.style.setProperty('--fill-progress', progress.toFixed(3));
      el.classList.toggle('is-outline-active', progress < 0.72);
    });
  };

  window.addEventListener('scroll', updateAll, { passive: true });
  updateAll();
  return () => {
    window.removeEventListener('scroll', updateAll);
    displays.forEach((el) => {
      el.style.removeProperty('--fill-progress');
      el.classList.remove('is-outline-active');
    });
  };
}

function mountDragFlowMarquees(root) {
  const bands = Array.from(root.querySelectorAll('[data-drag-marquee]'));
  if (!bands.length) return () => {};

  const controllers = bands.map((band, bandIdx) => {
    const track = band.querySelector('.drag-marquee-track');
    if (!track) return () => {};

    let offsetPx = 0;
    let velocityPx = 0;
    let dragging = false;
    let lastX = 0;
    let lastScrollY = window.scrollY || 0;
    let scrollSkew = 0;
    let rafId = 0;
    const baseSpeed = bandIdx % 2 === 0 ? -0.55 : 0.48;

    const getPeriodWidth = () => Math.max(400, track.scrollWidth / 2);

    const onDown = (e) => {
      dragging = true;
      lastX = e.clientX;
      band.classList.add('is-dragging');
      band.setPointerCapture?.(e.pointerId);
    };

    const onMove = (e) => {
      if (!dragging) return;
      const dx = e.clientX - lastX;
      lastX = e.clientX;
      offsetPx += dx;
      velocityPx = dx * 0.85;
    };

    const onUp = (e) => {
      if (!dragging) return;
      dragging = false;
      band.classList.remove('is-dragging');
      band.releasePointerCapture?.(e.pointerId);
    };

    band.addEventListener('pointerdown', onDown);
    band.addEventListener('pointermove', onMove);
    band.addEventListener('pointerup', onUp);
    band.addEventListener('pointercancel', onUp);

    const tick = () => {
      const curScroll = window.scrollY || 0;
      const dScroll = curScroll - lastScrollY;
      lastScrollY = curScroll;
      scrollSkew = scrollSkew * 0.86 + Math.max(-7, Math.min(7, dScroll * 0.16)) * 0.14;

      if (!dragging) {
        velocityPx *= 0.94;
        offsetPx += baseSpeed + velocityPx;
      }

      const period = getPeriodWidth();
      if (offsetPx <= -period) offsetPx += period;
      else if (offsetPx > 0) offsetPx -= period;

      track.style.transform = `translate3d(${offsetPx.toFixed(1)}px, 0, 0) skewX(${scrollSkew.toFixed(2)}deg)`;
      rafId = window.requestAnimationFrame(tick);
    };
    rafId = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(rafId);
      band.removeEventListener('pointerdown', onDown);
      band.removeEventListener('pointermove', onMove);
      band.removeEventListener('pointerup', onUp);
      band.removeEventListener('pointercancel', onUp);
    };
  });

  return () => controllers.forEach((fn) => fn());
}

/** Mechanical digit drum spin trigger used by Venue countdown numbers */
export function spinCountdownDigit(el, nextValue) {
  if (!el) return;
  const formatted = String(nextValue);
  if (el.textContent === formatted) return;

  el.textContent = formatted;
  if (prefersReducedMotion()) return;

  el.classList.remove('is-drum-rolling');
  // Force single-frame reflow so sequential minute updates cleanly retrigger CSS drum flip
  void el.offsetWidth;
  el.classList.add('is-drum-rolling');
}

export function mountTextMotion(root = document) {
  if (!root || prefersReducedMotion()) return () => {};
  const cleanups = [
    mountHeroKineticHeadline(root),
    mountScrambleReveals(root),
    mountScrollOutlineToFill(root),
    mountDragFlowMarquees(root),
  ];
  return () => cleanups.forEach((fn) => fn());
}
