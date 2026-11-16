/**
 * Pinned Mission Control HUD Chrome:
 * Futuristic Bezel SVG, top GDG tab, bottom coordinates tab with live mouse tracking,
 * battery ON indicator and menu drawer.
 */

export function initHud({ onMotionChange, onNavigate }) {
  const hudSvg = document.getElementById('hud-svg');
  const motionToggle = document.getElementById('motion-toggle');
  const motionLabel = document.getElementById('motion-label');
  const coordsText = document.getElementById('coords-text');
  const menuToggle = document.getElementById('menu-toggle');
  const hudNav = document.getElementById('hud-nav');

  let paused = false;

  function redrawHUD() {
    if (!hudSvg) return;
    const W = window.innerWidth;
    const H = window.innerHeight;

    // Exact outer bezel coordinates matching reference screenshot
    const cx = W / 2;

    // Subtle accent along the top and bottom center tabs only
    const topTabHalfW = 121;
    const topSlant = 16;
    const T = 10;
    const topTabBottom = 27;

    const btmTabHalfW = 118;
    const btmSlant = 18;
    const B = H - 10;
    const btmTabTop = H - 28;

    const topPath = `M ${cx - topTabHalfW - topSlant},${T} L ${cx - topTabHalfW},${topTabBottom} L ${cx + topTabHalfW},${topTabBottom} L ${cx + topTabHalfW + topSlant},${T}`;
    const btmPath = `M ${cx - btmTabHalfW - btmSlant},${B} L ${cx - btmTabHalfW},${btmTabTop} L ${cx + btmTabHalfW},${btmTabTop} L ${cx + btmTabHalfW + btmSlant},${B}`;

    hudSvg.innerHTML = `
      <path d="${topPath}" stroke="rgba(180, 215, 255, 0.14)" stroke-width="1" fill="none" />
      <path d="${btmPath}" stroke="rgba(180, 215, 255, 0.14)" stroke-width="1" fill="none" />
    `;
  }

  redrawHUD();
  window.addEventListener('resize', redrawHUD, { passive: true });

  // Mouse coordinate tracker for bottom-center tab: "X.0958 // Y.0784"
  function onPointerMove(e) {
    if (!coordsText) return;
    const nx = (e.clientX / window.innerWidth).toFixed(4).replace('0.', '.');
    const ny = (e.clientY / window.innerHeight).toFixed(4).replace('0.', '.');
    coordsText.innerHTML = `X${nx} &nbsp;//&nbsp; Y${ny}`;
  }
  window.addEventListener('pointermove', onPointerMove, { passive: true });

  // Battery motion toggle
  if (motionToggle && motionLabel) {
    motionToggle.addEventListener('click', () => {
      paused = !paused;
      motionToggle.setAttribute('aria-pressed', String(paused));
      motionLabel.textContent = paused ? 'OFF' : 'ON';
      document.documentElement.classList.toggle('paused', paused);
      onMotionChange?.(paused);
    });
  }

  // Menu Drawer toggle
  if (menuToggle && hudNav) {
    menuToggle.addEventListener('click', () => {
      const isOpen = hudNav.classList.toggle('open');
      menuToggle.setAttribute('aria-expanded', String(isOpen));
    });

    hudNav.querySelectorAll('.hud-nav-link').forEach((link) => {
      link.addEventListener('click', () => {
        hudNav.classList.remove('open');
        menuToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  return {
    isPaused: () => paused,
    redraw: redrawHUD,
    setActiveRoute: () => {},
  };
}
