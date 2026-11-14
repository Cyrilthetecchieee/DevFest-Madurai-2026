/**
 * Tickets & Registration Section:
 * Flat boarding-stub card without holographic foil shaders or badge canvas generators.
 */
import { esc } from '../utils/dom.js';

export function renderTicketsSection(ticketsData, links) {
  return `
    <section id="tickets" class="stage-section tkt-stage" aria-labelledby="heading-tickets">
      <div class="tkt-header">
        <span class="stage-eyebrow">${esc(ticketsData.tag)}</span>
        <h2 id="heading-tickets" class="stage-display">${esc(ticketsData.heading)}</h2>
        <p class="stage-lead">${esc(ticketsData.copy)}</p>
      </div>

      <div class="tkt-pass-card">
        <div class="tkt-pass-main">
          <div class="tkt-pass-top">
            <span class="tkt-pass-code">DEVFEST MADURAI 2026</span>
            <span class="orbe-badge-tba">12 DECEMBER 2026</span>
          </div>

          <div class="tkt-pass-title-wrap">
            <span class="tkt-pass-kicker">GDG MADURAI PRESENTS</span>
            <h3 class="tkt-pass-title">DEVFEST MADURAI 2026</h3>
            <p class="tkt-pass-meta">${esc(ticketsData.metaLine)}</p>
          </div>

          <div class="tkt-pass-cta">
            <a href="${esc(links.tickets)}" target="_blank" rel="noopener noreferrer" class="btn-link-inline">${esc(ticketsData.ctaLabel)}</a>
          </div>
        </div>
      </div>
    </section>
  `;
}

export function mountTicketsSection() {
  return () => {};
}
