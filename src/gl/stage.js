/**
 * Persistent Single WebGL Stage
 * - Owns the ONE <canvas id="gl-stage"> living OUTSIDE #app-view View Transitions root.
 * - Combines Sky + Marquee Plane + 3D Figure inside a single WebGL2/WebGL1 context.
 * - Responds to Quality Governor step-down/recovery, tab visibility, context loss/restored, and pause.
 */
import * as THREE from 'three';
import { createSkyPass } from './skyPass.js';
import { createMarqueePlane } from './marqueePlane.js';
import { createFigureRig } from './figureRig.js';
import { createPostFxPass } from './postFx.js';
import { stageBus } from '../motion/stageBus.js';

const yieldTask = () => new Promise((resolve) => window.setTimeout(resolve, 0));

export async function mountWebGLStage({ canvas, quality }) {
  const initialConfig = quality.getConfig();
  const initialTier = quality.getTier();

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: false,
      antialias: initialTier !== 'LOW',
      powerPreference: 'high-performance',
    });
  } catch (err) {
    console.warn('[stage] WebGL init failed; keeping static poster fallback:', err);
    return null;
  }

  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.82;
  const computeEffectiveScale = (cfg) =>
    Number((Math.min(window.devicePixelRatio || 1, cfg.maxDpr) * (cfg.renderScale ?? 1)).toFixed(2));
  renderer.setPixelRatio(computeEffectiveScale(initialConfig));

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(0, 1280, 0, -720, -6000, 6000);
  camera.position.set(0, 0, 2000);

  const isSmallScreen = window.innerWidth <= 820;
  const plateUrl = isSmallScreen ? '/assets/hero/sky-plate-960.webp' : '/assets/hero/sky-plate-1920.webp';

  await yieldTask();
  const skyPass = createSkyPass({
    scene,
    renderer,
    plateImgUrl: plateUrl,
    videoUrl: '/assets/hero/sky-loop.mp4',
    tier: initialTier,
  });

  await yieldTask();
  const marqueePlane = createMarqueePlane({ scene, renderer });

  const postFx = createPostFxPass({ renderer, tier: initialTier });

  await yieldTask();
  let figureVisibleReady = false;
  const figureRig = createFigureRig({
    scene,
    renderer,
    camera,
    glbUrl: '/assets/models/hero-figure.glb',
    lowGlbUrl: '/assets/models/hero-figure-low.glb',
    tier: initialTier,
    onLoaded() {
      figureVisibleReady = true;
      // Wait two composited animation frames before cross-fading over the static poster
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          canvas.classList.add('ready');
          document.documentElement.classList.add('gl-active');
        });
      });
    },
  });

  // Expose live debug telemetry for Playwright / QA verification
  window.__DEVFEST_STAGE_DEBUG__ = {
    getStats: () => ({
      ...quality.getStats(),
      effectiveDpr: Number(renderer.getPixelRatio().toFixed(2)),
      paused: state.paused,
      hidden: document.hidden,
      contextLost: state.contextLost,
      figureLoaded: figureVisibleReady,
      marqueeReady: marqueePlane.isReady(),
      canvasSize: { w: canvas.width, h: canvas.height },
      glContextsCount: document.querySelectorAll('canvas').length,
      drawCalls: renderer.info.render.calls,
      triangles: renderer.info.render.triangles,
    }),
    forceTier: import.meta.env.DEV ? (t) => quality.forceTier(t) : undefined,
  };

  const state = {
    paused: false,
    contextLost: false,
    time: 0,
    lastFrame: performance.now(),
    rafId: 0,
    paceTimerId: 0,
    W: window.innerWidth,
    H: window.innerHeight,
    pointer: {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
      prevX: window.innerWidth / 2,
      prevY: window.innerHeight / 2,
      amt: 0,
      moved: false,
      inside: true,
    },
  };

  function resize() {
    const W = window.innerWidth || 320;
    const H = window.innerHeight || 540;
    state.W = W;
    state.H = H;

    const cfg = quality.getConfig();
    renderer.setPixelRatio(computeEffectiveScale(cfg));
    renderer.setSize(W, H, false);

    camera.left = 0;
    camera.right = W;
    camera.top = 0;
    camera.bottom = -H;
    camera.updateProjectionMatrix();

    skyPass.setSize(W, H);
    marqueePlane.setSize(W, H);
    figureRig.setSize(W, H);
    postFx.setSize(W, H, renderer.getPixelRatio());
  }

  resize();

  const unsubscribeQuality = quality.onChange(({ tier, config }) => {
    renderer.setPixelRatio(computeEffectiveScale(config));
    renderer.setSize(state.W, state.H, false);
    skyPass.setTier(tier);
    postFx.setTier(tier);
    postFx.setSize(state.W, state.H, renderer.getPixelRatio());
  });

  const onPointerMove = (e) => {
    const dx = e.clientX - state.pointer.x;
    const dy = e.clientY - state.pointer.y;
    const dist = Math.hypot(dx, dy);
    state.pointer.x = e.clientX;
    state.pointer.y = e.clientY;
    state.pointer.moved = true;
    state.pointer.inside = true;
    state.pointer.amt = Math.min(1, state.pointer.amt + dist / 140);
  };

  const onPointerLeave = () => {
    state.pointer.inside = false;
  };

  const onVisibilityChange = () => {
    if (document.hidden) {
      skyPass.setPaused(true);
    } else {
      state.lastFrame = performance.now();
      skyPass.setPaused(state.paused);
    }
  };

  const onContextLost = (e) => {
    e.preventDefault();
    state.contextLost = true;
    canvas.classList.remove('ready');
    document.documentElement.classList.remove('gl-active');
  };

  const onContextRestored = () => {
    state.contextLost = false;
    state.lastFrame = performance.now();
    if (figureVisibleReady) {
      canvas.classList.add('ready');
      document.documentElement.classList.add('gl-active');
    }
  };

  window.addEventListener('resize', resize, { passive: true });
  window.addEventListener('pointermove', onPointerMove, { passive: true });
  window.addEventListener('pointerleave', onPointerLeave, { passive: true });
  document.addEventListener('visibilitychange', onVisibilityChange);
  canvas.addEventListener('webglcontextlost', onContextLost);
  canvas.addEventListener('webglcontextrestored', onContextRestored);

  function scheduleNextFrame(renderCostMs) {
    if (renderCostMs > 25) {
      // Yield cleanly when software/constrained GPU cannot sustain 40fps so browser input & UI stay responsive
      const yieldMs = Math.min(110, Math.max(48, Math.round(renderCostMs * 0.65)));
      state.paceTimerId = window.setTimeout(() => {
        state.rafId = window.requestAnimationFrame(frame);
      }, yieldMs);
    } else {
      state.rafId = window.requestAnimationFrame(frame);
    }
  }

  function frame(now) {
    if (document.hidden || state.contextLost) {
      state.rafId = window.requestAnimationFrame(frame);
      return;
    }

    const rawDtMs = now - state.lastFrame;
    state.lastFrame = now;
    const dt = Math.min(rawDtMs / 1000, 0.1);

    if (!state.paused) {
      state.time += dt;
    }

    const cfg = quality.getConfig();
    const t0 = performance.now();
    skyPass.update({
      time: state.time,
      pointer: state.pointer,
      W: state.W,
      H: state.H,
      paused: state.paused,
      trailEnabled: cfg.trailEnabled,
      scrollProgress: stageBus.scrollProgress,
      auroraBoost: stageBus.warpBoost,
    });
    marqueePlane.update({ dt, paused: state.paused });
    figureRig.update({
      dt,
      time: state.time,
      pointer: state.pointer,
      W: state.W,
      H: state.H,
      paused: state.paused,
      scrollProgress: stageBus.scrollProgress,
      pointerSpeed: stageBus.pointerSpeed,
    });

    postFx.render({
      scene,
      camera,
      time: state.time,
      velocity: stageBus.scrollVelocity,
      warp: stageBus.warpBoost,
      iris: stageBus.irisProgress,
    });
    const renderCostMs = performance.now() - t0;

    state.pointer.prevX = state.pointer.x;
    state.pointer.prevY = state.pointer.y;
    state.pointer.amt *= 0.82;

    if (!state.paused) {
      quality.recordFrame(Math.max(rawDtMs, renderCostMs), now);
    }

    scheduleNextFrame(renderCostMs);
  }

  state.rafId = window.requestAnimationFrame(frame);

  return {
    setPaused(nextPaused) {
      state.paused = Boolean(nextPaused);
      skyPass.setPaused(state.paused);
    },
    destroy() {
      window.clearTimeout(state.paceTimerId);
      window.cancelAnimationFrame(state.rafId);
      unsubscribeQuality();
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerleave', onPointerLeave);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      canvas.removeEventListener('webglcontextlost', onContextLost);
      canvas.removeEventListener('webglcontextrestored', onContextRestored);
      skyPass.dispose();
      marqueePlane.dispose();
      figureRig.dispose();
      postFx.dispose();
      renderer.dispose();
    },
  };
}
