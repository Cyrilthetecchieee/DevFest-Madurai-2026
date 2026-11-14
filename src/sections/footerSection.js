/**
 * Footer Section — Clear 4-Column Navigation, Official Socials, Email, Legal & Disclaimer
 */
import eventData from '../data/event.json';
import { esc } from '../utils/dom.js';

export function renderStageFooter() {
  const { footer, links } = eventData;
  const socials = links.socials || [];

  return `
    <footer class="stage-section ftr-stage" id="footer" data-creature-zone="footer" aria-labelledby="heading-footer">
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

  if (topBtn) {
    const onTop = () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    topBtn.addEventListener('click', onTop);
    cleanups.push(() => topBtn.removeEventListener('click', onTop));
  }

  return () => cleanups.forEach((fn) => fn());
}
