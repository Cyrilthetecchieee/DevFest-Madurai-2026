/**
 * Call for Proposals Section (#18):
 * - Full-width typographic track rows with directional color-wash hover sweep.
 * - Floating spring-lerped live cursor preview card on pointer devices.
 * - Tap-to-expand inline drawer on mobile / keyboard Enter.
 */
import { esc } from '../utils/dom.js';
import { prefersReducedMotion } from '../utils/env.js';

const CFP_TRACKS = [
  {
    code: 'CFP_01',
    title: 'AI & MACHINE LEARNING',
    tag: 'MODELS · AGENTS · APPLIED ML',
    detail: 'Real-world architectures, on-device inference, LLM evaluation, and practical workflows builders can ship.',
  },
  {
    code: 'CFP_02',
    title: 'WEB & CLOUD PLATFORMS',
    tag: 'PERF · EDGE · DISTRIBUTED SYSTEMS',
    detail: 'Modern rendering, WebGL/WebGPU graphics, resilience patterns, and scalable cloud-native stacks.',
  },
  {
    code: 'CFP_03',
    title: 'ANDROID & MOBILE SYSTEMS',
    tag: 'KOTLIN · COMPOSE · PERFORMANCE',
    detail: 'Delightful interfaces, offline-first architecture, profiling, and cross-device ecosystems.',
  },
  {
    code: 'CFP_04',
    title: 'OPEN SOURCE ECOSYSTEM',
    tag: 'TOOLING · MAINTAINERS · COMMUNITY',
    detail: 'Lessons from shipping public codebases, sustainable maintainership, and contributing from Tier-2 cities.',
  },
  {
    code: 'CFP_05',
    title: 'DESIGN & PRODUCT CRAFT',
    tag: 'SYSTEMS · MOTION · ACCESSIBILITY',
    detail: 'Human-centred interfaces, motion systems, inclusive design engineering, and product storytelling.',
  },
  {
    code: 'CFP_06',
    title: 'CAREER & COMMUNITY STORIES',
    tag: 'FIRST-TIME SPEAKERS · FIELD NOTES',
    detail: 'Authentic journeys, lessons learned from failures, and mentorship insights for Madurai developers.',
  },
];

export function renderCfpSection(cfpData, links) {
  const homeCards = cfpData.homeCards || [];

  return `
    <section id="cfp" class="stage-section cfp-stage" data-waypoint="6" aria-labelledby="heading-cfp">
      <div class="cfp-header-grid">
        <div>
          <span class="stage-eyebrow" data-scramble="true">${esc(cfpData.tag)}</span>
          <h2 id="heading-cfp" class="stage-display" data-reveal="mask" data-track-scroll="true">${esc(cfpData.heading)}</h2>
          <p class="stage-lead">${esc(cfpData.copy)}</p>
        </div>

        <div class="cfp-highlights">
          ${homeCards.map((c) => `
            <article class="cfp-highlight-item">
              <span class="orbe-badge-tba">${esc(c.badge)}</span>
              <h3 class="cfp-highlight-title">${esc(c.title)}</h3>
              <p class="cfp-highlight-body">${esc(c.body)}</p>
            </article>
          `).join('')}
        </div>
      </div>

      <div class="cfp-tracks-stage" id="cfp-tracks-stage">
        <div class="cfp-float-preview" id="cfp-float-preview" aria-hidden="true">
          <span class="cfp-float-code" id="cfp-float-code">CFP_01</span>
          <strong class="cfp-float-title" id="cfp-float-title">AI & MACHINE LEARNING</strong>
          <p class="cfp-float-detail" id="cfp-float-detail"></p>
          <span class="cfp-float-hint">OPEN FOR PROPOSALS // GDG MADURAI</span>
        </div>

        <ul class="cfp-track-list" aria-label="CFP Proposal Tracks">
          ${CFP_TRACKS.map((tr, i) => `
            <li class="cfp-track-item">
              <button
                type="button"
                class="cfp-track-trigger"
                data-cfp-idx="${i}"
                aria-expanded="false"
                aria-controls="cfp-drawer-${i}"
              >
                <span class="cfp-track-wash" aria-hidden="true"></span>
                <span class="cfp-track-code">${esc(tr.code)}</span>
                <span class="cfp-track-name" data-hover-glyph="true">${esc(tr.title)}</span>
                <span class="cfp-track-tags">${esc(tr.tag)}</span>
                <span class="cfp-track-arrow" aria-hidden="true">&#8599;</span>
              </button>
              <div class="cfp-mobile-drawer" id="cfp-drawer-${i}" hidden>
                <p>${esc(tr.detail)}</p>
                <a href="${esc(links.cfp)}" target="_blank" rel="noopener noreferrer" class="btn-link-inline">${esc(cfpData.ctaLabel)}</a>
              </div>
            </li>
          `).join('')}
        </ul>
      </div>

      <div class="orbe-cta-row">
        <a href="${esc(links.cfp)}" target="_blank" rel="noopener noreferrer" class="btn-link-inline cfp-main-cta" data-magnetic="true" data-cursor-label="SUBMIT">${esc(cfpData.ctaLabel)}</a>
      </div>
    </section>
  `;
}

export function mountCfpSection() {
  const stage = document.getElementById('cfp-tracks-stage');
  const floatCard = document.getElementById('cfp-float-preview');
  const fCode = document.getElementById('cfp-float-code');
  const fTitle = document.getElementById('cfp-float-title');
  const fDetail = document.getElementById('cfp-float-detail');
  if (!stage) return () => {};

  const triggers = Array.from(stage.querySelectorAll('.cfp-track-trigger'));
  const reduced = prefersReducedMotion();

  let targetX = 0;
  let targetY = 0;
  let curX = 0;
  let curY = 0;
  let visible = false;
  let rafId = 0;

  function setActiveTrack(idx) {
    const tr = CFP_TRACKS[idx];
    if (!tr) return;
    if (fCode) fCode.textContent = tr.code;
    if (fTitle) fTitle.textContent = tr.title;
    if (fDetail) fDetail.textContent = tr.detail;
  }

  function tick() {
    curX += (targetX - curX) * 0.16;
    curY += (targetY - curY) * 0.16;
    if (floatCard) {
      floatCard.style.transform = `translate3d(${curX.toFixed(1)}px, ${curY.toFixed(1)}px, 0)`;
    }
    if (visible) {
      rafId = window.requestAnimationFrame(tick);
    } else {
      rafId = 0;
    }
  }

  const canHover = window.matchMedia?.('(hover: hover) and (pointer: fine)')?.matches && !reduced;

  function onMouseMove(e) {
    if (!canHover || !floatCard) return;
    const rect = stage.getBoundingClientRect();
    targetX = Math.min(rect.width - 310, Math.max(12, e.clientX - rect.left + 24));
    targetY = e.clientY - rect.top - 72;
  }

  function onMouseLeave() {
    visible = false;
    floatCard?.classList.remove('is-visible');
  }

  if (canHover) {
    stage.addEventListener('pointermove', onMouseMove, { passive: true });
    stage.addEventListener('pointerleave', onMouseLeave);
  }

  triggers.forEach((btn) => {
    const idx = Number(btn.dataset.cfpIdx || 0);
    btn.addEventListener('pointerenter', () => {
      if (!canHover) return;
      setActiveTrack(idx);
      visible = true;
      floatCard?.classList.add('is-visible');
      if (!rafId) rafId = window.requestAnimationFrame(tick);
    });

    btn.addEventListener('click', () => {
      const panelId = btn.getAttribute('aria-controls');
      const panel = panelId ? document.getElementById(panelId) : null;
      const expanded = btn.getAttribute('aria-expanded') === 'true';
      triggers.forEach((other) => {
        other.setAttribute('aria-expanded', 'false');
        const oId = other.getAttribute('aria-controls');
        const oPanel = oId ? document.getElementById(oId) : null;
        if (oPanel) oPanel.hidden = true;
      });
      if (!expanded && panel) {
        btn.setAttribute('aria-expanded', 'true');
        panel.hidden = false;
      }
    });
  });

  return () => {
    window.cancelAnimationFrame(rafId);
    stage.removeEventListener('pointermove', onMouseMove);
    stage.removeEventListener('pointerleave', onMouseLeave);
  };
}
