/** Once-per-session, non-blocking, skippable Mission Control loader hook. */
import { prefersReducedMotion, readSessionFlag, writeSessionFlag } from '../utils/env.js';

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

  const dismiss = () => {
    if (dismissed) return;
    dismissed = true;
    writeSessionFlag(SESSION_KEY, '1');
    el.classList.add('fade-out');
    window.setTimeout(() => {
      el.hidden = true;
    }, 420);
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

  // Auto-complete cleanly shortly after initial mount so interactive readiness is fast
  window.setTimeout(dismiss, 950);
}
