/**
 * Shared Real-Time Motion & Stage Bus
 * Single source of truth connecting Lenis scroll, Fluid Cursor, HUD, and persistent WebGL passes.
 */
export const stageBus = {
  // Normalized pointer coordinates (0..1 screen space) & smoothed velocity
  pointerX: 0.5,
  pointerY: 0.5,
  pointerVx: 0,
  pointerVy: 0,
  pointerSpeed: 0,
  pointerActive: false,

  // Continuous scroll telemetry updated by Lenis + GSAP ticker
  scrollY: 0,
  scrollMax: 1,
  scrollProgress: 0, // 0..1 across current document
  scrollVelocity: 0, // signed px/frame normalized

  // Waypoint camera & morph targets
  routeKey: 'home',
  waypointIndex: 0, // 0: hero, 1: about, 2: venue, 3: speakers, 4: agenda, 5: tickets, 6: cfp, 7: sponsors, 8: memories, 9: footer
  warpBoost: 0, // temporary burst for easter eggs / transitions
  irisProgress: 0, // 0 = idle, 0..1 = route transition pulse

  // External triggers registered lazily once subsystems boot
  _listeners: new Set(),
  emit(event, payload) {
    for (const cb of this._listeners) {
      try {
        cb(event, payload);
      } catch (err) {
        console.error('[stageBus] listener error:', err);
      }
    }
  },
  on(cb) {
    this._listeners.add(cb);
    return () => this._listeners.delete(cb);
  },
};
