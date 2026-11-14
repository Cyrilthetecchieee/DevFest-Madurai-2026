/**
 * Calm UI Motion Tokens (no hidden text, no scroll hijacking, reduced-motion safe).
 */
export const MOTION = Object.freeze({
  easeOutExpo: 'power3.out',
  easeCssExpo: 'cubic-bezier(0.22, 1, 0.36, 1)',
  durationFast: 0.2,
  durationReveal: 0.45,
});

export function initSectionMotion() {
  return () => {};
}
