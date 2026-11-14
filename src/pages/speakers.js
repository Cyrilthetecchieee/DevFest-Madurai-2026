/** Speakers Page View & Track Filter Controller */
import eventData from '../data/event.json';
import speakersData from '../data/speakers.json';
import { esc, renderHeroStage, renderDiscoverButton, renderFooter } from '../utils/dom.js';

export const SPEAKERS_META = {
  title: 'Speakers — GDG Madurai · DevFest Madurai 2026',
  description: 'Explore DevFest Madurai 2026 speakers, community hosts, and Call for Speakers guidelines. 12 December 2026 · Madurai, Tamil Nadu, India.',
  canonical: '/speakers',
};

export function renderSpeakersPage() {
  const { pageSection, filters, speakers } = speakersData;
  const { sections, links } = eventData;

  return `
    ${renderHeroStage('speakers', 'Speakers — DevFest Madurai 2026')}

    <main id="devfest-content">
      <section id="speakers-directory" class="orbe-section" aria-labelledby="heading-speakers-page">
        <span class="orbe-section-tag">${esc(pageSection.tag)}</span>
        <h2 id="heading-speakers-page" class="orbe-section-heading">${esc(pageSection.heading)}</h2>
        ${pageSection.paragraphs.map((p) => `<p class="orbe-section-copy">${esc(p)}</p>`).join('')}

        <div class="orbe-filter-bar" role="tablist" aria-label="Filter Speakers by Track">
          ${filters.map((f, idx) => `
            <button type="button" role="tab" aria-selected="${idx === 0 ? 'true' : 'false'}" class="orbe-filter-btn${idx === 0 ? ' active' : ''}" data-track="${esc(f.id)}">${esc(f.label)}</button>
          `).join('')}
        </div>

        <div id="speakers-grid" class="orbe-grid-3" aria-label="DevFest Madurai 2026 Speakers">
          ${speakers.map((s) => `
            <article class="orbe-card speaker-item" data-category="${esc(s.category)}">
              <div class="orbe-speaker-frame">
                <span class="orbe-speaker-code">${esc(s.code)}</span>
                <div class="orbe-speaker-monogram">${esc(s.monogram)}</div>
                <span class="orbe-badge-tba">${esc(s.pageBadge)}</span>
                <span class="orbe-speaker-status">${esc(s.status)}</span>
              </div>
              <h3 class="orbe-card-title">${esc(s.pageName || s.name)}</h3>
              <p class="orbe-card-body">${esc(s.subtitle)}</p>
              <p class="orbe-card-body orbe-card-body-muted">${esc(s.bio)}</p>
            </article>
          `).join('')}
        </div>
      </section>

      <section id="cfp" class="orbe-section" aria-labelledby="heading-cfp-page">
        <span class="orbe-section-tag">${esc(sections.cfp.tag)}</span>
        <h2 id="heading-cfp-page" class="orbe-section-heading">${esc(sections.cfp.heading)}</h2>
        <p class="orbe-section-copy">${esc(sections.cfp.copy)}</p>

        <div class="orbe-grid-4" aria-label="CFP Guidelines">
          ${sections.cfp.guidelines.map((g) => `
            <article class="orbe-card">
              <span class="orbe-badge-tba">${esc(g.badge)}</span>
              <h3 class="orbe-card-title">${esc(g.title)}</h3>
              <p class="orbe-card-body">${esc(g.body)}</p>
            </article>
          `).join('')}
        </div>

        <div class="orbe-cta-row">
          ${renderDiscoverButton({
            label: sections.cfp.ctaLabel,
            ariaLabel: 'Submit Your Proposal',
            href: links.cfp,
            external: true,
            inline: true,
            compactLabel: true,
          })}
          <a href="${esc(links.tickets)}" target="_blank" rel="noopener noreferrer" class="btn-link-inline">${esc(sections.tickets.ctaLabel)}</a>
          <a href="/#agenda" data-spa-link="true" class="btn-link-inline">EXPLORE AGENDA //</a>
        </div>
      </section>

      <section id="event-info" class="orbe-section" aria-labelledby="heading-event-info-spk">
        <span class="orbe-section-tag">+++ // EVENT INFORMATION · DEVFEST MADURAI 2026</span>
        <h2 id="heading-event-info-spk" class="orbe-section-heading">${esc(sections.venue.heading)}</h2>
        <div class="orbe-grid-3">
          ${sections.venue.cards.map((c, idx) => `
            <article class="orbe-card">
              <h3 class="orbe-card-title">${esc(c.title)}</h3>
              <p class="orbe-card-body">${esc(c.body)}</p>
              ${idx === 2 ? `<span class="orbe-badge-tba">${esc(c.badge)}</span>` : ''}
            </article>
          `).join('')}
        </div>
      </section>

      ${renderFooter({ cfpHref: '#cfp' })}
    </main>
  `;
}

export function mountSpeakersPage(root) {
  const buttons = root.querySelectorAll('.orbe-filter-btn');
  const cards = root.querySelectorAll('.speaker-item');
  const handlers = [];

  buttons.forEach((btn) => {
    const onClick = () => {
      const track = btn.dataset.track || 'all';
      buttons.forEach((b) => {
        const active = b === btn;
        b.classList.toggle('active', active);
        b.setAttribute('aria-selected', active ? 'true' : 'false');
      });
      cards.forEach((card) => {
        const show = track === 'all' || card.dataset.category === track;
        card.hidden = !show;
      });
    };
    btn.addEventListener('click', onClick);
    handlers.push([btn, onClick]);
  });

  return () => {
    for (const [btn, fn] of handlers) {
      btn.removeEventListener('click', fn);
    }
  };
}
