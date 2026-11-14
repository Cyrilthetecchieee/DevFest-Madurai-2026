/**
 * Speakers Directory & Preview Section — 4:5 Portrait Cards, Neutral Silhouettes,
 * Track Filters & Confirmed Speaker Bio/Socials Modal
 */
import speakersData from '../data/speakers.json';
import {
  esc,
  renderTrackChip,
  renderStatusChip,
} from '../utils/dom.js';

const SOCIAL_LABELS = [
  ['linkedin', 'LinkedIn'],
  ['x', 'X'],
  ['github', 'GitHub'],
  ['website', 'Website'],
];

function matchesFilter(track, filterId) {
  if (!filterId || filterId === 'all') return true;
  if (filterId === 'opensource-design') {
    return track === 'opensource' || track === 'design';
  }
  return track === filterId;
}

function renderPortraitPlaceholder(isHost = false) {
  return `
    <div class="spk-silhouette" aria-hidden="true">
      <svg viewBox="0 0 120 150" class="spk-silhouette-svg" focusable="false">
        <polygon points="10,6 110,6 114,10 114,140 110,144 10,144 6,140 6,10" fill="none" stroke="rgba(94,243,255,0.22)" stroke-width="1" />
        <circle cx="60" cy="54" r="26" fill="none" stroke="rgba(155,92,255,0.34)" stroke-width="1" stroke-dasharray="4 4" />
        <circle cx="60" cy="54" r="20" fill="${isHost ? 'rgba(94,243,255,0.16)' : 'rgba(94,243,255,0.1)'}" stroke="${isHost ? '#5ef3ff' : 'rgba(94,243,255,0.45)'}" stroke-width="1.5" />
        <path d="M24,132 C24,102 96,102 96,132" fill="${isHost ? 'rgba(94,243,255,0.12)' : 'rgba(155,92,255,0.1)'}" stroke="${isHost ? '#5ef3ff' : 'rgba(94,243,255,0.38)'}" stroke-width="1.5" />
        <line x1="36" y1="18" x2="84" y2="18" stroke="rgba(94,243,255,0.45)" stroke-width="1.5" />
      </svg>
      <span class="spk-silhouette-label">${isHost ? 'GDG MADURAI CHAPTER' : 'SPEAKER TO BE ANNOUNCED'}</span>
    </div>
  `;
}

function renderSpeakerStatusBadge(speaker) {
  if (speaker.status === 'confirmed') {
    return speaker.track === 'hosts'
      ? renderStatusChip('HOST CHAPTER', 'cyan')
      : renderStatusChip('CONFIRMED', 'open');
  }
  return renderStatusChip('TBA', 'tba');
}

function renderSpeakerCard(speaker) {
  const isConfirmed = speaker.status === 'confirmed';
  const isHost = speaker.track === 'hosts';
  const hasPhoto = Boolean(speaker.photo && speaker.photo.trim());

  return `
    <article class="spk-card spk-card--${esc(speaker.track)} speaker-item" data-track="${esc(speaker.track)}" data-speaker-id="${esc(speaker.id)}">
      <div class="spk-photo-frame">
        ${hasPhoto
          ? `<img src="${esc(speaker.photo)}" alt="${esc(speaker.name)} portrait" loading="lazy" decoding="async" class="spk-photo-img" data-spk-img />`
          : ''}
        <div class="spk-photo-fallback" ${hasPhoto ? 'hidden' : ''}>
          ${renderPortraitPlaceholder(isHost)}
        </div>
        <div class="spk-photo-badge">
          ${renderSpeakerStatusBadge(speaker)}
        </div>
      </div>

      <div class="spk-card-body">
        <div class="spk-card-meta-row">
          ${renderTrackChip(speaker.track)}
        </div>
        <h3 class="spk-card-name">${esc(speaker.name)}</h3>
        <p class="spk-card-role">${esc(speaker.role)} · ${esc(speaker.organisation)}</p>
        <p class="spk-card-topic">${esc(speaker.topic)}</p>
        ${isConfirmed
          ? `<div class="spk-card-actions">
              <button type="button" class="btn-g-secondary spk-bio-trigger" data-spk-open="${esc(speaker.id)}">
                VIEW BIO &amp; SOCIALS
              </button>
            </div>`
          : `<p class="spk-card-tba-note">${esc(speaker.bio)}</p>`
        }
      </div>
    </article>
  `;
}

export function renderSpeakersExperience({
  id = 'speakers',
  headingId = 'heading-speakers',
  isPage = false,
} = {}) {
  const { homeSection, pageSection, filters = [], speakers = [] } = speakersData;
  const sectionCopy = isPage ? pageSection : homeSection;
  const visibleSpeakers = isPage ? speakers : speakers.filter((s) => s.showOnHome !== false);
  const confirmedCount = speakers.filter((s) => s.status === 'confirmed').length;

  return `
    <section id="${esc(id)}" class="stage-section" aria-labelledby="${esc(headingId)}">
      ${!isPage ? `
        <div class="stage-asymmetric">
          <div class="content-zone">
            <div class="local-scrim">
              <div class="stage-section-head">
                <div>
                  <span class="stage-eyebrow" data-scramble="true">${esc(sectionCopy.tag)}</span>
                  <h2 id="${esc(headingId)}" class="stage-display" data-reveal="mask">${esc(sectionCopy.heading)}</h2>
                </div>
              </div>
              <p class="stage-lead">${esc(sectionCopy.copy)}</p>

              <div class="spk-summary-bar">
                ${renderStatusChip(confirmedCount > 1 ? `${confirmedCount} CONFIRMED` : 'LINEUP ANNOUNCING SOON', confirmedCount > 1 ? 'open' : 'tba')}
                <span class="spk-summary-count">${visibleSpeakers.length} TRACK SLOTS · DEVFEST MADURAI 2026</span>
              </div>
            </div>

            <div class="spk-grid spk-grid--preview" id="${esc(id)}-grid">
              ${visibleSpeakers.map(renderSpeakerCard).join('')}
            </div>
            <p id="${esc(id)}-empty" class="spk-empty-state" hidden>No speaker slots match this track yet.</p>

            <div class="spk-footer-cta">
              <a href="/speakers" data-spa-link="true" class="btn-g-primary">VIEW ALL SPEAKERS</a>
            </div>
          </div>

          <div class="graphic-window" data-creature-zone="speakers" aria-hidden="true"></div>
        </div>
      ` : `
        <div class="stage-asymmetric">
          <div class="content-zone local-scrim">
            <div class="stage-section-head">
              <div>
                <span class="stage-eyebrow" data-scramble="true">${esc(sectionCopy.tag)}</span>
                <h2 id="${esc(headingId)}" class="stage-display" data-reveal="mask">${esc(sectionCopy.heading)}</h2>
              </div>
            </div>

            ${sectionCopy.paragraphs.map((p) => `<p class="stage-lead">${esc(p)}</p>`).join('')}

            <div class="spk-summary-bar">
              ${renderStatusChip(confirmedCount > 1 ? `${confirmedCount} CONFIRMED` : 'LINEUP ANNOUNCING SOON', confirmedCount > 1 ? 'open' : 'tba')}
              <span class="spk-summary-count">${visibleSpeakers.length} TRACK SLOTS · DEVFEST MADURAI 2026</span>
            </div>

            <div class="orbe-filter-bar" role="group" aria-label="Filter speakers by track">
              <span class="orbe-filter-indicator" aria-hidden="true"></span>
              ${filters.map((f, idx) => `
                <button
                  type="button"
                  class="orbe-filter-btn ${idx === 0 ? 'active' : ''}"
                  data-spk-filter="${esc(f.id)}"
                  aria-pressed="${idx === 0 ? 'true' : 'false'}"
                >
                  ${esc(f.label)}
                </button>
              `).join('')}
            </div>
          </div>

          <div class="graphic-window" data-creature-zone="speakers" aria-hidden="true"></div>
        </div>

        <div class="spk-grid spk-grid--full" id="${esc(id)}-grid">
          ${visibleSpeakers.map(renderSpeakerCard).join('')}
        </div>
        <p id="${esc(id)}-empty" class="spk-empty-state" hidden>No speaker slots match this track yet.</p>
      `}

      <div id="spk-modal" class="spk-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="spk-modal-name" hidden>
        <div class="spk-modal-card">
          <div class="spk-modal-top">
            <div id="spk-modal-chips" class="spk-modal-chips"></div>
            <button type="button" id="spk-modal-close" class="spk-modal-close" aria-label="Close speaker profile">CLOSE ✕</button>
          </div>
          <div class="spk-modal-body">
            <div class="spk-modal-media" id="spk-modal-media"></div>
            <div class="spk-modal-info">
              <h3 id="spk-modal-name" class="spk-modal-name"></h3>
              <p id="spk-modal-role" class="spk-modal-role"></p>
              <p id="spk-modal-topic" class="spk-modal-topic"></p>
              <p id="spk-modal-bio" class="spk-modal-bio"></p>
              <div id="spk-modal-socials" class="spk-modal-socials"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;
}

export function mountSpeakersExperience({ id = 'speakers' } = {}) {
  const section = document.getElementById(id);
  if (!section) return () => {};

  const cleanups = [];
  const speakerMap = new Map(speakersData.speakers.map((s) => [s.id, s]));

  // Graceful fallback if a photo path is broken or fails to decode
  section.querySelectorAll('[data-spk-img]').forEach((img) => {
    const onError = () => {
      img.hidden = true;
      const fallback = img.parentElement?.querySelector('.spk-photo-fallback');
      if (fallback) fallback.hidden = false;
    };
    img.addEventListener('error', onError);
    cleanups.push(() => img.removeEventListener('error', onError));
  });

  // Track filter tabs with sliding indicator & keyboard Arrow navigation
  const filterBar = section.querySelector('.orbe-filter-bar');
  const filterIndicator = filterBar?.querySelector('.orbe-filter-indicator');
  const filterBtns = Array.from(section.querySelectorAll('[data-spk-filter]'));
  const cards = Array.from(section.querySelectorAll('.speaker-item'));
  const emptyEl = section.querySelector(`#${id}-empty`);

  const moveFilterIndicator = (btn) => {
    if (!filterBar || !filterIndicator || !btn) return;
    const barRect = filterBar.getBoundingClientRect();
    const btnRect = btn.getBoundingClientRect();
    filterIndicator.style.width = `${btnRect.width}px`;
    filterIndicator.style.height = `${btnRect.height}px`;
    filterIndicator.style.transform = `translate3d(${btnRect.left - barRect.left}px, ${btnRect.top - barRect.top}px, 0)`;
    filterIndicator.style.opacity = '1';
  };

  if (filterBtns[0]) {
    window.requestAnimationFrame(() => moveFilterIndicator(filterBtns.find((b) => b.classList.contains('active')) || filterBtns[0]));
  }
  const onResizeIndicator = () => {
    const active = filterBtns.find((b) => b.classList.contains('active'));
    if (active) moveFilterIndicator(active);
  };
  window.addEventListener('resize', onResizeIndicator, { passive: true });
  cleanups.push(() => window.removeEventListener('resize', onResizeIndicator));

  filterBtns.forEach((btn, idx) => {
    const onClick = () => {
      const filterId = btn.dataset.spkFilter || 'all';
      filterBtns.forEach((b) => {
        const active = b === btn;
        b.classList.toggle('active', active);
        b.setAttribute('aria-pressed', String(active));
      });
      moveFilterIndicator(btn);

      let shown = 0;
      cards.forEach((card) => {
        const track = card.dataset.track || '';
        const visible = matchesFilter(track, filterId);
        card.hidden = !visible;
        if (visible) shown += 1;
      });
      if (emptyEl) emptyEl.hidden = shown > 0;
    };
    const onKeyDown = (e) => {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        filterBtns[(idx + 1) % filterBtns.length]?.focus();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        filterBtns[(idx - 1 + filterBtns.length) % filterBtns.length]?.focus();
      }
    };
    btn.addEventListener('click', onClick);
    btn.addEventListener('keydown', onKeyDown);
    cleanups.push(() => {
      btn.removeEventListener('click', onClick);
      btn.removeEventListener('keydown', onKeyDown);
    });
  });

  // Accessible Speaker Bio & Socials Modal
  const modal = section.querySelector('#spk-modal');
  const closeBtn = section.querySelector('#spk-modal-close');
  const nameEl = section.querySelector('#spk-modal-name');
  const roleEl = section.querySelector('#spk-modal-role');
  const topicEl = section.querySelector('#spk-modal-topic');
  const bioEl = section.querySelector('#spk-modal-bio');
  const chipsEl = section.querySelector('#spk-modal-chips');
  const mediaEl = section.querySelector('#spk-modal-media');
  const socialsEl = section.querySelector('#spk-modal-socials');
  let lastTrigger = null;

  const closeModal = () => {
    if (!modal || modal.hidden) return;
    modal.hidden = true;
    document.body.style.overflow = '';
    if (lastTrigger && typeof lastTrigger.focus === 'function') {
      lastTrigger.focus();
    }
    lastTrigger = null;
  };

  const openModal = (speaker, trigger) => {
    if (!modal || !speaker) return;
    lastTrigger = trigger || null;
    if (chipsEl) {
      chipsEl.innerHTML = `${renderTrackChip(speaker.track)} ${renderSpeakerStatusBadge(speaker)}`;
    }
    if (mediaEl) {
      mediaEl.innerHTML = speaker.photo
        ? `<img src="${esc(speaker.photo)}" alt="${esc(speaker.name)} portrait" class="spk-photo-img" />`
        : renderPortraitPlaceholder(speaker.track === 'hosts');
    }
    if (nameEl) nameEl.textContent = speaker.name;
    if (roleEl) roleEl.textContent = `${speaker.role} · ${speaker.organisation}`;
    if (topicEl) topicEl.textContent = speaker.topic;
    if (bioEl) bioEl.textContent = speaker.bio;
    if (socialsEl) {
      const linksHtml = SOCIAL_LABELS
        .filter(([key]) => speaker.socials && speaker.socials[key])
        .map(
          ([key, label]) =>
            `<a href="${esc(speaker.socials[key])}" target="_blank" rel="noopener noreferrer" class="btn-g-secondary spk-social-link">${esc(label)} ↗</a>`,
        )
        .join('');
      socialsEl.innerHTML = linksHtml || '<span class="spk-card-tba-note">No public social links added yet.</span>';
    }
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    closeBtn?.focus();
  };

  section.querySelectorAll('[data-spk-open]').forEach((btn) => {
    const onClick = () => {
      const spk = speakerMap.get(btn.dataset.spkOpen || '');
      if (spk) openModal(spk, btn);
    };
    btn.addEventListener('click', onClick);
    cleanups.push(() => btn.removeEventListener('click', onClick));
  });

  if (modal) {
    const onBackdropClick = (e) => {
      if (e.target === modal) closeModal();
    };
    const onKeyDown = (e) => {
      if (e.key === 'Escape' && !modal.hidden) closeModal();
    };
    closeBtn?.addEventListener('click', closeModal);
    modal.addEventListener('click', onBackdropClick);
    window.addEventListener('keydown', onKeyDown);
    cleanups.push(() => {
      closeBtn?.removeEventListener('click', closeModal);
      modal.removeEventListener('click', onBackdropClick);
      window.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    });
  }

  return () => cleanups.forEach((fn) => fn());
}
