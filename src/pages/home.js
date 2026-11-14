/** Home Page View (Hero Stage + About + Venue + Speakers Preview + Agenda + Tickets + CFP + Sponsors + Memories + Footer) */
import eventData from '../data/event.json';
import { renderHeroStage } from '../utils/dom.js';
import { renderStageFooter, mountStageFooter } from '../sections/footerSection.js';
import { renderAboutSection, mountAboutSection } from '../sections/aboutSection.js';
import { renderVenueSection, mountVenueSection } from '../sections/venueSection.js';
import { renderSpeakersExperience, mountSpeakersExperience } from '../sections/speakersPreview.js';
import { renderAgendaSection, mountAgendaSection } from '../sections/agendaSection.js';
import { renderTicketsSection, mountTicketsSection } from '../sections/ticketsBadgeSection.js';
import { renderCfpSection, mountCfpSection } from '../sections/cfpSection.js';
import { renderSponsorsSection, mountSponsorsSection } from '../sections/sponsorsSection.js';
import { renderHomeMemoriesSection, mountMemoriesInteraction } from '../sections/memoriesFilmstrip.js';

export const HOME_META = {
  title: 'GDG MADURAI — DevFest Madurai 2026',
  description: 'GDG Madurai presents DevFest Madurai 2026 — Where Curiosity Meets Creation. 12 December 2026 · Madurai, Tamil Nadu, India.',
  canonical: '/',
};

export function renderHomePage() {
  const { sections, links } = eventData;

  return `
    ${renderHeroStage('home', 'GDG Madurai Presents DevFest Madurai 2026')}

    <main id="devfest-content">
      ${renderAboutSection(sections.about)}

      ${renderVenueSection(sections.venue, links)}

      ${renderSpeakersExperience({ id: 'speakers', headingId: 'heading-speakers', isPage: false, links, cfpCtaLabel: sections.cfp.ctaLabel })}

      ${renderAgendaSection()}

      ${renderTicketsSection(sections.tickets, links)}

      ${renderCfpSection(sections.cfp, links)}

      ${renderSponsorsSection()}

      ${renderHomeMemoriesSection()}

      ${renderStageFooter({ cfpHref: '/#cfp' })}
    </main>
  `;
}

export function mountHomePage() {
  const view = document.getElementById('app-view') || document;
  const stopAbout = mountAboutSection();
  const stopVenue = mountVenueSection();
  const stopSpeakers = mountSpeakersExperience({ id: 'speakers', isPage: false });
  const stopAgenda = mountAgendaSection();
  const stopTickets = mountTicketsSection();
  const stopCfp = mountCfpSection();
  const stopSponsors = mountSponsorsSection();
  const stopMemories = mountMemoriesInteraction(view);
  const stopFooter = mountStageFooter(view);
  return () => {
    stopFooter();
    stopMemories();
    stopSponsors();
    stopCfp();
    stopTickets();
    stopAgenda();
    stopSpeakers();
    stopVenue();
    stopAbout();
  };
}
