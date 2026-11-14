/**
 * GPU Particle Morph Director (S4)
 * - 46,000 (HIGH) / 22,000 (MEDIUM) / 7,500 (LOW) GPU point cloud.
 * - Morphs cleanly via scroll checkpoints: dust -> G -> DEVFEST -> kolam -> gopuram -> CREATE.
 * - Features GPU curl/simplex turbulence, pointer/touch repulsion force field,
 *   and velocity-driven scatter that re-forms smoothly on scroll rest.
 */
import * as THREE from 'three';
import { generateKolamSpec } from '../visuals/kolamEngine.js';
import { sampleGopuramPoints } from '../visuals/gopuramBuilder.js';

const TIER_COUNTS = Object.freeze({
  HIGH: 46000,
  MEDIUM: 22000,
  LOW: 7500,
});

const VS_PARTICLES = /* glsl */ `
  attribute vec3 aTo;
  attribute vec2 aSeed;
  uniform float uMix;
  uniform float uTime;
  uniform float uScatter;
  uniform float uPointSize;
  uniform vec3 uPointer;
  uniform float uPointerStrength;
  varying float vSeed;
  varying float vEnergy;

  vec3 hash3(float n) {
    return fract(sin(vec3(n, n + 1.0, n + 2.0)) * vec3(43758.5453, 22578.1459, 19642.3490)) * 2.0 - 1.0;
  }

  void main() {
    vSeed = aSeed.x;
    vec3 base = mix(position, aTo, uMix);

    // Pseudo curl-noise drift around structure
    float phase = uTime * (0.65 + aSeed.y * 0.45) + aSeed.x * 31.4;
    vec3 curl = vec3(
      sin(base.y * 1.9 + phase) * cos(base.z * 1.4 - phase * 0.7),
      cos(base.x * 1.7 - phase) * sin(base.z * 1.5 + phase),
      sin(base.x * 1.3 + base.y * 1.6 + phase * 0.8)
    );

    // Scatter outward along pseudo-normal on high scroll velocity & re-assemble on rest
    vec3 scatterDir = hash3(aSeed.x * 997.0 + aSeed.y * 131.0);
    float scatterAmt = uScatter * (0.45 + 1.15 * aSeed.y);
    vec3 pos = base + curl * (0.09 + uScatter * 0.25) + scatterDir * scatterAmt;

    // Cursor / touch radial force field
    vec3 toPtr = pos - uPointer;
    float dPtr = length(toPtr.xy);
    float field = exp(-dPtr * dPtr * 0.55) * uPointerStrength;
    pos.xy += normalize(toPtr.xy + vec2(1e-4)) * field * 1.15;
    pos.z += field * 0.75;

    vEnergy = clamp(field + scatterAmt * 0.45, 0.0, 1.0);

    vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPos;
    gl_PointSize = clamp((uPointSize * (0.6 + 0.75 * aSeed.y + vEnergy * 0.5)) / max(1.0, -mvPos.z), 1.2, 6.5);
  }
`;

const FS_PARTICLES = /* glsl */ `
  precision highp float;
  varying float vSeed;
  varying float vEnergy;
  uniform float uOpacity;

  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float r = dot(c, c);
    if (r > 0.25) discard;
    float soft = exp(-r * 16.0);

    vec3 cyan = vec3(0.369, 0.953, 1.0);
    vec3 violet = vec3(0.608, 0.361, 1.0);
    vec3 ink = vec3(0.953, 0.965, 1.0);
    vec3 col = mix(mix(cyan, violet, vSeed), ink, vEnergy * 0.65);

    gl_FragColor = vec4(col, soft * uOpacity);
  }
`;

/** Rasterizes uppercase wordmarks ("G", "DEVFEST", "CREATE.") into crisp 3D normalized sample coords. */
function sampleWordmarkPoints(text, count, { scaleX = 3.8, scaleY = 1.4, fontScale = 1 } = {}) {
  const out = new Float32Array(count * 3);
  const w = 512;
  const h = 160;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `900 ${Math.round((text.length <= 2 ? 128 : 88) * fontScale)}px monospace`;
  ctx.fillText(text, w / 2, h / 2);

  const img = ctx.getImageData(0, 0, w, h).data;
  const pts = [];
  const step = text.length <= 2 ? 2 : 3;
  for (let y = 0; y < h; y += step) {
    for (let x = 0; x < w; x += step) {
      if (img[(y * w + x) * 4] > 110) {
        pts.push([(x / w - 0.5) * 2 * scaleX, (0.5 - y / h) * 2 * scaleY]);
      }
    }
  }
  if (!pts.length) pts.push([0, 0]);

  let ptr = 0;
  for (let i = 0; i < count; i++) {
    const pick = pts[(i * 2654435761) % pts.length];
    const jitterX = (((i * 73) % 100) / 100 - 0.5) * 0.05;
    const jitterY = (((i * 197) % 100) / 100 - 0.5) * 0.05;
    const jitterZ = (((i * 389) % 100) / 100 - 0.5) * 0.35;
    out[ptr++] = pick[0] + jitterX;
    out[ptr++] = pick[1] + jitterY;
    out[ptr++] = jitterZ;
  }
  return out;
}

function sampleDustPoints(count) {
  const out = new Float32Array(count * 3);
  let ptr = 0;
  for (let i = 0; i < count; i++) {
    const a = ((i * 7919) % 10000) / 10000;
    const b = ((i * 15485863) % 10000) / 10000;
    const c = ((i * 32452843) % 10000) / 10000;
    const theta = a * Math.PI * 2;
    const rad = 1.2 + Math.pow(b, 0.7) * 6.5;
    out[ptr++] = Math.cos(theta) * rad;
    out[ptr++] = (c - 0.5) * 5.2;
    out[ptr++] = (Math.sin(theta) * rad) * 0.45;
  }
  return out;
}

function sampleKolamPoints(count) {
  const spec = generateKolamSpec({ gridRadius: 3, size: 400, seed: 'DEVFEST-PARTICLES-2026' });
  const raw = spec.samples.length ? spec.samples : [{ x: 0, y: 0 }];
  const out = new Float32Array(count * 3);
  let ptr = 0;
  for (let i = 0; i < count; i++) {
    const s = raw[(i * 131) % raw.length];
    const jx = (((i * 41) % 100) / 100 - 0.5) * 0.04;
    const jy = (((i * 89) % 100) / 100 - 0.5) * 0.04;
    const ringZ = Math.sin((s.x + s.y) * 4.0) * 0.28;
    out[ptr++] = s.x * 2.6 + jx;
    out[ptr++] = s.y * 2.6 + jy;
    out[ptr++] = ringZ;
  }
  return out;
}

export function createParticleDirector(scene, { tier = 'HIGH' } = {}) {
  const MAX = TIER_COUNTS.HIGH;
  const targets = [
    sampleDustPoints(MAX),
    sampleWordmarkPoints('G', MAX, { scaleX: 2.3, scaleY: 2.3, fontScale: 1.1 }),
    sampleWordmarkPoints('DEVFEST', MAX, { scaleX: 4.1, scaleY: 1.35, fontScale: 1 }),
    sampleKolamPoints(MAX),
    sampleGopuramPoints(MAX),
    sampleWordmarkPoints('CREATE.', MAX, { scaleX: 3.9, scaleY: 1.35, fontScale: 0.96 }),
  ];

  const seeds = new Float32Array(MAX * 2);
  for (let i = 0; i < MAX; i++) {
    seeds[i * 2] = ((i * 9301 + 49297) % 233280) / 233280;
    seeds[i * 2 + 1] = ((i * 49297 + 9301) % 233280) / 233280;
  }

  const geo = new THREE.BufferGeometry();
  const attrFrom = new THREE.BufferAttribute(new Float32Array(targets[0]), 3);
  const attrTo = new THREE.BufferAttribute(new Float32Array(targets[1]), 3);
  geo.setAttribute('position', attrFrom);
  geo.setAttribute('aTo', attrTo);
  geo.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 2));
  geo.setDrawRange(0, TIER_COUNTS[tier] || TIER_COUNTS.MEDIUM);

  const mat = new THREE.ShaderMaterial({
    vertexShader: VS_PARTICLES,
    fragmentShader: FS_PARTICLES,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uMix: { value: 0 },
      uTime: { value: 0 },
      uScatter: { value: 0 },
      uPointSize: { value: 28 },
      uPointer: { value: new THREE.Vector3(0, 0, 0) },
      uPointerStrength: { value: 0 },
      uOpacity: { value: 0.52 },
    },
  });

  const points = new THREE.Points(geo, mat);
  points.position.set(0, 0.25, -8.5);
  points.frustumCulled = false;
  scene.add(points);

  let currentSeg = 0;
  let scatterSmoothed = 0;

  function setTier(nextTier) {
    geo.setDrawRange(0, TIER_COUNTS[nextTier] || TIER_COUNTS.LOW);
  }

  function update({ time, scrollProgress, scrollVelocity, pointerX, pointerY, pointerSpeed, paused, warpBoost }) {
    if (!paused) {
      mat.uniforms.uTime.value = time;
    }

    // 5 segments across 0..1 scroll range -> 6 discrete morph forms
    const segFloat = Math.max(0, Math.min(4.9999, scrollProgress * 5.0));
    const segIdx = Math.floor(segFloat);
    const localMix = segFloat - segIdx;
    // Slight hold plateaus around each shape before morphing to the next
    const shapedMix = localMix < 0.25 ? 0 : localMix > 0.8 ? 1 : (localMix - 0.25) / 0.55;

    if (segIdx !== currentSeg) {
      currentSeg = segIdx;
      attrFrom.array.set(targets[segIdx]);
      attrTo.array.set(targets[Math.min(5, segIdx + 1)]);
      attrFrom.needsUpdate = true;
      attrTo.needsUpdate = true;
    }

    mat.uniforms.uMix.value = shapedMix * shapedMix * (3 - 2 * shapedMix);

    // Scatter proportional to scroll speed & warp easter egg, decays softly on rest
    const velBurst = Math.min(1.6, Math.abs(scrollVelocity) * 2.2 + warpBoost * 1.4);
    scatterSmoothed = scatterSmoothed * 0.88 + velBurst * 0.12;
    mat.uniforms.uScatter.value = scatterSmoothed;

    // Cursor repulsion coordinate in world XY at z = -8.5 plane
    const worldX = (pointerX - 0.5) * 9.0;
    const worldY = (0.5 - pointerY) * 5.2;
    mat.uniforms.uPointer.value.set(worldX, worldY, 0);
    mat.uniforms.uPointerStrength.value = Math.min(1.3, 0.45 + pointerSpeed * 0.9);

    // Hero stays lighter behind crisp bust; deep scroll brightens particle sculpture
    mat.uniforms.uOpacity.value = Math.min(0.86, 0.34 + scrollProgress * 0.65);
    points.rotation.y = Math.sin(time * 0.18) * 0.12;
  }

  function dispose() {
    geo.dispose();
    mat.dispose();
  }

  return { setTier, update, dispose };
}
