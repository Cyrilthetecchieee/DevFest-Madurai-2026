/**
 * Synthesized Night-Sky Audio Engine (S10)
 * - Strictly opt-in (default OFF); AudioContext starts only on explicit user interaction.
 * - Zero external audio files (<5 KB pure Web Audio API): cosmic A-fifth drone + pentatonic hover chimes.
 */
import { stageBus } from './stageBus.js';
import { prefersReducedMotion } from '../utils/env.js';

const CHIME_SCALE = [440.0, 523.25, 659.25, 783.99, 880.0, 1046.5, 1318.51];

export function initSoundscape() {
  const btn = document.getElementById('hud-sound-btn');
  const label = document.getElementById('hud-sound-label');

  let ctx = null;
  let master = null;
  let filter = null;
  let droneNodes = [];
  let enabled = false;
  let paused = false;
  let lastChimeAt = 0;

  function ensureGraph() {
    if (ctx) return;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;

    ctx = new AudioCtx();
    master = ctx.createGain();
    master.gain.value = 0;

    filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 320;
    filter.Q.value = 1.4;

    filter.connect(master);
    master.connect(ctx.destination);

    // Sub-harmonic nocturnal chord pad (A1, A2, E3)
    const freqs = [
      { f: 55.0, type: 'sine', gain: 0.36 },
      { f: 110.0, type: 'triangle', gain: 0.14 },
      { f: 164.81, type: 'sine', gain: 0.1 },
    ];

    freqs.forEach(({ f, type, gain }) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = type;
      osc.frequency.value = f;
      g.gain.value = gain;
      osc.connect(g);
      g.connect(filter);
      osc.start();
      droneNodes.push({ osc, g });
    });

    // Ultra-slow filter LFO for breathing sky resonance
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.value = 0.08;
    lfoGain.gain.value = 120;
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);
    lfo.start();
    droneNodes.push({ osc: lfo, g: lfoGain });
  }

  function syncGain() {
    if (!ctx || !master) return;
    const now = ctx.currentTime;
    const target = enabled && !paused && !document.hidden ? 0.075 : 0;
    master.gain.cancelScheduledValues(now);
    master.gain.setTargetAtTime(target, now, 0.25);
  }

  function updateUi() {
    if (!btn) return;
    btn.classList.toggle('is-on', enabled);
    btn.setAttribute('aria-pressed', enabled ? 'true' : 'false');
    btn.setAttribute('aria-label', enabled ? 'Ambient soundscape on' : 'Ambient soundscape off');
    if (label) label.textContent = enabled ? 'SFX ON' : 'SFX';
  }

  async function toggle(forceState = null) {
    enabled = forceState === null ? !enabled : Boolean(forceState);
    if (enabled) {
      ensureGraph();
      if (ctx?.state === 'suspended') {
        await ctx.resume().catch(() => {});
      }
      playChime(659.25, 0.05);
    }
    syncGain();
    updateUi();
  }

  function playChime(freq, vol = 0.032) {
    if (!enabled || paused || !ctx || ctx.state !== 'running' || !master) return;
    const nowMs = performance.now();
    if (nowMs - lastChimeAt < 90) return;
    lastChimeAt = nowMs;

    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, t);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.008, t + 0.35);

    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(vol, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.48);

    osc.connect(g);
    g.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.52);
  }

  const onHoverInteractive = (e) => {
    if (!enabled || paused || prefersReducedMotion()) return;
    const target = e.target.closest?.('a, button, .cfp-track-trigger, .spk-node-pill');
    if (!target) return;
    const idx = ((target.textContent?.length || 1) + Math.round(e.clientX || 0)) % CHIME_SCALE.length;
    playChime(CHIME_SCALE[idx], 0.022);
  };

  btn?.addEventListener('click', () => toggle());
  document.addEventListener('pointerover', onHoverInteractive, { passive: true });
  document.addEventListener('visibilitychange', syncGain);

  const unsubBus = stageBus.on((ev) => {
    if (ev === 'audio:toggle') toggle();
    else if (ev === 'easter-egg:warp') playChime(1046.5, 0.045);
  });

  updateUi();

  return {
    setPaused(nextPaused) {
      paused = Boolean(nextPaused);
      syncGain();
    },
    destroy() {
      unsubBus();
      document.removeEventListener('pointerover', onHoverInteractive);
      document.removeEventListener('visibilitychange', syncGain);
      droneNodes.forEach(({ osc }) => {
        try { osc.stop(); } catch { /* noop */ }
      });
      ctx?.close?.().catch(() => {});
    },
  };
}
