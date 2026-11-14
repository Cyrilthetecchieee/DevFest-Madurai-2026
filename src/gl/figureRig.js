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
  let headScreenX = 0;
  let headScreenY = 0;

  let curYaw = 0;
  let curPitch = 0;
  let curRoll = 0;
  let curParallaxX = 0;
  let curBobY = 0;
  let revealElapsed = 0;
  let rimPulse = 0;

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

  const useLowLod = tier === 'LOW' && Boolean(lowGlbUrl);
  const chosenUrl = useLowLod ? lowGlbUrl : glbUrl;

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
              vec3 rimColor = iriShift * rim * (1.8 + uRimPulse * 1.15);
              totalEmissiveRadiance += rimColor;

              vec3 warmCore = vec3(1.0, 0.62, 0.55) * 0.55 * smoothstep(0.18, 0.42, vYF) * (1.0 - smoothstep(0.52, 0.68, vYF)) * pow(abs(vNormal.z), 2.5);
              totalEmissiveRadiance += warmCore;

              float ring = smoothstep(0.69, 0.73, vYF);
              float pulse = 0.85 + 0.15 * sin(uTime * 2.2);
              float haloEmissiveAtten = isPlanetOrMoon ? 0.5 : 1.0;
              vec3 haloEmissive = vec3(0.06, 0.7, 1.0) * ring * (0.9 + 2.2 * rim) * pulse * haloEmissiveAtten;
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

    const boxLeft = W / 2 - 1024 * coverUnit;
    const boxTop = topPx + boxH / 2 - 680 * coverUnit;

    figureCoverRoot.position.set(boxLeft, -boxTop, 0);
    figureCoverRoot.scale.setScalar(coverUnit);

    headScreenX = boxLeft + 982 * coverUnit;
    headScreenY = boxTop + 450 * coverUnit;
  }

  function update({ dt, time, pointer, W, H, paused, scrollProgress = 0, pointerSpeed = 0 }) {
    if (!loaded) return;

    revealElapsed = Math.min(1.3, revealElapsed + dt * 0.95);
    rimPulse = rimPulse * 0.88 + pointerSpeed * 0.12;

    for (const shader of customShaders) {
      if (!shader.uniforms) continue;
      if (shader.uniforms.uTime) shader.uniforms.uTime.value = time;
      if (shader.uniforms.uReveal) shader.uniforms.uReveal.value = revealElapsed;
      if (shader.uniforms.uRimPulse) shader.uniforms.uRimPulse.value = rimPulse;
    }

    if (paused) return;

    let dx = gyroOffsetX;
    let dy = gyroOffsetY;
    if (pointer.inside && pointer.moved) {
      dx = Math.max(-1, Math.min(1, (pointer.x - headScreenX) / Math.max(W / 2, 1)));
      dy = Math.max(-1, Math.min(1, (pointer.y - headScreenY) / Math.max(H / 2, 1)));
    }

    // Hero-to-content recession & scroll-linked yaw (#3, #7)
    const heroExit = Math.min(1, scrollProgress * 4.5);
    const tYaw = 0.62 * dx + 0.025 * Math.sin(time * 0.6) + heroExit * 0.42;
    const tPitch = 0.2 * dy - heroExit * 0.12;
    const tRoll = -0.045 * dx;
    const tParallaxX = 14 * dx;
    const tBobY = 5 * Math.sin(time * 0.9) - heroExit * 90;

    const easeK = 1.0 - Math.exp(-dt * 4.2);
    curYaw += (tYaw - curYaw) * easeK;
    curPitch += (tPitch - curPitch) * easeK;
    curRoll += (tRoll - curRoll) * easeK;
    curParallaxX += (tParallaxX - curParallaxX) * easeK;
    curBobY += (tBobY - curBobY) * easeK;

    turnGroup.rotation.y = curYaw;
    turnGroup.rotation.x = curPitch;
    turnGroup.rotation.z = curRoll;
    turnGroup.scale.setScalar(1.0 - heroExit * 0.22);

    rootGroup.position.x = 982 + curParallaxX;
    rootGroup.position.y = -792 + curBobY;
    rootGroup.position.z = -heroExit * 340;
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
