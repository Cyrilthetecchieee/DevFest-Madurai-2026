/** Memories Archive Page View, Scroll Progress Bar & Accessible Lightbox */
import eventData from '../data/event.json';
import memoriesData from '../data/memories.json';
import { esc, renderHeroStage, renderDiscoverButton, renderPicture, renderFooter } from '../utils/dom.js';

export const MEMORIES_META = {
  title: 'Memories — GDG Madurai · DevFest Archive',
  description: 'A cinematic archive celebrating past DevFest & GDG Madurai editions, speakers, builders, and community moments leading to DevFest Madurai 2026.',
  canonical: '/memories',
};

function getLightboxImageUrl(item) {
  return `/assets/${item.dir}/${item.base}-1280.webp`;
}

export function renderMemoriesPage() {
  const { community, editions, gallery, human, closing } = memoriesData;
  const { links } = eventData;

  return `
    ${renderHeroStage('memories', 'Memories — GDG Madurai Community Archive')}

    <main id="devfest-content">
      <section id="community" class="orbe-section" aria-labelledby="heading-community">
        <span class="orbe-section-tag">${esc(community.tag)}</span>
        <h2 id="heading-community" class="orbe-section-heading">${esc(community.heading)}</h2>
        <p class="orbe-section-copy">${esc(community.copy)}</p>

        <div class="mem-community-layout">
          <div class="mem-featured-frame" tabindex="0" role="button" aria-label="Open photo: ${esc(community.featured.title)}" data-img="${esc(getLightboxImageUrl(community.featured))}" data-caption="${esc(community.featured.lightboxCaption)}">
            ${renderPicture({ ...community.featured, sizes: '(max-width: 820px) 92vw, 52vw' })}
            <div class="mem-caption-bar">
              <span>${esc(community.featured.title)}</span>
              <span class="mem-caption-tag">${esc(community.featured.badge)}</span>
            </div>
          </div>

          <div class="mem-community-stack">
            ${community.stack.map((item) => `
              <div class="mem-sub-frame" tabindex="0" role="button" aria-label="Open photo: ${esc(item.title)}" data-img="${esc(getLightboxImageUrl(item))}" data-caption="${esc(item.lightboxCaption)}">
                ${renderPicture({ ...item, sizes: '(max-width: 820px) 92vw, 32vw' })}
                <div class="mem-caption-bar">
                  <span>${esc(item.title)}</span>
                  <span class="mem-caption-tag">${esc(item.badge)}</span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </section>

      <section id="editions" class="orbe-section" aria-labelledby="heading-editions">
        <span class="orbe-section-tag">${esc(editions.tag)}</span>
        <h2 id="heading-editions" class="orbe-section-heading">${esc(editions.heading)}</h2>
        <p class="orbe-section-copy">${esc(editions.copy)}</p>

        <div class="mem-timeline">
          ${editions.items.map((ed) => `
            <div class="mem-edition-block">
              <div class="mem-edition-node" aria-hidden="true"></div>
              <div class="mem-edition-header">
                <span class="mem-year-badge">${esc(ed.year)}</span>
                <span class="mem-edition-title">${esc(ed.title)}</span>
              </div>
              <p class="orbe-section-copy orbe-section-copy-flush">${esc(ed.copy)}</p>
              <div class="mem-edition-grid">
                ${ed.cards.map((card) => `
                  <div class="mem-edition-card" tabindex="0" role="button" aria-label="Open photo: ${esc(card.title)}" data-img="${esc(getLightboxImageUrl(card))}" data-caption="${esc(card.lightboxCaption)}">
                    ${renderPicture({ ...card, sizes: '(max-width: 820px) 92vw, 26vw' })}
                    <div class="mem-caption-bar">
                      <span>${esc(card.title)}</span>
                      <span class="mem-caption-tag">${esc(card.badge)}</span>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          `).join('')}
        </div>
      </section>

      <section id="gallery" class="orbe-section" aria-labelledby="heading-gallery">
        <span class="orbe-section-tag">${esc(gallery.tag)}</span>
        <h2 id="heading-gallery" class="orbe-section-heading">${esc(gallery.heading)}</h2>
        <p class="orbe-section-copy">${esc(gallery.copy)}</p>

        <div class="mem-cinematic-gallery">
          <div class="mem-panoramic-card" tabindex="0" role="button" aria-label="Open photo: ${esc(gallery.panoramic1.title)}" data-img="${esc(getLightboxImageUrl(gallery.panoramic1))}" data-caption="${esc(gallery.panoramic1.lightboxCaption)}">
            ${renderPicture({ ...gallery.panoramic1, sizes: '(max-width: 820px) 92vw, 84vw' })}
            <div class="mem-panoramic-overlay">
              <div>
                <div class="mem-panoramic-title">${esc(gallery.panoramic1.title)}</div>
                <div class="mem-panoramic-desc">${esc(gallery.panoramic1.desc)}</div>
              </div>
              <span class="orbe-badge-tba">${esc(gallery.panoramic1.badge)}</span>
            </div>
          </div>

          <div class="mem-diptych-grid">
            ${gallery.diptych.map((card) => `
              <div class="mem-diptych-card" tabindex="0" role="button" aria-label="Open photo: ${esc(card.title)}" data-img="${esc(getLightboxImageUrl(card))}" data-caption="${esc(card.lightboxCaption)}">
                ${renderPicture({ ...card, sizes: '(max-width: 820px) 92vw, 42vw' })}
                <div class="mem-caption-bar">
                  <span>${esc(card.title)}</span>
                  <span class="mem-caption-tag">${esc(card.badge)}</span>
                </div>
              </div>
            `).join('')}
          </div>

          <div class="mem-panoramic-card" tabindex="0" role="button" aria-label="Open photo: ${esc(gallery.panoramic2.title)}" data-img="${esc(getLightboxImageUrl(gallery.panoramic2))}" data-caption="${esc(gallery.panoramic2.lightboxCaption)}">
            ${renderPicture({ ...gallery.panoramic2, sizes: '(max-width: 820px) 92vw, 84vw' })}
            <div class="mem-panoramic-overlay">
              <div>
                <div class="mem-panoramic-title">${esc(gallery.panoramic2.title)}</div>
                <div class="mem-panoramic-desc">${esc(gallery.panoramic2.desc)}</div>
              </div>
              <span class="orbe-badge-tba">${esc(gallery.panoramic2.badge)}</span>
            </div>
          </div>
        </div>
      </section>

      <section id="human-moments" class="orbe-section" aria-labelledby="heading-human">
        <span class="orbe-section-tag">${esc(human.tag)}</span>
        <h2 id="heading-human" class="orbe-section-heading">${esc(human.heading)}</h2>
        <p class="orbe-section-copy">${esc(human.copy)}</p>

        <div class="mem-human-grid">
          ${human.cards.map((card) => `
            <div class="mem-human-card" tabindex="0" role="button" aria-label="Open photo: ${esc(card.title)}" data-img="${esc(getLightboxImageUrl(card))}" data-caption="${esc(card.lightboxCaption)}">
              ${renderPicture({ ...card, sizes: '(max-width: 820px) 92vw, 28vw' })}
              <div class="mem-human-title">${esc(card.title)}</div>
              <p class="mem-human-text">${esc(card.text)}</p>
            </div>
          `).join('')}
        </div>
      </section>

      <section id="closing" class="orbe-section mem-closing-hero" aria-labelledby="heading-closing">
        <span class="orbe-section-tag">${esc(closing.tag)}</span>
        <h2 id="heading-closing" class="mem-closing-heading">${esc(closing.heading)}</h2>
        <p class="mem-closing-sub">${esc(closing.sub)}</p>
        <p class="orbe-section-copy orbe-section-copy-center">${esc(closing.copy)}</p>

        <div class="orbe-cta-row orbe-cta-row-center">
          ${renderDiscoverButton({
            label: closing.ctaLabel,
            ariaLabel: 'Join DevFest Madurai 2026',
            href: links.tickets,
            external: true,
            inline: true,
            compactLabel: true,
          })}
          <a href="/" data-spa-link="true" class="btn-link-inline">← RETURN TO HOME</a>
        </div>
      </section>

      ${renderFooter({ cfpHref: '/#cfp' })}
    </main>

    <div id="archive-lightbox" role="dialog" aria-modal="true" aria-labelledby="lightbox-caption" aria-hidden="true">
      <div class="lightbox-content">
        <button type="button" class="lightbox-close-btn" id="lightbox-close">CLOSE // ESC</button>
        <div id="lightbox-media-slot"></div>
        <div class="lightbox-caption" id="lightbox-caption"></div>
      </div>
    </div>
  `;
}

export function mountMemoriesPage(root) {
  const progress = document.getElementById('archive-progress');
  const lightbox = root.querySelector('#archive-lightbox');
  const mediaSlot = root.querySelector('#lightbox-media-slot');
  const lightboxCaption = root.querySelector('#lightbox-caption');
  const closeBtn = root.querySelector('#lightbox-close');
  let lastTrigger = null;

  if (progress) progress.classList.add('visible');

  const updateProgress = () => {
    if (!progress) return;
    const total = document.documentElement.scrollHeight - window.innerHeight;
    const pct = total > 0 ? Math.min(100, Math.max(0, (window.scrollY / total) * 100)) : 0;
    progress.style.width = `${pct}%`;
  };
  window.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();

  const openLightbox = (trigger) => {
    const src = trigger.dataset.img;
    const cap = trigger.dataset.caption || '';
    if (!src || !lightbox || !mediaSlot) return;
    lastTrigger = trigger;

    mediaSlot.innerHTML = '';
    const img = document.createElement('img');
    img.src = src;
    img.alt = cap;
    mediaSlot.appendChild(img);

    if (lightboxCaption) lightboxCaption.textContent = cap;
    lightbox.classList.add('active');
    lightbox.setAttribute('aria-hidden', 'false');
    closeBtn?.focus();
  };

  const closeLightbox = () => {
    if (!lightbox || !lightbox.classList.contains('active')) return;
    lightbox.classList.remove('active');
    lightbox.setAttribute('aria-hidden', 'true');
    if (mediaSlot) mediaSlot.innerHTML = '';
    lastTrigger?.focus?.();
    lastTrigger = null;
  };

  const triggers = root.querySelectorAll('[data-img]');
  const triggerHandlers = [];
  triggers.forEach((el) => {
    const onClick = () => openLightbox(el);
    const onKey = (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openLightbox(el);
      }
    };
    el.addEventListener('click', onClick);
    el.addEventListener('keydown', onKey);
    triggerHandlers.push([el, onClick, onKey]);
  });

  closeBtn?.addEventListener('click', closeLightbox);
  const onBackdropClick = (e) => {
    if (e.target === lightbox) closeLightbox();
  };
  const onEsc = (e) => {
    if (e.key === 'Escape' && lightbox?.classList.contains('active')) {
      closeLightbox();
    }
  };
  lightbox?.addEventListener('click', onBackdropClick);
  document.addEventListener('keydown', onEsc);

  return () => {
    if (progress) {
      progress.classList.remove('visible');
      progress.style.width = '0%';
    }
    window.removeEventListener('scroll', updateProgress);
    for (const [el, onClick, onKey] of triggerHandlers) {
      el.removeEventListener('click', onClick);
      el.removeEventListener('keydown', onKey);
    }
    closeBtn?.removeEventListener('click', closeLightbox);
    lightbox?.removeEventListener('click', onBackdropClick);
    document.removeEventListener('keydown', onEsc);
  };
}
