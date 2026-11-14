/** Memories Archive Page View, Curtain Reveals, Liquid Hover & Swipe Lightbox */
import eventData from '../data/event.json';
import memoriesData from '../data/memories.json';
import { esc, renderHeroStage, renderDiscoverButton, renderPicture } from '../utils/dom.js';
import { mountMemoriesInteraction } from '../sections/memoriesFilmstrip.js';
import { renderStageFooter, mountStageFooter } from '../sections/footerSection.js';

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
      <section id="community" class="stage-section" aria-labelledby="heading-community">
        <div class="stage-asymmetric">
          <div class="content-zone local-scrim">
            <span class="stage-eyebrow" data-scramble="true">${esc(community.tag)}</span>
            <h2 id="heading-community" class="stage-display" data-reveal="mask">${esc(community.heading)}</h2>
            <p class="stage-lead">${esc(community.copy)}</p>
          </div>
          <div class="graphic-window" data-creature-zone="about" aria-hidden="true"></div>
        </div>

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

      <section id="editions" class="stage-section" aria-labelledby="heading-editions">
        <div class="content-zone local-scrim">
          <span class="stage-eyebrow" data-scramble="true">${esc(editions.tag)}</span>
          <h2 id="heading-editions" class="stage-display" data-reveal="mask">${esc(editions.heading)}</h2>
          <p class="stage-lead">${esc(editions.copy)}</p>
        </div>

        <div class="mem-timeline">
          ${editions.items.map((ed) => `
            <div class="mem-edition-block">
              <div class="mem-edition-node" aria-hidden="true"></div>
              <div class="mem-edition-header">
                <span class="mem-year-badge">${esc(ed.year)}</span>
                <span class="mem-edition-title">${esc(ed.title)}</span>
              </div>
              <p class="stage-lead orbe-section-copy-flush">${esc(ed.copy)}</p>
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

      <section id="gallery" class="stage-section" aria-labelledby="heading-gallery">
        <div class="content-zone local-scrim">
          <span class="stage-eyebrow" data-scramble="true">${esc(gallery.tag)}</span>
          <h2 id="heading-gallery" class="stage-display" data-reveal="mask">${esc(gallery.heading)}</h2>
          <p class="stage-lead">${esc(gallery.copy)}</p>
        </div>

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

      <section id="human-moments" class="stage-section" aria-labelledby="heading-human">
        <div class="content-zone local-scrim">
          <span class="stage-eyebrow" data-scramble="true">${esc(human.tag)}</span>
          <h2 id="heading-human" class="stage-display" data-reveal="mask">${esc(human.heading)}</h2>
          <p class="stage-lead">${esc(human.copy)}</p>
        </div>

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

      <section id="closing" class="stage-section mem-closing-hero" aria-labelledby="heading-closing">
        <div class="content-zone local-scrim">
          <span class="stage-eyebrow" data-scramble="true">${esc(closing.tag)}</span>
          <h2 id="heading-closing" class="mem-closing-heading" data-reveal="mask">${esc(closing.heading)}</h2>
          <p class="mem-closing-sub">${esc(closing.sub)}</p>
          <p class="stage-lead orbe-section-copy-center">${esc(closing.copy)}</p>

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
        </div>
      </section>

      ${renderStageFooter()}
    </main>

    <div id="archive-lightbox" class="mem-lightbox" role="dialog" aria-modal="true" aria-labelledby="lightbox-caption" aria-hidden="true">
      <div class="lightbox-content">
        <div class="lightbox-bar">
          <span class="lightbox-counter" id="lightbox-counter">01 / 01</span>
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
  `;
}

export function mountMemoriesPage(root) {
  const progress = document.getElementById('archive-progress');
  if (progress) progress.classList.add('visible');

  const updateProgress = () => {
    if (!progress) return;
    const total = document.documentElement.scrollHeight - window.innerHeight;
    const pct = total > 0 ? Math.min(100, Math.max(0, (window.scrollY / total) * 100)) : 0;
    progress.style.width = `${pct}%`;
  };
  window.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();

  const stopInteraction = mountMemoriesInteraction(root || document);
  const stopFooter = mountStageFooter(root || document);

  return () => {
    if (progress) {
      progress.classList.remove('visible');
      progress.style.width = '0%';
    }
    window.removeEventListener('scroll', updateProgress);
    stopFooter();
    stopInteraction();
  };
}
