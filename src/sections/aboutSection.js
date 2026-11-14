/**
 * About Section (#13):
 * - Editorial intro and static normal-flow 6-pillar layout (no scroll-pinning or kolam engine).
 */
import { esc } from '../utils/dom.js';

const PILLAR_EMBLEMS = [
  // 01 Roadshows: concentric radar propagation arcs
  `<svg viewBox="0 0 64 64" width="56" height="56" fill="none" aria-hidden="true">
    <circle cx="32" cy="32" r="24" stroke="currentColor" stroke-width="1.4" stroke-dasharray="4 4"/>
    <circle cx="32" cy="32" r="14" stroke="#5ef3ff" stroke-width="1.5"/>
    <circle cx="32" cy="32" r="4" fill="#9b5cff"/>
    <line x1="32" y1="2" x2="32" y2="12" stroke="#5ef3ff" stroke-width="1.5"/>
    <line x1="32" y1="52" x2="32" y2="62" stroke="#5ef3ff" stroke-width="1.5"/>
    <line x1="2" y1="32" x2="12" y2="32" stroke="#5ef3ff" stroke-width="1.5"/>
    <line x1="52" y1="32" x2="62" y2="32" stroke="#5ef3ff" stroke-width="1.5"/>
  </svg>`,
  // 02 Build Sessions: isometric architectural cube wireframe
  `<svg viewBox="0 0 64 64" width="56" height="56" fill="none" aria-hidden="true">
    <polygon points="32,8 54,20 54,44 32,56 10,44 10,20" stroke="#5ef3ff" stroke-width="1.5"/>
    <polyline points="10,20 32,32 54,20" stroke="currentColor" stroke-width="1.4"/>
    <line x1="32" y1="32" x2="32" y2="56" stroke="#9b5cff" stroke-width="1.5"/>
    <circle cx="32" cy="32" r="3" fill="#5ef3ff"/>
  </svg>`,
  // 03 Competitions: twin orthogonal chevrons & apex prism
  `<svg viewBox="0 0 64 64" width="56" height="56" fill="none" aria-hidden="true">
    <polygon points="32,8 50,32 32,56 14,32" stroke="#9b5cff" stroke-width="1.5"/>
    <polyline points="20,24 32,14 44,24" stroke="#5ef3ff" stroke-width="1.5"/>
    <polyline points="20,40 32,50 44,40" stroke="#5ef3ff" stroke-width="1.5"/>
    <line x1="8" y1="32" x2="56" y2="32" stroke="currentColor" stroke-width="1.2" opacity="0.6"/>
  </svg>`,
  // 04 Tech Talks: harmonic carrier waves
  `<svg viewBox="0 0 64 64" width="56" height="56" fill="none" aria-hidden="true">
    <path d="M6 32 C14 14, 22 14, 32 32 C42 50, 50 50, 58 32" stroke="#5ef3ff" stroke-width="1.6"/>
    <path d="M6 32 C14 50, 22 50, 32 32 C42 14, 50 14, 58 32" stroke="#9b5cff" stroke-width="1.4" opacity="0.85"/>
    <line x1="4" y1="32" x2="60" y2="32" stroke="currentColor" stroke-width="1" stroke-dasharray="3 3"/>
  </svg>`,
  // 05 Networking: geodesic graph node lattice
  `<svg viewBox="0 0 64 64" width="56" height="56" fill="none" aria-hidden="true">
    <circle cx="32" cy="14" r="3.5" fill="#5ef3ff"/>
    <circle cx="14" cy="44" r="3.5" fill="#9b5cff"/>
    <circle cx="50" cy="44" r="3.5" fill="#5ef3ff"/>
    <circle cx="32" cy="34" r="4" stroke="currentColor" stroke-width="1.4"/>
    <line x1="32" y1="14" x2="14" y2="44" stroke="currentColor" stroke-width="1.3" opacity="0.75"/>
    <line x1="14" y1="44" x2="50" y2="44" stroke="#5ef3ff" stroke-width="1.3"/>
    <line x1="50" y1="44" x2="32" y2="14" stroke="#9b5cff" stroke-width="1.3"/>
  </svg>`,
  // 06 Community: 3x3 kolam pulli dot loop
  `<svg viewBox="0 0 64 64" width="56" height="56" fill="none" aria-hidden="true">
    <path d="M20 12 C28 12, 28 24, 32 24 C36 24, 36 12, 44 12 C52 12, 52 24, 44 32 C52 40, 52 52, 44 52 C36 52, 36 40, 32 40 C28 40, 28 52, 20 52 C12 52, 12 40, 20 32 C12 24, 12 12, 20 12 Z" stroke="#5ef3ff" stroke-width="1.5"/>
    <circle cx="22" cy="22" r="2" fill="#f3f6ff"/>
    <circle cx="42" cy="22" r="2" fill="#f3f6ff"/>
    <circle cx="32" cy="32" r="2.5" fill="#9b5cff"/>
    <circle cx="22" cy="42" r="2" fill="#f3f6ff"/>
    <circle cx="42" cy="42" r="2" fill="#f3f6ff"/>
  </svg>`,
];

function parsePillarParts(rawTitle) {
  const m = String(rawTitle || '').match(/^(\d+)\s*[—-]\s*(.+)$/);
  if (m) return { code: m[1].padStart(2, '0'), name: m[2].trim(), full: rawTitle };
  return { code: '01', name: rawTitle, full: rawTitle };
}

export function renderAboutSection(aboutData) {
  const pillars = aboutData.pillars || [];
  const totalStr = String(pillars.length).padStart(2, '0');

  return `
    <section id="about" class="stage-section about-stage" aria-labelledby="heading-about">
      <div class="about-editorial-grid">
        <div class="about-editorial-lead">
          <span class="stage-eyebrow">${esc(aboutData.tag)}</span>
          <h2 id="heading-about" class="stage-display">${esc(aboutData.heading)}</h2>
        </div>

        <div class="about-editorial-copy">
          ${(aboutData.paragraphs || []).map((p, idx) => `
            <p class="${idx === 0 ? 'stage-lead' : 'about-manifesto-quote'}">${esc(p)}</p>
          `).join('')}
        </div>
      </div>

      <div id="experience" class="about-rail-wrapper" aria-label="DevFest Experience Sections">
        <div class="about-pillars-grid">
          ${pillars.map((pillar, i) => {
            const { code, full } = parsePillarParts(pillar.title);
            const emblem = PILLAR_EMBLEMS[i % PILLAR_EMBLEMS.length];
            return `
              <article class="about-pillar-card" data-pillar-index="${i}">
                <div class="about-pillar-top">
                  <span class="about-pillar-num">G_${code}</span>
                  <div class="about-pillar-emblem">${emblem}</div>
                </div>
                <h3 class="about-pillar-title">${esc(full)}</h3>
                <p class="about-pillar-body">${esc(pillar.body)}</p>
              </article>
            `;
          }).join('')}
        </div>
      </div>
    </section>
  `;
}

export function mountAboutSection() {
  return () => {};
}
