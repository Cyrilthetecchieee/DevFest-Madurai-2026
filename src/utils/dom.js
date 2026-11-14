/** Safe HTML serialization, responsive picture rendering & night-sky HUD primitives. */
import eventData from '../data/event.json';

export const TRACK_META = {
  ai: { id: 'ai', label: 'AI & ML', colorVar: '--cyan', hex: '#5ef3ff', chipClass: 'track-chip--ai' },
  cloud: { id: 'cloud', label: 'Web & Cloud', colorVar: '--aurora-aqua', hex: '#3ee8b5', chipClass: 'track-chip--cloud' },
  android: { id: 'android', label: 'Android', colorVar: '--aurora-ice', hex: '#7dd3fc', chipClass: 'track-chip--android' },
  opensource: { id: 'opensource', label: 'Open Source & Design', colorVar: '--aurora-rose', hex: '#f472b6', chipClass: 'track-chip--opensource' },
  design: { id: 'design', label: 'Open Source & Design', colorVar: '--aurora-rose', hex: '#f472b6', chipClass: 'track-chip--design' },
  workshop: { id: 'workshop', label: 'Build Session', colorVar: '--violet', hex: '#9b5cff', chipClass: 'track-chip--workshop' },
  hosts: { id: 'hosts', label: 'Community Hosts', colorVar: '--aurora-indigo', hex: '#a5b4fc', chipClass: 'track-chip--hosts' },
  keynote: { id: 'keynote', label: 'Keynote', colorVar: '--cyan', hex: '#5ef3ff', chipClass: 'track-chip--keynote' },
  general: { id: 'general', label: 'Program', colorVar: '--cyan', hex: '#5ef3ff', chipClass: 'track-chip--general' },
};

export function getTrackMeta(trackKey) {
  return TRACK_META[trackKey] || TRACK_META.general;
}

export function renderTrackChip(trackKey, labelOverride = '') {
  const meta = getTrackMeta(trackKey);
  const label = labelOverride || meta.label;
  return `<span class="track-chip ${esc(meta.chipClass)}">${esc(label)}</span>`;
}

export function renderStatusChip(label, variant = 'tba') {
  const map = {
    tba: 'status-chip--tba',
    open: 'status-chip--open',
    confirmed: 'status-chip--open',
    deadline: 'status-chip--deadline',
    red: 'status-chip--deadline',
    blue: 'status-chip--cyan',
    cyan: 'status-chip--cyan',
    violet: 'status-chip--violet',
  };
  const cls = map[variant] || map.tba;
  return `<span class="status-chip ${cls}">${esc(label)}</span>`;
}

export function esc(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export function renderPicture({ base, dir, alt, width, height, sizes = '(max-width: 820px) 100vw, 48vw', eager = false, className = '' }) {
  const path640 = `/assets/${dir}/${base}-640`;
  const path1280 = `/assets/${dir}/${base}-1280`;
  const loadingAttr = eager ? 'eager' : 'lazy';
  const clsAttr = className ? ` class="${esc(className)}"` : '';
  return `
    <picture>
      <source type="image/avif" srcset="${path640}.avif 640w, ${path1280}.avif 1280w" sizes="${esc(sizes)}">
      <source type="image/webp" srcset="${path640}.webp 640w, ${path1280}.webp 1280w" sizes="${esc(sizes)}">
      <img${clsAttr} src="${path1280}.webp" alt="${esc(alt)}" width="${Number(width)}" height="${Number(height)}" loading="${loadingAttr}" decoding="async">
    </picture>
  `;
}

export function renderDragMarqueeBand(phrase = 'BUILD. LEARN. CONNECT. CREATE. · MADURAI 12 DEC 2026 · ') {
  const repeated = `${phrase}${phrase}${phrase}${phrase}`;
  return `
    <div class="drag-marquee-band" data-drag-marquee="true" aria-hidden="true">
      <div class="drag-marquee-track">
        <span class="drag-marquee-chunk">${esc(repeated)}</span>
        <span class="drag-marquee-chunk">${esc(repeated)}</span>
      </div>
    </div>
  `;
}

export function renderDiscoverButton({ label, ariaLabel, href, external = false, inline = false, internalHref = null }) {
  const attrs = external
    ? 'target="_blank" rel="noopener noreferrer"'
    : internalHref
      ? 'data-spa-link="true"'
      : '';
  const classes = ['hero-cta-primary', inline ? 'btn-discover-inline' : ''].filter(Boolean).join(' ');
  const resolvedHref = internalHref || href;

  return `
    <a href="${esc(resolvedHref)}" ${attrs} class="${classes}" aria-label="${esc(ariaLabel || label)}">
      <span>${esc(label)}</span>
      <span class="hero-cta-arrow" aria-hidden="true">&#8599;</span>
    </a>
  `;
}

const HERO_PILLAR_ICONS = [
  '<rect x="5" y="9" width="22" height="14" rx="2" stroke="currentColor" stroke-width="1.6" fill="none"/><path d="M11 16h10M16 11v10" stroke="currentColor" stroke-width="1.6"/>',
  '<polygon points="16,4 28,10 28,22 16,28 4,22 4,10" stroke="currentColor" stroke-width="1.6" fill="none"/><circle cx="16" cy="16" r="2.6" fill="currentColor"/>',
  '<path d="M6 24 L16 6 L26 24 Z" stroke="currentColor" stroke-width="1.6" fill="none"/><circle cx="16" cy="18" r="2" fill="currentColor"/>',
  '<circle cx="16" cy="16" r="10.5" stroke="currentColor" stroke-width="1.6" fill="none"/><path d="M11 16h10M16 11v10" stroke="currentColor" stroke-width="1.6"/>',
  '<circle cx="10" cy="12" r="3" stroke="currentColor" stroke-width="1.5" fill="none"/><circle cx="22" cy="12" r="3" stroke="currentColor" stroke-width="1.5" fill="none"/><circle cx="16" cy="22" r="3" stroke="currentColor" stroke-width="1.5" fill="none"/><path d="M13 13l6 0M11.5 14.5l3.5 5M20.5 14.5l-3.5 5" stroke="currentColor" stroke-width="1.4"/>',
  '<rect x="6" y="6" width="8" height="8" stroke="currentColor" stroke-width="1.5" fill="none"/><rect x="18" y="6" width="8" height="8" stroke="currentColor" stroke-width="1.5" fill="none"/><rect x="6" y="18" width="8" height="8" stroke="currentColor" stroke-width="1.5" fill="none"/><rect x="18" y="18" width="8" height="8" fill="currentColor"/>',
];

function splitPillarLabel(raw, index) {
  const m = String(raw).match(/^(\d{2})\s*[—-]\s*(.+)$/);
  if (m) return { num: m[1], title: m[2] };
  return { num: `0${index + 1}`, title: raw };
}

export function renderHeroStage(routeKey, headingText) {
  const cfg = eventData.hero[routeKey] || eventData.hero.home;
  const pillars = routeKey === 'home' ? (eventData.sections?.about?.pillars || []) : [];
  const topId = routeKey === 'home' ? 'home' : 'top';
  const primaryAttrs = cfg.primaryCta.external
    ? 'target="_blank" rel="noopener noreferrer"'
    : cfg.primaryCta.href.startsWith('/')
      ? 'data-spa-link="true"'
      : '';
  const secondaryAttrs = cfg.secondaryCta.external
    ? `href="${esc(cfg.secondaryCta.href)}" target="_blank" rel="noopener noreferrer"`
    : cfg.secondaryCta.href.startsWith('/')
      ? `href="${esc(cfg.secondaryCta.href)}" data-spa-link="true"`
      : `href="${esc(cfg.secondaryCta.href)}"`;

  return `
    <div id="${topId}"></div>
    <section id="stage-ui" class="pinned-stage hero-stage" aria-label="Hero">
      <div class="hero-scrim" aria-hidden="true"></div>

      <div class="hero-layout">
        <div class="hero-sides">
          <div class="side-copy side-copy-left">
            <span class="hero-kicker">${esc(cfg.left.kicker)}</span>
            <strong class="hero-side-title">${esc(cfg.left.title)}</strong>
            <p class="hero-side-lead">${esc(cfg.left.lead)}</p>
            ${cfg.left.subs.map((s) => `<p class="hero-sub">${esc(s)}</p>`).join('')}
          </div>

          <div class="side-copy side-copy-right">
            <p class="hero-side-lead">${esc(cfg.right.lead)}</p>
            ${cfg.right.subs.map((s) => `<p class="hero-sub">${esc(s)}</p>`).join('')}
            <div class="hero-meta-lines">
              ${cfg.right.meta.map((m) => `<span>${esc(m)}</span>`).join('')}
            </div>
          </div>
        </div>

        <div class="hero-focal-dock">
          <h1 class="hero-main-heading">${esc(headingText)}</h1>
          <div class="hero-cta-group">
            <a href="${esc(cfg.primaryCta.href)}" ${primaryAttrs} class="hero-cta-primary" aria-label="${esc(cfg.primaryCta.ariaLabel || cfg.primaryCta.label)}">
              <span>${esc(cfg.primaryCta.label)}</span>
              <span class="hero-cta-arrow" aria-hidden="true">&#8599;</span>
            </a>
            <a ${secondaryAttrs} class="hero-cta-secondary">${esc(cfg.secondaryCta.label)}</a>
            ${routeKey === 'home' ? `<a href="#tickets" class="hero-cta-secondary hero-cta-tickets">TICKETS &amp; PASS</a>` : ''}
          </div>
        </div>

        ${pillars.length ? `
          <div class="hero-pillars-band" aria-label="Festival pillars">
            <div class="hero-pillars-bar">
              <span class="hero-pillars-label">FESTIVAL PILLARS // DEVFEST 2026</span>
              <div class="hero-pillars-controls">
                <button type="button" class="hero-pillar-nav-btn" id="hero-pillar-prev" aria-label="Previous pillar">&lsaquo;</button>
                <span class="hero-pillars-counter" id="hero-pillars-counter">01 / ${String(pillars.length).padStart(2, '0')}</span>
                <button type="button" class="hero-pillar-nav-btn" id="hero-pillar-next" aria-label="Next pillar">&rsaquo;</button>
              </div>
            </div>
            <div class="hero-pillars-track" id="hero-pillars-track" tabindex="0" aria-label="Festival pillars carousel">
              ${pillars.map((pillar, idx) => {
                const parts = splitPillarLabel(pillar.title, idx);
                return `
                  <article class="hud-bevel-card hero-pillar-card">
                    <div class="hero-pillar-top">
                      <span class="hero-pillar-num">${esc(parts.num)}</span>
                      <svg class="hero-pillar-icon" viewBox="0 0 32 32" width="22" height="22" aria-hidden="true">
                        ${HERO_PILLAR_ICONS[idx % HERO_PILLAR_ICONS.length]}
                      </svg>
                    </div>
                    <h2 class="hero-pillar-title">${esc(parts.title)}</h2>
                    <p class="hero-pillar-copy">${esc(pillar.body)}</p>
                  </article>
                `;
              }).join('')}
            </div>
          </div>
        ` : ''}
      </div>
    </section>
  `;
}

export function mountHeroPillarsCarousel(root = document) {
  const track = root.querySelector('#hero-pillars-track');
  const prevBtn = root.querySelector('#hero-pillar-prev');
  const nextBtn = root.querySelector('#hero-pillar-next');
  const counterEl = root.querySelector('#hero-pillars-counter');
  if (!track) return () => {};

  const cards = Array.from(track.querySelectorAll('.hero-pillar-card'));
  const total = cards.length || 1;
  let activeIdx = 0;
  let dragging = false;
  let startX = 0;
  let startScroll = 0;

  const getStepPx = () => {
    if (!cards.length) return 320;
    return cards[0].getBoundingClientRect().width + 16;
  };

  const updateCounter = () => {
    const step = Math.max(1, getStepPx());
    const idx = Math.max(0, Math.min(total - 1, Math.round(track.scrollLeft / step)));
    activeIdx = idx;
    if (counterEl) {
      counterEl.textContent = `${String(idx + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}`;
    }
  };

  const scrollToIdx = (idx) => {
    const clamped = Math.max(0, Math.min(total - 1, idx));
    activeIdx = clamped;
    track.scrollTo({ left: clamped * getStepPx(), behavior: 'smooth' });
    if (counterEl) {
      counterEl.textContent = `${String(clamped + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}`;
    }
  };

  const onPrev = () => scrollToIdx(activeIdx - 1);
  const onNext = () => scrollToIdx(activeIdx + 1);
  const onKeyDown = (e) => {
    if (e.key === 'ArrowLeft') { e.preventDefault(); onPrev(); }
    if (e.key === 'ArrowRight') { e.preventDefault(); onNext(); }
  };

  const onPointerDown = (e) => {
    dragging = true;
    startX = e.clientX;
    startScroll = track.scrollLeft;
    track.classList.add('is-dragging');
  };
  const onPointerMove = (e) => {
    if (!dragging) return;
    track.scrollLeft = startScroll - (e.clientX - startX);
  };
  const onPointerUp = () => {
    if (!dragging) return;
    dragging = false;
    track.classList.remove('is-dragging');
    updateCounter();
  };

  prevBtn?.addEventListener('click', onPrev);
  nextBtn?.addEventListener('click', onNext);
  track.addEventListener('keydown', onKeyDown);
  track.addEventListener('scroll', updateCounter, { passive: true });
  track.addEventListener('pointerdown', onPointerDown);
  window.addEventListener('pointermove', onPointerMove, { passive: true });
  window.addEventListener('pointerup', onPointerUp, { passive: true });

  return () => {
    prevBtn?.removeEventListener('click', onPrev);
    nextBtn?.removeEventListener('click', onNext);
    track.removeEventListener('keydown', onKeyDown);
    track.removeEventListener('scroll', updateCounter);
    track.removeEventListener('pointerdown', onPointerDown);
    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('pointerup', onPointerUp);
  };
}

export function renderFooter() {
  const f = eventData.footer;
  const l = eventData.links;

  return `
    <footer id="footer" class="orbe-footer" role="contentinfo">
      <div class="orbe-footer-top">
        <div>
          <span class="orbe-section-tag">${esc(f.tag)}</span>
          <h2 class="orbe-section-heading orbe-section-heading-tight">${esc(f.heading)}</h2>
          <p class="orbe-card-body">${esc(f.pillars)}</p>
        </div>

        <nav aria-label="Footer navigation">
          <ul class="orbe-footer-links">
            <li><a href="/#home" data-spa-link="true">Home</a></li>
            <li><a href="/#about" data-spa-link="true">About</a></li>
            <li><a href="/#agenda" data-spa-link="true">Agenda</a></li>
            <li><a href="/speakers" data-spa-link="true">Speakers</a></li>
            <li><a href="/#tickets" data-spa-link="true">Tickets</a></li>
            <li><a href="/memories" data-spa-link="true">Memories</a></li>
          </ul>
        </nav>
      </div>

      <div class="orbe-footer-top">
        <ul class="orbe-footer-links" aria-label="Social Links">
          ${l.socials.map((s) => `<li><a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.label)}</a></li>`).join('')}
        </ul>

        <ul class="orbe-footer-links" aria-label="Legal and Contact">
          <li><a href="${esc(l.codeOfConduct)}" target="_blank" rel="noopener noreferrer">Code of Conduct</a></li>
          <li><a href="${esc(l.privacyPolicy)}" target="_blank" rel="noopener noreferrer">Privacy Policy</a></li>
          <li><a href="${esc(l.email)}">${esc(l.emailLabel)}</a></li>
        </ul>
      </div>

      <p class="orbe-disclaimer">${esc(f.disclaimer)}</p>
      <p class="orbe-card-body orbe-card-body-muted">${esc(f.copyright)}</p>
    </footer>
  `;
}
