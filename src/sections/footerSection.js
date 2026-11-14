/**
 * Footer Section — Giant Cursor-Reactive Wordmark Over Back-Lit Creature + 4-Column HUD Footer
 */
import eventData from '../data/event.json';
import { esc } from '../utils/dom.js';
import { prefersReducedMotion } from '../utils/env.js';

export function renderStageFooter() {
  const { footer, links } = eventData;
  const socials = links.socials || [];

  return `
    <footer class="stage-section ftr-stage" id="footer" data-creature-zone="footer" aria-labelledby="heading-footer">
      <div class="ftr-wordmark-stage" aria-hidden="true">
        <div class="ftr-giant-wordmark" id="ftr-giant-wordmark">
          <span>DEVFEST</span>
          <span>MADURAI</span>
        </div>
      </div>

      <div class="content-zone local-scrim">
        <div class="ftr-top-meta">
          <span class="stage-eyebrow" data-scramble="true">${esc(footer.tag)}</span>
          <span class="ftr-pillars">${esc(footer.pillars)}</span>
        </div>

        <h2 id="heading-footer" class="ftr-heading">${esc(footer.heading)}</h2>

        <div class="ftr-grid">
        <div class="ftr-col">
          <span class="ftr-col-label">NAVIGATION</span>
          <ul class="ftr-link-list">
            <li><a href="/#home" data-spa-link="true" class="ftr-link">Home</a></li>
            <li><a href="/#about" data-spa-link="true" class="ftr-link">About DevFest</a></li>
            <li><a href="/#venue" data-spa-link="true" class="ftr-link">Venue &amp; Date</a></li>
            <li><a href="/#agenda" data-spa-link="true" class="ftr-link">Agenda</a></li>
            <li><a href="/speakers" data-spa-link="true" class="ftr-link">Speakers</a></li>
            <li><a href="/#sponsors" data-spa-link="true" class="ftr-link">Sponsors</a></li>
            <li><a href="/memories" data-spa-link="true" class="ftr-link">Memories Archive</a></li>
          </ul>
        </div>

        <div class="ftr-col">
          <span class="ftr-col-label">PARTICIPATE</span>
          <ul class="ftr-link-list">
            <li><a href="/#tickets" data-spa-link="true" class="ftr-link">Tickets &amp; Event Pass</a></li>
            <li><a href="${esc(links.tickets)}" target="_blank" rel="noopener noreferrer" class="ftr-link">Register on GDG &#8599;</a></li>
            <li><a href="${esc(links.codeOfConduct)}" target="_blank" rel="noopener noreferrer" class="ftr-link">Code of Conduct &#8599;</a></li>
            <li><a href="${esc(links.privacyPolicy)}" target="_blank" rel="noopener noreferrer" class="ftr-link">Privacy Policy &#8599;</a></li>
          </ul>
        </div>

        <div class="ftr-col">
          <span class="ftr-col-label">CONNECT</span>
          <ul class="ftr-link-list">
            <li><a href="${esc(links.email)}" class="ftr-link ftr-link--email">${esc(links.emailLabel)}</a></li>
            ${socials.map((s) => `
              <li><a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer" class="ftr-link">${esc(s.label)} ↗</a></li>
            `).join('')}
          </ul>
        </div>

        <div class="ftr-col">
          <span class="ftr-col-label">EVENT DETAILS</span>
          <p class="ftr-coord-text">${esc(eventData.dateDisplay)}</p>
          <p class="ftr-coord-sub">${esc(eventData.locationDisplay)}<br />Venue: ${esc(eventData.venueDisplay)}<br />${esc(eventData.coords)}</p>
          <button type="button" id="ftr-back-top" class="ftr-top-btn">BACK TO TOP ↑</button>
        </div>
      </div>

        <div class="ftr-legal-bar">
          <p class="ftr-disclaimer">${esc(footer.disclaimer)}</p>
          <p class="ftr-copyright">${esc(footer.copyright)}</p>
        </div>
      </div>
    </footer>
  `;
}

export function mountStageFooter(root = document) {
  const cleanups = [];
  const topBtn = root.querySelector('#ftr-back-top');
  const footer = root.querySelector('#footer');
  const wordmark = root.querySelector('#ftr-giant-wordmark');

  if (topBtn) {
    const onTop = () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    topBtn.addEventListener('click', onTop);
    cleanups.push(() => topBtn.removeEventListener('click', onTop));
  }

  if (footer && wordmark && !prefersReducedMotion()) {
    const onMove = (e) => {
      const r = footer.getBoundingClientRect();
      const nx = ((e.clientX - r.left) / Math.max(1, r.width) - 0.5) * 26;
      const ny = ((e.clientY - r.top) / Math.max(1, r.height) - 0.5) * 10;
      wordmark.style.transform = `translate3d(${nx.toFixed(1)}px, ${ny.toFixed(1)}px, 0)`;
    };
    const onLeave = () => {
      wordmark.style.transform = 'translate3d(0, 0, 0)';
    };
    footer.addEventListener('pointermove', onMove, { passive: true });
    footer.addEventListener('pointerleave', onLeave, { passive: true });
    cleanups.push(() => {
      footer.removeEventListener('pointermove', onMove);
      footer.removeEventListener('pointerleave', onLeave);
    });
  }

  return () => cleanups.forEach((fn) => fn());
}
