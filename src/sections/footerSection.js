/**
 * Monumental Footer Section (#21):
 * - Edge-to-edge cursor-proximity reactive wordmark "DEVFEST MADURAI".
 * - Hairline-wipe links across 3 mission columns + Return to Orbit button.
 * - Verbatim independence disclaimer & copyright preserved from event.json.
 */
import eventData from '../data/event.json';
import { esc } from '../utils/dom.js';
import { prefersReducedMotion } from '../utils/env.js';

function renderReactiveWordmark(text = 'DEVFEST MADURAI') {
  return Array.from(text)
    .map((ch, i) =>
      ch === ' '
        ? `<span class="ftr-space" aria-hidden="true">&nbsp;</span>`
        : `<span class="ftr-char" data-ci="${i}" aria-hidden="true">${ch}</span>`
    )
    .join('');
}

export function renderStageFooter({ cfpHref = '/#cfp' } = {}) {
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
            <li><a href="/#about" class="ftr-link">ABOUT &amp; PILLARS</a></li>
            <li><a href="/#agenda" class="ftr-link">AGENDA &amp; MY DAY</a></li>
          </ul>
        </div>

        <div class="ftr-col">
          <span class="ftr-col-label">PARTICIPATION</span>
          <ul class="ftr-link-list">
            <li><a href="${esc(links.tickets)}" target="_blank" rel="noopener noreferrer" class="ftr-link">GET YOUR TICKETS.</a></li>
            <li><a href="${esc(cfpHref)}" class="ftr-link">SUBMIT YOUR PROPOSAL.</a></li>
            <li><a href="${esc(links.cfp)}" target="_blank" rel="noopener noreferrer" class="ftr-link">EXTERNAL CFP PORTAL</a></li>
            <li><a href="/#sponsors" class="ftr-link">SPONSORS &amp; PARTNERS</a></li>
          </ul>
        </div>

        <div class="ftr-col">
          <span class="ftr-col-label">COORDINATES</span>
          <p class="ftr-coord-text">${esc(footer.heading)}</p>
          <p class="ftr-coord-sub">12 DECEMBER 2026 · MADURAI, TAMIL NADU, INDIA</p>
          <p class="ftr-coord-sub">09.9252° N // 78.1198° E</p>
          <button type="button" id="ftr-scroll-top" class="ftr-top-btn">↑ RETURN TO ORBIT</button>
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
    const onTop = () => window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
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
