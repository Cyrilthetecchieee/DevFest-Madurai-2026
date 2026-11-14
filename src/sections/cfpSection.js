/**
 * Call for Speakers (CFP) Section — Clean Track Rows, Guidelines & Prominent Submission CTA
 */
import {
  esc,
  renderGdgRule,
  renderGdgMotif,
  renderTrackChip,
  renderStatusChip,
} from '../utils/dom.js';

const CFP_TRACKS = [
  {
    code: '01',
    track: 'ai',
    title: 'AI & MACHINE LEARNING',
    tags: 'Applied LLMs · On-Device ML · Evaluation · Agents',
    detail: 'Practical lessons shipping AI features, model evaluation, safety workflows, and real-world architectures.',
  },
  {
    code: '02',
    track: 'cloud',
    title: 'WEB & CLOUD PLATFORMS',
    tags: 'Modern Web · Google Cloud · Kubernetes · Performance',
    detail: 'Production architectures, frontend reliability, serverless pipelines, and multi-cloud observability.',
  },
  {
    code: '03',
    track: 'android',
    title: 'ANDROID & MOBILE SYSTEMS',
    tags: 'Kotlin · Jetpack Compose · KMP · Performance',
    detail: 'Building responsive mobile apps with modern UI toolkits, architecture patterns, and offline-first sync.',
  },
  {
    code: '04',
    track: 'opensource',
    title: 'OPEN SOURCE ECOSYSTEM',
    tags: 'Developer Tools · Governance · Maintaining Projects',
    detail: 'Stories from maintainers and contributors on sustainable tooling, developer experience, and community impact.',
  },
  {
    code: '05',
    track: 'design',
    title: 'DESIGN & PRODUCT CRAFT',
    tags: 'Design Systems · Accessibility · Interaction',
    detail: 'Co-creating clear, accessible, human-centred interfaces that pair engineering velocity with thoughtful UX.',
  },
  {
    code: '06',
    track: 'workshop',
    title: 'WORKSHOPS & CAREER STORIES',
    tags: 'Hands-on Labs · First-Time Speakers · Engineering Growth',
    detail: 'Step-by-step build sessions alongside candid lessons from building developer communities and engineering teams.',
  },
];

export function renderCfpSection(cfpData, links) {
  return `
    <section id="cfp" class="stage-section" aria-labelledby="heading-cfp">
      ${renderGdgRule()}
      <div class="gdg-section-head">
        <div>
          <span class="stage-eyebrow">${esc(cfpData.tag)}</span>
          <h2 id="heading-cfp" class="stage-display">${esc(cfpData.heading)}</h2>
        </div>
        ${renderGdgMotif('bars')}
      </div>
      <p class="stage-lead">${esc(cfpData.copy)}</p>

      <div class="cfp-highlights">
        ${(cfpData.homeCards || []).map((card, i) => `
          <article class="cfp-highlight-card cfp-highlight-card--${i === 0 ? 'blue' : 'green'}">
            ${renderStatusChip(card.badge, i === 0 ? 'blue' : 'open')}
            <h3 class="cfp-highlight-title">${esc(card.title)}</h3>
            <p class="cfp-highlight-body">${esc(card.body)}</p>
          </article>
        `).join('')}
      </div>

      <h3 class="cfp-subhead">PROPOSED SESSION TRACKS</h3>
      <ul class="cfp-track-list" aria-label="Call for Speakers tracks">
        ${CFP_TRACKS.map((tr, i) => `
          <li class="cfp-track-item cfp-track-item--${esc(tr.track)}">
            <button
              type="button"
              class="cfp-track-trigger"
              data-cfp-toggle="${i}"
              aria-expanded="false"
              aria-controls="cfp-drawer-${i}"
            >
              <span class="cfp-track-code">${esc(tr.code)}</span>
              <span class="cfp-track-main">
                <span class="cfp-track-name">${esc(tr.title)}</span>
                <span class="cfp-track-tags">${esc(tr.tags)}</span>
              </span>
              <span class="cfp-track-right">
                ${renderTrackChip(tr.track)}
                <span class="cfp-track-chevron" aria-hidden="true">+</span>
              </span>
            </button>
            <div id="cfp-drawer-${i}" class="cfp-track-drawer" hidden>
              <p class="cfp-drawer-body">${esc(tr.detail)}</p>
              <a href="${esc(links.cfp)}" target="_blank" rel="noopener noreferrer" class="btn-g-secondary cfp-track-submit">
                PROPOSE A TALK IN ${esc(tr.title)} ↗
              </a>
            </div>
          </li>
        `).join('')}
      </ul>

      <div class="cfp-cta-bar">
        <a
          href="${esc(links.cfp)}"
          target="_blank"
          rel="noopener noreferrer"
          class="btn-g-primary"
        >
          ${esc(cfpData.ctaLabel)}
        </a>
        <a href="/speakers" data-spa-link="true" class="btn-g-secondary">VIEW SPEAKER GUIDELINES</a>
      </div>
    </section>
  `;
}

export function mountCfpSection() {
  const section = document.getElementById('cfp');
  if (!section) return () => {};

  const triggers = Array.from(section.querySelectorAll('[data-cfp-toggle]'));
  const cleanups = [];

  triggers.forEach((btn) => {
    const onClick = () => {
      const idx = btn.dataset.cfpToggle;
      const drawer = document.getElementById(`cfp-drawer-${idx}`);
      if (!drawer) return;
      const expanded = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!expanded));
      const icon = btn.querySelector('.cfp-track-chevron');
      if (icon) icon.textContent = !expanded ? '−' : '+';
      drawer.hidden = expanded;
    };
    btn.addEventListener('click', onClick);
    cleanups.push(() => btn.removeEventListener('click', onClick));
  });

  return () => cleanups.forEach((fn) => fn());
}
