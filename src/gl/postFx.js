/**
 * Single-Pass Post-FX Composite (Cyan Soft Bloom, Filmic Grain, Edge Chromatic Aberration,
 * Vignette & Velocity Scanlines) + Route Wipe Iris Uniform (#4, #26).
 */
import * as THREE from 'three';

const VS_POST = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const FS_POST = /* glsl */ `
  precision highp float;
  uniform sampler2D uSceneTex;
  uniform vec2 uTexel;
  uniform float uTime;
  uniform float uVelocity;
  uniform float uWarp;
  uniform float uIris;
  varying vec2 vUv;

  float hash12(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * 0.1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
  }

  vec3 sampleBloom(vec2 uv) {
    vec2 d = uTexel * 2.6;
    vec3 c0 = texture2D(uSceneTex, clamp(uv + vec2( d.x,  0.0), 0.001, 0.999)).rgb;
    vec3 c1 = texture2D(uSceneTex, clamp(uv + vec2(-d.x,  0.0), 0.001, 0.999)).rgb;
    vec3 c2 = texture2D(uSceneTex, clamp(uv + vec2( 0.0,  d.y), 0.001, 0.999)).rgb;
    vec3 c3 = texture2D(uSceneTex, clamp(uv + vec2( 0.0, -d.y), 0.001, 0.999)).rgb;
    vec3 c4 = texture2D(uSceneTex, clamp(uv + vec2( d.x * 1.4,  d.y * 1.4), 0.001, 0.999)).rgb;
    vec3 c5 = texture2D(uSceneTex, clamp(uv + vec2(-d.x * 1.4, -d.y * 1.4), 0.001, 0.999)).rgb;
    vec3 avg = (c0 + c1 + c2 + c3 + 0.5 * (c4 + c5)) / 5.0;
    float lum = dot(avg, vec3(0.2126, 0.7152, 0.0722));
    float cyanWeight = clamp(avg.b * 0.65 + avg.g * 0.55 - avg.r * 0.35, 0.0, 1.0);
    return avg * smoothstep(0.54, 0.96, lum + cyanWeight * 0.28);
  }

  void main() {
    vec2 centered = vUv - 0.5;
    float radial = dot(centered, centered);

    // Subtle edge chromatic aberration amplified by scroll velocity / warp state
    float caAmt = (0.0014 + abs(uVelocity) * 0.0045 + uWarp * 0.006) * radial * 2.2;
    vec2 dir = normalize(centered + vec2(1e-5));
    vec2 uvR = clamp(vUv + dir * caAmt, 0.001, 0.999);
    vec2 uvB = clamp(vUv - dir * caAmt, 0.001, 0.999);

    vec3 base;
    base.r = texture2D(uSceneTex, uvR).r;
    base.g = texture2D(uSceneTex, vUv).g;
    base.b = texture2D(uSceneTex, uvB).b;

    // Soft cyan-tinted bloom halo
    vec3 bloom = sampleBloom(vUv);
    vec3 col = base + bloom * vec3(0.32, 0.52, 0.62) * (0.42 + uWarp * 0.35);

    // Scroll-velocity reactive horizontal scanlines
    float scan = sin((vUv.y / max(uTexel.y, 1e-4)) * 0.65 + uTime * 3.0);
    float scanMix = (0.012 + min(0.065, abs(uVelocity) * 0.07 + uWarp * 0.05));
    col *= 1.0 - scan * scanMix;

    // Restrained filmic grain
    float grain = (hash12(vUv / max(uTexel, vec2(1e-4)) + fract(uTime * 19.3)) - 0.5) * 0.028;
    col += grain;

    // Deep HUD vignette
    float vig = smoothstep(0.86, 0.24, length(centered));
    col *= mix(0.76, 1.0, vig);

    // Optional route iris / shader transition darkening pulse
    if (uIris > 0.001) {
      float ring = smoothstep(uIris - 0.08, uIris + 0.02, length(centered));
      col = mix(col, vec3(0.02, 0.04, 0.14) + vec3(0.37, 0.95, 1.0) * 0.18 * (1.0 - ring), clamp(uIris * 1.15, 0.0, 0.85));
    }

    gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
  }
`;

export function createPostFxPass({ renderer, tier }) {
  let enabled = tier !== 'LOW';
  let width = Math.max(2, window.innerWidth);
  let height = Math.max(2, window.innerHeight);

  const rt = new THREE.WebGLRenderTarget(width, height, {
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    format: THREE.RGBAFormat,
    depthBuffer: true,
    stencilBuffer: false,
  });

  const postScene = new THREE.Scene();
  const postCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const mat = new THREE.ShaderMaterial({
    vertexShader: VS_POST,
    fragmentShader: FS_POST,
    depthTest: false,
    depthWrite: false,
    uniforms: {
      uSceneTex: { value: rt.texture },
      uTexel: { value: new THREE.Vector2(1 / width, 1 / height) },
      uTime: { value: 0 },
      uVelocity: { value: 0 },
      uWarp: { value: 0 },
      uIris: { value: 0 },
    },
  });

  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat);
  postScene.add(quad);

  function setSize(W, H, pixelRatio) {
    width = Math.max(2, Math.floor(W * pixelRatio));
    height = Math.max(2, Math.floor(H * pixelRatio));
    rt.setSize(width, height);
    mat.uniforms.uTexel.value.set(1 / width, 1 / height);
  }

  function setTier(nextTier) {
    enabled = nextTier !== 'LOW';
  }

  function render({ scene, camera, worldScene, worldCamera, time, velocity, warp, iris }) {
    const prevAutoClear = renderer.autoClear;
    renderer.autoClear = false;

    const target = enabled ? rt : null;
    renderer.setRenderTarget(target);
    renderer.clear(true, true, true);
    renderer.render(scene, camera);

    if (worldScene && worldCamera) {
      renderer.clearDepth();
      renderer.render(worldScene, worldCamera);
    }

    if (enabled) {
      mat.uniforms.uTime.value = time;
      mat.uniforms.uVelocity.value = velocity || 0;
      mat.uniforms.uWarp.value = warp || 0;
      mat.uniforms.uIris.value = iris || 0;

      renderer.setRenderTarget(null);
      renderer.clear(true, false, false);
      renderer.render(postScene, postCam);
    }

    renderer.autoClear = prevAutoClear;
  }

  function dispose() {
    rt.dispose();
    quad.geometry.dispose();
    mat.dispose();
  }

  return { setSize, setTier, render, dispose };
}
