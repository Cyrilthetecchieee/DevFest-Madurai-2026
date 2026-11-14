/**
 * Once-per-session, non-blocking, skippable Loader (< 1.2s total).
 */
import { prefersReducedMotion, readSessionFlag, writeSessionFlag } from '../utils/env.js';

const SESSION_KEY = 'df_madurai_2026_booted';

export function initSessionLoader() {
  const el = document.getElementById('mc-loader');
  if (!el) return;

  if (readSessionFlag(SESSION_KEY) === '1' || prefersReducedMotion()) {
    el.hidden = true;
    return;
  }

  el.hidden = false;
  let dismissed = false;
  let rafId = 0;

  const pctEl = el.querySelector('#mc-loader-pct');
  const barEl = el.querySelector('.mc-loader-fill');

  const dismiss = () => {
    if (dismissed) return;
    dismissed = true;
    window.cancelAnimationFrame(rafId);
    writeSessionFlag(SESSION_KEY, '1');
    if (pctEl) pctEl.textContent = '100%';
    el.classList.add('iris-out');
    window.setTimeout(() => {
      el.hidden = true;
    }, 280);
  };

  el.querySelector('#mc-loader-skip')?.addEventListener('click', dismiss, { once: true });

  const onKey = (e) => {
    if (e.key === 'Escape') {
      dismiss();
      window.removeEventListener('keydown', onKey);
    }
  };
  window.addEventListener('keydown', onKey);

  const duration = 680;
  const start = performance.now();
  const step = (now) => {
    if (dismissed) return;
    const raw = Math.min(1, (now - start) / duration);
    const eased = 1 - Math.pow(1 - raw, 2);
    if (pctEl) pctEl.textContent = `${String(Math.round(eased * 100)).padStart(3, '0')}%`;
    if (barEl) barEl.style.transform = `scaleX(${Math.max(0.08, eased).toFixed(3)})`;
    if (raw < 1) {
      rafId = window.requestAnimationFrame(step);
    } else {
      dismiss();
    }
  };
  rafId = window.requestAnimationFrame(step);
}
