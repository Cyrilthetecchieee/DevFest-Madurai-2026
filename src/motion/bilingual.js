/**
 * Bilingual EN / தமிழ் Toggle Controller (S9):
 * - Default EN. Stores original English copy automatically and toggles cleanly without page reload.
 * - Dynamically imports src/data/ta.proposed.json only when Tamil mode is selected (keeps EN initial bundle minimal).
 * - Displays explicit "PROPOSED TRANSLATIONS — REQUIRES NATIVE REVIEW" HUD banner when active.
 */
import { stageBus } from './stageBus.js';

const STORAGE_LANG = 'df26_lang';

export function initBilingualSystem() {
  const btn = document.getElementById('hud-lang-btn');
  let currentLang = 'en';
  let taData = null;

  const banner = document.createElement('div');
  banner.id = 'hud-ta-notice';
  banner.className = 'hud-ta-notice';
  banner.setAttribute('role', 'status');
  banner.setAttribute('aria-live', 'polite');
  banner.hidden = true;
  document.body.appendChild(banner);

  function applyMap(map, isTamil, preserveHtml = false) {
    if (!map) return;
    Object.entries(map).forEach(([selector, taValue]) => {
      const el = document.querySelector(selector);
      if (!el) return;
      if (isTamil) {
        if (el.dataset.enOriginal === undefined) {
          el.dataset.enOriginal = preserveHtml ? el.innerHTML : (el.textContent || '');
        }
        el.textContent = taValue;
        el.setAttribute('aria-label', taValue);
      } else if (el.dataset.enOriginal !== undefined) {
        if (preserveHtml) {
          el.innerHTML = el.dataset.enOriginal;
        } else {
          el.textContent = el.dataset.enOriginal;
          el.setAttribute('aria-label', el.dataset.enOriginal);
        }
      }
    });
  }

  async function applyCurrentLanguage() {
    const isTamil = currentLang === 'ta';
    document.documentElement.lang = isTamil ? 'ta' : 'en';
    document.documentElement.classList.toggle('lang-ta', isTamil);

    if (btn) {
      btn.textContent = isTamil ? 'EN' : 'தமிழ்';
      btn.setAttribute('aria-pressed', isTamil ? 'true' : 'false');
      btn.setAttribute('aria-label', isTamil ? 'Switch to English' : 'Switch to Tamil');
    }

    if (isTamil && !taData) {
      try {
        const mod = await import('../data/ta.proposed.json');
        taData = mod.default || mod;
      } catch {
        return;
      }
    }

    if (taData) {
      applyMap(taData.headings, isTamil, true);
      applyMap(taData.eyebrows, isTamil);
      applyMap(taData.copy, isTamil);
      applyMap(taData.ctas, isTamil);
      if (isTamil) {
        banner.textContent = taData._bannerText || taData._notice;
      }
    }

    banner.hidden = !isTamil;
  }

  async function toggleLang() {
    currentLang = currentLang === 'en' ? 'ta' : 'en';
    try {
      window.localStorage.setItem(STORAGE_LANG, currentLang);
    } catch {
      // Ignore storage error
    }
    await applyCurrentLanguage();
  }

  btn?.addEventListener('click', toggleLang);

  const unsubBus = stageBus.on((ev) => {
    if (ev === 'lang:toggle') toggleLang();
    else if (ev === 'route:applied') {
      // Clear cached dataset markers on new route DOM and re-apply if in Tamil
      window.requestAnimationFrame(() => applyCurrentLanguage());
    }
  });

  // Restore saved preference if user selected Tamil earlier
  try {
    if (window.localStorage.getItem(STORAGE_LANG) === 'ta') {
      currentLang = 'ta';
      applyCurrentLanguage();
    }
  } catch {
    // Ignore storage read failure
  }

  return () => {
    unsubBus();
    btn?.removeEventListener('click', toggleLang);
    banner.remove();
  };
}
