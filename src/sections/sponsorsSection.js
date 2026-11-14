/**
 * Sponsors & Community Partners Section — Open Sponsor Tiers + Pauseable Partner Strip
 */
import eventData from '../data/event.json';
import sponsorsData from '../data/sponsors.json';
import {
  esc,
  renderStatusChip,
} from '../utils/dom.js';

export function renderSponsorsSection() {
  const sponsors = sponsorsData.sponsors || [];
  const platinum = sponsors[0];
  const goldSlots = sponsors.slice(1);
  const partners = sponsorsData.partners || [];

  const renderPartnerTile = (p, duplicate = false) => `
    <div class="spn-marquee-item" ${duplicate ? 'aria-hidden="true"' : ''}>
      <img src="${esc(p.src)}" alt="${duplicate ? '' : esc(p.alt)}" loading="lazy" decoding="async" />
      <span class="spn-marquee-label">${esc(p.alt || p.label)}</span>
    </div>
  `;

  return `
    <section id="sponsors" class="stage-section" aria-labelledby="heading-sponsors">
      <div class="stage-asymmetric stage-asymmetric--flip">
        <div class="graphic-window" data-creature-zone="sponsors" aria-hidden="true"></div>

        <div class="content-zone local-scrim">
          <div class="stage-section-head">
            <div>
              <span class="stage-eyebrow" data-scramble="true">${esc(sponsorsData.tag)}</span>
              <h2 id="heading-sponsors" class="stage-display" data-reveal="mask">${esc(sponsorsData.heading)}</h2>
            </div>
          </div>
          <p class="stage-lead">${esc(sponsorsData.copy)}</p>

          <div class="spn-tier-stack">
            ${platinum ? `
              <div class="spn-tier-card spn-tier-card--platinum">
                <div class="spn-tier-meta">
                  <span class="spn-tier-rank">PLATINUM SPONSOR TIER</span>
                  ${renderStatusChip('SPONSOR SLOT OPEN', 'open')}
                </div>
                <div class="spn-logo-monolith spn-logo-platinum">
                  <img src="${esc(platinum.src)}" alt="${esc(platinum.alt)}" loading="lazy" decoding="async" />
                </div>
                <p class="spn-slot-note">Partner with Madurai's flagship tech festival — brand visibility, workshop tracks, and community booth presence.</p>
              </div>
            ` : ''}

            <div class="spn-tier-gold-row">
              ${goldSlots.map((slot, idx) => `
                <div class="spn-tier-card spn-tier-card--gold">
                  <div class="spn-tier-meta">
                    <span class="spn-tier-rank">GOLD SPONSOR TIER 0${idx + 1}</span>
                    ${renderStatusChip('SPONSOR SLOT OPEN', 'tba')}
                  </div>
                  <div class="spn-logo-monolith spn-logo-gold">
                    <img src="${esc(slot.src)}" alt="${esc(slot.alt)}" loading="lazy" decoding="async" />
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <div class="spn-cta-callout">
            <p class="spn-cta-text">Interested in sponsoring DevFest Madurai 2026? Reach the GDG Madurai organising team directly.</p>
            <a href="${esc(eventData.links.email)}" class="btn-g-primary">BECOME A SPONSOR · ${esc(eventData.links.emailLabel)}</a>
          </div>
        </div>
      </div>

      <div class="spn-partners-wrap" aria-label="Community Partners">
        <div class="spn-partners-head">
          <span class="spn-tier-rank">ECOSYSTEM // COMMUNITY PARTNERS</span>
          <button
            type="button"
            id="spn-marquee-toggle"
            class="btn-g-secondary spn-pause-btn"
            aria-pressed="false"
          >
            PAUSE MARQUEE
          </button>
        </div>

        <div class="spn-marquee-band" id="spn-marquee-band">
          <div class="spn-marquee-track spn-marquee-fwd">
            ${partners.map((p) => renderPartnerTile(p, false)).join('')}
            ${partners.map((p) => renderPartnerTile(p, true)).join('')}
          </div>
        </div>
      </div>
    </section>
  `;
}

export function mountSponsorsSection() {
  const toggleBtn = document.getElementById('spn-marquee-toggle');
  const band = document.getElementById('spn-marquee-band');
  if (!toggleBtn || !band) return () => {};

  const onToggle = () => {
    const paused = band.classList.toggle('is-paused');
    toggleBtn.setAttribute('aria-pressed', String(paused));
    toggleBtn.textContent = paused ? 'RESUME MARQUEE' : 'PAUSE MARQUEE';
  };

  toggleBtn.addEventListener('click', onToggle);
  return () => toggleBtn.removeEventListener('click', onToggle);
}
