/**
 * Once-per-session, non-blocking, skippable Mission Control HUD Loader (#1).
 * Draws procedural Tamil Kolam SVG strokes while running telemetry readout,
 * flashes SIGNAL ACQUIRED, and opens into the stage via radial clip-path iris.
 */
import { prefersReducedMotion, readSessionFlag, writeSessionFlag } from '../utils/env.js';
import { mountInteractiveKolamSvg } from '../visuals/kolamEngine.js';

const SESSION_KEY = 'df_madurai_2026_booted';

export function initSessionLoader() {
  const el = document.getElementById('mc-loader');
  if (!el) return;

  const alreadySeen = readSessionFlag(SESSION_KEY) === '1';
  if (alreadySeen || prefersReducedMotion()) {
    el.hidden = true;
    return;
  }

  el.hidden = false;
  let dismissed = false;
  let rafId = 0;
  let kolamCtrl = null;

  const kolamMount = el.querySelector('#mc-loader-kolam');
  const pctEl = el.querySelector('#mc-loader-pct');
  const tagEl = el.querySelector('.mc-loader-tag');
  const barEl = el.querySelector('.mc-loader-fill');

  if (kolamMount) {
    kolamCtrl = mountInteractiveKolamSvg(kolamMount, {
      gridRadius: 2,
      size: 168,
      seed: 'GDG-MADURAI-2026',
      drawOnScroll: true,
      className: 'mc-kolam-svg',
    });
  }

  const dismiss = () => {
    if (dismissed) return;
    dismissed = true;
    window.cancelAnimationFrame(rafId);
    writeSessionFlag(SESSION_KEY, '1');
    el.classList.add('is-acquired');
    if (tagEl) tagEl.textContent = 'SIGNAL ACQUIRED // ENTERING STAGE';
    if (pctEl) pctEl.textContent = '100%';
    kolamCtrl?.setProgress(1);

    window.setTimeout(() => {
      el.classList.add('iris-out');
      window.setTimeout(() => {
        kolamCtrl?.destroy();
        el.hidden = true;
      }, 520);
    }, 180);
  };

  const skipBtn = el.querySelector('#mc-loader-skip');
  skipBtn?.addEventListener('click', dismiss, { once: true });

  const onKey = (e) => {
    if (e.key === 'Escape') {
      dismiss();
      window.removeEventListener('keydown', onKey);
    }
  };
  window.addEventListener('keydown', onKey);

  const duration = 980;
  const start = performance.now();
  const step = (now) => {
    if (dismissed) return;
    const raw = Math.min(1, (now - start) / duration);
    const eased = 1 - Math.pow(1 - raw, 3);
    kolamCtrl?.setProgress(eased);
    if (pctEl) pctEl.textContent = `${String(Math.round(eased * 100)).padStart(3, '0')}%`;
    if (barEl) barEl.style.transform = `scaleX(${Math.max(0.05, eased).toFixed(3)})`;

    if (raw < 1) {
      rafId = window.requestAnimationFrame(step);
    } else {
      dismiss();
    }
  };
  rafId = window.requestAnimationFrame(step);
}
