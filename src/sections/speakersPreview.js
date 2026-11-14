/**
 * Speakers Lineup Grid (replaces deleted 3D constellation with clear, accessible cards).
 */
import speakersData from '../data/speakers.json';
import { esc } from '../utils/dom.js';

export function renderSpeakersExperience({
  id = 'speakers',
  headingId = 'heading-speakers',
  isPage = false,
  links,
  cfpCtaLabel,
}) {
  const { homeSection, pageSection, filters = [], speakers = [] } = speakersData;
  const meta = isPage ? pageSection : homeSection;

  return `
    <section id="${esc(id)}" class="stage-section spk-stage" aria-labelledby="${esc(headingId)}">
      <div class="spk-header-row">
        <div>
          <span class="stage-eyebrow">${esc(meta.tag)}</span>
          <h2 id="${esc(headingId)}" class="stage-display">${esc(meta.heading)}</h2>
          ${meta.copy
            ? `<p class="stage-lead">${esc(meta.copy)}</p>`
            : (meta.paragraphs || []).map((p) => `<p class="stage-lead">${esc(p)}</p>`).join('')}
        </div>

        <div class="spk-count-chip" aria-live="polite">
          <span>${speakers.length} SLOTS //</span>
          <strong class="orbe-badge-tba">SPEAKERS TBA</strong>
        </div>
      </div>

      ${filters.length ? `
        <div class="orbe-filter-bar" role="group" aria-label="Filter Speakers by Track">
          ${filters.map((f, idx) => `
            <button
              type="button"
              class="orbe-filter-btn${idx === 0 ? ' active' : ''}"
              data-filter="${esc(f.id)}"
              aria-pressed="${idx === 0 ? 'true' : 'false'}"
            >${esc(f.label)}</button>
          `).join('')}
        </div>
      ` : ''}

      <div class="orbe-grid-3 spk-cards-grid" aria-label="Speaker Slots">
        ${speakers.map((s) => `
          <article class="orbe-card speaker-item" data-track="${esc(s.category)}">
            <div class="orbe-speaker-frame">
              <span class="orbe-speaker-code">${esc(s.code)}</span>
              <strong class="spk-slot-title">${esc(s.name)}</strong>
              <span class="orbe-badge-tba">${esc(s.status || 'TBA')}</span>
            </div>
            <h3 class="orbe-card-title">${esc(s.subtitle)}</h3>
            <p class="orbe-card-body">${esc(s.bio)}</p>
          </article>
        `).join('')}
      </div>

      <div class="orbe-cta-row">
        ${!isPage ? `<a href="/speakers" data-spa-link="true" class="btn-link-inline">VIEW ALL SPEAKERS</a>` : ''}
        <a href="${esc(links.cfp)}" target="_blank" rel="noopener noreferrer" class="btn-link-inline">${esc(cfpCtaLabel)}</a>
      </div>
    </section>
  `;
}

export function mountSpeakersExperience({ id = 'speakers' } = {}) {
  const root = document.getElementById(id);
  if (!root) return () => {};

  const filterBtns = Array.from(root.querySelectorAll('.orbe-filter-btn'));
  const cards = Array.from(root.querySelectorAll('.speaker-item'));

  const cleanups = [];
  filterBtns.forEach((btn) => {
    const onClick = () => {
      const target = btn.dataset.filter || 'all';
      filterBtns.forEach((other) => {
        const active = other === btn;
        other.classList.toggle('active', active);
        other.setAttribute('aria-pressed', active ? 'true' : 'false');
      });
      cards.forEach((card) => {
        card.hidden = target !== 'all' && card.dataset.track !== target;
      });
    };
    btn.addEventListener('click', onClick);
    cleanups.push(() => btn.removeEventListener('click', onClick));
  });

  return () => cleanups.forEach((fn) => fn());
}
