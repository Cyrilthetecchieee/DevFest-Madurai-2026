/**
 * Memories Highlights — Curved 3D Ring Carousel, Drag Inertia, Aurora Mask Reveal & Accessible Lightbox
 */
import memoriesData from '../data/memories.json';
import { prefersReducedMotion } from '../utils/env.js';
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

          <div class="mem-ring-toolbar">
            <div class="hero-pillars-controls">
              <button type="button" class="hero-pillar-nav-btn" id="mem-ring-prev" aria-label="Previous memory">&lsaquo;</button>
              <span class="hero-pillars-counter" id="mem-ring-counter">01 / ${String(items.length).padStart(2, '0')}</span>
              <button type="button" class="hero-pillar-nav-btn" id="mem-ring-next" aria-label="Next memory">&rsaquo;</button>
            </div>
            <button type="button" class="btn-g-secondary" id="mem-grid-toggle" aria-pressed="false">GRID VIEW</button>
            <a href="/memories" data-spa-link="true" class="btn-g-primary">EXPLORE ALL MEMORIES</a>
          </div>
        </div>

        <div class="graphic-window" data-creature-zone="memories" aria-hidden="true"></div>
      </div>

      <div class="mem-ring-stage" id="mem-ring-stage" aria-label="3D Memory Ring Carousel">
        <div class="mem-ring-track" id="mem-ring-track">
          ${items.map((item, i) => `
            <figure class="hud-bevel-card mem-ring-card" data-mem-idx="${i}">
              <button
                type="button"
                class="mem-photo-trigger mem-iris-frame"
                aria-label="Open photo: ${esc(item.caption)}"
                data-img="${esc(getLightboxImageUrl(item))}"
                data-caption="${esc(item.caption)}"
                data-ring-idx="${i}"
              >
                <span class="mem-hud-year">2025 // ARCHIVE 0${i + 1}</span>
                ${renderPicture({
                  base: item.base,
                  dir: item.dir,
                  alt: item.alt,
                  sizes: '(max-width: 640px) 84vw, (max-width: 1024px) 52vw, 38vw',
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
      </div>

      <div class="mem-home-grid" id="mem-home-grid" hidden>
        ${items.map((item, i) => `
          <figure class="mem-photo-card">
            <button
              type="button"
              class="mem-photo-trigger mem-iris-frame"
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
  const ringStage = root.querySelector('#mem-ring-stage');
  const ringCards = Array.from(root.querySelectorAll('.mem-ring-card'));
  const ringCounter = root.querySelector('#mem-ring-counter');
  const ringPrevBtn = root.querySelector('#mem-ring-prev');
  const ringNextBtn = root.querySelector('#mem-ring-next');
  const gridToggleBtn = root.querySelector('#mem-grid-toggle');
  const gridFallback = root.querySelector('#mem-home-grid');

  // Interactive Curved 3D Ring Carousel Controller (when present on Home page)
  if (ringStage && ringCards.length) {
    const count = ringCards.length;
    let targetIdx = 0;
    let currentPos = 0;
    let velocity = 0;
    let dragging = false;
    let lastX = 0;
    let dragDist = 0;
    let rafId = 0;
    const reduced = prefersReducedMotion();

    const wrappedDiff = (i, pos) => {
      let d = (i - pos) % count;
      if (d > count / 2) d -= count;
      if (d < -count / 2) d += count;
      return d;
    };

    const layoutCards = () => {
      const stageW = ringStage.clientWidth || window.innerWidth;
      const arcRadius = Math.max(240, Math.min(480, stageW * 0.42));
      const nearest = ((Math.round(targetIdx) % count) + count) % count;
      if (ringCounter) {
        ringCounter.textContent = `${String(nearest + 1).padStart(2, '0')} / ${String(count).padStart(2, '0')}`;
      }

      ringCards.forEach((card, i) => {
        const d = wrappedDiff(i, currentPos);
        const absD = Math.abs(d);
        const theta = d * 0.48;
        const tx = Math.sin(theta) * arcRadius;
        const tz = (Math.cos(theta) - 1) * 280;
        const ry = -theta * (180 / Math.PI) * 0.72;
        const scale = Math.max(0.72, 1 - absD * 0.14);
        const opacity = absD > 2.3 ? Math.max(0, 1 - (absD - 2.3) * 1.4) : Math.max(0.45, 1 - absD * 0.24);
        const isActive = absD < 0.35;

        card.classList.toggle('is-active', isActive);
        card.style.opacity = opacity.toFixed(2);
        card.style.zIndex = String(Math.round(100 - absD * 20));
        card.style.transform = `translate3d(calc(-50% + ${tx.toFixed(1)}px), 0, ${tz.toFixed(1)}px) rotateY(${ry.toFixed(1)}deg) scale(${scale.toFixed(3)})`;
      });
    };

    const tick = () => {
      if (!dragging) {
        if (Math.abs(velocity) > 0.002) {
          targetIdx += velocity;
          velocity *= 0.9;
        } else {
          targetIdx += (Math.round(targetIdx) - targetIdx) * 0.14;
        }
      }
      currentPos += (targetIdx - currentPos) * (reduced ? 1 : 0.16);
      layoutCards();
      rafId = window.requestAnimationFrame(tick);
    };

    const onDown = (e) => {
      dragging = true;
      lastX = e.clientX;
      dragDist = 0;
      velocity = 0;
      ringStage.classList.add('is-dragging');
    };
    const onMove = (e) => {
      if (!dragging) return;
      const dx = e.clientX - lastX;
      lastX = e.clientX;
      dragDist += Math.abs(dx);
      targetIdx -= dx / 220;
      velocity = -dx / 260;
    };
    const onUp = () => {
      if (!dragging) return;
      dragging = false;
      ringStage.classList.remove('is-dragging');
      targetIdx = Math.round(targetIdx);
    };

    const onPrev = () => { targetIdx = Math.round(targetIdx) - 1; velocity = 0; };
    const onNext = () => { targetIdx = Math.round(targetIdx) + 1; velocity = 0; };

    ringPrevBtn?.addEventListener('click', onPrev);
    ringNextBtn?.addEventListener('click', onNext);
    ringStage.addEventListener('pointerdown', onDown);
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerup', onUp, { passive: true });

    if (gridToggleBtn && gridFallback) {
      const onGridToggle = () => {
        const showGrid = gridFallback.hidden;
        gridFallback.hidden = !showGrid;
        ringStage.hidden = showGrid;
        gridToggleBtn.setAttribute('aria-pressed', String(showGrid));
        gridToggleBtn.textContent = showGrid ? '3D RING VIEW' : 'GRID VIEW';
      };
      gridToggleBtn.addEventListener('click', onGridToggle);
      cleanups.push(() => gridToggleBtn.removeEventListener('click', onGridToggle));
    }

    rafId = window.requestAnimationFrame(tick);
    cleanups.push(() => {
      window.cancelAnimationFrame(rafId);
      ringPrevBtn?.removeEventListener('click', onPrev);
      ringNextBtn?.removeEventListener('click', onNext);
      ringStage.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    });

    // Clicking an inactive side card brings it forward instead of immediately triggering lightbox
    ringCards.forEach((card, i) => {
      const btn = card.querySelector('[data-ring-idx]');
      if (!btn) return;
      const onRingClick = (e) => {
        if (dragDist > 10) {
          e.stopImmediatePropagation();
          e.preventDefault();
          return;
        }
        const diff = wrappedDiff(i, targetIdx);
        if (Math.abs(diff) > 0.35) {
          e.stopImmediatePropagation();
          e.preventDefault();
          targetIdx += diff;
        }
      };
      btn.addEventListener('click', onRingClick, { capture: true });
      cleanups.push(() => btn.removeEventListener('click', onRingClick, { capture: true }));
    });
  }

  // Lightbox Controller (Home + Memories Archive Page)
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
