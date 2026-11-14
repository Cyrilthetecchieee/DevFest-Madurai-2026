/** Safe HTML serialization, responsive picture rendering, and shared HUD chrome markup. */
import eventData from '../data/event.json';

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

export function renderHeroStage(routeKey, headingText) {
  const cfg = eventData.hero[routeKey] || eventData.hero.home;
  const topId = routeKey === 'home' ? 'home' : 'top';
  const primaryAttrs = cfg.primaryCta.external
    ? 'target="_blank" rel="noopener noreferrer"'
    : cfg.primaryCta.href.startsWith('/')
      ? 'data-spa-link="true"'
      : '';
  const secondaryAttrs = cfg.secondaryCta.href.startsWith('/')
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
          </div>
        </div>
      </div>
    </section>
  `;
}

export function renderFooter({ cfpHref = '/#cfp' } = {}) {
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
            <li><a href="${esc(cfpHref)}" data-spa-link="true">Submit CFP</a></li>
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
