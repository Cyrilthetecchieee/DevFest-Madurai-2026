/**
 * Figure Rig — loads compressed hero-figure.glb (meshopt + WebP), preserves exact
 * local-space vObjPos clipping-plane cutout (zNorm/yNorm planet & moon) and rim/halo shaders,
 * and implements damped-spring cursor + idle breathing + device orientation follow.
 */
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';

/** Fast procedural equirectangular studio env map (avoids multi-pass RoomEnvironment stall on startup). */
function createStudioEnvTexture() {
  const w = 128;
  const h = 64;
  const data = new Uint8Array(w * h * 4);
  for (let y = 0; y < h; y++) {
    const v = y / (h - 1);
    for (let x = 0; x < w; x++) {
      const u = x / (w - 1);
      const horiz = Math.exp(-Math.pow((v - 0.52) * 5.2, 2));
      const azim = 0.5 + 0.5 * Math.cos((u - 0.25) * Math.PI * 2);
      const r = Math.min(255, Math.round(14 + 78 * horiz * (0.4 + 0.6 * azim) + 70 * Math.pow(v, 3)));
      const g = Math.min(255, Math.round(18 + 165 * horiz * (0.35 + 0.65 * (1 - azim)) + 50 * horiz));
      const b = Math.min(255, Math.round(52 + 190 * horiz + 90 * Math.sin(v * Math.PI)));
      const idx = (y * w + x) * 4;
      data[idx] = r;
      data[idx + 1] = g;
      data[idx + 2] = b;
      data[idx + 3] = 255;
    }
  }
  const tex = new THREE.DataTexture(data, w, h, THREE.RGBAFormat);
  tex.mapping = THREE.EquirectangularReflectionMapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.magFilter = THREE.LinearFilter;
  tex.minFilter = THREE.LinearFilter;
  tex.needsUpdate = true;
  return tex;
}

export function createFigureRig({ scene, renderer, camera, glbUrl, lowGlbUrl, tier, onLoaded }) {
  // Lightweight procedural environment reflection (< 1ms init)
  const envTex = createStudioEnvTexture();
  scene.environment = envTex;

  // Studio rim & key lighting rig
  const hemiLight = new THREE.HemisphereLight(0xd8e6ff, 0x2a1b6b, 1.1);
  scene.add(hemiLight);

  const keyLight = new THREE.DirectionalLight(0xffe2f4, 1.5);
  keyLight.position.set(-500, 700, 900);
  scene.add(keyLight);

  const cyanRim = new THREE.DirectionalLight(0x5ef3ff, 2.4);
  cyanRim.position.set(900, 300, -700);
  scene.add(cyanRim);

  const violetRim = new THREE.DirectionalLight(0x9b5cff, 2.0);
  violetRim.position.set(-900, 200, -600);
  scene.add(violetRim);

  // Wrapper aligning CSS .cover-box (2048x1360) coordinates inside viewport OrthographicCamera
  const figureCoverRoot = new THREE.Group();
  scene.add(figureCoverRoot);

  const rootGroup = new THREE.Group();
  rootGroup.position.set(982, -792, 0);
  figureCoverRoot.add(rootGroup);

  const turnGroup = new THREE.Group();
  rootGroup.add(turnGroup);

  const innerGroup = new THREE.Group();
  turnGroup.add(innerGroup);

  const customShaders = [];
  const disposableResources = [];
  let loaded = false;
  let coverUnit = 1;
  let boxLeft = 0;
  let boxTop = 0;
  let headScreenX = 0;
  let headScreenY = 0;

  let curYaw = 0;
  let curPitch = 0;
  let curRoll = 0;
  let curParallaxX = 0;
  let curPosX = 982;
  let curPosY = -792;
  let curPosZ = 0;
  let curScale = 1;
  let curHaloGain = 1;
  let curWarmth = 0;
  let curSilhouette = 0;
  let revealElapsed = 0;
  let rimPulse = 0;

  // High-segment concentric halo rings mounted around the crown so low-poly/far zoom never facets
  const haloRingGeo = new THREE.TorusGeometry(235, 3.0, 20, 160);
  const haloRingMat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uTime: { value: 0 },
      uGain: { value: 1 },
      uWarmth: { value: 0 },
      uRimPulse: { value: 0 },
    },
    vertexShader: /* glsl */ `
      varying vec3 vNormalV;
      varying vec2 vRingUv;
      void main() {
        vRingUv = uv;
        vNormalV = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uTime;
      uniform float uGain;
      uniform float uWarmth;
      uniform float uRimPulse;
      varying vec3 vNormalV;
      varying vec2 vRingUv;
      void main() {
        float fresnel = pow(1.0 - abs(vNormalV.z), 1.6);
        float sweep = 0.72 + 0.28 * sin(vRingUv.x * 6.28318 * 2.0 - uTime * 1.4);
        vec3 cyanCol = vec3(0.369, 0.953, 1.0);
        vec3 violetCol = vec3(0.608, 0.361, 1.0);
        vec3 roseCol = vec3(0.957, 0.447, 0.714);
        vec3 baseCol = mix(cyanCol, violetCol, 0.28 + 0.22 * sin(vRingUv.x * 6.28318 + uTime * 0.6));
        baseCol = mix(baseCol, roseCol, uWarmth * 0.42);
        float alpha = clamp((0.36 + 0.64 * fresnel) * sweep * (0.42 + uGain * 0.36 + uRimPulse * 0.28), 0.0, 0.92);
        gl_FragColor = vec4(baseCol * (1.1 + uGain * 0.45), alpha);
      }
    `,
  });
  const haloRingMesh = new THREE.Mesh(haloRingGeo, haloRingMat);
  haloRingMesh.position.set(-14, 344, -28);
  haloRingMesh.rotation.set(Math.PI * 0.42, 0.14, 0.08);
  haloRingMesh.renderOrder = 3;
  turnGroup.add(haloRingMesh);

  const outerRingGeo = new THREE.TorusGeometry(274, 1.35, 16, 160);
  const outerRingMat = haloRingMat.clone();
  const outerRingMesh = new THREE.Mesh(outerRingGeo, outerRingMat);
  outerRingMesh.position.copy(haloRingMesh.position);
  outerRingMesh.rotation.set(Math.PI * 0.42, 0.14, 0.08);
  outerRingMesh.renderOrder = 3;
  turnGroup.add(outerRingMesh);
  disposableResources.push(haloRingGeo, haloRingMat, outerRingGeo, outerRingMat);

  // Device tilt (permission-gated on iOS Safari via first tap, passive elsewhere)
  let gyroOffsetX = 0;
  let gyroOffsetY = 0;
  let gyroAttached = false;
  const onDeviceOrientation = (e) => {
    if (typeof e.gamma === 'number' && typeof e.beta === 'number') {
      gyroOffsetX = Math.max(-0.5, Math.min(0.5, e.gamma / 45));
      gyroOffsetY = Math.max(-0.5, Math.min(0.5, (e.beta - 45) / 45));
    }
  };
  const attachGyro = () => {
    if (gyroAttached) return;
    gyroAttached = true;
    window.addEventListener('deviceorientation', onDeviceOrientation, { passive: true });
  };
  if (typeof window.DeviceOrientationEvent !== 'undefined') {
    if (typeof window.DeviceOrientationEvent.requestPermission !== 'function') {
      attachGyro();
    } else {
      const requestOnGesture = () => {
        window.DeviceOrientationEvent.requestPermission()
          .then((res) => { if (res === 'granted') attachGyro(); })
          .catch(() => {});
      };
      window.addEventListener('pointerdown', requestOnGesture, { once: true, passive: true });
    }
  }

  // Always load full-detail compressed GLB (1.12 MB cached) so crown halo geometry never facets;
  // downgrade shader cost only via MeshStandardMaterial on LOW tier.
  const useLowLod = tier === 'LOW';
  const chosenUrl = glbUrl || lowGlbUrl;

  const loader = new GLTFLoader();
  loader.setMeshoptDecoder(MeshoptDecoder);

      loader.load(
    chosenUrl,
    async (gltf) => {
      const model = gltf.scene;
      const box = new THREE.Box3().setFromObject(model);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());

      const targetH = 1046;
      const scale = targetH / size.y;
      innerGroup.scale.setScalar(scale);

      model.position.sub(center);
      model.rotation.y = -Math.PI / 2;
      innerGroup.add(model);

      model.traverse((child) => {
        if (!child.isMesh || !child.material) return;
        const origMat = child.material;
        const geo = child.geometry;
        geo.computeBoundingBox();
        const bbox = geo.boundingBox;

        const baseParams = {
          map: origMat.map || null,
          normalMap: origMat.normalMap || null,
          normalScale: new THREE.Vector2(1, 1),
          color: new THREE.Color('#a9b2ff'),
          roughness: 0.25,
          metalness: 0,
          emissive: new THREE.Color('#30227a'),
          emissiveIntensity: 0.5,
          envMapIntensity: 0.7,
          transparent: true,
          opacity: 0.88,
        };

        const mat = useLowLod
          ? new THREE.MeshStandardMaterial(baseParams)
          : new THREE.MeshPhysicalMaterial({
              ...baseParams,
              clearcoat: 1.0,
              clearcoatRoughness: 0.08,
              iridescence: 1.0,
              iridescenceIOR: 1.4,
              iridescenceThicknessRange: [200, 700],
              sheen: 0.5,
              sheenRoughness: 0.3,
              sheenColor: new THREE.Color('#9fe9ff'),
            });

        mat.onBeforeCompile = (shader) => {
          shader.uniforms.uTime = { value: 0 };
          shader.uniforms.uRimPulse = { value: 0 };
          shader.uniforms.uReveal = { value: 0 };
          shader.uniforms.uHaloGain = { value: 1 };
          shader.uniforms.uWarmth = { value: 0 };
          shader.uniforms.uSilhouette = { value: 0 };
          shader.uniforms.uBBoxMin = { value: bbox.min };
          shader.uniforms.uBBoxMax = { value: bbox.max };

          shader.vertexShader = `
            varying vec3 vObjPos;
            varying float vYF;
            uniform vec3 uBBoxMin;
            uniform vec3 uBBoxMax;
            ${shader.vertexShader}
          `.replace(
            '#include <begin_vertex>',
            `
            #include <begin_vertex>
            vObjPos = position;
            vYF = clamp((position.y - uBBoxMin.y) / (uBBoxMax.y - uBBoxMin.y), 0.0, 1.0);
            `
          );

          shader.fragmentShader = `
            varying vec3 vObjPos;
            varying float vYF;
            uniform float uTime;
            uniform float uRimPulse;
            uniform float uReveal;
            uniform float uHaloGain;
            uniform float uWarmth;
            uniform float uSilhouette;
            ${shader.fragmentShader}
          `
            .replace(
              '#include <clipping_planes_fragment>',
              `
              #include <clipping_planes_fragment>
              float zNorm = (vObjPos.z - (-0.035)) / 0.152;
              float yNorm = (vObjPos.y - 0.328) / 0.112;
              if ((zNorm * zNorm + yNorm * yNorm) < 1.0) {
                float distPlanet = length(vec2(vObjPos.z - (-0.031), vObjPos.y - 0.339));
                float distMoon = length(vec2(vObjPos.z - (-0.112), vObjPos.y - 0.294));
                if (distPlanet > 0.046 && distMoon > 0.02) {
                  discard;
                }
              }
              `
            )
            .replace(
              '#include <emissivemap_fragment>',
              `
              #include <emissivemap_fragment>
              float distPlanetP = length(vec2(vObjPos.z - (-0.031), vObjPos.y - 0.339));
              float distMoonP = length(vec2(vObjPos.z - (-0.112), vObjPos.y - 0.294));
              bool isPlanetOrMoon = (distPlanetP <= 0.046) || (distMoonP <= 0.02);

              float rim = pow(1.0 - abs(vNormal.z), 2.0);
              vec3 iriShift = mix(vec3(0.35, 0.95, 1.0), vec3(0.66, 0.4, 1.0), smoothstep(0.18, 0.82, vYF));
              iriShift = mix(iriShift, vec3(0.96, 0.56, 0.78), uWarmth * 0.42);
              vec3 rimColor = iriShift * rim * (1.8 + uRimPulse * 1.15 + uSilhouette * 1.1);
              totalEmissiveRadiance = mix(totalEmissiveRadiance, totalEmissiveRadiance * 0.25, uSilhouette * 0.65);
              totalEmissiveRadiance += rimColor;

              vec3 warmCore = vec3(1.0, 0.62, 0.55) * (0.55 + uWarmth * 0.45) * smoothstep(0.18, 0.42, vYF) * (1.0 - smoothstep(0.52, 0.68, vYF)) * pow(abs(vNormal.z), 2.5);
              totalEmissiveRadiance += warmCore * (1.0 - uSilhouette * 0.7);

              float ring = smoothstep(0.69, 0.73, vYF);
              float pulse = 0.85 + 0.15 * sin(uTime * 2.2);
              float haloEmissiveAtten = isPlanetOrMoon ? 0.5 : 1.0;
              vec3 haloEmissive = mix(vec3(0.06, 0.7, 1.0), vec3(0.95, 0.48, 0.78), uWarmth * 0.35) * ring * (0.9 + 2.2 * rim) * pulse * haloEmissiveAtten * uHaloGain;
              totalEmissiveRadiance += haloEmissive;

              // Holographic scan-sweep reveal wave on first entry
              if (uReveal < 1.18) {
                float wave = exp(-pow((vYF - uReveal) * 14.0, 2.0));
                totalEmissiveRadiance += vec3(0.37, 0.95, 1.0) * wave * 2.4;
              }
              `
            );

          customShaders.push(shader);
        };

        child.renderOrder = 2;
        origMat.dispose();
        child.material = mat;
        disposableResources.push(geo, mat);
        if (mat.map) disposableResources.push(mat.map);
        if (mat.normalMap) disposableResources.push(mat.normalMap);
      });

      if (camera && typeof renderer.compileAsync === 'function') {
        try {
          await renderer.compileAsync(model, camera, scene);
        } catch {
          // Safe fallback to synchronous shader compile on drivers without KHR_parallel_shader_compile
        }
      }

      loaded = true;
      if (typeof onLoaded === 'function') onLoaded();
    },
    undefined,
    (err) => {
      console.warn('[figureRig] GLB failed to load; retaining static pre-keyed poster:', err);
    }
  );

  function setSize(W, H) {
    const isMobile = W <= 820;
    const topPx = isMobile ? Math.max(200, Math.min(260, H * 0.3)) : 0;
    const boxH = H - topPx;
    coverUnit = Math.max(W / 2048, boxH / 1360);

    boxLeft = W / 2 - 1024 * coverUnit;
    boxTop = topPx + boxH / 2 - 680 * coverUnit;

    figureCoverRoot.position.set(boxLeft, -boxTop, 0);
    figureCoverRoot.scale.setScalar(coverUnit);

    headScreenX = boxLeft + 982 * coverUnit;
    headScreenY = boxTop + 450 * coverUnit;
  }

  function update({
    dt,
    time,
    pointer,
    W,
    H,
    paused,
    pointerSpeed = 0,
    pose = null,
  }) {
    if (!loaded) return;

    revealElapsed = Math.min(1.3, revealElapsed + dt * 0.95);
    rimPulse = rimPulse * 0.88 + pointerSpeed * 0.12;

    const targetHalo = pose?.haloGain ?? 1.0;
    const targetWarmth = pose?.warmth ?? 0.0;
    const targetSil = pose?.silhouette ?? 0.0;
    const paramEase = 1.0 - Math.exp(-dt * 4.0);
    curHaloGain += (targetHalo - curHaloGain) * paramEase;
    curWarmth += (targetWarmth - curWarmth) * paramEase;
    curSilhouette += (targetSil - curSilhouette) * paramEase;

    for (const shader of customShaders) {
      if (!shader.uniforms) continue;
      if (shader.uniforms.uTime) shader.uniforms.uTime.value = time;
      if (shader.uniforms.uReveal) shader.uniforms.uReveal.value = revealElapsed;
      if (shader.uniforms.uRimPulse) shader.uniforms.uRimPulse.value = rimPulse;
      if (shader.uniforms.uHaloGain) shader.uniforms.uHaloGain.value = curHaloGain;
      if (shader.uniforms.uWarmth) shader.uniforms.uWarmth.value = curWarmth;
      if (shader.uniforms.uSilhouette) shader.uniforms.uSilhouette.value = curSilhouette;
    }

    haloRingMat.uniforms.uTime.value = time;
    haloRingMat.uniforms.uGain.value = curHaloGain;
    haloRingMat.uniforms.uWarmth.value = curWarmth;
    haloRingMat.uniforms.uRimPulse.value = rimPulse;
    outerRingMat.uniforms.uTime.value = -time * 0.7;
    outerRingMat.uniforms.uGain.value = curHaloGain * 0.78;
    outerRingMat.uniforms.uWarmth.value = curWarmth;
    outerRingMat.uniforms.uRimPulse.value = rimPulse;

    if (paused) return;

    // Gentle ring oscillation synced to creature breath
    haloRingMesh.rotation.z = 0.08 + Math.sin(time * 0.7) * 0.04;
    outerRingMesh.rotation.z = -0.06 - Math.sin(time * 0.5) * 0.05;
    outerRingMesh.scale.setScalar(1.0 + 0.025 * Math.sin(time * 1.1) + rimPulse * 0.05);

    let dx = gyroOffsetX;
    let dy = gyroOffsetY;
    if (pointer.inside && pointer.moved) {
      dx = Math.max(-1, Math.min(1, (pointer.x - headScreenX) / Math.max(W * 0.5, 1)));
      dy = Math.max(-1, Math.min(1, (pointer.y - headScreenY) / Math.max(H * 0.5, 1)));
    }

    const baseYaw = pose?.yaw ?? 0;
    const basePitch = pose?.pitch ?? 0;
    const baseScale = pose?.scale ?? 1;
    const baseZ = pose?.z ?? 0;

    let targetPosX = 982;
    let targetPosY = -792;
    if (pose && typeof pose.screenX === 'number' && typeof pose.screenY === 'number') {
      const unit = Math.max(coverUnit, 1e-4);
      targetPosX = (pose.screenX - boxLeft) / unit;
      targetPosY = -((pose.screenY - boxTop) / unit);
    }

    const tYaw = baseYaw + 0.58 * dx + 0.025 * Math.sin(time * 0.6);
    const tPitch = basePitch + 0.18 * dy;
    const tRoll = -0.045 * dx;
    const tParallaxX = 14 * dx;
    const tBobY = 6 * Math.sin(time * 0.9);

    const easeK = 1.0 - Math.exp(-dt * 4.5);
    curYaw += (tYaw - curYaw) * easeK;
    curPitch += (tPitch - curPitch) * easeK;
    curRoll += (tRoll - curRoll) * easeK;
    curParallaxX += (tParallaxX - curParallaxX) * easeK;
    curScale += (baseScale - curScale) * easeK;
    curPosX += (targetPosX - curPosX) * easeK;
    curPosY += (targetPosY + tBobY - curPosY) * easeK;
    curPosZ += (baseZ - curPosZ) * easeK;

    turnGroup.rotation.y = curYaw;
    turnGroup.rotation.x = curPitch;
    turnGroup.rotation.z = curRoll;
    turnGroup.scale.setScalar(curScale);

    rootGroup.position.x = curPosX + curParallaxX;
    rootGroup.position.y = curPosY;
    rootGroup.position.z = curPosZ;

    // Keep pointer gaze anchored on where the figure currently stands
    headScreenX = boxLeft + rootGroup.position.x * coverUnit;
    headScreenY = boxTop + (-rootGroup.position.y - 340 * curScale) * coverUnit;
  }

  function dispose() {
    window.removeEventListener('deviceorientation', onDeviceOrientation);
    envTex.dispose();
    for (const res of disposableResources) {
      res?.dispose?.();
    }
  }

  return {
    isLoaded: () => loaded,
    setSize,
    update,
    dispose,
  };
}
