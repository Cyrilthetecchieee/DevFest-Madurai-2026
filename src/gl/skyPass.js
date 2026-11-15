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
  uniform vec2 uPointer;
  uniform float uTime;
  uniform float uTrailWeight;
  uniform float uScrollProgress;
  uniform float uAuroraGain;
  varying vec2 vUv;

  vec2 toCoverUv(vec2 uv) {
    return clamp(vec2(0.5) + (uv - 0.5) * uCoverScale, 0.001, 0.999);
  }

  float hash21(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  float vnoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    float a = hash21(i);
    float b = hash21(i + vec2(1.0, 0.0));
    float c = hash21(i + vec2(0.0, 1.0));
    float d = hash21(i + vec2(1.0, 1.0));
    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
  }

  float fbm3(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    mat2 rot = mat2(0.8, 0.6, -0.6, 0.8);
    for (int i = 0; i < 3; i++) {
      v += a * vnoise(p);
      p = rot * p * 2.04;
      a *= 0.5;
    }
    return v;
  }

  float starLayer(vec2 uv, float scale, float parallax, float seed) {
    vec2 st = (uv + (uPointer - 0.5) * parallax + vec2(0.0, uScrollProgress * parallax * 1.4)) * scale;
    vec2 id = floor(st);
    vec2 gv = fract(st) - 0.5;
    float n = hash21(id + seed);
    if (n < 0.915) return 0.0;
    vec2 jitter = (vec2(hash21(id * 2.3 + seed), hash21(id * 5.7 + seed)) - 0.5) * 0.65;
    float d = length(gv - jitter);
    float twinkle = 0.55 + 0.45 * sin(uTime * (2.2 + n * 4.5) + n * 31.4);
    return smoothstep(0.09, 0.0, d) * twinkle * smoothstep(0.915, 0.995, n);
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

    vec3 col = vec3(
      texture2D(uMainTex, uvR).r,
      texture2D(uMainTex, uvG).g,
      texture2D(uMainTex, uvB).b
    );

    // Deep midnight-blue zenith depth preserving the original sky plate
    float zenithDepth = smoothstep(0.48, 0.98, v.y);
    col = mix(col, col * vec3(0.88, 0.91, 1.04) + vec3(0.012, 0.018, 0.065), zenithDepth * 0.45);

    // Domain-warped FBM nebula & aurora curtains (#0b0f3a / #5ef3ff / #9b5cff palette)
    vec2 aUv = v * vec2(2.8, 1.9) + vec2(uTime * 0.035, -uScrollProgress * 0.45);
    vec2 q = vec2(fbm3(aUv), fbm3(aUv + vec2(4.2, 1.7)));
    float aurora = fbm3(aUv + 1.85 * q + vec2(uTime * 0.022));
    float auroraBand = smoothstep(0.32, 0.78, aurora) * smoothstep(0.16, 0.88, v.y);
    vec3 violetNebula = vec3(0.608, 0.361, 1.0);
    vec3 cyanHighlight = vec3(0.369, 0.953, 1.0);
    vec3 auroraCol = mix(violetNebula, cyanHighlight, clamp(q.x * 0.85 + 0.15 - uScrollProgress * 0.25, 0.0, 1.0));
    col += auroraCol * auroraBand * (0.11 + uAuroraGain * 0.18);

    // Natural cloud depth & soft atmospheric horizon scatter along cloud tops
    float cloudCrest = smoothstep(0.12, 0.28, v.y) * (1.0 - smoothstep(0.28, 0.46, v.y));
    col += mix(violetNebula, cyanHighlight, 0.42) * cloudCrest * (0.045 + 0.025 * q.y);

    // Gentle ambient illumination around the character and cyan orbital ring
    float heroPresence = 1.0 - smoothstep(0.0, 0.28, uScrollProgress);
    vec2 charDelta = (v - vec2(0.48, 0.44)) * vec2(1.35, 1.0);
    vec2 ringDelta = (v - vec2(0.48, 0.63)) * vec2(1.35, 1.0);
    float charGlow = exp(-dot(charDelta, charDelta) * 7.5);
    float ringGlow = exp(-dot(ringDelta, ringDelta) * 14.0);
    col += (violetNebula * 0.055 * charGlow + cyanHighlight * 0.065 * ringGlow) * heroPresence;

    // Tri-depth parallax twinkling starfield (masked cleanly above lower foreground clouds)
    float skyMask = smoothstep(0.22, 0.44, v.y);
    float starsDeep = starLayer(v, 64.0, 0.007, 53.9);
    float starsFar = starLayer(v, 36.0, 0.014, 13.7);
    float starsNear = starLayer(v, 19.0, 0.032, 91.3);
    col += vec3(0.84, 0.90, 1.0) * starsDeep * 0.42 * skyMask;
    col += vec3(0.92, 0.96, 1.0) * starsFar * 0.55 * skyMask;
    col += mix(cyanHighlight, vec3(0.95, 0.96, 1.0), 0.6) * starsNear * 0.72 * skyMask;

    // Cursor fluid ripple tint & luminescence
    vec3 tint = col * vec3(1.08, 0.98, 1.15) + vec3(0.05, 0.03, 0.09);
    col = mix(col, tint, smoothstep(0.0, 0.5, t));
    col += vec3(0.37, 0.95, 1.0) * length(g) * 0.14;
    col += vec3(0.61, 0.36, 1.0) * dot(rib, vec2(0.55, 0.83)) * 0.06 * smoothstep(0.0, 0.5, t);

    // Scroll-linked subtle palette grade (navy -> cyan depth -> violet nebula -> deep horizon)
    vec3 deepGrade = mix(vec3(1.0, 1.0, 1.0), vec3(0.86, 0.94, 1.06), smoothstep(0.0, 0.5, uScrollProgress));
    deepGrade = mix(deepGrade, vec3(0.95, 0.84, 1.1), smoothstep(0.45, 1.0, uScrollProgress));
    col *= deepGrade;

    gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
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
      uPointer: { value: new THREE.Vector2(0.5, 0.5) },
      uTime: { value: 0 },
      uTrailWeight: { value: tier === 'LOW' ? 0 : 1 },
      uScrollProgress: { value: 0 },
      uAuroraGain: { value: tier === 'LOW' ? 0.45 : 1.0 },
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
    skyMat.uniforms.uAuroraGain.value = nextTier === 'LOW' ? 0.45 : 1.0;
    if (nextTier !== 'LOW') enableVideoIfPermitted(nextTier);
  }

  function update({ time, pointer, W, H, paused, trailEnabled, scrollProgress = 0, auroraBoost = 0 }) {
    skyMat.uniforms.uTime.value = time;
    skyMat.uniforms.uScrollProgress.value = scrollProgress;
    skyMat.uniforms.uPointer.value.set(pointer.x / Math.max(1, W), 1.0 - pointer.y / Math.max(1, H));
    const baseGain = trailEnabled ? 1.0 : 0.45;
    skyMat.uniforms.uAuroraGain.value = baseGain + auroraBoost;

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
