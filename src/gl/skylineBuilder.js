/**
 * Procedural Madurai Night Skyline & Horizon Mesh (S1)
 * Stylized architectural silhouette ridges beneath the 3D fly-through camera path.
 */
import * as THREE from 'three';

const VS_SKYLINE = /* glsl */ `
  varying vec2 vUv;
  varying float vElev;
  void main() {
    vUv = uv;
    vElev = position.y;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const FS_SKYLINE = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  varying float vElev;
  uniform float uTime;
  uniform float uOpacity;

  void main() {
    if (uOpacity < 0.01) discard;
    float rim = smoothstep(0.0, 0.35, vUv.y);
    float ridgeGlow = smoothstep(0.76, 1.0, vUv.y);
    float pulse = 0.75 + 0.25 * sin(vUv.x * 28.0 + uTime * 0.8);

    vec3 navy = vec3(0.024, 0.035, 0.165);
    vec3 rimCol = mix(vec3(0.369, 0.953, 1.0), vec3(0.608, 0.361, 1.0), vUv.x);
    vec3 col = mix(navy, rimCol * 0.48, ridgeGlow * pulse);
    float alpha = (0.55 * rim + ridgeGlow * 0.55) * uOpacity;

    gl_FragColor = vec4(col, alpha);
  }
`;

export function createMaduraiSkyline(scene) {
  const segs = 120;
  const width = 52;
  const height = 3.2;

  const geo = new THREE.PlaneGeometry(width, height, segs, 1);
  const pos = geo.attributes.position;

  // Sculpt stepped architectural horizon with iconic silhouette notches
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    if (y > 0) {
      const tower =
        Math.exp(-Math.pow((x - 6.5) / 1.4, 2)) * 2.1 +
        Math.exp(-Math.pow((x + 8.5) / 1.1, 2)) * 1.55 +
        Math.exp(-Math.pow((x - 16.0) / 0.9, 2)) * 1.2;
      const urban = Math.floor(((Math.sin(x * 1.9) * 0.5 + 0.5) * 4.0)) * 0.22;
      const vaigaiDip = Math.cos(x * 0.35) * 0.18;
      pos.setY(i, Math.max(0.15, height * 0.4 + urban + tower + vaigaiDip));
    }
  }
  geo.computeVertexNormals();

  const mat = new THREE.ShaderMaterial({
    vertexShader: VS_SKYLINE,
    fragmentShader: FS_SKYLINE,
    transparent: true,
    depthWrite: false,
    uniforms: {
      uTime: { value: 0 },
      uOpacity: { value: 0 },
    },
  });

  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(0, -4.6, -24);
  mesh.frustumCulled = false;
  scene.add(mesh);

  // Perspective horizon grid floor leading toward temple city towers
  const grid = new THREE.GridHelper(64, 36, 0x5ef3ff, 0x1d2563);
  grid.position.set(0, -4.8, -22);
  grid.material.transparent = true;
  grid.material.opacity = 0;
  scene.add(grid);

  function update({ time, scrollProgress }) {
    const afterHero = Math.min(1, Math.max(0, (scrollProgress - 0.04) * 5.0));
    mat.uniforms.uTime.value = time;
    mat.uniforms.uOpacity.value = afterHero * 0.72;
    grid.material.opacity = afterHero * 0.16;
    mesh.visible = afterHero > 0.01;
    grid.visible = afterHero > 0.01;
  }

  function dispose() {
    geo.dispose();
    mat.dispose();
    grid.geometry.dispose();
    grid.material.dispose();
  }

  return { update, dispose };
}
