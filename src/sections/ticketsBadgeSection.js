/**
 * Tickets & Registration Section — Night-Sky Pass Card
 */
import eventData from '../data/event.json';
import {
  esc,
  renderStatusChip,
} from '../utils/dom.js';

export function renderTicketsSection(ticketsData, links) {
  return `
    <section id="tickets" class="stage-section" aria-labelledby="heading-tickets">
      <div class="stage-asymmetric">
        <div class="content-zone local-scrim">
          <div class="stage-section-head">
            <div>
              <span class="stage-eyebrow" data-scramble="true">${esc(ticketsData.tag)}</span>
              <h2 id="heading-tickets" class="stage-display" data-reveal="mask">${esc(ticketsData.heading)}</h2>
            </div>
          </div>
          <p class="stage-lead">${esc(ticketsData.copy)}</p>

          <article class="tkt-stub" aria-label="DevFest Madurai 2026 Pass Summary">
            <div class="tkt-stub-layout">
              <div class="tkt-stub-main">
                <div class="tkt-stub-top">
                  <span class="tkt-stub-kicker">OFFICIAL ATTENDEE PASS · GDG MADURAI</span>
                  ${renderStatusChip('REGISTRATION', 'cyan')}
                </div>

                <h3 class="tkt-stub-title">${esc(eventData.event)}</h3>
                <p class="tkt-stub-tagline">${esc(eventData.tagline)} · ${esc(eventData.pillars)}</p>

                <dl class="tkt-stub-facts">
                  <div class="tkt-fact">
                    <dt>DATE</dt>
                    <dd>${esc(eventData.dateDisplay)}</dd>
                  </div>
                  <div class="tkt-fact">
                    <dt>LOCATION</dt>
                    <dd>${esc(eventData.locationDisplay)}</dd>
                  </div>
                  <div class="tkt-fact">
                    <dt>VENUE</dt>
                    <dd>
                      <span>${esc(eventData.venueDisplay)}</span>
                      ${renderStatusChip('TBA', 'tba')}
                    </dd>
                  </div>
                </dl>
              </div>

              <div class="tkt-stub-divider" aria-hidden="true">
                <span class="tkt-notch tkt-notch--top"></span>
                <span class="tkt-perf-line"></span>
                <span class="tkt-notch tkt-notch--bottom"></span>
              </div>

              <div class="tkt-stub-action">
                <span class="tkt-action-code">DF26 // MADURAI</span>
                <a
                  href="${esc(links.tickets)}"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="btn-g-primary tkt-cta-btn"
                >
                  ${esc(ticketsData.ctaLabel)}
                </a>
                <p class="tkt-platform-note">
                  Registration takes place on the official <strong>GDG Community</strong> platform.
                </p>
              </div>
            </div>
          </article>
        </div>

        <div class="graphic-window" data-creature-zone="tickets" aria-hidden="true"></div>
      </div>
    </section>
  `;
}

export function mountTicketsSection() {
  return () => {};
}
