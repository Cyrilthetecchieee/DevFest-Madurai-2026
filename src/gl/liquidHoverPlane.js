/**
 * Persistent-Context Liquid Hover Distortion Plane (S15)
 * Renders in the single Ortho Hero/Stage scene when quality tier === HIGH on fine-pointer desktops.
 * Syncs exact screen coordinates directly from hovered DOM rect each frame (zero scroll jitter).
 */
import * as THREE from 'three';
import { stageBus } from '../motion/stageBus.js';
import { prefersReducedMotion } from '../utils/env.js';

const MAX_CACHED_TEXTURES = 6;

const VERT = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const FRAG = `
precision mediump float;
uniform sampler2D uTex;
uniform float uHover;
uniform float uTime;
uniform vec2 uPointer;
uniform vec2 uPlaneAspect;
uniform vec2 uTexAspect;
varying vec2 vUv;

vec2 coverUv(vec2 uv, vec2 planeRes, vec2 texRes) {
  float s = planeRes.x / max(1.0, planeRes.y);
  float i = texRes.x / max(1.0, texRes.y);
  vec2 scale = s > i ? vec2(1.0, i / s) : vec2(s / i, 1.0);
  return (uv - 0.5) * scale + 0.5;
}

void main() {
  vec2 uv = coverUv(vUv, uPlaneAspect, uTexAspect);
  float dist = length(vUv - uPointer);
  float ripple = sin(dist * 18.0 - uTime * 5.2) * exp(-dist * 3.8);
  vec2 dir = normalize(vUv - uPointer + vec2(0.0001));
  vec2 flow = dir * ripple * 0.022 * uHover;

  float r = texture2D(uTex, clamp(uv + flow * 1.35, 0.002, 0.998)).r;
  float g = texture2D(uTex, clamp(uv + flow, 0.002, 0.998)).g;
  float b = texture2D(uTex, clamp(uv + flow * 0.65, 0.002, 0.998)).b;

  // Subtle cyan edge rim on liquid disturbance
  float rim = abs(ripple) * 0.14 * uHover;
  vec3 col = vec3(r, g, b) + vec3(0.37, 0.95, 1.0) * rim;
  gl_FragColor = vec4(col, uHover);
}
`;

export function createLiquidHoverPlane({ scene, tier = 'HIGH' }) {
  const finePointer = window.matchMedia?.('(hover: hover) and (pointer: fine)')?.matches ?? false;
  let currentTier = tier;

  const loader = new THREE.TextureLoader();
  const cache = new Map();
  const inflight = new Map();

  const geo = new THREE.PlaneGeometry(1, 1, 1, 1);
  const uniforms = {
    uTex: { value: null },
    uHover: { value: 0 },
    uTime: { value: 0 },
    uPointer: { value: new THREE.Vector2(0.5, 0.5) },
    uPlaneAspect: { value: new THREE.Vector2(16, 10) },
    uTexAspect: { value: new THREE.Vector2(16, 10) },
  };

  const mat = new THREE.ShaderMaterial({
    vertexShader: VERT,
    fragmentShader: FRAG,
    uniforms,
    transparent: true,
    depthWrite: false,
    depthTest: false,
  });

  const mesh = new THREE.Mesh(geo, mat);
  mesh.visible = false;
  mesh.renderOrder = 40;
  mesh.frustumCulled = false;
  scene.add(mesh);

  let activeEl = null;
  let activeSrc = '';
  let targetHover = 0;

  function canActivate() {
    return finePointer && currentTier === 'HIGH' && !prefersReducedMotion();
  }

  function cachePut(src, tex) {
    if (cache.has(src)) cache.delete(src);
    cache.set(src, tex);
    while (cache.size > MAX_CACHED_TEXTURES) {
      const oldestKey = cache.keys().next().value;
      const oldTex = cache.get(oldestKey);
      cache.delete(oldestKey);
      oldTex?.dispose();
    }
  }

  function acquireTexture(src, el) {
    if (!src) return;
    const hit = cache.get(src);
    if (hit) {
      uniforms.uTex.value = hit;
      if (hit.image?.width && hit.image?.height) {
        uniforms.uTexAspect.value.set(hit.image.width, hit.image.height);
      }
      if (activeEl === el && canActivate()) {
        el.classList.add('is-gl-liquid');
      }
      return;
    }
    if (inflight.has(src)) return;
    inflight.set(src, true);
    loader.load(
      src,
      (tex) => {
        inflight.delete(src);
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.minFilter = THREE.LinearFilter;
        tex.magFilter = THREE.LinearFilter;
        cachePut(src, tex);
        if (activeSrc === src && activeEl && canActivate()) {
          uniforms.uTex.value = tex;
          if (tex.image?.width && tex.image?.height) {
            uniforms.uTexAspect.value.set(tex.image.width, tex.image.height);
          }
          activeEl.classList.add('is-gl-liquid');
        }
      },
      undefined,
      () => {
        inflight.delete(src);
      }
    );
  }

  const unsub = stageBus.on((ev, payload) => {
    if (ev === 'media:hover') {
      if (!canActivate() || !payload?.el || !payload?.src) return;
      if (activeEl && activeEl !== payload.el) {
        activeEl.classList.remove('is-gl-liquid');
      }
      activeEl = payload.el;
      activeSrc = payload.src;
      targetHover = 1;
      acquireTexture(activeSrc, activeEl);
    } else if (ev === 'media:move' && payload) {
      uniforms.uPointer.value.set(payload.nx ?? 0.5, 1.0 - (payload.ny ?? 0.5));
    } else if (ev === 'media:leave') {
      if (!payload?.el || payload.el === activeEl) {
        activeEl?.classList.remove('is-gl-liquid');
        targetHover = 0;
      }
    }
  });

  function update({ time, paused }) {
    if (!canActivate() || !activeEl || !activeEl.isConnected) {
      if (activeEl) {
        activeEl.classList.remove('is-gl-liquid');
        activeEl = null;
      }
      uniforms.uHover.value = 0;
      mesh.visible = false;
      return;
    }

    const step = paused ? 0.25 : 0.14;
    uniforms.uHover.value += (targetHover - uniforms.uHover.value) * step;

    if (uniforms.uHover.value < 0.02 || !uniforms.uTex.value) {
      mesh.visible = false;
      if (targetHover === 0) activeEl = null;
      return;
    }

    const r = activeEl.getBoundingClientRect();
    if (r.width < 10 || r.height < 10 || r.bottom < 0 || r.top > window.innerHeight) {
      mesh.visible = false;
      activeEl.classList.remove('is-gl-liquid');
      return;
    }

    mesh.visible = true;
    mesh.position.set(r.left + r.width * 0.5, -(r.top + r.height * 0.5), 2.5);
    mesh.scale.set(r.width, r.height, 1);
    uniforms.uPlaneAspect.value.set(r.width, r.height);
    uniforms.uTime.value = time;
  }

  function setTier(nextTier) {
    currentTier = nextTier;
    if (!canActivate() && activeEl) {
      activeEl.classList.remove('is-gl-liquid');
      targetHover = 0;
    }
  }

  function dispose() {
    unsub();
    activeEl?.classList.remove('is-gl-liquid');
    scene.remove(mesh);
    geo.dispose();
    mat.dispose();
    cache.forEach((tex) => tex.dispose());
    cache.clear();
  }

  return { update, setTier, dispose };
}
