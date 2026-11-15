/** Pinned Mission Control HUD Chrome: Bezel SVG, Sticky Dock Handoff, Menu Drawer, Motion Toggle & Coordinates. */
import { stageBus } from '../motion/stageBus.js';

const HOME_WAYPOINTS = [
  '01 / ORBIT',
  '02 / ABOUT',
  '03 / VENUE',
  '04 / SPEAKERS',
  '05 / AGENDA',
  '06 / TICKETS',
  '07 / SPONSORS',
  '08 / MEMORIES',
  '09 / SIGNAL END',
];

const ROUTE_LABELS = {
  speakers: 'G_010 // SPEAKERS',
  memories: 'G_012 // MEMORIES',
};

export function initHud({ onMotionChange, onNavigate }) {
  const hudSvg = document.getElementById('hud-svg');
  const motionToggle = document.getElementById('motion-toggle');
  const motionLabel = document.getElementById('motion-label');
  const coordsText = document.getElementById('coords-text');
  const menuToggle = document.getElementById('menu-toggle');
  const hudNav = document.getElementById('hud-nav');
  const waypointEl = document.getElementById('hud-waypoint');
  const cmdOpenBtn = document.getElementById('cmd-open-btn');

  let paused = false;
  let lastScrolled = false;
  let lastWaypointText = '';
  let activeRouteKey = 'home';

  function redrawHUD() {
    if (!hudSvg) return;
    const W = window.innerWidth;
    const H = window.innerHeight;
    const isMobile = W <= 820;
    const h = isMobile ? W / 860 : Math.min(W / 2048, H / 1360);
    const cx = W / 2;
    const k = 7 * h;

    const L = 20 * h;
    const T = 20 * h;
    const R = W - 20 * h;
    const B = H - 30 * h;
    const bc = H * 577 / 1360;

    let p = `M 0,0 H ${W} V ${H} H 0 Z `;
    p += `M ${L},${T + 30 * h} Q ${L},${T} ${L + 30 * h},${T} `;
    p += `L ${cx - 220 * h},${T} `;
    p += `Q ${cx - 220 * h + 0.7 * k},${T} ${cx - 220 * h + 1.2 * k},${T + 0.7 * k} `;
    p += `L ${cx - 188 * h - 0.7 * k},${T + 30 * h - 0.7 * k} `;
    p += `Q ${cx - 188 * h},${T + 30 * h} ${cx - 188 * h + k},${T + 30 * h} `;
    p += `L ${cx + 190 * h - k},${T + 30 * h} `;
    p += `Q ${cx + 190 * h},${T + 30 * h} ${cx + 190 * h + 0.7 * k},${T + 30 * h - 0.7 * k} `;
    p += `L ${cx + 222 * h - 1.2 * k},${T + 0.7 * k} `;
    p += `Q ${cx + 222 * h},${T} ${cx + 222 * h + k},${T} `;
    p += `L ${R - 30 * h},${T} Q ${R},${T} ${R},${T + 30 * h} `;

    if (!isMobile) {
      p += `L ${R},${bc - 247 * h - 52 * h} `;
      p += `L ${R - 26 * h},${bc - 247 * h} `;
      p += `L ${R - 26 * h},${bc + 247 * h} `;
      p += `L ${R},${bc + 247 * h + 52 * h} `;
    }
    p += `L ${R},${B - 30 * h} Q ${R},${B} ${R - 30 * h},${B} `;
    p += `L ${cx + 232 * h},${B} `;
    p += `Q ${cx + 232 * h - 0.7 * k},${B} ${cx + 232 * h - 1.2 * k},${B - 0.7 * k} `;
    p += `L ${cx + 190 * h + 0.7 * k},${B - 37 * h + 0.7 * k} `;
    p += `Q ${cx + 190 * h},${B - 37 * h} ${cx + 190 * h - k},${B - 37 * h} `;
    p += `L ${cx - 188 * h + k},${B - 37 * h} `;
    p += `Q ${cx - 188 * h},${B - 37 * h} ${cx - 188 * h - 0.7 * k},${B - 37 * h + 0.7 * k} `;
    p += `L ${cx - 230 * h + 1.2 * k},${B - 0.7 * k} `;
    p += `Q ${cx - 230 * h},${B} ${cx - 230 * h - k},${B} `;
    p += `L ${L + 30 * h},${B} Q ${L},${B} ${L},${B - 30 * h} `;

    if (!isMobile) {
      p += `L ${L},${bc + 247 * h + 52 * h} `;
      p += `L ${L + 26 * h},${bc + 247 * h} `;
      p += `L ${L + 26 * h},${bc - 247 * h} `;
      p += `L ${L},${bc - 247 * h - 52 * h} `;
    }
    p += `L ${L},${T + 30 * h} Z`;

    const bStroke = Math.max(1, 2 * h);
    const bLen = 14 * h;
    const bOff = 5 * h;
    const brackets = `
      <path d="M ${bOff},${bOff + bLen} V ${bOff} H ${bOff + bLen}" stroke="#cfd6e6" stroke-width="${bStroke}" fill="none" />
      <path d="M ${W - bOff - bLen},${bOff} H ${W - bOff} V ${bOff + bLen}" stroke="#cfd6e6" stroke-width="${bStroke}" fill="none" />
      <path d="M ${bOff},${H - bOff - bLen} V ${H - bOff} H ${bOff + bLen}" stroke="#cfd6e6" stroke-width="${bStroke}" fill="none" />
      <path d="M ${W - bOff - bLen},${H - bOff} H ${W - bOff} V ${H - bOff - bLen}" stroke="#cfd6e6" stroke-width="${bStroke}" fill="none" />
    `;

    let rails = '';
    if (!isMobile) {
      const rStroke = Math.max(0.8, 1.2 * h);
      const rDot = 3 * h;
      const y0 = bc - 180 * h;
      const y1 = bc + 208 * h;
      rails = `
        <g stroke="#cfd6e6" stroke-width="${rStroke}" opacity="0.55">
          <line x1="${20 * h}" y1="${y0}" x2="${20 * h}" y2="${y1}" />
          <line x1="${W - 20 * h}" y1="${y0}" x2="${W - 20 * h}" y2="${y1}" />
        </g>
        <circle cx="${20 * h}" cy="${y0}" r="${rDot}" fill="#7f8aa6" />
        <circle cx="${20 * h}" cy="${y1}" r="${rDot}" fill="#7f8aa6" />
        <circle cx="${W - 20 * h}" cy="${y0}" r="${rDot}" fill="#7f8aa6" />
        <circle cx="${W - 20 * h}" cy="${y1}" r="${rDot}" fill="#7f8aa6" />
      `;
    }

    hudSvg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    hudSvg.innerHTML = `
      <path d="${p}" fill="#030409" fill-rule="evenodd" />
      ${brackets}
      ${rails}
    `;
  }

  function closeMenu() {
    if (!hudNav || !menuToggle) return;
    hudNav.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.textContent = 'MENU';
  }

  menuToggle?.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = hudNav.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    menuToggle.textContent = isOpen ? 'CLOSE' : 'MENU';
  });

  hudNav?.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', (e) => {
      closeMenu();
      const href = link.getAttribute('href');
      if (href && typeof onNavigate === 'function') {
        e.preventDefault();
        onNavigate(href);
      }
    });
  });

  document.addEventListener('click', (e) => {
    if (hudNav?.classList.contains('open') && !hudNav.contains(e.target) && e.target !== menuToggle) {
      closeMenu();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && hudNav?.classList.contains('open')) {
      closeMenu();
      menuToggle?.focus();
    }
  });

  motionToggle?.addEventListener('click', () => {
    paused = !paused;
    document.documentElement.classList.toggle('paused', paused);
    if (motionLabel) motionLabel.textContent = paused ? 'OFF' : 'ON';
    motionToggle.setAttribute('aria-pressed', paused ? 'true' : 'false');
    motionToggle.setAttribute('aria-label', paused ? 'Motion off' : 'Motion on');
    onMotionChange?.(paused);
  });

  function pad4(n) {
    return String(Math.round(Math.abs(n)) % 10000).padStart(4, '0');
  }

  window.addEventListener('pointermove', (e) => {
    if (!coordsText) return;
    coordsText.textContent = `X.${pad4(e.clientX)}  //  Y.${pad4(e.clientY)}`;
  }, { passive: true });

  window.addEventListener('resize', redrawHUD, { passive: true });
  redrawHUD();

  function syncDockState(scrollProgress) {
    const y = window.scrollY || 0;
    const isScrolled = scrollProgress > 0.035 || y > Math.max(140, window.innerHeight * 0.22);
    if (isScrolled !== lastScrolled) {
      lastScrolled = isScrolled;
      document.documentElement.classList.toggle('is-scrolled', isScrolled);
    }

    let nextWaypoint = ROUTE_LABELS[activeRouteKey];
    if (!nextWaypoint) {
      const idx = Math.min(
        HOME_WAYPOINTS.length - 1,
        Math.max(0, Math.round(scrollProgress * (HOME_WAYPOINTS.length - 1))),
      );
      nextWaypoint = HOME_WAYPOINTS[idx];
    }
    if (waypointEl && nextWaypoint !== lastWaypointText) {
      lastWaypointText = nextWaypoint;
      waypointEl.textContent = nextWaypoint;
    }
  }

  const unsubBus = stageBus.on((ev, state) => {
    if (ev === 'scroll' || ev === 'route') {
      syncDockState(state.scrollProgress || 0);
    }
  });

  window.addEventListener('scroll', () => {
    const docMax = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    syncDockState((window.scrollY || 0) / docMax);
  }, { passive: true });

  cmdOpenBtn?.addEventListener('click', () => {
    stageBus.emit('command-palette:toggle', { source: 'hud' });
  });

  function setActiveRoute(routeKey) {
    activeRouteKey = routeKey || 'home';
    stageBus.routeKey = activeRouteKey;
    stageBus.emit('route', { routeKey: activeRouteKey });
    syncDockState(stageBus.scrollProgress || 0);
    if (!hudNav) return;
    hudNav.querySelectorAll('.hud-nav-link').forEach((el) => {
      const targetRoute = el.dataset.route;
      el.classList.toggle('active', targetRoute === routeKey);
    });
  }

  return { setActiveRoute, closeMenu, isPaused: () => paused, destroy: () => unsubBus() };
}
