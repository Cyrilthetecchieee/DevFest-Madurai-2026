/**
 * About Section — Editorial Overview & Open Companion Window
 */
import { esc } from '../utils/dom.js';

export function renderAboutSection(aboutData) {
  return `
    <section id="about" class="stage-section about-stage" aria-labelledby="heading-about">
      <div class="stage-asymmetric">
        <div class="content-zone local-scrim">
          <div class="stage-section-head">
            <div>
              <span class="stage-eyebrow" data-scramble="true">${esc(aboutData.tag)}</span>
              <h2 id="heading-about" class="stage-display" data-reveal="mask">${esc(aboutData.heading)}</h2>
            </div>
          </div>

          <div class="about-editorial-copy">
            <p class="stage-lead">${esc(aboutData.paragraphs[0])}</p>
            <p class="about-manifesto-quote">${esc(aboutData.paragraphs[1])}</p>
          </div>

          <div class="about-actions-row">
            <a href="#agenda" class="btn-g-primary">EXPLORE THE DAY RING</a>
            <a href="/speakers" data-spa-link="true" class="btn-g-secondary">MEET THE SPEAKERS</a>
          </div>
        </div>

        <div class="graphic-window" data-creature-zone="about" aria-hidden="true"></div>
      </div>
    </section>
  `;
}

export function mountAboutSection() {
  return () => {};
}
