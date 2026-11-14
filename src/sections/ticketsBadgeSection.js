/**
 * Tickets & Registration Section — Realistic Tactile Pass Card with Perforation & Rim Highlight
 */
import eventData from '../data/event.json';
import { prefersReducedMotion } from '../utils/env.js';
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

          <div class="tkt-card-stage">
            <article class="tkt-stub tkt-cardstock" id="tkt-cardstock" aria-label="DevFest Madurai 2026 Pass Summary">
              <div class="tkt-sheen-layer" aria-hidden="true"></div>
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
                  <div class="tkt-barcode-decorative" aria-hidden="true">
                    <span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span>
                  </div>
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
        </div>

        <div class="graphic-window" data-creature-zone="tickets" aria-hidden="true"></div>
      </div>
    </section>
  `;
}

export function mountTicketsSection() {
  const card = document.getElementById('tkt-cardstock');
  if (!card || prefersReducedMotion()) return () => {};

  const onMove = (e) => {
    const r = card.getBoundingClientRect();
    const nx = Math.max(-0.5, Math.min(0.5, (e.clientX - r.left) / Math.max(1, r.width) - 0.5));
    const ny = Math.max(-0.5, Math.min(0.5, (e.clientY - r.top) / Math.max(1, r.height) - 0.5));
    const rx = (-ny * 7.2).toFixed(2);
    const ry = (nx * 7.2).toFixed(2);
    card.style.setProperty('--tkt-rx', `${rx}deg`);
    card.style.setProperty('--tkt-ry', `${ry}deg`);
    card.style.setProperty('--tkt-mx', `${((nx + 0.5) * 100).toFixed(1)}%`);
    card.style.setProperty('--tkt-my', `${((ny + 0.5) * 100).toFixed(1)}%`);
    card.classList.add('is-tilting');
  };

  const onLeave = () => {
    card.classList.remove('is-tilting');
    card.style.setProperty('--tkt-rx', '0deg');
    card.style.setProperty('--tkt-ry', '0deg');
  };

  card.addEventListener('pointermove', onMove, { passive: true });
  card.addEventListener('pointerleave', onLeave, { passive: true });

  return () => {
    card.removeEventListener('pointermove', onMove);
    card.removeEventListener('pointerleave', onLeave);
  };
}
