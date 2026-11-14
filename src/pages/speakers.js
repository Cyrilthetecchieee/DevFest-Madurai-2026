/** Speakers Page View & Track Filter Controller */
import eventData from '../data/event.json';
import { esc, renderHeroStage, renderDiscoverButton } from '../utils/dom.js';
import { renderSpeakersExperience, mountSpeakersExperience } from '../sections/speakersPreview.js';
import { renderStageFooter, mountStageFooter } from '../sections/footerSection.js';

export const SPEAKERS_META = {
  title: 'Speakers — GDG Madurai · DevFest Madurai 2026',
  description: 'Explore DevFest Madurai 2026 speakers and community hosts. 12 December 2026 · Madurai, Tamil Nadu, India.',
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
      })}

      <section id="event-info" class="stage-section" aria-labelledby="heading-event-info-spk">
        <div class="stage-asymmetric stage-asymmetric--flip">
          <div class="graphic-window" data-creature-zone="venue" aria-hidden="true"></div>
          <div class="content-zone local-scrim">
            <span class="stage-eyebrow" data-scramble="true">+++ // EVENT INFORMATION · DEVFEST MADURAI 2026</span>
            <h2 id="heading-event-info-spk" class="stage-display" data-reveal="mask">${esc(sections.venue.heading)}</h2>
            <dl class="venue-specs-list">
              ${sections.venue.cards.map((c, idx) => `
                <div class="hud-bevel-card venue-spec-row">
                  <dt class="venue-spec-term"><span class="venue-spec-idx">0${idx + 1}</span><span>${esc(c.title)}</span></dt>
                  <dd class="venue-spec-val"><strong>${esc(c.body)}</strong><span class="venue-spec-note">${esc(c.badge)}</span></dd>
                </div>
              `).join('')}
            </dl>
            <div class="orbe-cta-row">
              ${renderDiscoverButton({
                label: sections.tickets.ctaLabel,
                ariaLabel: 'Get Tickets',
                href: links.tickets,
                external: true,
                inline: true,
              })}
              <a href="/#agenda" data-spa-link="true" class="btn-link-inline">EXPLORE AGENDA //</a>
            </div>
          </div>
        </div>
      </section>

      ${renderStageFooter()}
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
