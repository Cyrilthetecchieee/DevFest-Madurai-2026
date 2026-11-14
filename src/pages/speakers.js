/** Speakers Page View & Constellation/Track Controller */
import eventData from '../data/event.json';
import { esc, renderHeroStage, renderDiscoverButton } from '../utils/dom.js';
import { renderSpeakersExperience, mountSpeakersExperience } from '../sections/speakersPreview.js';
import { renderStageFooter, mountStageFooter } from '../sections/footerSection.js';

export const SPEAKERS_META = {
  title: 'Speakers — GDG Madurai · DevFest Madurai 2026',
  description: 'Explore DevFest Madurai 2026 speakers, community hosts, and Call for Speakers guidelines. 12 December 2026 · Madurai, Tamil Nadu, India.',
  canonical: '/speakers',
};

export function renderSpeakersPage() {
  const { sections, links } = eventData;

  return `
    ${renderHeroStage('speakers', 'Speakers — DevFest Madurai 2026')}

    <main id="devfest-content">
      ${renderSpeakersExperience({
        id: 'speakers-directory',
        headingId: 'heading-speakers-page',
        isPage: true,
        links,
        cfpCtaLabel: sections.cfp.ctaLabel,
      })}

      <section id="cfp" class="stage-section" aria-labelledby="heading-cfp-page">
        <span class="stage-eyebrow" data-scramble="true">${esc(sections.cfp.tag)}</span>
        <h2 id="heading-cfp-page" class="stage-display" data-reveal="mask">${esc(sections.cfp.heading)}</h2>
        <p class="stage-lead">${esc(sections.cfp.copy)}</p>

        <div class="spk-guidelines-rail" aria-label="CFP Guidelines">
          ${sections.cfp.guidelines.map((g) => `
            <article class="spk-guideline-row">
              <span class="orbe-badge-tba">${esc(g.badge)}</span>
              <h3 class="spk-guideline-title">${esc(g.title)}</h3>
              <p class="spk-guideline-body">${esc(g.body)}</p>
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

      <section id="event-info" class="stage-section" aria-labelledby="heading-event-info-spk">
        <span class="stage-eyebrow" data-scramble="true">+++ // EVENT INFORMATION · DEVFEST MADURAI 2026</span>
        <h2 id="heading-event-info-spk" class="stage-display" data-reveal="mask">${esc(sections.venue.heading)}</h2>
        <dl class="venue-specs-list">
          ${sections.venue.cards.map((c, idx) => `
            <div class="venue-spec-row">
              <dt class="venue-spec-term"><span class="venue-spec-idx">0${idx + 1}</span><span>${esc(c.title)}</span></dt>
              <dd class="venue-spec-val"><strong>${esc(c.body)}</strong><span class="venue-spec-note">${esc(c.badge)}</span></dd>
            </div>
          `).join('')}
        </dl>
      </section>

      ${renderStageFooter({ cfpHref: '#cfp' })}
    </main>
  `;
}

export function mountSpeakersPage(root) {
  const stopSpeakers = mountSpeakersExperience({ id: 'speakers-directory', isPage: true });
  const stopFooter = mountStageFooter(root || document);
  return () => {
    stopFooter();
    stopSpeakers();
  };
}
