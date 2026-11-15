/**
 * About Section (#13):
 * - Asymmetric 2-column editorial intro with interactive Kolam backdrop (S2).
 * - Responsive 3-column (desktop) / 2-column (tablet) / 1-column (mobile) HUD Experience Pillars grid
 *   with angular clipped corners, cyan identifiers, minimal outline icons, technical captions,
 *   and partial bottom accent bars.
 */
import { esc } from '../utils/dom.js';
import { prefersReducedMotion } from '../utils/env.js';
import { mountInteractiveKolamSvg } from '../visuals/kolamEngine.js';

const PILLAR_EMBLEMS = [
  // 01 Roadshows: concentric radar propagation arcs
  `<svg viewBox="0 0 48 48" width="40" height="40" fill="none" aria-hidden="true">
    <circle cx="24" cy="24" r="18" stroke="currentColor" stroke-width="1.3" stroke-dasharray="3 3"/>
    <circle cx="24" cy="24" r="10.5" stroke="#5ef3ff" stroke-width="1.4"/>
    <circle cx="24" cy="24" r="2.8" fill="#5ef3ff"/>
    <line x1="24" y1="2" x2="24" y2="9" stroke="#5ef3ff" stroke-width="1.4"/>
    <line x1="24" y1="39" x2="24" y2="46" stroke="#5ef3ff" stroke-width="1.4"/>
    <line x1="2" y1="24" x2="9" y2="24" stroke="#5ef3ff" stroke-width="1.4"/>
    <line x1="39" y1="24" x2="46" y2="24" stroke="#5ef3ff" stroke-width="1.4"/>
  </svg>`,
  // 02 Build Sessions: isometric architectural cube wireframe
  `<svg viewBox="0 0 48 48" width="40" height="40" fill="none" aria-hidden="true">
    <polygon points="24,6 40,15 40,33 24,42 8,33 8,15" stroke="#5ef3ff" stroke-width="1.4"/>
    <polyline points="8,15 24,24 40,15" stroke="currentColor" stroke-width="1.3"/>
    <line x1="24" y1="24" x2="24" y2="42" stroke="currentColor" stroke-width="1.3"/>
    <circle cx="24" cy="24" r="2.4" fill="#5ef3ff"/>
  </svg>`,
  // 03 Competitions: twin orthogonal chevrons & apex prism
  `<svg viewBox="0 0 48 48" width="40" height="40" fill="none" aria-hidden="true">
    <polygon points="24,6 38,24 24,42 10,24" stroke="currentColor" stroke-width="1.3"/>
    <polyline points="15,18 24,11 33,18" stroke="#5ef3ff" stroke-width="1.4"/>
    <polyline points="15,30 24,37 33,30" stroke="#5ef3ff" stroke-width="1.4"/>
    <line x1="6" y1="24" x2="42" y2="24" stroke="currentColor" stroke-width="1.1" opacity="0.6"/>
  </svg>`,
  // 04 Tech Talks: harmonic carrier waves
  `<svg viewBox="0 0 48 48" width="40" height="40" fill="none" aria-hidden="true">
    <path d="M5 24 C11 10, 17 10, 24 24 C31 38, 37 38, 43 24" stroke="#5ef3ff" stroke-width="1.5"/>
    <path d="M5 24 C11 38, 17 38, 24 24 C31 10, 37 10, 43 24" stroke="currentColor" stroke-width="1.2" opacity="0.75"/>
    <line x1="4" y1="24" x2="44" y2="24" stroke="currentColor" stroke-width="1" stroke-dasharray="2.5 2.5" opacity="0.6"/>
  </svg>`,
  // 05 Networking: geodesic graph node lattice
  `<svg viewBox="0 0 48 48" width="40" height="40" fill="none" aria-hidden="true">
    <circle cx="24" cy="10" r="2.8" fill="#5ef3ff"/>
    <circle cx="10" cy="34" r="2.8" stroke="#5ef3ff" stroke-width="1.4"/>
    <circle cx="38" cy="34" r="2.8" fill="#5ef3ff"/>
    <circle cx="24" cy="25" r="3.2" stroke="currentColor" stroke-width="1.3"/>
    <line x1="24" y1="10" x2="10" y2="34" stroke="currentColor" stroke-width="1.2" opacity="0.75"/>
    <line x1="10" y1="34" x2="38" y2="34" stroke="#5ef3ff" stroke-width="1.3"/>
    <line x1="38" y1="34" x2="24" y2="10" stroke="currentColor" stroke-width="1.2" opacity="0.75"/>
  </svg>`,
  // 06 Community: geometric kolam pulli loop
  `<svg viewBox="0 0 48 48" width="40" height="40" fill="none" aria-hidden="true">
    <path d="M15 9 C21 9, 21 18, 24 18 C27 18, 27 9, 33 9 C39 9, 39 18, 33 24 C39 30, 39 39, 33 39 C27 39, 27 30, 24 30 C21 30, 21 39, 15 39 C9 39, 9 30, 15 24 C9 18, 9 9, 15 9 Z" stroke="#5ef3ff" stroke-width="1.4"/>
    <circle cx="16.5" cy="16.5" r="1.6" fill="currentColor"/>
    <circle cx="31.5" cy="16.5" r="1.6" fill="currentColor"/>
    <circle cx="24" cy="24" r="2" fill="#5ef3ff"/>
    <circle cx="16.5" cy="31.5" r="1.6" fill="currentColor"/>
    <circle cx="31.5" cy="31.5" r="1.6" fill="currentColor"/>
  </svg>`,
];

const PILLAR_CAPTIONS = [
  'G_01 // OUTREACH',
  'G_02 // DEVELOPMENT',
  'G_03 // CHALLENGE',
  'G_04 // KNOWLEDGE',
  'G_05 // COMMUNITY',
  'G_06 // CONNECTION',
];

const PILLAR_COORDS = [
  '09.92N · 01',
  '09.92N · 02',
  '09.92N · 03',
  '09.92N · 04',
  '09.92N · 05',
  '09.92N · 06',
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
    <section id="about" class="stage-section about-stage" data-waypoint="1" aria-labelledby="heading-about">
      <div class="about-editorial-grid">
        <div class="about-editorial-lead">
          <div id="about-kolam-stage" class="about-kolam-backdrop" aria-hidden="true"></div>
          <span class="stage-eyebrow" data-scramble="true">${esc(aboutData.tag)}</span>
          <h2 id="heading-about" class="stage-display" data-reveal="mask" data-track-scroll="true">${esc(aboutData.heading)}</h2>
        </div>

        <div class="about-editorial-copy">
          ${(aboutData.paragraphs || []).map((p, idx) => `
            <p class="${idx === 0 ? 'stage-lead' : 'about-manifesto-quote'}">${esc(p)}</p>
          `).join('')}
        </div>
      </div>

      <div id="experience" class="about-rail-wrapper" aria-label="DevFest Experience Sections">
        <div class="about-rail-pin" id="about-rail-pin">
          <div class="about-rail-header">
            <div class="about-rail-counter">
              <span class="about-rail-index" id="about-pillar-index">01</span>
              <span class="about-rail-total">/ ${totalStr}</span>
              <span class="about-rail-kicker">PILLARS // WAYPOINT 02</span>
            </div>
            <div class="about-rail-controls">
              <button type="button" class="about-rail-btn" id="about-prev-btn" aria-label="Previous pillar">&#8592;</button>
              <button type="button" class="about-rail-btn" id="about-next-btn" aria-label="Next pillar">&#8594;</button>
            </div>
          </div>

          <div class="about-rail-progress" aria-hidden="true">
            <div class="about-rail-progress-fill" id="about-rail-progress-fill"></div>
          </div>

          <div class="about-rail-viewport" id="about-rail-viewport">
            <div class="about-rail-track" id="about-rail-track">
              ${pillars.map((pillar, i) => {
                const { code, name } = parsePillarParts(pillar.title);
                const emblem = PILLAR_EMBLEMS[i % PILLAR_EMBLEMS.length];
                const caption = PILLAR_CAPTIONS[i] || `G_${code} // PILLAR`;
                const coord = PILLAR_COORDS[i] || `09.92N · ${code}`;
                return `
                  <article class="about-pillar-card${i === 0 ? ' is-active' : ''}" data-pillar-index="${i}" style="--ci:${i}" tabindex="0">
                    <span class="about-pillar-corners" aria-hidden="true"></span>
                    <div class="about-pillar-top">
                      <span class="about-pillar-num" aria-hidden="true">${code}</span>
                      <div class="about-pillar-emblem">${emblem}</div>
                    </div>
                    <div class="about-pillar-content">
                      <h3 class="about-pillar-title" data-hover-glyph="true">${esc(name)}</h3>
                      <p class="about-pillar-body">${esc(pillar.body)}</p>
                    </div>
                    <footer class="about-pillar-foot">
                      <div class="about-pillar-caption">${esc(caption)}</div>
                      <div class="about-pillar-bottom">
                        <span class="about-pillar-rule" aria-hidden="true"></span>
                        <span class="about-pillar-coord" aria-hidden="true">${esc(coord)}</span>
                      </div>
                    </footer>
                  </article>
                `;
              }).join('')}
            </div>
          </div>
        </div>
      </div>
    </section>
  `;
}

export function mountAboutSection() {
  const kolamStage = document.getElementById('about-kolam-stage');
  const trackEl = document.getElementById('about-rail-track');
  const indexEl = document.getElementById('about-pillar-index');
  const progressFill = document.getElementById('about-rail-progress-fill');
  const prevBtn = document.getElementById('about-prev-btn');
  const nextBtn = document.getElementById('about-next-btn');
  const cards = Array.from(document.querySelectorAll('.about-pillar-card'));

  const cleanups = [];

  if (kolamStage) {
    const kolamCtrl = mountInteractiveKolamSvg(kolamStage, {
      gridRadius: 3,
      size: 420,
      seed: 202601,
      drawOnScroll: true,
      className: 'about-kolam-svg',
    });
    cleanups.push(() => kolamCtrl.destroy());
  }

  let activeIdx = 0;
  function setActivePillar(nextIdx) {
    if (!cards.length) return;
    const clamped = Math.max(0, Math.min(cards.length - 1, nextIdx));
    activeIdx = clamped;
    if (indexEl) indexEl.textContent = String(clamped + 1).padStart(2, '0');
    cards.forEach((c, idx) => c.classList.toggle('is-active', idx === clamped));
    if (progressFill && cards.length > 1) {
      progressFill.style.transform = `scaleX(${Math.max(0.08, clamped / (cards.length - 1))})`;
    }
  }

  function stepCarousel(dir) {
    if (!cards.length) return;
    const targetIdx = (activeIdx + dir + cards.length) % cards.length;
    setActivePillar(targetIdx);
    const card = cards[targetIdx];
    card?.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'nearest' });
  }

  const onPrevClick = () => stepCarousel(-1);
  const onNextClick = () => stepCarousel(1);
  prevBtn?.addEventListener('click', onPrevClick);
  nextBtn?.addEventListener('click', onNextClick);
  cleanups.push(() => {
    prevBtn?.removeEventListener('click', onPrevClick);
    nextBtn?.removeEventListener('click', onNextClick);
  });

  cards.forEach((card, idx) => {
    const onActivate = () => setActivePillar(idx);
    card.addEventListener('pointerenter', onActivate);
    card.addEventListener('focus', onActivate);
    card.addEventListener('click', onActivate);
    cleanups.push(() => {
      card.removeEventListener('pointerenter', onActivate);
      card.removeEventListener('focus', onActivate);
      card.removeEventListener('click', onActivate);
    });
  });

  // Subtle numbering & card reveal when entering viewport
  if (cards.length) {
    if (prefersReducedMotion() || typeof IntersectionObserver === 'undefined') {
      cards.forEach((c) => c.classList.add('is-in-view'));
    } else {
      const io = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-in-view');
              io.unobserve(entry.target);
            }
          }
        },
        { threshold: 0.15, rootMargin: '0px 0px -6% 0px' }
      );
      cards.forEach((c) => io.observe(c));
      cleanups.push(() => io.disconnect());
    }
  }

  setActivePillar(0);
  if (trackEl) trackEl.style.transform = '';

  return () => {
    cleanups.forEach((fn) => fn());
  };
}
