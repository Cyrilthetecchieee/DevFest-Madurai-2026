/** Home Page View (Hero Stage + About + Venue + Speakers Preview + Agenda + Tickets + CFP + Sponsors + Memories + Footer) */
import eventData from '../data/event.json';
import speakersData from '../data/speakers.json';
import agendaData from '../data/agenda.json';
import sponsorsData from '../data/sponsors.json';
import memoriesData from '../data/memories.json';
import { esc, renderHeroStage, renderDiscoverButton, renderPicture, renderFooter } from '../utils/dom.js';
import { initSectionMotion } from '../motion/tokens.js';

export const HOME_META = {
  title: 'GDG MADURAI — DevFest Madurai 2026',
  description: 'GDG Madurai presents DevFest Madurai 2026 — Where Curiosity Meets Creation. 12 December 2026 · Madurai, Tamil Nadu, India.',
  canonical: '/',
};

export function renderHomePage() {
  const { sections, links } = eventData;
  const homeSpeakers = speakersData.speakers.filter((s) => s.showOnHome !== false);

  return `
    ${renderHeroStage('home', 'GDG Madurai Presents DevFest Madurai 2026')}

    <main id="devfest-content">
      <section id="about" class="orbe-section" aria-labelledby="heading-about">
        <span class="orbe-section-tag">${esc(sections.about.tag)}</span>
        <h2 id="heading-about" class="orbe-section-heading">${esc(sections.about.heading)}</h2>
        ${sections.about.paragraphs.map((p) => `<p class="orbe-section-copy">${esc(p)}</p>`).join('')}

        <div id="experience" class="orbe-grid-3" aria-label="DevFest Experience Sections">
          ${sections.about.pillars.map((pillar) => `
            <article class="orbe-card">
              <h3 class="orbe-card-title">${esc(pillar.title)}</h3>
              <p class="orbe-card-body">${esc(pillar.body)}</p>
            </article>
          `).join('')}
        </div>
      </section>

      <section id="venue" class="orbe-section" aria-labelledby="heading-venue">
        <span class="orbe-section-tag">${esc(sections.venue.tag)}</span>
        <h2 id="heading-venue" class="orbe-section-heading">${esc(sections.venue.heading)}</h2>
        <p class="orbe-section-copy">${esc(sections.venue.copy)}</p>
        <p class="orbe-section-copy"><span class="orbe-badge-tba">${esc(sections.venue.statusBadge)}</span></p>

        <div id="event-info" class="orbe-grid-3" aria-label="Event Information">
          ${sections.venue.cards.map((card) => `
            <article class="orbe-card">
              <h3 class="orbe-card-title">${esc(card.title)}</h3>
              <p class="orbe-card-body">${esc(card.body)}</p>
              <span class="orbe-badge-tba">${esc(card.badge)}</span>
            </article>
          `).join('')}
        </div>

        <div class="orbe-cta-row">
          <a href="${esc(links.tickets)}" target="_blank" rel="noopener noreferrer" class="btn-link-inline">REGISTER NOW //</a>
          <a href="#agenda" class="btn-link-inline">EXPLORE AGENDA //</a>
        </div>
      </section>

      <section id="speakers" class="orbe-section" aria-labelledby="heading-speakers">
        <span class="orbe-section-tag">${esc(speakersData.homeSection.tag)}</span>
        <h2 id="heading-speakers" class="orbe-section-heading">${esc(speakersData.homeSection.heading)}</h2>
        <p class="orbe-section-copy">${esc(speakersData.homeSection.copy)}</p>

        <div class="orbe-grid-3" aria-label="Speaker Placeholders">
          ${homeSpeakers.map((s) => `
            <article class="orbe-card">
              <span class="orbe-badge-tba">${esc(s.homeBadge)}</span>
              <h3 class="orbe-card-title">${esc(s.name)}</h3>
              <p class="orbe-card-body">${esc(s.homeSubtitle || s.subtitle)}</p>
            </article>
          `).join('')}
        </div>

        <div class="orbe-cta-row">
          <a href="/speakers" data-spa-link="true" class="btn-link-inline">EXPLORE SPEAKERS PAGE //</a>
          <a href="#cfp" class="btn-link-inline">${esc(sections.cfp.ctaLabel)}</a>
        </div>
      </section>

      <section id="agenda" class="orbe-section" aria-labelledby="heading-agenda">
        <span class="orbe-section-tag">${esc(agendaData.tag)}</span>
        <h2 id="heading-agenda" class="orbe-section-heading">${esc(agendaData.heading)}</h2>
        <p class="orbe-section-copy">${esc(agendaData.copy)}</p>

        <div class="orbe-grid-3" aria-label="Agenda Format &amp; Placeholders">
          ${agendaData.tracks.map((t) => `
            <article class="orbe-card">
              <span class="orbe-badge-tba">${esc(t.badge)}</span>
              <h3 class="orbe-card-title">${esc(t.title)}</h3>
              <p class="orbe-card-body">${esc(t.body)}</p>
            </article>
          `).join('')}
        </div>
      </section>

      <section id="tickets" class="orbe-section" aria-labelledby="heading-tickets">
        <span class="orbe-section-tag">${esc(sections.tickets.tag)}</span>
        <h2 id="heading-tickets" class="orbe-section-heading">${esc(sections.tickets.heading)}</h2>
        <p class="orbe-section-copy">${esc(sections.tickets.copy)}</p>
        <p class="orbe-section-copy">${esc(sections.tickets.metaLine)}</p>

        <div class="orbe-cta-row">
          ${renderDiscoverButton({
            label: sections.tickets.ctaLabel,
            ariaLabel: 'Get Your Tickets',
            href: links.tickets,
            external: true,
            inline: true,
          })}
        </div>
      </section>

      <section id="cfp" class="orbe-section" aria-labelledby="heading-cfp">
        <span class="orbe-section-tag">${esc(sections.cfp.tag)}</span>
        <h2 id="heading-cfp" class="orbe-section-heading">${esc(sections.cfp.heading)}</h2>
        <p class="orbe-section-copy">${esc(sections.cfp.copy)}</p>

        <div class="orbe-grid-2">
          ${sections.cfp.homeCards.map((c) => `
            <article class="orbe-card">
              <span class="orbe-badge-tba">${esc(c.badge)}</span>
              <h3 class="orbe-card-title">${esc(c.title)}</h3>
              <p class="orbe-card-body">${esc(c.body)}</p>
            </article>
          `).join('')}
        </div>

        <div class="orbe-cta-row">
          <a href="${esc(links.cfp)}" target="_blank" rel="noopener noreferrer" class="btn-link-inline">${esc(sections.cfp.ctaLabel)}</a>
        </div>
      </section>

      <section id="sponsors" class="orbe-section" aria-labelledby="heading-sponsors">
        <span class="orbe-section-tag">${esc(sponsorsData.tag)}</span>
        <h2 id="heading-sponsors" class="orbe-section-heading">${esc(sponsorsData.heading)}</h2>
        <p class="orbe-section-copy">${esc(sponsorsData.copy)}</p>

        <div class="orbe-grid-3" aria-label="Sponsor Placeholders">
          ${sponsorsData.sponsors.map((s) => `
            <div class="orbe-logo-card">
              <img src="${esc(s.src)}" alt="${esc(s.alt)}" width="320" height="80" loading="lazy" />
              <span class="orbe-badge-tba">${esc(s.label)}</span>
            </div>
          `).join('')}
        </div>

        <div class="orbe-grid-4" aria-label="Community Partners">
          ${sponsorsData.partners.map((p) => `
            <div class="orbe-logo-card">
              <img src="${esc(p.src)}" alt="${esc(p.alt)}" width="220" height="72" loading="lazy" />
              <span class="orbe-badge-tba">${esc(p.label)}</span>
            </div>
          `).join('')}
        </div>
      </section>

      <section id="memories" class="orbe-section" aria-labelledby="heading-memories">
        <span class="orbe-section-tag">${esc(memoriesData.homeTeaser.tag)}</span>
        <h2 id="heading-memories" class="orbe-section-heading">${esc(memoriesData.homeTeaser.heading)}</h2>
        <p class="orbe-section-copy">${esc(memoriesData.homeTeaser.copy)}</p>

        <div class="orbe-grid-3" aria-label="DevFest Memories Gallery">
          ${memoriesData.homeTeaser.items.map((item) => `
            <figure class="orbe-memory-card">
              ${renderPicture({ ...item, sizes: '(max-width: 820px) 92vw, 28vw' })}
              <figcaption class="orbe-memory-caption">${esc(item.caption)}</figcaption>
            </figure>
          `).join('')}
        </div>

        <div class="orbe-cta-row">
          <a href="/memories" data-spa-link="true" class="btn-link-inline">EXPLORE DEDICATED MEMORIES ARCHIVE //</a>
        </div>
      </section>

      ${renderFooter({ cfpHref: '/#cfp' })}
    </main>
  `;
}

export function mountHomePage() {
  const view = document.getElementById('app-view') || document;
  const stopMotion = initSectionMotion(view);
  return () => stopMotion();
}
