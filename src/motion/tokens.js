/**
 * Unified Motion Language Tokens & Kinetic Typography Primitives (S13)
 * - Single shared easing, duration, and stagger vocabulary across all routes.
 * - Masked line reveals, HUD decode scramble, and per-digit odometer/roll helpers.
 * - Respects prefers-reduced-motion cleanly (instant clear state, zero transform locking).
 */
import { prefersReducedMotion } from '../utils/env.js';

export const MOTION = Object.freeze({
  easeOutExpo: 'power3.out',
  easeInOutQuart: 'power2.inOut',
  easeCssExpo: 'cubic-bezier(0.22, 1, 0.36, 1)',
  durationFast: 0.24,
  durationReveal: 0.68,
  durationSlow: 1.05,
  staggerLine: 0.055,
  staggerNode: 0.04,
});

const SCRAMBLE_GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/+:.';

/**
 * Scramble / decode effect for uppercase HUD telemetry labels (never breaks screen-reader aria-label).
 */
export function scrambleText(el, { durationMs = 520, finalText = null } = {}) {
  if (!el) return () => {};
  const target = finalText ?? el.dataset.text ?? el.textContent ?? '';
  el.dataset.text = target;
  if (!el.getAttribute('aria-label')) el.setAttribute('aria-label', target);

  if (prefersReducedMotion()) {
    el.textContent = target;
    return () => {};
  }

  let rafId = 0;
  const start = performance.now();
  const len = target.length;

  function step(now) {
    const p = Math.min(1, (now - start) / durationMs);
    const lockedCount = Math.floor(p * len);
    let out = '';
    for (let i = 0; i < len; i++) {
      const ch = target[i];
      if (i < lockedCount || ch === ' ' || ch === '/' || ch === '·' || ch === ':') {
        out += ch;
      } else {
        out += SCRAMBLE_GLYPHS[Math.floor((now * 0.07 + i * 7) % SCRAMBLE_GLYPHS.length)];
      }
    }
    el.textContent = out;
    if (p < 1) {
      rafId = window.requestAnimationFrame(step);
    } else {
      el.textContent = target;
    }
  }

  rafId = window.requestAnimationFrame(step);
  return () => window.cancelAnimationFrame(rafId);
}

/**
 * Splits a heading into masked clipped lines (`span.k-line > span.k-line-inner`) and reveals on intersection.
 */
export function attachMaskedLineReveals(root = document) {
  const headings = Array.from(root.querySelectorAll('[data-reveal="mask"]'));
  if (!headings.length) return () => {};

  const reduced = prefersReducedMotion();
  const observers = [];

  for (const el of headings) {
    if (el.dataset.maskedReady === '1') continue;
    el.dataset.maskedReady = '1';

    const rawText = (el.textContent || '').trim();
    if (!rawText) continue;
    const words = rawText.split(/\s+/);
    el.setAttribute('aria-label', rawText);
    el.innerHTML = words
      .map(
        (w, i) =>
          `<span class="k-word-clip" aria-hidden="true"><span class="k-word-inner" style="--wi:${i}">${w}</span></span>`
      )
      .join(' ');

    if (reduced) {
      el.classList.add('is-revealed');
      continue;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            el.classList.add('is-revealed');
            io.unobserve(el);
          }
        }
      },
      { threshold: 0.16, rootMargin: '0px 0px -8% 0px' }
    );
    io.observe(el);
    observers.push(io);
  }

  return () => observers.forEach((io) => io.disconnect());
}

/**
 * Observes [data-scramble="true"] elements once on entry into viewport.
 */
export function attachHudScrambleReveals(root = document) {
  const nodes = Array.from(root.querySelectorAll('[data-scramble="true"]'));
  if (!nodes.length) return () => {};

  const stops = new Set();
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const stop = scrambleText(entry.target, { durationMs: 460 });
        stops.add(stop);
        io.unobserve(entry.target);
      }
    },
    { threshold: 0.25 }
  );

  nodes.forEach((n) => io.observe(n));
  return () => {
    io.disconnect();
    stops.forEach((s) => s());
  };
}
