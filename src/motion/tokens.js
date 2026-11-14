/**
 * Unified Motion Language Tokens & Kinetic Typography Primitives (S13)
 * - Single shared easing, duration, and stagger vocabulary across all routes.
 * - Masked line reveals, HUD decode scramble, and per-digit odometer/roll helpers.
 * - Respects prefers-reduced-motion cleanly (instant clear state, zero transform locking).
 */
import { prefersReducedMotion } from '../utils/env.js';
import { stageBus } from './stageBus.js';

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

/**
 * Generates HTML for a per-digit rolling odometer display (e.g. "12 12 2026").
 */
export function renderCounterRoll(value, { label = '', className = '' } = {}) {
  const str = String(value ?? '');
  const digits = '0123456789';
  const tokens = Array.from(str).map((ch, idx) => {
    if (/[0-9]/.test(ch)) {
      return `<span class="k-digit-slot" style="--d:${ch};--di:${idx}" aria-hidden="true"><span class="k-digit-reel">${Array.from(digits).map((d) => `<span>${d}</span>`).join('')}</span></span>`;
    }
    if (ch === ' ') {
      return '<span class="k-digit-gap" aria-hidden="true">&nbsp;</span>';
    }
    return `<span class="k-digit-sep" aria-hidden="true">${ch}</span>`;
  }).join('');

  return `<span class="k-counter-roll ${className}" data-counter-roll="true" aria-label="${label || str}">${tokens}</span>`;
}

/**
 * Triggers per-digit counter rolls once on intersection (instant in reduced-motion).
 */
export function attachCounterRolls(root = document) {
  const nodes = Array.from(root.querySelectorAll('[data-counter-roll="true"]'));
  if (!nodes.length) return () => {};

  if (prefersReducedMotion()) {
    nodes.forEach((n) => n.classList.add('is-rolled'));
    return () => {};
  }

  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-rolled');
          io.unobserve(entry.target);
        }
      }
    },
    { threshold: 0.25 }
  );

  nodes.forEach((n) => io.observe(n));
  return () => io.disconnect();
}

/**
 * Drives `--fill-p` (0..1) on [data-outline-fill="true"] giant display elements from scroll progress.
 */
export function attachOutlineToFill(root = document) {
  const nodes = Array.from(root.querySelectorAll('[data-outline-fill="true"]'));
  if (!nodes.length) return () => {};

  if (prefersReducedMotion()) {
    nodes.forEach((n) => n.style.setProperty('--fill-p', '1'));
    return () => {};
  }

  function update() {
    const vh = window.innerHeight || 800;
    for (const el of nodes) {
      const r = el.getBoundingClientRect();
      const raw = (vh * 0.88 - r.top) / Math.max(180, vh * 0.56);
      const clamped = Math.max(0, Math.min(1, raw));
      el.style.setProperty('--fill-p', clamped.toFixed(3));
    }
  }

  const unsub = stageBus.on((ev) => {
    if (ev === 'scroll') update();
  });
  window.addEventListener('scroll', update, { passive: true });
  update();

  return () => {
    unsub();
    window.removeEventListener('scroll', update);
  };
}

/**
 * Expands letter-spacing dynamically with scroll velocity & viewport transit on [data-track-scroll="true"].
 */
export function attachVariableTracking(root = document) {
  const nodes = Array.from(root.querySelectorAll('[data-track-scroll="true"]'));
  if (!nodes.length) return () => {};

  if (prefersReducedMotion()) {
    nodes.forEach((n) => n.style.setProperty('--track-p', '0'));
    return () => {};
  }

  function update() {
    const vh = window.innerHeight || 800;
    const velBoost = Math.min(0.35, Math.abs(stageBus.scrollVelocity || 0) * 0.012);
    for (const el of nodes) {
      const r = el.getBoundingClientRect();
      const centerDist = Math.abs((r.top + r.height * 0.5) - vh * 0.5) / Math.max(240, vh * 0.65);
      const p = Math.min(1, Math.max(0, 1 - centerDist) * 0.65 + velBoost);
      el.style.setProperty('--track-p', p.toFixed(3));
    }
  }

  const unsub = stageBus.on((ev) => {
    if (ev === 'scroll') update();
  });
  window.addEventListener('scroll', update, { passive: true });
  update();

  return () => {
    unsub();
    window.removeEventListener('scroll', update);
  };
}

/**
 * Wraps [data-hover-glyph="true"] elements with an echo layer for crisp chromatic displacement on hover.
 */
export function attachHoverGlyphs(root = document) {
  const nodes = Array.from(root.querySelectorAll('[data-hover-glyph="true"]'));
  for (const el of nodes) {
    if (el.dataset.glyphReady === '1') continue;
    const txt = (el.textContent || '').trim();
    if (!txt) continue;
    el.dataset.glyphReady = '1';
    if (!el.getAttribute('aria-label')) el.setAttribute('aria-label', txt);
    el.classList.add('k-hover-glyph');
    el.innerHTML = `<span class="k-glyph-base">${txt}</span><span class="k-glyph-echo" aria-hidden="true">${txt}</span>`;
  }
  return () => {};
}

/**
 * Single orchestrator for all S13 kinetic typography primitives inside a mounted route view.
 */
export function initSectionMotion(root = document) {
  const cleanups = [
    attachMaskedLineReveals(root),
    attachHudScrambleReveals(root),
    attachCounterRolls(root),
    attachOutlineToFill(root),
    attachVariableTracking(root),
    attachHoverGlyphs(root),
  ];
  return () => cleanups.forEach((fn) => fn?.());
}
