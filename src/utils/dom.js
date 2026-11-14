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

export function renderDiscoverButton({ label, ariaLabel, href, external = false, inline = false, compactLabel = false, internalHref = null }) {
  const attrs = external
    ? `target="_blank" rel="noopener noreferrer"`
    : internalHref
      ? `data-spa-link="true"`
      : '';
  const classes = ['btn-discover', inline ? 'btn-discover-inline' : ''].filter(Boolean).join(' ');
  const labelClasses = ['btn-label', compactLabel ? 'btn-label-compact' : ''].filter(Boolean).join(' ');
  const resolvedHref = internalHref || href;

  return `
    <a href="${esc(resolvedHref)}" ${attrs} class="${classes}" aria-label="${esc(ariaLabel || label)}">
      <svg class="btn-discover-svg" viewBox="862 1127 330 102" aria-hidden="true">
        <path d="M884,1131 H1170 L1188,1149 V1207 L1170,1225 H884 L866,1207 V1149 Z" fill="#04060c" stroke="#04060c" stroke-width="7" stroke-linejoin="round" />
        <path d="M871,1196 V1151 L886,1136 H1170 L1181,1147" fill="none" stroke="#5ef3ff" stroke-width="2.2" opacity="0.9" />
        <path d="M884,1131 H1170 L1188,1149 V1207 L1170,1225 H884 L866,1207 V1149 Z" fill="none" stroke="#0a1220" stroke-width="2" opacity="0.9" />
        <path class="chip" d="M1110,1140 H1166 L1180,1154 V1196 L1166,1210 H1110 L1096,1196 V1154 Z" fill="#5ef3ff" />
        <g class="chevrons" stroke="#0a1a2c" stroke-width="2.2" stroke-linecap="butt" stroke-linejoin="miter" fill="none">
          <path d="M1124,1167 l6,8 l-6,8" />
          <path d="M1134,1167 l6,8 l-6,8" />
          <path d="M1144,1167 l6,8 l-6,8" />
        </g>
      </svg>
      <span class="${labelClasses}">${esc(label)}</span>
    </a>
  `;
}

export function renderHeroStage(routeKey, headingText) {
  const cfg = eventData.hero[routeKey] || eventData.hero.home;
  const topId = routeKey === 'home' ? 'home' : 'top';
  const secondaryAttrs = cfg.secondaryCta.href.startsWith('/')
    ? `href="${esc(cfg.secondaryCta.href)}" data-spa-link="true"`
    : `href="${esc(cfg.secondaryCta.href)}"`;
  const compactPrimary = cfg.primaryCta.label.length > 14;

  return `
    <div id="${topId}"></div>
    <section id="stage-ui" class="pinned-stage" aria-label="Hero">
      <h1 class="sr-only">${esc(headingText)}</h1>

      <div class="side-copy side-copy-left">
        <span class="crosses" aria-hidden="true">+++</span>
        <div>${esc(cfg.left.kicker)}</div>
        <div>${esc(cfg.left.title)}</div>
        <span class="spacer" aria-hidden="true"></span>
        <div>${esc(cfg.left.lead)}</div>
        ${cfg.left.subs.map((s) => `<div class="hero-sub">${esc(s)}</div>`).join('')}
      </div>

      <div class="side-copy side-copy-right">
        <span class="crosses" aria-hidden="true">+++</span>
        <div>${esc(cfg.right.lead)}</div>
        ${cfg.right.subs.map((s) => `<div class="hero-sub">${esc(s)}</div>`).join('')}
        <span class="spacer" aria-hidden="true"></span>
        ${cfg.right.meta.map((m) => `<div>${esc(m)}</div>`).join('')}
      </div>

      <svg class="word-new" viewBox="0 0 480 160" aria-hidden="true">
        <path fill-rule="evenodd" fill="#f3f6ff" d="M 34.459 19.820 C 28.801 22.473, 22 31.373, 22 36.122 C 22 36.605, 28.275 37, 35.944 37 C 52.445 37, 52.559 37.060, 58.589 49 C 60.673 53.125, 66.498 64.375, 71.535 74 C 76.572 83.625, 84.855 99.600, 89.942 109.500 C 100.272 129.605, 103.029 133.119, 110.736 136.002 C 120.688 139.726, 130.322 137.731, 137.616 130.436 C 144.944 123.108, 145 122.628, 145 66.818 L 145 18 135.009 18 L 125.019 18 124.759 67.141 C 124.472 121.522, 124.708 119.685, 118.303 117.442 C 116.050 116.653, 114.162 113.913, 108.681 103.480 C 68.196 26.418, 67.781 25.714, 60.214 21.280 C 54.032 17.657, 40.682 16.900, 34.459 19.820 M 175.239 19.335 C 170.338 21.112, 165.392 25.476, 162.282 30.767 C 159.620 35.296, 159.485 36.162, 159.158 50.865 C 158.712 70.930, 160.683 76.618, 170.155 82.598 C 176.964 86.896, 181.444 87.190, 228.842 86.452 L 273.184 85.761 272.755 76.630 L 272.326 67.500 226.980 67.240 C 186.536 67.008, 181.438 66.802, 179.817 65.335 C 178.266 63.930, 178 62.042, 178 52.418 C 178 35.553, 173.295 37, 228.135 37 L 273 37 273 27.500 L 273 18 225.750 18.076 C 192.062 18.130, 177.564 18.492, 175.239 19.335 M 285 67.304 L 285 116.607 287.602 121.829 C 294.279 135.227, 299.244 137.411, 324 137.832 C 353.652 138.336, 352.638 138.596, 363.828 127.648 C 368.971 122.617, 373.814 117.285, 374.590 115.800 C 375.746 113.586, 376 104.530, 376 65.550 L 376 18 366 18 L 356 18 356 64.035 C 356 115.491, 356.273 113.473, 348.920 116.415 C 345.865 117.638, 341.185 118, 328.448 118 C 309.675 118, 305.604 117.042, 304.286 112.316 C 303.854 110.767, 303.500 88.912, 303.500 63.750 L 303.500 18 294.250 18 L 285 18 285 67.304 M 433 53.670 L 433 89.339 420.250 102.235 C 404.159 118.510, 405.168 118, 389.050 118 L 376 118 376 128.086 L 376 138.172 392.250 137.836 C 407.791 137.515, 408.700 137.383, 413.077 134.809 C 419.396 131.095, 445.455 103.957, 448.811 97.596 L 451.500 92.500 451.796 55.250 L 452.091 18 442.546 18 L 433 18 433 53.670 M 159 126.992 L 159 137 216.036 137 L 273.072 137 272.786 127.250 L 272.500 117.500 215.750 117.242 L 159 116.983 159 126.992" />
      </svg>

      <svg class="word-era" viewBox="0 0 420 160" aria-hidden="true">
        <path fill-rule="evenodd" fill="#f3f6ff" d="M 322.500 18.417 C 316.733 20.992, 314.320 25.199, 302.952 52.500 C 296.769 67.350, 289.259 85.350, 286.263 92.500 C 283.268 99.650, 278.126 112.025, 274.838 120 C 271.549 127.975, 268.617 135.063, 268.322 135.750 C 267.914 136.702, 270.165 137, 277.776 137 C 286.420 137, 287.839 136.764, 288.304 135.250 C 288.940 133.179, 307.223 88.786, 318.987 60.750 C 325.181 45.986, 327.706 41, 328.988 41 C 331.096 41, 334.974 49.258, 356.570 99.727 L 372.500 136.955 382.750 136.977 C 388.387 136.990, 393 136.711, 393 136.358 C 393 135.515, 376.124 97.445, 353.611 47.500 C 352.372 44.750, 349.814 38.703, 347.929 34.063 C 346.043 29.423, 343.145 24.186, 341.488 22.426 C 336.848 17.495, 328.510 15.735, 322.500 18.417 M 36 20.079 C 29.959 22.810, 25.252 27.451, 22.387 33.500 C 18.842 40.987, 18.838 64.963, 22.381 72.571 C 25.292 78.824, 30.910 83.620, 37.500 85.480 C 42.995 87.031, 80.991 87.447, 116.750 86.348 L 136 85.756 136 76.378 L 136 67 89.071 67 C 32.918 67, 37.357 68.450, 38.263 50.406 C 38.665 42.399, 38.933 41.454, 41.407 39.326 L 44.112 37 90.056 37 L 136 37 136 27.500 L 136 18 88.250 18.022 C 42.396 18.043, 40.321 18.125, 36 20.079 M 156 19.596 C 150.112 23.338, 149.500 25.306, 149.500 40.500 C 149.500 63.587, 150.828 64.825, 195 82.940 C 214.549 90.956, 238.852 102.455, 240.750 104.586 C 242.870 106.966, 243 107.973, 243 122.056 L 243 137 252 137 L 261 137 261 120.178 C 261 99.611, 260.056 96.034, 252.942 89.638 C 250.259 87.226, 245.012 83.986, 241.282 82.438 C 237.552 80.891, 229.325 77.410, 223 74.704 C 216.675 71.997, 202.500 65.982, 191.500 61.336 C 167.057 51.014, 167.608 51.482, 167.885 41.250 L 168 37 203.045 37 L 238.091 37 240.545 39.455 C 242.965 41.874, 243 42.158, 243 59.474 L 243 77.038 245.750 76.396 C 250.183 75.362, 256.160 71.720, 258.411 68.681 C 260.596 65.732, 262.029 44.299, 260.564 36.490 C 259.610 31.402, 254.238 24.224, 249.142 21.229 L 244.500 18.500 201.500 18.254 C 163.648 18.037, 158.201 18.198, 156 19.596 M 20 120.853 C 20 122.973, 19.711 127.473, 19.358 130.853 L 18.715 137 77.358 137 L 136 137 136 127 L 136 117 78 117 L 20 117 20 120.853" />
      </svg>

      ${renderDiscoverButton({
        label: cfg.primaryCta.label,
        ariaLabel: cfg.primaryCta.ariaLabel,
        href: cfg.primaryCta.href,
        external: cfg.primaryCta.external,
        compactLabel: compactPrimary,
      })}

      <a ${secondaryAttrs} class="btn-secondary-hud">${esc(cfg.secondaryCta.label)}</a>
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
