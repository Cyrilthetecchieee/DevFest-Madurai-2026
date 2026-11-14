/**
 * About Section (#13):
 * - Asymmetric 2-column editorial intro with interactive Kolam backdrop (S2).
 * - Desktop pinned horizontal 6-pillar architectural rail (01-06 counter, hairline progress bar,
 *   bespoke geometric SVG emblem per pillar).
 * - Mobile / reduced-motion horizontal snap-scroll carousel.
 */
import { esc } from '../utils/dom.js';
import { prefersReducedMotion } from '../utils/env.js';
import { mountInteractiveKolamSvg } from '../visuals/kolamEngine.js';

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
                const { code, full } = parsePillarParts(pillar.title);
                const emblem = PILLAR_EMBLEMS[i % PILLAR_EMBLEMS.length];
                return `
                  <article class="about-pillar-card${i === 0 ? ' is-active' : ''}" data-pillar-index="${i}" tabindex="0">
                    <div class="about-pillar-top">
                      <span class="about-pillar-num">G_${code}</span>
                      <div class="about-pillar-emblem">${emblem}</div>
                    </div>
                    <h3 class="about-pillar-title" data-hover-glyph="true">${esc(full)}</h3>
                    <p class="about-pillar-body">${esc(pillar.body)}</p>
                    <span class="about-pillar-rule" aria-hidden="true"></span>
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
  const pinEl = document.getElementById('about-rail-pin');
  const viewportEl = document.getElementById('about-rail-viewport');
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
    const clamped = Math.max(0, Math.min(cards.length - 1, nextIdx));
    activeIdx = clamped;
    if (indexEl) indexEl.textContent = String(clamped + 1).padStart(2, '0');
    cards.forEach((c, idx) => c.classList.toggle('is-active', idx === clamped));
    if (progressFill && cards.length > 1) {
      progressFill.style.transform = `scaleX(${Math.max(0.08, clamped / (cards.length - 1))})`;
    }
  }

  function stepCarousel(dir) {
    const targetIdx = Math.max(0, Math.min(cards.length - 1, activeIdx + dir));
    setActivePillar(targetIdx);
    const card = cards[targetIdx];
    if (!card || !viewportEl) return;
    if (window.innerWidth <= 820 || prefersReducedMotion()) {
      card.scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
    } else if (stInstance) {
      const targetScroll = stInstance.start + (stInstance.end - stInstance.start) * (targetIdx / Math.max(1, cards.length - 1));
      window.scrollTo({ top: targetScroll, behavior: 'smooth' });
    }
  }

  prevBtn?.addEventListener('click', () => stepCarousel(-1));
  nextBtn?.addEventListener('click', () => stepCarousel(1));

  // Mobile snap scroll telemetry sync
  const onViewportScroll = () => {
    if (!viewportEl || !cards.length) return;
    const maxScroll = Math.max(1, viewportEl.scrollWidth - viewportEl.clientWidth);
    const p = viewportEl.scrollLeft / maxScroll;
    const idx = Math.round(p * (cards.length - 1));
    setActivePillar(idx);
    if (progressFill) {
      progressFill.style.transform = `scaleX(${Math.max(0.08, p)})`;
    }
  };
  viewportEl?.addEventListener('scroll', onViewportScroll, { passive: true });
  cleanups.push(() => viewportEl?.removeEventListener('scroll', onViewportScroll));

  let gsCtx = null;
  let stInstance = null;
  let cancelled = false;

  async function initPinnedRail() {
    if (cancelled || prefersReducedMotion() || window.innerWidth <= 820 || !pinEl || !trackEl || !viewportEl) {
      setActivePillar(0);
      return;
    }

    const [{ default: gsap }, { ScrollTrigger }] = await Promise.all([
      import('gsap'),
      import('gsap/ScrollTrigger'),
    ]);
    if (cancelled) return;
    gsap.registerPlugin(ScrollTrigger);

    gsCtx = gsap.context(() => {
      const getTravel = () => Math.max(0, trackEl.scrollWidth - viewportEl.clientWidth);
      if (getTravel() <= 16) return;

      const tween = gsap.to(trackEl, {
        x: () => -getTravel(),
        ease: 'none',
        scrollTrigger: {
          trigger: pinEl,
          pin: true,
          scrub: 0.75,
          start: 'top 64px',
          end: () => `+=${Math.max(540, getTravel() * 0.92)}`,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            stInstance = self;
            const p = self.progress;
            const idx = Math.round(p * (cards.length - 1));
            activeIdx = idx;
            if (indexEl) indexEl.textContent = String(idx + 1).padStart(2, '0');
            if (progressFill) progressFill.style.transform = `scaleX(${Math.max(0.08, p)})`;
            cards.forEach((c, cIdx) => c.classList.toggle('is-active', cIdx === idx));
          },
        },
      });
      stInstance = tween.scrollTrigger;
    }, pinEl);
  }

  // Idle-defer pin setup slightly so initial paint stays instant while ready before user reaches About
  const setupTimer = window.setTimeout(initPinnedRail, 220);

  return () => {
    cancelled = true;
    window.clearTimeout(setupTimer);
    gsCtx?.revert();
    cleanups.forEach((fn) => fn());
  };
}
