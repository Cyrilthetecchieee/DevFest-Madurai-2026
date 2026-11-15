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
      speed: 0,
      moved: false,
      inside: true,
    },
    scrollY: window.scrollY || 0,
    prevScrollY: window.scrollY || 0,
    scrollVelocity: 0,
    zoneEls: [],
  };

  const ZONE_PRESETS = {
    hero: { yaw: 0, pitch: 0.02, scale: 1.0, z: 0, haloGain: 1.0, warmth: 0.0, silhouette: 0.0 },
    about: { yaw: -0.52, pitch: 0.06, scale: 0.85, z: -100, haloGain: 1.0, warmth: 0.05, silhouette: 0.0 },
    venue: { yaw: 0.72, pitch: 0.04, scale: 0.88, z: -80, haloGain: 1.12, warmth: 0.45, silhouette: 0.0 },
    speakers: { yaw: -0.44, pitch: 0.05, scale: 0.8, z: -120, haloGain: 0.92, warmth: 0.1, silhouette: 0.0 },
    agenda: { yaw: 0.28, pitch: 0.03, scale: 0.86, z: -90, haloGain: 1.42, warmth: 0.0, silhouette: 0.0 },
    tickets: { yaw: -0.34, pitch: 0.02, scale: 0.94, z: -50, haloGain: 1.24, warmth: 0.12, silhouette: 0.0 },
    sponsors: { yaw: 0.48, pitch: 0.05, scale: 0.8, z: -120, haloGain: 0.95, warmth: 0.08, silhouette: 0.0 },
    memories: { yaw: -0.32, pitch: 0.04, scale: 0.74, z: -150, haloGain: 0.98, warmth: 0.15, silhouette: 0.0 },
    footer: { yaw: 0.04, pitch: -0.02, scale: 1.06, z: 20, haloGain: 1.48, warmth: 0.18, silhouette: 0.92 },
  };

  function collectZoneElements() {
    state.zoneEls = Array.from(document.querySelectorAll('[data-creature-zone]'));
  }
  collectZoneElements();
  const onRouteChanged = () => collectZoneElements();
  window.addEventListener('devfest:route-changed', onRouteChanged);

  function smoothstep(a, b, x) {
    const t = Math.max(0, Math.min(1, (x - a) / Math.max(1e-4, b - a)));
    return t * t * (3 - 2 * t);
  }

  function lerpPose(a, b, t) {
    return {
      screenX: a.screenX + (b.screenX - a.screenX) * t,
      screenY: a.screenY + (b.screenY - a.screenY) * t,
      yaw: a.yaw + (b.yaw - a.yaw) * t,
      pitch: a.pitch + (b.pitch - a.pitch) * t,
      scale: a.scale + (b.scale - a.scale) * t,
      z: a.z + (b.z - a.z) * t,
      haloGain: a.haloGain + (b.haloGain - a.haloGain) * t,
      warmth: a.warmth + (b.warmth - a.warmth) * t,
      silhouette: a.silhouette + (b.silhouette - a.silhouette) * t,
    };
  }

  function computeCompanionPose(W, H, time) {
    const isMobile = W <= 960;
    const isSmall = W <= 820;
    const topPx = isSmall ? Math.max(200, Math.min(260, H * 0.3)) : 0;
    const boxH = H - topPx;
    const coverUnit = Math.max(W / 2048, boxH / 1360);
    const boxLeft = W / 2 - 1024 * coverUnit;
    const boxTop = topPx + boxH / 2 - 680 * coverUnit;

    const heroPose = {
      ...ZONE_PRESETS.hero,
      screenX: boxLeft + 982 * coverUnit,
      screenY: boxTop + 792 * coverUnit,
      anchorY: H * 0.42 - state.scrollY,
    };

    if (!state.zoneEls.length) {
      return heroPose;
    }

    const focusY = H * 0.46;
    const points = [heroPose];

    for (const el of state.zoneEls) {
      const key = el.dataset.creatureZone || 'about';
      const base = ZONE_PRESETS[key] || ZONE_PRESETS.about;
      const r = el.getBoundingClientRect();
      if (r.width === 0 && r.height === 0) continue;
      const secRect = (el.closest('section') || el).getBoundingClientRect();

      const isFooter = key === 'footer';
      const screenX = isMobile || isFooter
        ? W * 0.5
        : Math.max(W * 0.17, Math.min(W * 0.83, r.left + r.width * 0.5));

      const screenY = isMobile
        ? Math.max(H * 0.42, Math.min(H * 0.54, heroPose.screenY * 0.94))
        : (isFooter ? H * 0.6 : Math.max(H * 0.50, Math.min(H * 0.68, r.top + Math.min(r.height * 0.54, H * 0.4))));

      points.push({
        ...base,
        yaw: isMobile ? base.yaw * 0.35 : base.yaw,
        screenX,
        screenY,
        anchorY: isFooter
          ? secRect.top + secRect.height * 0.36
          : secRect.top + Math.min(secRect.height * 0.28, H * 0.26),
      });
    }

    if (points.length === 1 || focusY <= points[0].anchorY) {
      return heroPose;
    }

    for (let i = 0; i < points.length - 1; i++) {
      const a = points[i];
      const b = points[i + 1];
      if (focusY <= b.anchorY) {
        const w = smoothstep(a.anchorY, b.anchorY, focusY);
        const mixed = lerpPose(a, b, w);
        return {
          ...mixed,
          yaw: mixed.yaw + (mixed.silhouette > 0.4 ? Math.sin(time * 0.65) * 0.08 : 0),
        };
      }
    }

    const last = points[points.length - 1];
    return {
      ...last,
      yaw: last.yaw + Math.sin(time * 0.65) * 0.08,
    };
  }

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
    state.pointer.speed = Math.min(1.2, state.pointer.speed + dist / 90);
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
    const docScrollMax = Math.max(1, document.documentElement.scrollHeight - state.H);
    state.scrollY = window.scrollY || window.pageYOffset || 0;
    const scrollProgress = Math.max(0, Math.min(1, state.scrollY / docScrollMax));
    const scrollDelta = state.scrollY - state.prevScrollY;
    state.prevScrollY = state.scrollY;
    state.scrollVelocity = state.scrollVelocity * 0.85 + Math.max(-2.5, Math.min(2.5, scrollDelta / 48)) * 0.15;

    const heroFade = Math.max(0, 1 - state.scrollY / Math.max(state.H * 0.45, 220));
    const companionPose = computeCompanionPose(state.W, state.H, state.time);
    const creatureUv = {
      x: Math.max(0.1, Math.min(0.9, (companionPose.screenX || state.W * 0.5) / Math.max(1, state.W))),
      y: Math.max(0.15, Math.min(0.85, 1 - (companionPose.screenY || state.H * 0.5) / Math.max(1, state.H))),
    };

    const t0 = performance.now();
    skyPass.update({
      time: state.time,
      pointer: state.pointer,
      W: state.W,
      H: state.H,
      paused: state.paused,
      trailEnabled: cfg.trailEnabled,
      scrollProgress,
      auroraBoost: Math.max(0, (companionPose.haloGain || 1) - 1) * 0.45,
      creatureUv,
      warmth: companionPose.warmth || 0,
    });
    marqueePlane.update({ dt, paused: state.paused, heroFade });
    figureRig.update({
      dt,
      time: state.time,
      pointer: state.pointer,
      W: state.W,
      H: state.H,
      paused: state.paused,
      pointerSpeed: state.pointer.speed,
      pose: companionPose,
    });

    postFx.render({
      scene,
      camera,
      time: state.time,
      velocity: state.scrollVelocity,
    });
    const renderCostMs = performance.now() - t0;

    state.pointer.prevX = state.pointer.x;
    state.pointer.prevY = state.pointer.y;
    state.pointer.amt *= 0.82;
    state.pointer.speed *= 0.86;

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
      window.removeEventListener('devfest:route-changed', onRouteChanged);
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
