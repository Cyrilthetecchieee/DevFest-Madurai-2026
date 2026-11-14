/**
 * Marquee Plane — renders the DEVFEST 2026 traced-glyph & Orbe index strip
 * as a crisp mipmapped CanvasTexture inside the unified Three.js scene at z = -1200
 * behind the translucent 3D figure.
 */
import * as THREE from 'three';

const PERIOD_W = 2352;
const PERIOD_H = 380;

const VS_MARQUEE = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const FS_MARQUEE = /* glsl */ `
  uniform sampler2D uTex;
  uniform float uOffsetX;
  uniform float uRepeatX;
  varying vec2 vUv;

  void main() {
    vec2 uv = vec2(fract(vUv.x * uRepeatX + uOffsetX), vUv.y);
    vec4 col = texture2D(uTex, uv);
    if (col.a < 0.01) discard;
    gl_FragColor = col;
  }
`;

/** Rasterize the DOM marquee SVG period into an offscreen crisp 2D canvas after fonts load. */
async function rasterizeMarqueeTexture(maxAnisotropy) {
  await document.fonts.ready;

  const sourceSvg = document.getElementById('marquee-svg-template');
  if (!sourceSvg) return null;

  // Extract defs block & render one clean period in standalone SVG
  const defsEl = sourceSvg.querySelector('defs');
  if (!defsEl) return null;

  const svgMarkup = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${PERIOD_W}" height="${PERIOD_H}" viewBox="0 0 ${PERIOD_W} ${PERIOD_H}">
      ${defsEl.outerHTML}
      <use href="#marquee-period" x="0" y="0" />
    </svg>
  `;

  const blob = new Blob([svgMarkup], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  try {
    const img = new Image();
    img.decoding = 'async';
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
      img.src = url;
    });

    const canvas = document.createElement('canvas');
    canvas.width = PERIOD_W;
    canvas.height = PERIOD_H;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.NoColorSpace;
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
    tex.minFilter = THREE.LinearMipmapLinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.anisotropy = Math.min(8, maxAnisotropy || 4);
    tex.needsUpdate = true;
    return tex;
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function createMarqueePlane({ scene, renderer }) {
  const geo = new THREE.PlaneGeometry(1, 1);
  const mat = new THREE.ShaderMaterial({
    vertexShader: VS_MARQUEE,
    fragmentShader: FS_MARQUEE,
    transparent: true,
    depthTest: true,
    depthWrite: false,
    uniforms: {
      uTex: { value: null },
      uOffsetX: { value: 0 },
      uRepeatX: { value: 1 },
    },
  });

  const mesh = new THREE.Mesh(geo, mat);
  mesh.renderOrder = 1;
  mesh.visible = false;
  mesh.frustumCulled = false;
  scene.add(mesh);

  let texture = null;
  let ready = false;
  let offsetPeriods = 0;

  rasterizeMarqueeTexture(renderer.capabilities.getMaxAnisotropy())
    .then((tex) => {
      if (!tex) return;
      texture = tex;
      mat.uniforms.uTex.value = tex;
      ready = true;
      mesh.visible = true;
    })
    .catch((err) => {
      console.warn('[marqueePlane] texture rasterization failed; retaining DOM SVG fallback:', err);
    });

  function setSize(W, H) {
    const isMobile = W <= 820;
    const u = Math.min(W / 2048, H / 1150);

    // Match CSS headline-container exact top + height (viewBox height 380 vs 260 baseline ratio)
    const cssTop = isMobile ? 56 : 100 * u;
    const cssStripH = isMobile ? 112 : 260 * u;
    // Period SVG height 380 occupies cssStripH * (380 / 260) units so glyph height matches 1:1
    const planeH = cssStripH * (PERIOD_H / 260);
    const scalePx = cssStripH / 260;

    mesh.position.set(W / 2, -(cssTop + planeH / 2), -1200);
    mesh.scale.set(W, planeH, 1);
    mat.uniforms.uRepeatX.value = W / Math.max(PERIOD_W * scalePx, 1);
  }

  function update({ dt, paused }) {
    if (!ready || paused) return;
    // Matches CSS @keyframes marquee: -2352px over 34s = 1 full period every 34s
    offsetPeriods = (offsetPeriods + dt / 34) % 1;
    mat.uniforms.uOffsetX.value = offsetPeriods;
  }

  function dispose() {
    geo.dispose();
    mat.dispose();
    if (texture) texture.dispose();
  }

  return {
    isReady: () => ready,
    setSize,
    update,
    dispose,
  };
}
