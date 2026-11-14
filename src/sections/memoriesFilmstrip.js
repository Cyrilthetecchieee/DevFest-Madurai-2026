/**
 * Memories Highlights & Clean Accessible Lightbox Controller
 */
import memoriesData from '../data/memories.json';
import {
  esc,
  renderPicture,
} from '../utils/dom.js';

function getLightboxImageUrl(item) {
  return `/assets/${item.dir || 'archive'}/${item.base}-1280.webp`;
}

export function renderHomeMemoriesSection() {
  const teaser = memoriesData.homeTeaser;
  const items = teaser.items || [];

  return `
    <section id="memories" class="stage-section" aria-labelledby="heading-memories">
      <div class="stage-asymmetric">
        <div class="content-zone local-scrim">
          <div class="stage-section-head">
            <div>
              <span class="stage-eyebrow" data-scramble="true">${esc(teaser.tag)}</span>
              <h2 id="heading-memories" class="stage-display" data-reveal="mask">${esc(teaser.heading)}</h2>
            </div>
          </div>
          <p class="stage-lead">${esc(teaser.copy)}</p>

          <div class="mem-home-cta">
            <a href="/memories" data-spa-link="true" class="btn-g-primary">EXPLORE ALL MEMORIES</a>
          </div>
        </div>

        <div class="graphic-window" data-creature-zone="memories" aria-hidden="true"></div>
      </div>

      <div class="mem-home-grid">
        ${items.map((item, i) => `
          <figure class="mem-photo-card">
            <button
              type="button"
              class="mem-photo-trigger"
              aria-label="Open photo: ${esc(item.caption)}"
              data-img="${esc(getLightboxImageUrl(item))}"
              data-caption="${esc(item.caption)}"
            >
              ${renderPicture({
                base: item.base,
                dir: item.dir,
                alt: item.alt,
                sizes: '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
                width: item.width,
                height: item.height,
                className: 'mem-photo-img',
                fallbackExt: 'webp',
              })}
            </button>
            <figcaption class="mem-photo-caption">
              <span class="mem-photo-num">0${i + 1}</span>
              <span>${esc(item.caption)}</span>
            </figcaption>
          </figure>
        `).join('')}
      </div>

      <div id="archive-lightbox" class="mem-lightbox" role="dialog" aria-modal="true" aria-labelledby="lightbox-caption" aria-hidden="true">
        <div class="lightbox-content">
          <div class="lightbox-bar">
            <span class="lightbox-counter" id="lightbox-counter">01 / 06</span>
            <button type="button" class="lightbox-close" id="lightbox-close" aria-label="Close Lightbox">CLOSE [ESC]</button>
          </div>
          <div class="lightbox-media-frame" id="lightbox-media-slot"></div>
          <div class="lightbox-foot">
            <button type="button" class="lightbox-nav-btn" id="lightbox-prev" aria-label="Previous photo">&larr; PREV</button>
            <div class="lightbox-caption" id="lightbox-caption"></div>
            <button type="button" class="lightbox-nav-btn" id="lightbox-next" aria-label="Next photo">NEXT &rarr;</button>
          </div>
        </div>
      </div>
    </section>
  `;
}

export function mountMemoriesInteraction(root = document) {
  const cleanups = [];
  const lightbox = root.querySelector('#archive-lightbox');
  const mediaSlot = root.querySelector('#lightbox-media-slot');
  const lightboxCaption = root.querySelector('#lightbox-caption');
  const lightboxCounter = root.querySelector('#lightbox-counter');
  const closeBtn = root.querySelector('#lightbox-close');
  const prevBtn = root.querySelector('#lightbox-prev');
  const nextBtn = root.querySelector('#lightbox-next');

  const triggers = Array.from(root.querySelectorAll('[data-img]'));
  let activeIdx = 0;
  let lastTrigger = null;

  const renderLightboxAt = (idx) => {
    if (!triggers.length || !mediaSlot) return;
    activeIdx = ((idx % triggers.length) + triggers.length) % triggers.length;
    const el = triggers[activeIdx];
    const src = el.dataset.img || el.querySelector('img')?.currentSrc || el.querySelector('img')?.src || '';
    const cap = el.dataset.caption || el.getAttribute('aria-label') || '';

    mediaSlot.innerHTML = '';
    const img = document.createElement('img');
    img.src = src;
    img.alt = cap;
    img.decoding = 'async';
    mediaSlot.appendChild(img);

    if (lightboxCaption) lightboxCaption.textContent = cap;
    if (lightboxCounter) {
      lightboxCounter.textContent = `${String(activeIdx + 1).padStart(2, '0')} / ${String(triggers.length).padStart(2, '0')}`;
    }
  };

  const openLightbox = (trigger, idx) => {
    if (!lightbox || !mediaSlot) return;
    lastTrigger = trigger;
    renderLightboxAt(idx);
    lightbox.classList.add('active');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    closeBtn?.focus();
  };

  const closeLightbox = () => {
    if (!lightbox || !lightbox.classList.contains('active')) return;
    lightbox.classList.remove('active');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (lastTrigger && typeof lastTrigger.focus === 'function') {
      lastTrigger.focus();
    }
    lastTrigger = null;
  };

  triggers.forEach((el, idx) => {
    const onClick = () => openLightbox(el, idx);
    const onKeyDown = (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openLightbox(el, idx);
      }
    };
    el.addEventListener('click', onClick);
    el.addEventListener('keydown', onKeyDown);
    cleanups.push(() => {
      el.removeEventListener('click', onClick);
      el.removeEventListener('keydown', onKeyDown);
    });
  });

  const onPrev = () => renderLightboxAt(activeIdx - 1);
  const onNext = () => renderLightboxAt(activeIdx + 1);
  prevBtn?.addEventListener('click', onPrev);
  nextBtn?.addEventListener('click', onNext);
  closeBtn?.addEventListener('click', closeLightbox);

  let lbTouchX = 0;
  const onLbTouchStart = (e) => {
    lbTouchX = e.touches[0]?.clientX || 0;
  };
  const onLbTouchEnd = (e) => {
    const endX = e.changedTouches[0]?.clientX || 0;
    const diff = endX - lbTouchX;
    if (Math.abs(diff) > 48) {
      renderLightboxAt(diff < 0 ? activeIdx + 1 : activeIdx - 1);
    }
  };

  const onLbClick = (e) => {
    if (e.target === lightbox) closeLightbox();
  };
  const onKeyDown = (e) => {
    if (!lightbox?.classList.contains('active')) return;
    if (e.key === 'Escape') closeLightbox();
    else if (e.key === 'ArrowLeft') renderLightboxAt(activeIdx - 1);
    else if (e.key === 'ArrowRight') renderLightboxAt(activeIdx + 1);
  };

  lightbox?.addEventListener('touchstart', onLbTouchStart, { passive: true });
  lightbox?.addEventListener('touchend', onLbTouchEnd, { passive: true });
  lightbox?.addEventListener('click', onLbClick);
  window.addEventListener('keydown', onKeyDown);

  cleanups.push(() => {
    prevBtn?.removeEventListener('click', onPrev);
    nextBtn?.removeEventListener('click', onNext);
    closeBtn?.removeEventListener('click', closeLightbox);
    lightbox?.removeEventListener('touchstart', onLbTouchStart);
    lightbox?.removeEventListener('touchend', onLbTouchEnd);
    lightbox?.removeEventListener('click', onLbClick);
    window.removeEventListener('keydown', onKeyDown);
    document.body.style.overflow = '';
  });

  return () => cleanups.forEach((fn) => fn());
}
