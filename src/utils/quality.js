/**
 * Adaptive Quality Governor
 * Tiers: HIGH | MEDIUM | LOW
 * - Respects ?tier=high|medium|low query override for benchmarking/debugging.
 * - Initial selection uses hardware concurrency, device memory, viewport, and software GL heuristic.
 * - Steps down 1 tier when rolling average frame time > 20ms for 2,000ms continuously.
 * - Recovers upward when rolling average < 13ms for 4,000ms (with hysteresis cooldown).
 */

import { detectSoftwareRenderer } from './env.js';

export const TIERS = Object.freeze({
  HIGH: 'HIGH',
  MEDIUM: 'MEDIUM',
  LOW: 'LOW',
});

const TIER_ORDER = [TIERS.LOW, TIERS.MEDIUM, TIERS.HIGH];

export const TIER_CONFIG = Object.freeze({
  [TIERS.HIGH]: {
    maxDpr: 2,
    renderScale: 1.0,
    skySegments: 1,
    trailEnabled: true,
    trailSamples: 3,
    ambientPasses: 4,
    figurePixelScale: 1.0,
    pauseOffscreen: true,
  },
  [TIERS.MEDIUM]: {
    maxDpr: 1.5,
    renderScale: 0.9,
    skySegments: 1,
    trailEnabled: true,
    trailSamples: 2,
    ambientPasses: 2,
    figurePixelScale: 0.9,
    pauseOffscreen: true,
  },
  [TIERS.LOW]: {
    maxDpr: 1.0,
    renderScale: 0.72,
    skySegments: 1,
    trailEnabled: false,
    trailSamples: 1,
    ambientPasses: 1,
    figurePixelScale: 0.72,
    pauseOffscreen: true,
  },
});

function parseQueryTier() {
  if (!import.meta.env.DEV) return null;
  try {
    const params = new URLSearchParams(window.location.search);
    const raw = params.get('tier')?.toUpperCase();
    const unlock = params.get('unlock') === '1';
    return TIER_ORDER.includes(raw) ? { tier: raw, locked: !unlock } : null;
  } catch {
    return null;
  }
}

function detectInitialTier() {
  const forced = parseQueryTier();
  if (forced) return forced;

  const isSoftware = detectSoftwareRenderer();
  if (isSoftware) return { tier: TIERS.LOW, locked: false };

  const cores = navigator.hardwareConcurrency || 4;
  const mem = navigator.deviceMemory || 4;
  const mobile = window.innerWidth <= 820;

  if (cores <= 2 || mem <= 2) return { tier: TIERS.LOW, locked: false };
  if (mobile || cores <= 4 || mem <= 4) return { tier: TIERS.MEDIUM, locked: false };
  return { tier: TIERS.HIGH, locked: false };
}

export function createQualityGovernor() {
  const { tier: initialTier, locked } = detectInitialTier();
  let currentTier = initialTier;
  let overBudgetMs = 0;
  let underBudgetMs = 0;
  let lastTransitionAt = 0;
  let fpsEstimate = 60;
  let avgFrameMs = 16.67;

  const history = new Float32Array(90);
  let historyIdx = 0;
  let historyCount = 0;
  const listeners = new Set();

  function notify(reason) {
    const payload = {
      tier: currentTier,
      locked,
      config: TIER_CONFIG[currentTier],
      avgFrameMs,
      fpsEstimate,
      reason,
    };
    for (const cb of listeners) {
      try {
        cb(payload);
      } catch (err) {
        console.error('[quality] listener error:', err);
      }
    }
  }

  function stepDown(now) {
    const idx = TIER_ORDER.indexOf(currentTier);
    if (idx <= 0) return false;
    currentTier = TIER_ORDER[idx - 1];
    overBudgetMs = 0;
    underBudgetMs = 0;
    lastTransitionAt = now;
    notify('step-down');
    return true;
  }

  function stepUp(now) {
    const idx = TIER_ORDER.indexOf(currentTier);
    if (idx >= TIER_ORDER.length - 1) return false;
    currentTier = TIER_ORDER[idx + 1];
    overBudgetMs = 0;
    underBudgetMs = 0;
    lastTransitionAt = now;
    notify('recovery');
    return true;
  }

  function recordFrame(dtMs, now = performance.now()) {
    // Ignore giant tab-switch spikes (> 1200ms) so switching windows does not punish tier.
    if (dtMs <= 0 || dtMs > 1200) return;

    history[historyIdx] = dtMs;
    historyIdx = (historyIdx + 1) % history.length;
    if (historyCount < history.length) historyCount++;

    let sum = 0;
    for (let i = 0; i < historyCount; i++) sum += history[i];
    avgFrameMs = sum / historyCount;
    fpsEstimate = avgFrameMs > 0 ? Math.min(240, 1000 / avgFrameMs) : 60;

    if (locked || historyCount < 6) return;

    const cooldownElapsed = now - lastTransitionAt > 3000;
    if (avgFrameMs > 20) {
      overBudgetMs += dtMs;
      underBudgetMs = 0;
      if (overBudgetMs >= 2000 && cooldownElapsed) {
        stepDown(now);
      }
    } else if (avgFrameMs < 13) {
      underBudgetMs += dtMs;
      overBudgetMs = Math.max(0, overBudgetMs - dtMs * 0.5);
      if (underBudgetMs >= 4000 && cooldownElapsed) {
        stepUp(now);
      }
    } else {
      overBudgetMs = Math.max(0, overBudgetMs - dtMs * 0.25);
      underBudgetMs = Math.max(0, underBudgetMs - dtMs * 0.25);
    }
  }

  return {
    getTier: () => currentTier,
    isLocked: () => locked,
    getConfig: () => TIER_CONFIG[currentTier],
    getStats: () => ({
      tier: currentTier,
      locked,
      avgFrameMs: Number(avgFrameMs.toFixed(2)),
      fps: Number(fpsEstimate.toFixed(1)),
      effectiveDpr: Math.min(window.devicePixelRatio || 1, TIER_CONFIG[currentTier].maxDpr),
    }),
    recordFrame,
    onChange(cb) {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    forceTier(nextTier) {
      if (!import.meta.env.DEV) return;
      if (!TIER_ORDER.includes(nextTier) || nextTier === currentTier) return;
      currentTier = nextTier;
      overBudgetMs = 0;
      underBudgetMs = 0;
      notify('manual');
    },
  };
}
