/** Safe HTML serialization, responsive picture rendering, and shared hero stage markup. */

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
      <span class="${labelClasses}">${esc(label)}</span>
    </a>
  `;
}

export function renderHeroStage(routeKey, headingText) {
  const topId = routeKey === 'home' ? 'home' : 'top';

  return `
    <div id="${topId}"></div>
    <section id="stage-ui" class="hero-stage" aria-label="${esc(headingText)}">
      <h1 class="sr-only">${esc(headingText)}</h1>

      <!-- Reconstructed Multi-Layer Scene (Layers 2 through 7 over Layer 1 Background) -->
      <div class="hero-layers" aria-hidden="true">
        <!-- Layer 2: Nebula and Cloud Effects -->
        <div class="hero-layer-wrap hero-nebula-wrap" id="hero-nebula">
          <img class="hero-layer-img" src="/assets/layers/layer2_nebula.webp" alt="" width="1720" height="864" />
        </div>

        <!-- Layer 3: Meenakshi Amman Temple Architecture -->
        <div class="hero-layer-wrap hero-temple-wrap" id="hero-temple">
          <img class="hero-layer-img" src="/assets/layers/layer3_temple.webp" alt="" width="1720" height="864" />
        </div>

        <!-- Layer 4: Concentric Water Projector Base -->
        <div class="hero-layer-wrap hero-water-base-wrap" id="hero-water-base">
          <img class="hero-layer-img hero-water-base-img" src="/assets/layers/layer4_water_base.webp" alt="" width="1720" height="864" />
        </div>

        <!-- Layer 5: Circular Energy Portal Rings -->
        <div class="hero-layer-wrap hero-portal-wrap" id="hero-portal">
          <img class="hero-layer-img hero-portal-img" src="/assets/layers/layer5_portal.webp" alt="" width="1720" height="864" />
        </div>

        <!-- Layer 4: Central Translucent Glass Sphere & Developer Network -->
        <div class="hero-layer-wrap hero-character-wrap" id="hero-character">
          <img class="hero-layer-img hero-character-img" src="/assets/layers/layer4_character.webp" alt="" width="1720" height="864" />
        </div>

        <!-- Layer 4: Orbiting Tech Badges -->
        <div class="hero-layer-wrap hero-badges-wrap" id="hero-badges">
          <img class="hero-layer-img hero-badges-img" src="/assets/layers/layer4_tech_badges.webp" alt="" width="1720" height="864" />
        </div>

        <!-- Layer 6: Giant 3D Developer Brackets </> -->
        <div class="hero-layer-wrap hero-symbol-wrap" id="hero-symbol">
          <img class="hero-layer-img hero-symbol-img" src="/assets/layers/layer6_google_symbol.webp" alt="" width="1720" height="864" />
        </div>

        <!-- Layer 7: Foreground Flowing Energy Waves -->
        <div class="hero-layer-wrap hero-waves-wrap" id="hero-waves">
          <img class="hero-layer-img hero-waves-img" src="/assets/layers/layer7_waves.webp" alt="" width="1720" height="864" />
        </div>

        <!-- Real-time Sparkle / Energy Particle Canvas -->
        <canvas id="hero-particles" class="hero-particles-canvas"></canvas>
      </div>

      <!-- Layer 8 & 10: Left Content, Typography & Interactive Buttons -->
      <div class="hero-left-content">
        <!-- Google Developer Groups Logo & Madurai -->
        <div class="gdg-brand-badge">
          <img class="gdg-brackets-logo" src="/assets/layers/gdg_icon.webp" alt="" width="52" height="29" />
          <div class="gdg-brand-text">
            <span class="gdg-title">Google Developer Groups</span>
            <span class="gdg-city">Madurai</span>
          </div>
        </div>

        <!-- P R E S E N T S -->
        <div class="hero-presents">P R E S E N T S</div>

        <!-- DevFest with Yellow Sparkle ✦ -->
        <div class="hero-devfest-row">
          <span class="sr-only">DevFest</span>
          <img class="hero-devfest-img" src="/assets/layers/devfest_wordmark.webp" alt="DevFest" width="532" height="92" />
        </div>

        <!-- MADURAI 2026 + Temple Skyline Silhouette -->
        <div class="hero-madurai-row">
          <span class="sr-only">MADURAI 2026</span>
          <img class="hero-madurai-img" src="/assets/layers/madurai_skyline.webp" alt="MADURAI 2026" width="616" height="66" />
        </div>

        <!-- Tagline: | WHERE CURIOSITY MEETS CREATION. -->
        <div class="hero-tagline">
          <span class="tagline-bar" aria-hidden="true"></span>
          <span class="tagline-text">WHERE CURIOSITY MEETS CREATION.</span>
        </div>

        <!-- Body Paragraph Description -->
        <p class="hero-description">
          Madurai's biggest tech festival by Google Developer<br>
          Groups. A community of builders, designers, and<br>
          innovators coming together to learn, build and create<br>
          what's next.
        </p>

        <!-- Event Details Row (Date & Location) -->
        <div class="hero-details-row">
          <div class="detail-badge detail-date">
            <svg class="detail-icon" viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="#f0b429" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <rect x="3" y="4" width="18" height="18" rx="2.5" ry="2.5"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="9.5" x2="21" y2="9.5"/>
              <rect x="7" y="13" width="2" height="2" fill="#f0b429" stroke="none"/>
              <rect x="11" y="13" width="2" height="2" fill="#f0b429" stroke="none"/>
              <rect x="15" y="13" width="2" height="2" fill="#f0b429" stroke="none"/>
              <rect x="7" y="17" width="2" height="2" fill="#f0b429" stroke="none"/>
              <rect x="11" y="17" width="2" height="2" fill="#f0b429" stroke="none"/>
              <rect x="15" y="17" width="2" height="2" fill="#f0b429" stroke="none"/>
            </svg>
            <span class="detail-text">12 DEC 2026</span>
          </div>

          <div class="detail-divider" aria-hidden="true"></div>

          <div class="detail-badge detail-location">
            <svg class="detail-icon" viewBox="0 0 24 24" width="21" height="21" fill="#f0b429" aria-hidden="true">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
            <div class="detail-location-text">
              <span class="location-city">MADURAI</span>
              <span class="location-country">TAMIL NADU, INDIA</span>
            </div>
          </div>
        </div>

        <!-- Layer 10: Interactive Action Buttons (Chamfered HUD Geometry) -->
        <div class="hero-actions-row">
          <a href="https://gdg.community.dev/events/details/google-gdg-madurai-presents-devfest-2026/" target="_blank" rel="noopener noreferrer" class="hero-btn-primary">
            <svg class="btn-primary-frame" viewBox="0 0 214 54" preserveAspectRatio="none" aria-hidden="true">
              <!-- Outer chamfered gold frame -->
              <polygon points="8,0 206,0 213,7 213,47 206,54 8,54 0,47 0,7" fill="none" stroke="rgba(244, 190, 55, 0.72)" stroke-width="1.2" />
              <!-- Inner solid gold chamfered fill -->
              <polygon points="9,1 205,1 212,8 212,46 205,53 9,53 1,46 1,8" fill="#f4be37" />
            </svg>
            <span class="btn-primary-label">REGISTER NOW</span>
            <svg class="btn-arrow" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <line x1="4" y1="12" x2="19" y2="12"></line>
              <polyline points="13 6 19 12 13 18"></polyline>
            </svg>
          </a>

          <a href="#agenda" class="hero-btn-secondary">
            <svg class="btn-secondary-frame" viewBox="0 0 175 48" preserveAspectRatio="none" aria-hidden="true">
              <polygon points="8,1 167,1 174,8 174,40 167,47 8,47 1,40 1,8" fill="rgba(10, 18, 42, 0.55)" stroke="rgba(148, 175, 215, 0.48)" stroke-width="1.2" />
            </svg>
            <span class="btn-secondary-label">EXPLORE AGENDA</span>
          </a>
        </div>
      </div>

      <!-- Right Content Column (BUILD. LEARN. CONNECT. CREATE.) -->
      <div class="hero-right-content">
        <div class="crosses" aria-hidden="true">+ + +</div>
        <div class="pillar-word">BUILD.</div>
        <div class="pillar-word">LEARN.</div>
        <div class="pillar-word">CONNECT.</div>
        <div class="pillar-word">CREATE.</div>
        <div class="pillar-accent-line" aria-hidden="true"></div>
      </div>
    </section>
  `;
}
