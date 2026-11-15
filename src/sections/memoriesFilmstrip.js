/**
 * Memories Filmstrip, Curtain Reveals, Lightbox & Liquid Hover Integration (#20, S15):
 * - Home #memories: draggable inertial horizontal filmstrip, velocity skew, parallax frames.
 * - Shared clip-path curtain reveals, swipe/keyboard Prev/Next shared-element Lightbox.
 * - Dispatches media hover telemetry to stageBus for HIGH-tier persistent WebGL liquid shader (CSS fallback elsewhere).
 */
import memoriesData from '../data/memories.json';
import { esc, renderPicture } from '../utils/dom.js';
import { prefersReducedMotion } from '../utils/env.js';
import { stageBus } from '../motion/stageBus.js';

function getLightboxImageUrl(item) {
  return `/assets/${item.dir}/${item.base}-1280.webp`;
}

export function renderHomeMemoriesSection() {
  const { homeTeaser } = memoriesData;
  const items = homeTeaser.items || [];
  const featured = items[0];
  const galleryItems = items.slice(1);

  return `
    <section id="memories" class="stage-section mem-home-stage" data-waypoint="8" aria-labelledby="heading-memories">
      <div class="mem-home-head">
        <div>
          <span class="stage-eyebrow" data-scramble="true">${esc(homeTeaser.tag)}</span>
          <h2 id="heading-memories" class="stage-display" data-reveal="mask" data-track-scroll="true">${esc(homeTeaser.heading)}</h2>
          <p class="stage-lead">${esc(homeTeaser.copy)}</p>
        </div>
        <div class="mem-strip-controls">
          <span class="mem-drag-hint">DRAG SHOWCASE // CLICK TO INSPECT</span>
          <div class="mem-step-btns">
            <button type="button" class="about-rail-btn" id="mem-strip-prev" aria-label="Scroll showcase left">&#8592;</button>
            <button type="button" class="about-rail-btn" id="mem-strip-next" aria-label="Scroll showcase right">&#8594;</button>
          </div>
        </div>
      </div>

      ${featured ? `
        <figure
          class="mem-home-featured"
          data-curtain="true"
          data-img="${esc(getLightboxImageUrl(featured))}"
          data-caption="${esc(featured.caption)}"
          data-idx="0"
          tabindex="0"
          role="button"
          aria-label="Open photo: ${esc(featured.caption)}"
        >
          <div class="mem-home-featured-frame" data-liquid-media="${esc(getLightboxImageUrl(featured))}">
            ${renderPicture({ ...featured, sizes: '(max-width: 820px) 92vw, 84vw' })}
            <figcaption class="mem-glass-overlay mem-glass-overlay--featured">
              <span class="mem-overlay-tag">01 // FEATURED ARCHIVE</span>
              <span class="mem-overlay-title">${esc(featured.caption)}</span>
            </figcaption>
          </div>
        </figure>
      ` : ''}

      <div class="mem-filmstrip-viewport" id="mem-filmstrip-viewport" aria-label="DevFest Memories Gallery">
        <div class="mem-filmstrip-track" id="mem-filmstrip-track">
          ${galleryItems.map((item, idx) => `
            <figure
              class="mem-film-card"
              data-curtain="true"
              data-img="${esc(getLightboxImageUrl(item))}"
              data-caption="${esc(item.caption)}"
              data-idx="${idx + 1}"
              tabindex="0"
              role="button"
              aria-label="Open photo: ${esc(item.caption)}"
            >
              <div class="mem-film-frame" data-liquid-media="${esc(getLightboxImageUrl(item))}">
                ${renderPicture({ ...item, sizes: '(max-width: 820px) 88vw, 44vw' })}
                <figcaption class="mem-glass-overlay">
                  <span class="mem-overlay-tag">0${idx + 2}</span>
                  <span class="mem-overlay-title">${esc(item.caption)}</span>
                </figcaption>
              </div>
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

  // 1. Curtain reveals on scroll (with eager viewport check + generous threshold so tall cards never stall)
  const curtainEls = Array.from(root.querySelectorAll('[data-curtain="true"]'));
  if (curtainEls.length) {
    if (reduced) {
      curtainEls.forEach((el) => el.classList.add('is-curtain-open'));
    } else {
      const revealIfVisible = () => {
        const vh = window.innerHeight || 900;
        curtainEls.forEach((el) => {
          if (el.classList.contains('is-curtain-open')) return;
          const r = el.getBoundingClientRect();
          if (r.top < vh + 160 && r.bottom > -160) {
            el.classList.add('is-curtain-open');
          }
        });
      };

      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-curtain-open');
              io.unobserve(entry.target);
            }
          });
        },
        { rootMargin: '160px 0px', threshold: 0.01 }
      );
      curtainEls.forEach((el) => io.observe(el));
      window.addEventListener('scroll', revealIfVisible, { passive: true });
      revealIfVisible();
      cleanups.push(() => {
        io.disconnect();
        window.removeEventListener('scroll', revealIfVisible);
      });
    }
  }

  // 2. Draggable inertial filmstrip + velocity skew + prev/next buttons (on Home)
  const viewport = root.querySelector('#mem-filmstrip-viewport');
  const track = root.querySelector('#mem-filmstrip-track');
  const prevStep = root.querySelector('#mem-strip-prev');
  const nextStep = root.querySelector('#mem-strip-next');
  let suppressClickUntil = 0;

  if (viewport && track) {
    let dragging = false;
    let startX = 0;
    let startScroll = 0;
    let lastX = 0;
    let velocity = 0;
    let inertiaRaf = 0;

    const applySkew = (vel) => {
      if (reduced) return;
      const deg = Math.max(-5.5, Math.min(5.5, vel * -0.22));
      track.style.transform = `skewX(${deg.toFixed(2)}deg)`;
    };

    const runInertia = () => {
      if (Math.abs(velocity) < 0.25) {
        velocity = 0;
        track.style.transform = '';
        inertiaRaf = 0;
        return;
      }
      viewport.scrollLeft -= velocity;
      velocity *= 0.92;
      applySkew(velocity);
      inertiaRaf = window.requestAnimationFrame(runInertia);
    };

    const onDown = (e) => {
      dragging = true;
      startX = e.clientX;
      lastX = e.clientX;
      startScroll = viewport.scrollLeft;
      velocity = 0;
      window.cancelAnimationFrame(inertiaRaf);
      viewport.classList.add('is-dragging');
    };

    const onMove = (e) => {
      if (!dragging) return;
      const dx = e.clientX - lastX;
      lastX = e.clientX;
      velocity = dx;
      viewport.scrollLeft = startScroll - (e.clientX - startX);
      applySkew(dx);
      if (Math.abs(e.clientX - startX) > 7) {
        suppressClickUntil = performance.now() + 220;
      }
    };

    const onUp = () => {
      if (!dragging) return;
      dragging = false;
      viewport.classList.remove('is-dragging');
      if (!reduced && Math.abs(velocity) > 0.6) {
        inertiaRaf = window.requestAnimationFrame(runInertia);
      } else {
        track.style.transform = '';
      }
    };

    viewport.addEventListener('pointerdown', onDown);
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerup', onUp);

    const scrollByStep = (dir) => {
      viewport.scrollBy({ left: dir * Math.min(440, viewport.clientWidth * 0.72), behavior: 'smooth' });
    };
    prevStep?.addEventListener('click', () => scrollByStep(-1));
    nextStep?.addEventListener('click', () => scrollByStep(1));

    cleanups.push(() => {
      window.cancelAnimationFrame(inertiaRaf);
      viewport.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    });
  }

  // 3. In-frame image scroll parallax + Liquid Hover bridge to persistent WebGL stage
  const liquidMediaBoxes = Array.from(root.querySelectorAll('[data-liquid-media], .mem-featured-frame, .mem-sub-frame, .mem-edition-card, .mem-panoramic-card, .mem-diptych-card, .mem-human-card'));
  if (liquidMediaBoxes.length && !reduced) {
    const onScrollParallax = () => {
      const vh = window.innerHeight || 800;
      for (const box of liquidMediaBoxes) {
        const r = box.getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh) continue;
        const p = ((r.top + r.height * 0.5) / vh - 0.5) * 2;
        box.style.setProperty('--mem-py', `${(p * -10).toFixed(1)}px`);
      }
    };
    window.addEventListener('scroll', onScrollParallax, { passive: true });
    onScrollParallax();
    cleanups.push(() => window.removeEventListener('scroll', onScrollParallax));

    liquidMediaBoxes.forEach((box) => {
      const parentTrigger = box.closest('[data-img]');
      const src = box.dataset.liquidMedia || parentTrigger?.dataset.img || box.querySelector('img')?.currentSrc;
      const enter = () => {
        if (!src) return;
        stageBus.emit('media:hover', { el: box, src });
      };
      const move = (e) => {
        const r = box.getBoundingClientRect();
        stageBus.emit('media:move', {
          nx: (e.clientX - r.left) / Math.max(1, r.width),
          ny: (e.clientY - r.top) / Math.max(1, r.height),
        });
      };
      const leave = () => {
        stageBus.emit('media:leave', { el: box });
      };
      box.addEventListener('pointerenter', enter);
      box.addEventListener('pointermove', move, { passive: true });
      box.addEventListener('pointerleave', leave);
      cleanups.push(() => {
        stageBus.emit('media:leave', { el: box });
        box.removeEventListener('pointerenter', enter);
        box.removeEventListener('pointermove', move);
        box.removeEventListener('pointerleave', leave);
      });
    });
  }

  // 4. Upgraded Lightbox with Prev/Next, Keyboard Arrows & Touch Swipe
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
    if (performance.now() < suppressClickUntil) return;
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
