/**
 * Memories Gallery & Lightbox Interaction:
 * Clean gallery controls and accessible keyboard/swipe Lightbox without liquid WebGL hover distortion.
 */
import memoriesData from '../data/memories.json';
import { esc, renderPicture } from '../utils/dom.js';
import { prefersReducedMotion } from '../utils/env.js';

function getLightboxImageUrl(item) {
  return `/assets/${item.dir}/${item.base}-1280.webp`;
}

export function renderHomeMemoriesSection() {
  const { homeTeaser } = memoriesData;
  const items = homeTeaser.items || [];

  return `
    <section id="memories" class="stage-section mem-home-stage" data-waypoint="8" aria-labelledby="heading-memories">
      <div class="mem-home-head">
        <div>
          <span class="stage-eyebrow" data-scramble="true">${esc(homeTeaser.tag)}</span>
          <h2 id="heading-memories" class="stage-display" data-reveal="mask" data-track-scroll="true">${esc(homeTeaser.heading)}</h2>
          <p class="stage-lead">${esc(homeTeaser.copy)}</p>
        </div>
        <div class="mem-strip-controls">
          <span class="mem-drag-hint">DRAG FILMSTRIP // CLICK TO INSPECT</span>
          <div class="mem-step-btns">
            <button type="button" class="about-rail-btn" id="mem-strip-prev" aria-label="Scroll filmstrip left">&#8592;</button>
            <button type="button" class="about-rail-btn" id="mem-strip-next" aria-label="Scroll filmstrip right">&#8594;</button>
          </div>
        </div>
      </div>

      <div class="mem-filmstrip-viewport" id="mem-filmstrip-viewport" aria-label="DevFest Memories Gallery">
        <div class="mem-filmstrip-track" id="mem-filmstrip-track">
          ${items.map((item, idx) => `
            <figure
              class="mem-film-card"
              data-img="${esc(getLightboxImageUrl(item))}"
              data-caption="${esc(item.caption)}"
              data-idx="${idx}"
              tabindex="0"
              role="button"
              aria-label="Open photo: ${esc(item.caption)}"
            >
              <div class="mem-film-frame">
                ${renderPicture({ ...item, sizes: '(max-width: 820px) 84vw, 34vw' })}
              </div>
              <figcaption class="mem-film-caption">
                <span>0${idx + 1} //</span>
                <span>${esc(item.caption)}</span>
              </figcaption>
            </figure>
          `).join('')}
        </div>
      </div>

      <div class="orbe-cta-row">
        <a href="/memories" data-spa-link="true" class="btn-link-inline" data-magnetic="true">EXPLORE DEDICATED MEMORIES ARCHIVE //</a>
      </div>

      <div id="archive-lightbox" class="mem-lightbox" role="dialog" aria-modal="true" aria-labelledby="lightbox-caption" aria-hidden="true">
        <div class="lightbox-content">
          <div class="lightbox-bar">
            <span class="lightbox-counter" id="lightbox-counter">01 / 06</span>
            <button type="button" class="lightbox-close-btn" id="lightbox-close">CLOSE // ESC</button>
          </div>
          <div id="lightbox-media-slot" class="lightbox-media-slot"></div>
          <div class="lightbox-foot">
            <button type="button" class="lightbox-nav-btn" id="lightbox-prev" aria-label="Previous photo">&#8592; PREV</button>
            <div class="lightbox-caption" id="lightbox-caption"></div>
            <button type="button" class="lightbox-nav-btn" id="lightbox-next" aria-label="Next photo">NEXT &#8594;</button>
          </div>
        </div>
      </div>
    </section>
  `;
}

/**
 * Shared enhancer for BOTH Home #memories and dedicated /memories archive page.
 */
export function mountMemoriesInteraction(root = document) {
  const cleanups = [];
  const reduced = prefersReducedMotion();

  const viewport = root.querySelector('#mem-filmstrip-viewport');
  const prevStep = root.querySelector('#mem-strip-prev');
  const nextStep = root.querySelector('#mem-strip-next');

  if (viewport) {
    const scrollByStep = (dir) => {
      viewport.scrollBy({
        left: dir * Math.min(440, viewport.clientWidth * 0.72),
        behavior: reduced ? 'auto' : 'smooth',
      });
    };
    const onPrev = () => scrollByStep(-1);
    const onNext = () => scrollByStep(1);
    prevStep?.addEventListener('click', onPrev);
    nextStep?.addEventListener('click', onNext);
    cleanups.push(() => {
      prevStep?.removeEventListener('click', onPrev);
      nextStep?.removeEventListener('click', onNext);
    });
  }

  // Lightbox with Prev/Next, Keyboard Arrows & Touch Swipe
  const lightbox = root.querySelector('#archive-lightbox');
  const mediaSlot = root.querySelector('#lightbox-media-slot');
  const lightboxCaption = root.querySelector('#lightbox-caption');
  const lightboxCounter = root.querySelector('#lightbox-counter');
  const closeBtn = root.querySelector('#lightbox-close');
  const prevBtn = root.querySelector('#lightbox-prev');
  const nextBtn = root.querySelector('#lightbox-next');
  const triggers = Array.from(root.querySelectorAll('[data-img]'));

  let activeIdx = -1;
  let lastTrigger = null;

  function renderLightboxAt(idx) {
    if (!triggers.length || !mediaSlot) return;
    activeIdx = ((idx % triggers.length) + triggers.length) % triggers.length;
    const tr = triggers[activeIdx];
    const src = tr.dataset.img;
    const cap = tr.dataset.caption || '';
    mediaSlot.innerHTML = '';
    const img = document.createElement('img');
    img.src = src;
    img.alt = cap;
    mediaSlot.appendChild(img);
    if (lightboxCaption) lightboxCaption.textContent = cap;
    if (lightboxCounter) {
      lightboxCounter.textContent = `${String(activeIdx + 1).padStart(2, '0')} / ${String(triggers.length).padStart(2, '0')}`;
    }
  }

  function openLightbox(trigger, idx) {
    if (!lightbox || !mediaSlot) return;
    lastTrigger = trigger;
    renderLightboxAt(idx);
    lightbox.classList.add('active');
    lightbox.setAttribute('aria-hidden', 'false');
    closeBtn?.focus();
  }

  function closeLightbox() {
    if (!lightbox || !lightbox.classList.contains('active')) return;
    lightbox.classList.remove('active');
    lightbox.setAttribute('aria-hidden', 'true');
    if (mediaSlot) mediaSlot.innerHTML = '';
    lastTrigger?.focus?.();
    lastTrigger = null;
  }

  triggers.forEach((el, idx) => {
    const onClick = () => openLightbox(el, idx);
    const onKey = (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openLightbox(el, idx);
      }
    };
    el.addEventListener('click', onClick);
    el.addEventListener('keydown', onKey);
    cleanups.push(() => {
      el.removeEventListener('click', onClick);
      el.removeEventListener('keydown', onKey);
    });
  });

  prevBtn?.addEventListener('click', () => renderLightboxAt(activeIdx - 1));
  nextBtn?.addEventListener('click', () => renderLightboxAt(activeIdx + 1));
  closeBtn?.addEventListener('click', closeLightbox);

  let touchStartX = 0;
  const onLbTouchStart = (e) => {
    touchStartX = e.touches?.[0]?.clientX || 0;
  };
  const onLbTouchEnd = (e) => {
    const endX = e.changedTouches?.[0]?.clientX || 0;
    const diff = endX - touchStartX;
    if (Math.abs(diff) > 48) {
      renderLightboxAt(diff < 0 ? activeIdx + 1 : activeIdx - 1);
    }
  };
  lightbox?.addEventListener('touchstart', onLbTouchStart, { passive: true });
  lightbox?.addEventListener('touchend', onLbTouchEnd, { passive: true });

  const onLbClick = (e) => {
    if (e.target === lightbox) closeLightbox();
  };
  const onKeyDown = (e) => {
    if (!lightbox?.classList.contains('active')) return;
    if (e.key === 'Escape') closeLightbox();
    else if (e.key === 'ArrowLeft') renderLightboxAt(activeIdx - 1);
    else if (e.key === 'ArrowRight') renderLightboxAt(activeIdx + 1);
  };
  lightbox?.addEventListener('click', onLbClick);
  document.addEventListener('keydown', onKeyDown);

  cleanups.push(() => {
    lightbox?.removeEventListener('touchstart', onLbTouchStart);
    lightbox?.removeEventListener('touchend', onLbTouchEnd);
    lightbox?.removeEventListener('click', onLbClick);
    document.removeEventListener('keydown', onKeyDown);
  });

  return () => cleanups.forEach((fn) => fn());
}
