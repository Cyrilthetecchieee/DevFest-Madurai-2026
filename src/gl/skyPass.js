/**
 * Sky Pass — ping-pong cursor ripple trail FBO + aspect-cover sky composite shader.
 * Renders at z = -2000 behind marquee and 3D figure inside the single persistent WebGL stage.
 */
import * as THREE from 'three';

const VS_FULLSCREEN = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const FS_TRAIL = /* glsl */ `
  precision highp float;
  uniform sampler2D uPrevTrail;
  uniform vec2 uP0;
  uniform vec2 uP1;
  uniform float uAmt;
  uniform float uHasMoved;
  uniform float uAspect;
  varying vec2 vUv;

  float distToSegment(vec2 p, vec2 a, vec2 b) {
    vec2 pa = p - a;
    vec2 ba = b - a;
    pa.x *= uAspect;
    ba.x *= uAspect;
    float h = clamp(dot(pa, ba) / max(dot(ba, ba), 1e-6), 0.0, 1.0);
    return length(pa - ba * h);
  }

  void main() {
    float o = texture2D(uPrevTrail, vUv).r;
    o = max(o * 0.972 - 0.0035, 0.0);
    if (uHasMoved > 0.5) {
      float d = distToSegment(vUv, uP0, uP1);
      o += smoothstep(0.075, 0.0, d) * uAmt;
    }
    o = clamp(o, 0.0, 1.0);
    gl_FragColor = vec4(o, o, o, 1.0);
  }
`;

const VS_SKY_QUAD = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const FS_SKY = /* glsl */ `
  precision highp float;
  uniform sampler2D uMainTex;
  uniform sampler2D uTrailTex;
  uniform vec2 uCoverScale;
  uniform float uTime;
  uniform float uTrailWeight;
  varying vec2 vUv;

  vec2 toCoverUv(vec2 uv) {
    return clamp(vec2(0.5) + (uv - 0.5) * uCoverScale, 0.001, 0.999);
  }

  void main() {
    vec2 v = vUv;
    float t = texture2D(uTrailTex, v).r * uTrailWeight;

    float txR = texture2D(uTrailTex, v + vec2(1.5 / 256.0, 0.0)).r;
    float txL = texture2D(uTrailTex, v - vec2(1.5 / 256.0, 0.0)).r;
    float tyU = texture2D(uTrailTex, v + vec2(0.0, 1.5 / 170.0)).r;
    float tyD = texture2D(uTrailTex, v - vec2(0.0, 1.5 / 170.0)).r;
    vec2 g = vec2(txR - txL, tyU - tyD) * uTrailWeight;

    vec2 rib = vec2(
      sin(v.y * 180.0 + uTime * 2.2 + sin(v.x * 70.0 + uTime) * 2.4),
      cos(v.x * 150.0 - uTime * 1.7 + sin(v.y * 60.0) * 2.2)
    );

    vec2 off = g * 0.05 + rib * 0.013 * smoothstep(0.0, 0.6, t);

    vec2 uvR = toCoverUv(v + off * 1.25);
    vec2 uvG = toCoverUv(v + off);
    vec2 uvB = toCoverUv(v + off * 0.75);

    float r = texture2D(uMainTex, uvR).r;
    float gCol = texture2D(uMainTex, uvG).g;
    float b = texture2D(uMainTex, uvB).b;
    vec3 col = vec3(r, gCol, b);

    vec3 tint = col * vec3(1.08, 0.98, 1.15) + vec3(0.05, 0.03, 0.09);
    col = mix(col, tint, smoothstep(0.0, 0.5, t));

    col += vec3(0.37, 0.95, 1.0) * length(g) * 0.12;
    col += vec3(0.61, 0.36, 1.0) * dot(rib, vec2(0.55, 0.83)) * 0.05 * smoothstep(0.0, 0.5, t);

    gl_FragColor = vec4(col, 1.0);
  }
`;

export function createSkyPass({ scene, renderer, plateImgUrl, videoUrl, tier }) {
  const TEX_ASPECT = 2048 / 1360;

  // Ping-pong trail targets
  const rtOpts = {
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    format: THREE.RGBAFormat,
    depthBuffer: false,
    stencilBuffer: false,
  };
  let rtA = new THREE.WebGLRenderTarget(256, 170, rtOpts);
  let rtB = new THREE.WebGLRenderTarget(256, 170, rtOpts);
  let readRT = rtA;
  let writeRT = rtB;

  const trailScene = new THREE.Scene();
  const trailCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const trailMat = new THREE.ShaderMaterial({
    vertexShader: VS_FULLSCREEN,
    fragmentShader: FS_TRAIL,
    depthTest: false,
    depthWrite: false,
    uniforms: {
      uPrevTrail: { value: readRT.texture },
      uP0: { value: new THREE.Vector2(0.5, 0.5) },
      uP1: { value: new THREE.Vector2(0.5, 0.5) },
      uAmt: { value: 0 },
      uHasMoved: { value: 0 },
      uAspect: { value: 1.506 },
    },
  });
  const trailQuad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), trailMat);
  trailScene.add(trailQuad);

  // Load initial high-res sky texture immediately (NoColorSpace so sRGB bytes pass cleanly)
  const texLoader = new THREE.TextureLoader();
  const plateTexture = texLoader.load(plateImgUrl);
  plateTexture.colorSpace = THREE.NoColorSpace;
  plateTexture.minFilter = THREE.LinearFilter;
  plateTexture.magFilter = THREE.LinearFilter;
  plateTexture.wrapS = THREE.ClampToEdgeWrapping;
  plateTexture.wrapT = THREE.ClampToEdgeWrapping;

  let videoEl = null;
  let videoTex = null;
  let usingVideo = false;

  // Main Sky quad placed in stage camera coords (0..W, 0..-H, z=-2000)
  const skyGeo = new THREE.PlaneGeometry(1, 1);
  const skyMat = new THREE.ShaderMaterial({
    vertexShader: VS_SKY_QUAD,
    fragmentShader: FS_SKY,
    depthTest: false,
    depthWrite: false,
    uniforms: {
      uMainTex: { value: plateTexture },
      uTrailTex: { value: readRT.texture },
      uCoverScale: { value: new THREE.Vector2(1, 1) },
      uTime: { value: 0 },
      uTrailWeight: { value: tier === 'LOW' ? 0 : 1 },
    },
  });
  const skyMesh = new THREE.Mesh(skyGeo, skyMat);
  skyMesh.renderOrder = 0;
  skyMesh.frustumCulled = false;
  scene.add(skyMesh);

  function enableVideoIfPermitted(nextTier) {
    if (usingVideo || videoEl || nextTier === 'LOW' || !videoUrl) return;
    if (navigator.connection?.saveData) return;
    videoEl = document.createElement('video');
    videoEl.src = videoUrl;
    videoEl.muted = true;
    videoEl.loop = true;
    videoEl.playsInline = true;
    videoEl.preload = 'metadata';

    const onReady = () => {
      if (!videoEl || videoEl.readyState < 2 || usingVideo) return;
      videoTex = new THREE.VideoTexture(videoEl);
      videoTex.colorSpace = THREE.NoColorSpace;
      videoTex.minFilter = THREE.LinearFilter;
      videoTex.magFilter = THREE.LinearFilter;
      skyMat.uniforms.uMainTex.value = videoTex;
      usingVideo = true;
      videoEl.play().catch(() => {});
    };

    videoEl.addEventListener('canplay', onReady, { once: true });
    videoEl.load();
  }

  // Upgrade sky plate to looping video after initial hero & GLB settle cleanly (never competes with LCP)
  const videoDelayTimer = window.setTimeout(() => {
    enableVideoIfPermitted(tier);
  }, 4200);

  function setSize(W, H) {
    skyMesh.position.set(W / 2, -H / 2, -2000);
    skyMesh.scale.set(W, H, 1);

    const viewAspect = W / Math.max(H, 1);
    trailMat.uniforms.uAspect.value = viewAspect;

    if (viewAspect > TEX_ASPECT) {
      // Wide viewport: crop Y
      skyMat.uniforms.uCoverScale.value.set(1, TEX_ASPECT / viewAspect);
    } else {
      // Tall/portrait viewport: crop X
      skyMat.uniforms.uCoverScale.value.set(viewAspect / TEX_ASPECT, 1);
    }
  }

  function setPaused(paused) {
    if (!videoEl) return;
    if (paused && !videoEl.paused) videoEl.pause();
    else if (!paused && usingVideo && videoEl.paused) videoEl.play().catch(() => {});
  }

  function setTier(nextTier) {
    skyMat.uniforms.uTrailWeight.value = nextTier === 'LOW' ? 0 : 1;
    if (nextTier !== 'LOW') enableVideoIfPermitted(nextTier);
  }

  function update({ time, pointer, W, H, paused, trailEnabled }) {
    skyMat.uniforms.uTime.value = time;

    if (trailEnabled && !paused) {
      trailMat.uniforms.uPrevTrail.value = readRT.texture;
      trailMat.uniforms.uP0.value.set(pointer.prevX / W, 1.0 - pointer.prevY / H);
      trailMat.uniforms.uP1.value.set(pointer.x / W, 1.0 - pointer.y / H);
      trailMat.uniforms.uAmt.value = pointer.amt;
      trailMat.uniforms.uHasMoved.value = pointer.moved ? 1.0 : 0.0;

      const prevTarget = renderer.getRenderTarget();
      renderer.setRenderTarget(writeRT);
      renderer.render(trailScene, trailCamera);
      renderer.setRenderTarget(prevTarget);

      // Swap ping-pong targets
      const tmp = readRT;
      readRT = writeRT;
      writeRT = tmp;
      skyMat.uniforms.uTrailTex.value = readRT.texture;
    }
  }

  function dispose() {
    window.clearTimeout(videoDelayTimer);
    rtA.dispose();
    rtB.dispose();
    trailQuad.geometry.dispose();
    trailMat.dispose();
    skyGeo.dispose();
    skyMat.dispose();
    plateTexture.dispose();
    if (videoTex) videoTex.dispose();
    if (videoEl) {
      videoEl.pause();
      videoEl.removeAttribute('src');
      videoEl.load();
    }
  }

  return { setSize, setPaused, setTier, update, dispose };
}
