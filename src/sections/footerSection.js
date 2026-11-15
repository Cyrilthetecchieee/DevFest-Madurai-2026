/**
 * Monumental Footer Section (#21):
 * - Edge-to-edge cursor-proximity reactive wordmark "DEVFEST MADURAI".
 * - Hairline-wipe links across 3 mission columns + Return to Orbit button.
 * - Verbatim independence disclaimer & copyright preserved from event.json.
 */
import eventData from '../data/event.json';
import { esc } from '../utils/dom.js';
import { prefersReducedMotion } from '../utils/env.js';

const SOCIAL_ICONS = {
  X: `<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`,
  Instagram: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>`,
  LinkedIn: `<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.46 1.46 0 1 0 0-2.92 1.46 1.46 0 0 0 0 2.92M7.86 18.5V10.13H5.07V18.5h2.79z"/></svg>`,
  YouTube: `<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>`,
  GitHub: `<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" clip-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0 0 22 12.017C22 6.484 17.522 2 12 2z"/></svg>`,
  Community: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`
};

function renderReactiveWordmark(text = 'DEVFEST MADURAI') {
  return Array.from(text)
    .map((ch, i) =>
      ch === ' '
        ? `<span class="ftr-space" aria-hidden="true">&nbsp;</span>`
        : `<span class="ftr-char" data-ci="${i}" aria-hidden="true">${ch}</span>`
    )
    .join('');
}

export function renderStageFooter() {
  const { footer, links } = eventData;

  return `
    <footer class="stage-section ftr-stage" data-waypoint="9" aria-label="Footer">
      <div class="ftr-top-meta">
        <span class="stage-eyebrow" data-scramble="true">${esc(footer.tag)}</span>
        <span class="ftr-pillars">${esc(footer.pillars)}</span>
      </div>

      <div class="ftr-grid">
        <div class="ftr-col">
          <span class="ftr-col-label">NAVIGATION</span>
          <ul class="ftr-link-list">
            <li><a href="/" data-spa-link="true" class="ftr-link">HOME // MISSION CONTROL</a></li>
            <li><a href="/speakers" data-spa-link="true" class="ftr-link">SPEAKERS CONSTELLATION</a></li>
            <li><a href="/memories" data-spa-link="true" class="ftr-link">MEMORIES ARCHIVE</a></li>
            <li><a href="/#about" data-spa-link="true" class="ftr-link">ABOUT &amp; PILLARS</a></li>
            <li><a href="/#agenda" data-spa-link="true" class="ftr-link">AGENDA &amp; MY DAY</a></li>
          </ul>
        </div>

        <div class="ftr-col">
          <span class="ftr-col-label">PARTICIPATION</span>
          <ul class="ftr-link-list">
            <li><a href="${esc(links.tickets)}" target="_blank" rel="noopener noreferrer" class="ftr-link">GET YOUR TICKETS.</a></li>
            <li><a href="/#venue" data-spa-link="true" class="ftr-link">VENUE &amp; COUNTDOWN</a></li>
            <li><a href="/#sponsors" data-spa-link="true" class="ftr-link">SPONSORS &amp; PARTNERS</a></li>
          </ul>
        </div>

        <div class="ftr-col">
          <span class="ftr-col-label">CONNECT // SOCIALS</span>
          <ul class="ftr-social-list" aria-label="Social Links">
            ${(links.socials || [])
              .map(
                (soc) => `
              <li>
                <a
                  href="${esc(soc.url)}"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="ftr-social-link"
                  aria-label="${esc(soc.label)}"
                >
                  <span class="ftr-social-icon">${SOCIAL_ICONS[soc.label] || ''}</span>
                  <span class="ftr-social-label">${esc(soc.label)}</span>
                </a>
              </li>
            `
              )
              .join('')}
          </ul>
        </div>

        <div class="ftr-col">
          <span class="ftr-col-label">EVENT DETAILS</span>
          <p class="ftr-coord-text">${esc(footer.heading)}</p>
          <p class="ftr-coord-sub">12 December 2026 · Madurai, Tamil Nadu, India</p>
          <p class="ftr-coord-sub">Official venue to be announced soon.</p>
          <button type="button" id="ftr-scroll-top" class="ftr-top-btn">↑ RETURN TO TOP</button>
        </div>
      </div>

      <div class="ftr-wordmark-wrap">
        <div class="ftr-wordmark" id="ftr-wordmark" aria-label="DEVFEST MADURAI">
          ${renderReactiveWordmark('DEVFEST MADURAI')}
        </div>
      </div>

      <div class="ftr-legal-bar">
        <p class="ftr-disclaimer">${esc(footer.disclaimer)}</p>
        <p class="ftr-copyright">${esc(footer.copyright)}</p>
      </div>
    </footer>
  `;
}

export function mountStageFooter(root = document) {
  const wordmark = root.querySelector('#ftr-wordmark');
  const topBtn = root.querySelector('#ftr-scroll-top');
  const reduced = prefersReducedMotion();
  const cleanups = [];

  if (topBtn) {
    const onTop = () => {
      if (window.__devfestLenis) {
        window.__devfestLenis.scrollTo(0, { immediate: reduced });
      } else {
        window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
      }
    };
    topBtn.addEventListener('click', onTop);
    cleanups.push(() => topBtn.removeEventListener('click', onTop));
  }

  if (wordmark && !reduced && window.matchMedia?.('(hover: hover) and (pointer: fine)')?.matches) {
    const chars = Array.from(wordmark.querySelectorAll('.ftr-char'));
    let charCenters = [];

    const measure = () => {
      charCenters = chars.map((el) => {
        const r = el.getBoundingClientRect();
        return { x: r.left + r.width * 0.5, y: r.top + r.height * 0.5 };
      });
    };

    const onMove = (e) => {
      if (!charCenters.length) measure();
      const px = e.clientX;
      const py = e.clientY;
      chars.forEach((el, i) => {
        const c = charCenters[i];
        if (!c) return;
        const dist = Math.hypot(px - c.x, py - c.y);
        const radius = 190;
        const p = Math.max(0, 1 - dist / radius);
        const eased = p * p;
        el.style.transform = `translateY(${(-eased * 14).toFixed(1)}px) scale(${(1 + eased * 0.14).toFixed(3)})`;
        el.style.color = eased > 0.45 ? '#5ef3ff' : eased > 0.14 ? '#b7c7ff' : '';
      });
    };

    const onEnter = () => measure();
    const onLeave = () => {
      chars.forEach((el) => {
        el.style.transform = '';
        el.style.color = '';
      });
    };

    window.addEventListener('scroll', measure, { passive: true });
    window.addEventListener('resize', measure, { passive: true });
    wordmark.addEventListener('pointerenter', onEnter);
    wordmark.addEventListener('pointermove', onMove, { passive: true });
    wordmark.addEventListener('pointerleave', onLeave);

    cleanups.push(() => {
      window.removeEventListener('scroll', measure);
      window.removeEventListener('resize', measure);
      wordmark.removeEventListener('pointerenter', onEnter);
      wordmark.removeEventListener('pointermove', onMove);
      wordmark.removeEventListener('pointerleave', onLeave);
    });
  }

  return () => cleanups.forEach((fn) => fn());
}
