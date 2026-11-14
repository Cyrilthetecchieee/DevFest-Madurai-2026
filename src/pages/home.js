/** Home Page View (Hero Stage + About + Venue + Speakers Preview + Agenda + Tickets + CFP + Sponsors + Memories + Footer) */
import eventData from '../data/event.json';
import speakersData from '../data/speakers.json';
import agendaData from '../data/agenda.json';
import sponsorsData from '../data/sponsors.json';
import memoriesData from '../data/memories.json';
import { esc, renderHeroStage, renderDiscoverButton, renderPicture, renderFooter } from '../utils/dom.js';
import { initSectionMotion } from '../motion/tokens.js';
import { renderAboutSection, mountAboutSection } from '../sections/aboutSection.js';
import { renderVenueSection, mountVenueSection } from '../sections/venueSection.js';
import { renderSpeakersExperience, mountSpeakersExperience } from '../sections/speakersConstellation.js';

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
      ${renderAboutSection(sections.about)}

      ${renderVenueSection(sections.venue, links)}

      ${renderSpeakersExperience({ id: 'speakers', headingId: 'heading-speakers', isPage: false, links, cfpCtaLabel: sections.cfp.ctaLabel })}

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
  const stopAbout = mountAboutSection();
  const stopVenue = mountVenueSection();
  const stopSpeakers = mountSpeakersExperience({ id: 'speakers', isPage: false });
  return () => {
    stopSpeakers();
    stopVenue();
    stopAbout();
    stopMotion();
  };
}
