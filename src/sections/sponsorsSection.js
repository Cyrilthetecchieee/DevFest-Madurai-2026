/**
 * Sponsors & Community Partners Section (#19):
 * - Scale hierarchy: monumental Platinum slot -> twin Gold slots -> dual-speed opposing marquee.
 * - Pause on hover / focus-within, monochrome-to-ink hover transition.
 * - Reduced-motion falls back cleanly to a static grid without marquee clones.
 */
import sponsorsData from '../data/sponsors.json';
import { esc } from '../utils/dom.js';

function renderMarqueeItems(items, clone = false) {
  return items
    .map(
      (p) => `
      <div class="spn-marquee-item"${clone ? ' aria-hidden="true"' : ''}>
        <img src="${esc(p.src)}" alt="${clone ? '' : esc(p.alt)}" width="220" height="72" loading="lazy" />
        <span class="spn-marquee-label">${esc(p.label)}</span>
      </div>
    `
    )
    .join('');
}

export function renderSponsorsSection() {
  const sponsors = sponsorsData.sponsors || [];
  const platinum = sponsors[0];
  const golds = sponsors.slice(1);
  const partners = sponsorsData.partners || [];
  const split = Math.ceil(partners.length / 2);
  const rowA = partners.slice(0, split);
  const rowB = partners.slice(split).length ? partners.slice(split) : partners;

  return `
    <section id="sponsors" class="stage-section spn-stage" data-waypoint="7" aria-labelledby="heading-sponsors">
      <div class="spn-header">
        <span class="stage-eyebrow" data-scramble="true">${esc(sponsorsData.tag)}</span>
        <h2 id="heading-sponsors" class="stage-display" data-reveal="mask" data-track-scroll="true">${esc(sponsorsData.heading)}</h2>
        <p class="stage-lead">${esc(sponsorsData.copy)}</p>
      </div>

      <div class="spn-tier-stack" aria-label="Sponsor Placeholders">
        ${platinum ? `
          <div class="spn-tier-platinum">
            <div class="spn-tier-meta">
              <span class="spn-tier-rank">TIER 01 // PLATINUM PARTNER</span>
              <span class="orbe-badge-tba">${esc(platinum.label)}</span>
            </div>
            <div class="spn-logo-monolith spn-logo-platinum" tabindex="0">
              <img src="${esc(platinum.src)}" alt="${esc(platinum.alt)}" width="420" height="104" loading="lazy" />
            </div>
          </div>
        ` : ''}

        ${golds.length ? `
          <div class="spn-tier-gold-row">
            ${golds.map((g, i) => `
              <div class="spn-tier-gold-card">
                <div class="spn-tier-meta">
                  <span class="spn-tier-rank">TIER 02 // GOLD 0${i + 1}</span>
                  <span class="orbe-badge-tba">${esc(g.label)}</span>
                </div>
                <div class="spn-logo-monolith spn-logo-gold" tabindex="0">
                  <img src="${esc(g.src)}" alt="${esc(g.alt)}" width="320" height="80" loading="lazy" />
                </div>
              </div>
            `).join('')}
          </div>
        ` : ''}
      </div>

      <div class="spn-partners-wrap" aria-label="Community Partners">
        <div class="spn-partners-head">
          <span class="spn-tier-rank">ECOSYSTEM // COMMUNITY PARTNERS</span>
          <span class="spn-marquee-hint">HOVER OR FOCUS TO PAUSE</span>
        </div>

        <div class="spn-marquee-band">
          <div class="spn-marquee-track spn-marquee-fwd">
            ${renderMarqueeItems(rowA, false)}
            ${renderMarqueeItems(rowA, true)}
          </div>
        </div>

        <div class="spn-marquee-band">
          <div class="spn-marquee-track spn-marquee-rev">
            ${renderMarqueeItems(rowB, false)}
            ${renderMarqueeItems(rowB, true)}
          </div>
        </div>
      </div>
    </section>
  `;
}
