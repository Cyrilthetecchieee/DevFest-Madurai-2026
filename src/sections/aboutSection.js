/**
 * About Section — Editorial Overview & Asymmetric Pillars Grid
 */
import { esc } from '../utils/dom.js';

const PILLAR_EMBLEMS = [
  '<rect x="6" y="10" width="24" height="16" rx="2" stroke="currentColor" stroke-width="1.6" fill="none"/><path d="M13 18h10M18 13v10" stroke="currentColor" stroke-width="1.6"/>',
  '<polygon points="18,4 31,12 31,24 18,32 5,24 5,12" stroke="currentColor" stroke-width="1.6" fill="none"/><circle cx="18" cy="18" r="3" fill="currentColor"/>',
  '<path d="M8 26 L18 8 L28 26 Z" stroke="currentColor" stroke-width="1.6" fill="none"/><circle cx="18" cy="20" r="2.2" fill="currentColor"/>',
  '<circle cx="18" cy="18" r="12" stroke="currentColor" stroke-width="1.6" fill="none"/><path d="M12 18h12M18 12v12" stroke="currentColor" stroke-width="1.6"/>',
  '<circle cx="11" cy="14" r="3.5" stroke="currentColor" stroke-width="1.5" fill="none"/><circle cx="25" cy="14" r="3.5" stroke="currentColor" stroke-width="1.5" fill="none"/><circle cx="18" cy="25" r="3.5" stroke="currentColor" stroke-width="1.5" fill="none"/><path d="M14 15.5l8 0M12.5 17.5l4 5.5M23.5 17.5l-4 5.5" stroke="currentColor" stroke-width="1.4"/>',
  '<rect x="7" y="7" width="9" height="9" stroke="currentColor" stroke-width="1.5" fill="none"/><rect x="20" y="7" width="9" height="9" stroke="currentColor" stroke-width="1.5" fill="none"/><rect x="7" y="20" width="9" height="9" stroke="currentColor" stroke-width="1.5" fill="none"/><rect x="20" y="20" width="9" height="9" fill="currentColor"/>',
];

const PILLAR_COLORS = ['cyan', 'violet', 'aqua', 'ice', 'cyan', 'violet'];

function parsePillarParts(rawTitle, index) {
  const idxMatch = String(rawTitle).match(/^(\d{2})\s*[—-]\s*(.+)$/);
  if (idxMatch) {
    return { num: idxMatch[1], title: idxMatch[2] };
  }
  return { num: `0${index + 1}`, title: rawTitle };
}

export function renderAboutSection(aboutData) {
  const pillars = aboutData.pillars || [];

  return `
    <section id="about" class="stage-section about-stage" aria-labelledby="heading-about">
      <div class="stage-section-head">
        <div>
          <span class="stage-eyebrow">${esc(aboutData.tag)}</span>
          <h2 id="heading-about" class="stage-display">${esc(aboutData.heading)}</h2>
        </div>
      </div>

      <div class="about-editorial-grid">
        <div class="about-editorial-lead">
          <p class="stage-lead">${esc(aboutData.paragraphs[0])}</p>
        </div>

        <div class="about-editorial-copy">
          <p class="about-manifesto-quote">${esc(aboutData.paragraphs[1])}</p>
        </div>
      </div>

      <div class="about-pillars-grid">
        ${pillars.map((pillar, idx) => {
          const parts = parsePillarParts(pillar.title, idx);
          const colorTone = PILLAR_COLORS[idx % PILLAR_COLORS.length];
          return `
            <article class="about-pillar-card about-pillar-card--${colorTone}">
              <div class="about-pillar-top">
                <span class="about-pillar-num">${esc(parts.num)}</span>
                <svg class="about-pillar-emblem" viewBox="0 0 36 36" width="28" height="28" aria-hidden="true">
                  ${PILLAR_EMBLEMS[idx % PILLAR_EMBLEMS.length]}
                </svg>
              </div>
              <h3 class="about-pillar-title">${esc(parts.title)}</h3>
              <p class="about-pillar-body">${esc(pillar.body)}</p>
            </article>
          `;
        }).join('')}
      </div>
    </section>
  `;
}

export function mountAboutSection() {
  return () => {};
}
