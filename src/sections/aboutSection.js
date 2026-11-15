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
  // 01 Roadshows: outreach signal waves
  `<svg viewBox="0 0 40 40" width="24" height="24" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <circle cx="20" cy="20" r="14" stroke="currentColor" stroke-width="1.5" stroke-dasharray="3 3" opacity="0.65"/>
    <circle cx="20" cy="20" r="8.5" stroke="#5ef3ff" stroke-width="1.5"/>
    <circle cx="20" cy="20" r="2.5" fill="#5ef3ff"/>
    <line x1="20" y1="3" x2="20" y2="7" stroke="#5ef3ff" stroke-width="1.5"/>
    <line x1="20" y1="33" x2="20" y2="37" stroke="#5ef3ff" stroke-width="1.5"/>
    <line x1="3" y1="20" x2="7" y2="20" stroke="#5ef3ff" stroke-width="1.5"/>
    <line x1="33" y1="20" x2="37" y2="20" stroke="#5ef3ff" stroke-width="1.5"/>
  </svg>`,
  // 02 Build Sessions: architectural cube
  `<svg viewBox="0 0 40 40" width="24" height="24" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <polygon points="20,5 33,12.5 33,27.5 20,35 7,27.5 7,12.5" stroke="#5ef3ff" stroke-width="1.5"/>
    <polyline points="7,12.5 20,20 33,12.5" stroke="currentColor" stroke-width="1.5"/>
    <line x1="20" y1="20" x2="20" y2="35" stroke="currentColor" stroke-width="1.5"/>
    <circle cx="20" cy="20" r="2.2" fill="#5ef3ff"/>
  </svg>`,
  // 03 Competitions: twin chevrons & apex prism
  `<svg viewBox="0 0 40 40" width="24" height="24" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <polygon points="20,5 32,20 20,35 8,20" stroke="currentColor" stroke-width="1.5" opacity="0.8"/>
    <polyline points="13,15 20,9 27,15" stroke="#5ef3ff" stroke-width="1.5"/>
    <polyline points="13,25 20,31 27,25" stroke="#5ef3ff" stroke-width="1.5"/>
    <line x1="6" y1="20" x2="34" y2="20" stroke="currentColor" stroke-width="1.3" opacity="0.55"/>
  </svg>`,
  // 04 Tech Talks: harmonic carrier waves
  `<svg viewBox="0 0 40 40" width="24" height="24" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M5 20 C10 8, 15 8, 20 20 C25 32, 30 32, 35 20" stroke="#5ef3ff" stroke-width="1.6"/>
    <path d="M5 20 C10 32, 15 32, 20 20 C25 8, 30 8, 35 20" stroke="currentColor" stroke-width="1.4" opacity="0.65"/>
    <line x1="4" y1="20" x2="36" y2="20" stroke="currentColor" stroke-width="1.2" stroke-dasharray="2.5 2.5" opacity="0.5"/>
  </svg>`,
  // 05 Networking: geodesic graph lattice
  `<svg viewBox="0 0 40 40" width="24" height="24" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <line x1="20" y1="9" x2="9" y2="29" stroke="currentColor" stroke-width="1.5" opacity="0.7"/>
    <line x1="9" y1="29" x2="31" y2="29" stroke="#5ef3ff" stroke-width="1.5"/>
    <line x1="31" y1="29" x2="20" y2="9" stroke="currentColor" stroke-width="1.5" opacity="0.7"/>
    <circle cx="20" cy="9" r="2.5" fill="#5ef3ff"/>
    <circle cx="9" cy="29" r="2.5" stroke="#5ef3ff" stroke-width="1.5" fill="#080d2c"/>
    <circle cx="31" cy="29" r="2.5" fill="#5ef3ff"/>
    <circle cx="20" cy="22" r="2.8" stroke="currentColor" stroke-width="1.4"/>
  </svg>`,
  // 06 Community: geometric kolam pulli loop
  `<svg viewBox="0 0 40 40" width="24" height="24" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M13 8 C18 8, 18 15, 20 15 C22 15, 22 8, 27 8 C32 8, 32 15, 27 20 C32 25, 32 32, 27 32 C22 32, 22 25, 20 25 C18 25, 18 32, 13 32 C8 32, 8 25, 13 20 C8 15, 8 8, 13 8 Z" stroke="#5ef3ff" stroke-width="1.5"/>
    <circle cx="14" cy="14" r="1.5" fill="currentColor"/>
    <circle cx="26" cy="14" r="1.5" fill="currentColor"/>
    <circle cx="20" cy="20" r="2" fill="#5ef3ff"/>
    <circle cx="14" cy="26" r="1.5" fill="currentColor"/>
    <circle cx="26" cy="26" r="1.5" fill="currentColor"/>
  </svg>`,
];

const PILLAR_CATEGORIES = [
  'Community Outreach',
  'Hands-On Labs',
  'Challenges',
  'Expert Sessions',
  'Peer Networking',
  'Developer Ecosystem',
];

function formatTitleCase(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/\b\w/g, (ch) => ch.toUpperCase());
}

function parsePillarParts(rawTitle) {
  const m = String(rawTitle || '').match(/^(\d+)\s*[—-]\s*(.+)$/);
  if (m) return { code: m[1].padStart(2, '0'), name: formatTitleCase(m[2].trim()), full: rawTitle };
  return { code: '01', name: formatTitleCase(rawTitle), full: rawTitle };
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
              <span class="about-rail-kicker">EXPERIENCE PILLARS</span>
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
                const category = PILLAR_CATEGORIES[i] || 'Experience';
                return `
                  <article class="about-pillar-card${i === 0 ? ' is-active' : ''}" data-pillar-index="${i}" style="--ci:${i}" tabindex="0">
                    <div class="about-pillar-top">
                      <span class="about-pillar-category">${esc(category)}</span>
                      <div class="about-pillar-emblem">${emblem}</div>
                    </div>
                    <div class="about-pillar-content">
                      <h3 class="about-pillar-title" data-hover-glyph="true">${esc(name)}</h3>
                      <p class="about-pillar-body">${esc(pillar.body)}</p>
                    </div>
                    <footer class="about-pillar-foot">
                      <span class="about-pillar-rule" aria-hidden="true"></span>
                      <span class="about-pillar-num" aria-hidden="true">${code}</span>
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
