/**
 * Continuous Camera Fly-Through Path (S1)
 * Maps scrollProgress (0..1) cleanly onto a 10-waypoint Catmull-Rom 3D path
 * glided smoothly over the Madurai skyline, Gopuram, and Morphing Particle stages.
 */
import * as THREE from 'three';

const WAYPOINTS = [
  { pos: [0.0, 0.2, 1.5], look: [0.0, 0.15, -8.5], roll: 0.0, fov: 44 },     // 0: Hero
  { pos: [-1.4, 0.6, -1.2], look: [0.4, 0.1, -9.0], roll: -0.025, fov: 46 }, // 1: About
  { pos: [1.9, -0.3, -3.0], look: [1.5, -0.1, -15.0], roll: 0.03, fov: 48 }, // 2: Venue + Gopuram
  { pos: [-0.8, 0.9, -2.5], look: [-0.2, 0.2, -9.5], roll: -0.02, fov: 43 }, // 3: Speakers
  { pos: [0.6, 0.2, -1.8], look: [0.0, 0.0, -9.0], roll: 0.015, fov: 41 },   // 4: Agenda
  { pos: [-1.1, -0.4, -2.2], look: [0.0, 0.2, -8.8], roll: -0.02, fov: 45 }, // 5: Tickets / Badge
  { pos: [1.2, 0.5, -1.6], look: [0.2, 0.1, -9.2], roll: 0.022, fov: 42 },   // 6: CFP
  { pos: [-0.5, 0.3, -2.0], look: [0.0, -0.2, -9.8], roll: -0.01, fov: 44 }, // 7: Sponsors
  { pos: [0.9, -0.6, -2.8], look: [0.0, -0.3, -11.0], roll: 0.018, fov: 47 },// 8: Memories
  { pos: [0.0, 1.1, 0.4], look: [0.0, 0.2, -10.5], roll: 0.0, fov: 40 },     // 9: Footer Horizon
];

export function createCameraFlythrough(aspect = 16 / 9) {
  const camera = new THREE.PerspectiveCamera(44, aspect, 0.1, 140);
  const posCurve = new THREE.CatmullRomCurve3(WAYPOINTS.map((w) => new THREE.Vector3(...w.pos)));
  const lookCurve = new THREE.CatmullRomCurve3(WAYPOINTS.map((w) => new THREE.Vector3(...w.look)));

  const curPos = new THREE.Vector3(...WAYPOINTS[0].pos);
  const curLook = new THREE.Vector3(...WAYPOINTS[0].look);
  const targetPos = new THREE.Vector3();
  const targetLook = new THREE.Vector3();
  let curRoll = 0;
  let curFov = 44;

  function setSize(W, H) {
    camera.aspect = W / Math.max(H, 1);
    camera.updateProjectionMatrix();
  }

  function update({ dt, scrollProgress, pointerX, pointerY, routeKey, warpBoost }) {
    let t = Math.max(0, Math.min(1, scrollProgress));
    if (routeKey === 'speakers') t = 0.34 + scrollProgress * 0.2;
    else if (routeKey === 'memories') t = 0.72 + scrollProgress * 0.22;

    posCurve.getPointAt(t, targetPos);
    lookCurve.getPointAt(t, targetLook);

    // Interpolate roll & FOV smoothly across waypoints
    const segF = t * (WAYPOINTS.length - 1);
    const i0 = Math.min(WAYPOINTS.length - 2, Math.floor(segF));
    const frac = segF - i0;
    const tRoll = WAYPOINTS[i0].roll + (WAYPOINTS[i0 + 1].roll - WAYPOINTS[i0].roll) * frac;
    const tFov = WAYPOINTS[i0].fov + (WAYPOINTS[i0 + 1].fov - WAYPOINTS[i0].fov) * frac + warpBoost * 12;

    // Gentle pointer look offset
    const px = (pointerX - 0.5) * 0.9;
    const py = (0.5 - pointerY) * 0.55;
    targetPos.x += px * 0.45;
    targetPos.y += py * 0.35;
    targetLook.x += px * 0.65;
    targetLook.y += py * 0.45;

    const easeK = 1 - Math.exp(-dt * 5.2);
    curPos.lerp(targetPos, easeK);
    curLook.lerp(targetLook, easeK);
    curRoll += (tRoll - curRoll) * easeK;
    curFov += (tFov - curFov) * easeK;

    camera.position.copy(curPos);
    camera.lookAt(curLook);
    camera.rotation.z += curRoll;
    if (Math.abs(camera.fov - curFov) > 0.05) {
      camera.fov = curFov;
      camera.updateProjectionMatrix();
    }
  }

  return { camera, setSize, update };
}
