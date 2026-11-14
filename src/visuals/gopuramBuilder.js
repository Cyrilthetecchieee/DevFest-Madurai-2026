/**
 * Procedural Holographic Meenakshi-Inspired Gopuram (S3)
 * - Instanced stepped tiers (talas), corner shrine pilasters, barrel-vault shikhara, and kalasams.
 * - Custom shader with vertical holographic scan-sweep reveal & palette glow.
 * - Exports sampleGopuramPoints() for S4 GPU Particle Morph target.
 */
import * as THREE from 'three';

const VS_GOPURAM = /* glsl */ `
  varying vec3 vWorldPos;
  varying float vHeightNorm;
  varying vec2 vLocalUv;
  uniform float uHeight;

  void main() {
    vLocalUv = uv;
    vec4 wp = modelMatrix * instanceMatrix * vec4(position, 1.0);
    vWorldPos = wp.xyz;
    vHeightNorm = clamp(wp.y / max(uHeight, 0.001), 0.0, 1.0);
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`;

const FS_GOPURAM = /* glsl */ `
  precision highp float;
  varying vec3 vWorldPos;
  varying float vHeightNorm;
  varying vec2 vLocalUv;
  uniform float uTime;
  uniform float uScan;
  uniform float uVisibility;

  void main() {
    if (uVisibility < 0.01) discard;

    // Holographic wireframe edge mask inside each instanced cell
    vec2 edge = min(vLocalUv, 1.0 - vLocalUv);
    float wire = 1.0 - smoothstep(0.03, 0.14, min(edge.x, edge.y));
    float gridY = smoothstep(0.86, 0.98, abs(sin(vHeightNorm * 42.0 + uTime * 0.4)));

    // Scan-sweep wavefront traveling vertically up the tower
    float scanLine = exp(-pow((vHeightNorm - uScan) * 14.0, 2.0));
    float revealed = smoothstep(uScan + 0.08, uScan - 0.12, vHeightNorm);

    vec3 baseCol = mix(vec3(0.369, 0.953, 1.0), vec3(0.608, 0.361, 1.0), vHeightNorm);
    vec3 col = baseCol * (0.28 + wire * 1.15 + gridY * 0.45) + vec3(0.95, 0.98, 1.0) * scanLine * 1.5;
    float alpha = (0.14 + wire * 0.62 + scanLine * 0.65) * uVisibility * mix(0.25, 1.0, revealed);

    gl_FragColor = vec4(col, clamp(alpha, 0.0, 0.95));
  }
`;

/**
 * Generates surface & frame points for the GPU particle morph gopuram silhouette.
 */
export function sampleGopuramPoints(count) {
  const out = new Float32Array(count * 3);
  const tiers = 7;
  let ptr = 0;

  for (let i = 0; i < count; i++) {
    const r0 = ((i * 7919) % 10000) / 10000;
    const r1 = ((i * 15485863) % 10000) / 10000;
    const r2 = ((i * 32452843) % 10000) / 10000;

    if (i % 14 === 0) {
      // Kalasam spires on crown crest
      const spireIdx = i % 5;
      const sx = (spireIdx - 2) * 0.36;
      const sy = 1.85 + r0 * 0.55;
      const sz = (r1 - 0.5) * 0.16;
      out[ptr++] = sx;
      out[ptr++] = sy;
      out[ptr++] = sz;
      continue;
    }

    const tierIdx = i % tiers;
    const tNorm = tierIdx / (tiers - 1);
    const halfW = 1.95 * (1 - tNorm * 0.52);
    const halfD = 0.72 * (1 - tNorm * 0.45);
    const yBase = -1.7 + tNorm * 3.25;
    const tierH = 0.44;

    // Distribute along perimeter facades + niches
    const side = r0 < 0.72 ? (r1 < 0.5 ? 1 : -1) : 0;
    let x, z;
    if (side !== 0) {
      x = (r2 - 0.5) * 2 * halfW;
      z = side * halfD;
    } else {
      x = (r1 < 0.5 ? -1 : 1) * halfW;
      z = (r2 - 0.5) * 2 * halfD;
    }
    const y = yBase + ((i * 31) % 17) / 17 * tierH;

    out[ptr++] = x * 1.1;
    out[ptr++] = y * 0.92;
    out[ptr++] = z * 1.1;
  }

  return out;
}

export function createProceduralGopuram(scene, { isMobile = false } = {}) {
  const group = new THREE.Group();
  const baseGeo = new THREE.BoxGeometry(1, 1, 1);
  const mat = new THREE.ShaderMaterial({
    vertexShader: VS_GOPURAM,
    fragmentShader: FS_GOPURAM,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uHeight: { value: 9.5 },
      uTime: { value: 0 },
      uScan: { value: 0 },
      uVisibility: { value: 0 },
    },
  });

  // Compute instance transforms across 7 stepped tiers + 5 kalasams + inner shrine gateway
  const matrices = [];
  const dummy = new THREE.Object3D();
  const tiers = 7;

  // Main sanctuary base pylon (two symmetrical flanks leaving central gateway)
  [-1.65, 1.65].forEach((px) => {
    dummy.position.set(px, 0.7, 0);
    dummy.scale.set(2.2, 1.4, 2.0);
    dummy.updateMatrix();
    matrices.push(dummy.matrix.clone());
  });

  // Stepped tapering tiers
  for (let t = 0; t < tiers; t++) {
    const tn = t / (tiers - 1);
    const tierW = 5.4 * (1 - tn * 0.48);
    const tierD = 2.15 * (1 - tn * 0.42);
    const y = 1.65 + t * 0.92;

    // Core cornice beam
    dummy.position.set(0, y, 0);
    dummy.scale.set(tierW, 0.34, tierD);
    dummy.updateMatrix();
    matrices.push(dummy.matrix.clone());

    // Decorative kutas/salas shrines along each tier front & back
    const countOnTier = Math.max(3, 7 - t);
    for (let k = 0; k < countOnTier; k++) {
      const kx = ((k / (countOnTier - 1)) - 0.5) * (tierW * 0.88);
      dummy.position.set(kx, y + 0.42, 0);
      dummy.scale.set(0.32, 0.56, tierD * 0.94);
      dummy.updateMatrix();
      matrices.push(dummy.matrix.clone());
    }
  }

  // Crown sala vault + 5 Kalasam finials
  dummy.position.set(0, 8.2, 0);
  dummy.scale.set(2.55, 0.65, 1.05);
  dummy.updateMatrix();
  matrices.push(dummy.matrix.clone());

  for (let k = 0; k < 5; k++) {
    dummy.position.set((k - 2) * 0.5, 8.92, 0);
    dummy.scale.set(0.14, 0.85, 0.14);
    dummy.updateMatrix();
    matrices.push(dummy.matrix.clone());
  }

  const instanced = new THREE.InstancedMesh(baseGeo, mat, matrices.length);
  matrices.forEach((m, idx) => instanced.setMatrixAt(idx, m));
  instanced.instanceMatrix.needsUpdate = true;
  instanced.frustumCulled = false;
  group.add(instanced);

  group.position.set(isMobile ? 0 : 3.2, -3.2, -16);
  group.scale.setScalar(0.95);
  scene.add(group);

  function update({ time, scrollProgress, routeKey, warpBoost }) {
    mat.uniforms.uTime.value = time;
    // Peaks strongly at Venue waypoint (scroll ~0.16..0.38) and reappears at Footer (~0.88)
    const venuePeak = Math.exp(-Math.pow((scrollProgress - 0.25) / 0.14, 2));
    const footerPeak = Math.exp(-Math.pow((scrollProgress - 0.88) / 0.12, 2)) * 0.65;
    const isHome = routeKey === 'home';
    const vis = isHome ? Math.min(1, Math.max(venuePeak, footerPeak) + warpBoost * 0.4) : 0.18;

    mat.uniforms.uVisibility.value = vis;
    mat.uniforms.uScan.value = (time * 0.28) % 1.25;
    group.rotation.y = Math.sin(time * 0.22) * 0.18 + scrollProgress * Math.PI * 0.35;
    group.visible = vis > 0.02;
  }

  function dispose() {
    baseGeo.dispose();
    mat.dispose();
  }

  return { group, update, dispose };
}
