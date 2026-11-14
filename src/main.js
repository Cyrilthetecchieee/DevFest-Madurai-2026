/**
 * Application Bootstrap
 * - Mounts tokens, CSS, HUD, Lenis, SPA Router & Session Loader immediately (< 200KB gzip).
 * - Defers WebGL + Three.js GLB chunk load until after first paint so LCP (< 2.0s) hits immediately
 *   on the pre-rendered static poster layer.
 */
import './styles/tokens.css';
import './styles/base.css';
import './styles/hud.css';
import './styles/sections.css';

import { detectWebGL, isConstrainedData, prefersReducedMotion } from './utils/env.js';
import { createQualityGovernor } from './utils/quality.js';
import { initSessionLoader } from './motion/loader.js';
import { initHud } from './pages/hud.js';
import { createRouter } from './pages/router.js';

const quality = createQualityGovernor();

let glStage = null;
const viewRoot = document.getElementById('app-view');

const hud = initHud({
  onMotionChange(paused) {
    glStage?.setPaused(paused);
  },
  onNavigate(href) {
    router.navigate(href);
  },
});

const router = createRouter({ viewRoot, hud });
initSessionLoader();

if (prefersReducedMotion()) {
  document.documentElement.classList.add('reduced-motion');
}

// Wait until hero posters & fonts finish painting before booting background WebGL
function scheduleEnhancementsBoot() {
  const glCanvas = document.getElementById('gl-stage');
  let glBooted = false;
  let passiveGlTimer = 0;

  const bootGL = async () => {
    if (glBooted || !glCanvas || !detectWebGL()) return;
    glBooted = true;
    window.clearTimeout(passiveGlTimer);
    cleanupListeners();
    const { mountWebGLStage } = await import('./gl/stage.js');
    glStage = await mountWebGLStage({ canvas: glCanvas, quality });
    if (glStage && hud.isPaused()) {
      glStage.setPaused(true);
    }
  };

  const onInteract = () => {
    window.requestAnimationFrame(() => {
      bootGL();
    });
  };

  const events = ['pointerdown', 'pointermove', 'wheel', 'touchstart', 'scroll', 'keydown'];
  const cleanupListeners = () => {
    for (const ev of events) window.removeEventListener(ev, onInteract, { passive: true });
  };
  for (const ev of events) window.addEventListener(ev, onInteract, { passive: true, once: true });

  const afterLcpPaint = async () => {
    const posterPromises = ['lcp-poster', 'figure-poster'].map((id) => {
      const img = document.getElementById(id);
      if (!img) return Promise.resolve();
      if (img.complete) return img.decode?.().catch(() => {}) || Promise.resolve();
      return new Promise((res) => {
        img.addEventListener('load', res, { once: true });
        img.addEventListener('error', res, { once: true });
      });
    });
    await Promise.race([
      Promise.all([...posterPromises, document.fonts?.ready].filter(Boolean)),
      new Promise((r) => window.setTimeout(r, 900)),
    ]);

    window.requestAnimationFrame(() => {
      const shouldDeferHeavy =
        quality.getTier() === 'LOW' || isConstrainedData() || prefersReducedMotion();
      if (shouldDeferHeavy) {
        passiveGlTimer = window.setTimeout(bootGL, 3800);
      } else if ('requestIdleCallback' in window) {
        window.requestIdleCallback(() => bootGL(), { timeout: 1200 });
      } else {
        window.setTimeout(() => bootGL(), 300);
      }
    });
  };

  if (document.readyState === 'complete') {
    afterLcpPaint();
  } else {
    window.addEventListener('load', afterLcpPaint, { once: true });
  }
}

scheduleEnhancementsBoot();
