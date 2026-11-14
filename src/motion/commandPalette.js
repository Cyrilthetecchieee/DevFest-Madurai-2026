/**
 * Mission Control Command Palette (S6), Easter Eggs (S16), Console Greeting & Dynamic Cyan Favicon:
 * - Opens on Cmd/Ctrl+K or HUD CMD button click.
 * - Fuzzy search across routes, page sections, interactive tools & secret Easter Eggs
 *   (kolam, aurora, warp, credits).
 * - Full focus trapping, keyboard arrow navigation, ARIA live announcements, Konami Warp Code.
 */
import { stageBus } from './stageBus.js';
import { prefersReducedMotion } from '../utils/env.js';
import { mountInteractiveKolamSvg } from '../visuals/kolamEngine.js';

const KONAMI = [
  'arrowup', 'arrowup', 'arrowdown', 'arrowdown',
  'arrowleft', 'arrowright', 'arrowleft', 'arrowright',
  'b', 'a',
];

function fuzzyMatch(query, text) {
  const q = query.trim().toLowerCase();
  if (!q) return 1;
  const hay = text.toLowerCase();
  if (hay.includes(q)) return 2;
  let qi = 0;
  for (let i = 0; i < hay.length && qi < q.length; i++) {
    if (hay[i] === q[qi]) qi++;
  }
  return qi === q.length ? 1 : 0;
}

function logConsoleGreeting() {
  try {
    console.log(
      '%c\n  ◈ GDG MADURAI // DEVFEST MADURAI 2026 \n  WHERE CURIOSITY MEETS CREATION. — 12 DEC 2026 · 9.9252° N 78.1198° E \n%c  CMD/CTRL + K -> Command Palette  |  Konami Code -> Hyper-Warp Orbit\n',
      'background:#0b0f3a;color:#5ef3ff;font-family:monospace;font-size:12px;padding:8px 12px;border-left:3px solid #9b5cff;',
      'color:#f3f6ff;font-family:monospace;font-size:11px;padding:4px 0;'
    );
  } catch {
    // Ignore console restrictions
  }
}

function startDynamicFaviconPulse() {
  if (prefersReducedMotion()) return () => {};
  const existing = document.querySelector('link[rel="icon"]');
  const link = existing || document.createElement('link');
  link.rel = 'icon';
  link.type = 'image/png';
  if (!existing) document.head.appendChild(link);

  const canvas = document.createElement('canvas');
  canvas.width = 32;
  canvas.height = 32;
  const ctx = canvas.getContext('2d');
  if (!ctx) return () => {};

  let phase = 0;
  function drawIcon() {
    if (document.hidden) return;
    phase = (phase + 1) % 8;
    const pulse = 0.55 + 0.45 * Math.sin((phase / 8) * Math.PI * 2);

    ctx.clearRect(0, 0, 32, 32);
    ctx.fillStyle = '#06091f';
    ctx.beginPath();
    ctx.roundRect(1, 1, 30, 30, 7);
    ctx.fill();

    ctx.strokeStyle = `rgba(94, 243, 255, ${(0.35 + pulse * 0.55).toFixed(2)})`;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.arc(16, 16, 10, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = pulse > 0.72 ? '#5ef3ff' : '#9b5cff';
    ctx.beginPath();
    ctx.arc(16, 16, 3.6 + pulse * 1.4, 0, Math.PI * 2);
    ctx.fill();

    try {
      link.href = canvas.toDataURL('image/png');
    } catch {
      // Ignore rare SecurityError
    }
  }

  drawIcon();
  const id = window.setInterval(drawIcon, 1600);
  return () => window.clearInterval(id);
}

export function initCommandSystem({ onNavigate, onToggleMotion }) {
  logConsoleGreeting();
  const stopFavicon = startDynamicFaviconPulse();

  // Mount root overlays outside #app-view so they persist seamlessly across routes
  const host = document.createElement('div');
  host.id = 'cmd-system-host';
  host.innerHTML = `
    <div id="cmd-toast" class="cmd-toast" role="status" aria-live="polite" hidden></div>
    <div id="ee-kolam-stage" class="ee-kolam-stage" hidden aria-hidden="true"></div>
    <div id="ee-credits-card" class="ee-credits-card" role="dialog" aria-modal="true" aria-label="Mission Control Credits" hidden>
      <div class="ee-credits-inner">
        <span class="stage-eyebrow">EASTER EGG // CREDITS</span>
        <h3 class="ee-credits-title">GDG MADURAI · DEVFEST 2026</h3>
        <p class="ee-credits-copy">Mission Control architecture engineered with Three.js single-canvas pipeline, GSAP + Lenis kinetic rail, generative Tamil Pulli Kolam engine, procedural Gopuram beacon, and client-side Web Audio synth.</p>
        <p class="ee-credits-meta">12 DECEMBER 2026 · MADURAI, TAMIL NADU · 09.9252° N 78.1198° E</p>
        <button type="button" id="ee-credits-close" class="cmd-action-btn">CLOSE // ESC</button>
      </div>
    </div>

    <div id="cmd-palette" class="cmd-overlay" role="dialog" aria-modal="true" aria-labelledby="cmd-palette-title" hidden>
      <div class="cmd-dialog">
        <div class="cmd-head">
          <span id="cmd-palette-title" class="cmd-title">COMMAND PALETTE // MISSION CONTROL</span>
          <button type="button" id="cmd-close-btn" class="cmd-esc-btn" aria-label="Close command palette">ESC</button>
        </div>
        <input type="search" id="cmd-input" class="cmd-input" placeholder="Type route, section, or secret (kolam, aurora, warp, credits)..." autocomplete="off" spellcheck="false" />
        <ul id="cmd-results" class="cmd-results" role="listbox" aria-label="Available commands"></ul>
      </div>
    </div>
  `;
  document.body.appendChild(host);

  const palette = document.getElementById('cmd-palette');
  const inputEl = document.getElementById('cmd-input');
  const resultsEl = document.getElementById('cmd-results');
  const closeBtn = document.getElementById('cmd-close-btn');
  const toastEl = document.getElementById('cmd-toast');
  const eeKolamEl = document.getElementById('ee-kolam-stage');
  const eeCreditsEl = document.getElementById('ee-credits-card');
  const eeCreditsClose = document.getElementById('ee-credits-close');

  let isOpen = false;
  let selectedIdx = 0;
  let lastFocus = null;
  let toastTimer = 0;
  let warpTimer = 0;
  let kolamCleanup = null;

  function showToast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.hidden = false;
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => {
      toastEl.hidden = true;
    }, 3200);
  }

  function triggerWarpBoost(boost = 1.6, ms = 3600, label = 'WARP DRIVE ENGAGED // ORBIT BOOSTED') {
    window.clearTimeout(warpTimer);
    stageBus.warpBoost = boost;
    stageBus.emit('easter-egg:warp', { boost });
    showToast(label);
    warpTimer = window.setTimeout(() => {
      stageBus.warpBoost = 0;
    }, ms);
  }

  function triggerKolamBloom() {
    if (!eeKolamEl) return;
    kolamCleanup?.();
    eeKolamEl.hidden = false;
    const ctrl = mountInteractiveKolamSvg(eeKolamEl, {
      gridRadius: 3,
      size: Math.min(480, window.innerWidth * 0.8),
      seed: Date.now() & 0xffff,
      drawOnScroll: false,
    });
    let p = 0;
    let raf = 0;
    const step = () => {
      p = Math.min(1, p + 0.025);
      ctrl.setProgress(p);
      if (p < 1) raf = window.requestAnimationFrame(step);
    };
    raf = window.requestAnimationFrame(step);
    showToast('KOLAM BLOOM INITIALIZED // S2 PULLI MATRIX');
    const hideId = window.setTimeout(() => {
      window.cancelAnimationFrame(raf);
      ctrl.destroy();
      eeKolamEl.hidden = true;
    }, 3400);
    kolamCleanup = () => {
      window.cancelAnimationFrame(raf);
      window.clearTimeout(hideId);
      ctrl.destroy();
      eeKolamEl.hidden = true;
    };
  }

  const commands = [
    { id: 'route-home', group: 'ROUTE', label: 'Home // Mission Control Stage', keys: 'home index top hero', run: () => onNavigate?.('/#home') },
    { id: 'route-speakers', group: 'ROUTE', label: 'Speakers // 3D Constellation & CFP', keys: 'speakers lineup constellation', run: () => onNavigate?.('/speakers') },
    { id: 'route-memories', group: 'ROUTE', label: 'Memories // DevFest Archive', keys: 'memories gallery archive photos', run: () => onNavigate?.('/memories') },
    { id: 'sec-about', group: 'SECTION', label: 'Jump -> About & 6 Experience Pillars', keys: 'about pillars experience roadshows', run: () => onNavigate?.('/#about') },
    { id: 'sec-venue', group: 'SECTION', label: 'Jump -> Venue Radar & 12 Dec Countdown', keys: 'venue map date countdown madurai', run: () => onNavigate?.('/#venue') },
    { id: 'sec-agenda', group: 'SECTION', label: 'Jump -> Agenda Spine & .ICS Planner', keys: 'agenda tracks schedule my day ics', run: () => onNavigate?.('/#agenda') },
    { id: 'sec-tickets', group: 'SECTION', label: 'Jump -> Boarding Pass & Mission Badge Studio', keys: 'tickets pass badge png register', run: () => onNavigate?.('/#tickets') },
    { id: 'sec-cfp', group: 'SECTION', label: 'Jump -> Call For Proposals Tracks', keys: 'cfp submit speaker proposal', run: () => onNavigate?.('/#cfp') },
    { id: 'sec-sponsors', group: 'SECTION', label: 'Jump -> Sponsors & Community Partners', keys: 'sponsors partners platinum gold', run: () => onNavigate?.('/#sponsors') },
    { id: 'act-motion', group: 'SYSTEM', label: 'Toggle Motion Engine (On / Off)', keys: 'motion pause reduced graphics', run: () => onToggleMotion?.() },
    { id: 'act-sound', group: 'SYSTEM', label: 'Toggle Cosmic Audio Synth', keys: 'sound audio mute synth ambient', run: () => stageBus.emit('audio:toggle') },
    { id: 'act-lang', group: 'SYSTEM', label: 'Switch Language (EN / தமிழ்)', keys: 'tamil language bilingual translate en ta', run: () => stageBus.emit('lang:toggle') },
    { id: 'ee-kolam', group: 'SECRET', label: 'kolam — Trigger Geometric Pulli Bloom', keys: 'kolam easter egg pulli rangoli', run: triggerKolamBloom },
    { id: 'ee-aurora', group: 'SECRET', label: 'aurora — Surge FBM Sky Ribbons', keys: 'aurora sky glow easter egg', run: () => triggerWarpBoost(1.25, 4200, 'AURORA MAGNETOSPHERE SURGE ACTIVE') },
    { id: 'ee-warp', group: 'SECRET', label: 'warp — Engage Starfield & Particle Hyper-Warp', keys: 'warp konami particles speed', run: () => triggerWarpBoost(1.85, 3600, 'WARP DRIVE ENGAGED // HYPER-ORBIT') },
    { id: 'ee-credits', group: 'SECRET', label: 'credits — Inspect Mission Control Build Manifest', keys: 'credits about build team secret', run: () => { if (eeCreditsEl) { eeCreditsEl.hidden = false; eeCreditsClose?.focus(); } } },
  ];

  let filtered = [...commands];

  function renderList() {
    if (!resultsEl) return;
    const q = inputEl?.value || '';
    filtered = commands
      .map((cmd) => ({ cmd, score: fuzzyMatch(q, `${cmd.label} ${cmd.keys} ${cmd.group}`) }))
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((x) => x.cmd);

    selectedIdx = Math.min(Math.max(0, selectedIdx), Math.max(0, filtered.length - 1));

    if (!filtered.length) {
      resultsEl.innerHTML = '<li class="cmd-empty">NO MATCHING MISSION COMMANDS.</li>';
      return;
    }

    resultsEl.innerHTML = filtered
      .map(
        (cmd, idx) => `
      <li role="option" aria-selected="${idx === selectedIdx ? 'true' : 'false'}">
        <button type="button" class="cmd-item${idx === selectedIdx ? ' is-active' : ''}" data-cmd-idx="${idx}">
          <span class="cmd-item-group">${cmd.group}</span>
          <span class="cmd-item-label">${cmd.label}</span>
        </button>
      </li>
    `
      )
      .join('');
  }

  function openPalette() {
    if (!palette || isOpen) return;
    isOpen = true;
    lastFocus = document.activeElement;
    palette.hidden = false;
    if (inputEl) {
      inputEl.value = '';
      selectedIdx = 0;
      renderList();
      window.requestAnimationFrame(() => inputEl.focus());
    }
  }

  function closePalette() {
    if (!palette || !isOpen) return;
    isOpen = false;
    palette.hidden = true;
    lastFocus?.focus?.();
    lastFocus = null;
  }

  function executeCommand(idx) {
    const cmd = filtered[idx];
    if (!cmd) return;
    closePalette();
    cmd.run();
  }

  resultsEl?.addEventListener('click', (e) => {
    const btn = e.target.closest('.cmd-item');
    if (!btn) return;
    executeCommand(Number(btn.dataset.cmdIdx || 0));
  });

  inputEl?.addEventListener('input', () => {
    selectedIdx = 0;
    renderList();
  });

  closeBtn?.addEventListener('click', closePalette);
  palette?.addEventListener('click', (e) => {
    if (e.target === palette) closePalette();
  });
  eeCreditsClose?.addEventListener('click', () => {
    if (eeCreditsEl) eeCreditsEl.hidden = true;
  });

  let konamiPos = 0;
  const onGlobalKey = (e) => {
    const k = e.key.toLowerCase();

    if ((e.metaKey || e.ctrlKey) && k === 'k') {
      e.preventDefault();
      if (isOpen) closePalette();
      else openPalette();
      return;
    }

    if (isOpen) {
      if (e.key === 'Escape') {
        e.preventDefault();
        closePalette();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        selectedIdx = (selectedIdx + 1) % Math.max(1, filtered.length);
        renderList();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        selectedIdx = (selectedIdx - 1 + Math.max(1, filtered.length)) % Math.max(1, filtered.length);
        renderList();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        executeCommand(selectedIdx);
      } else if (e.key === 'Tab') {
        const focusables = [inputEl, closeBtn].filter(Boolean);
        if (focusables.length === 2 && document.activeElement === closeBtn && !e.shiftKey) {
          e.preventDefault();
          inputEl?.focus();
        }
      }
      return;
    }

    if (e.key === 'Escape' && eeCreditsEl && !eeCreditsEl.hidden) {
      eeCreditsEl.hidden = true;
      return;
    }

    // Konami code detector (ignore while typing in inputs)
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    if (k === KONAMI[konamiPos]) {
      konamiPos++;
      if (konamiPos === KONAMI.length) {
        konamiPos = 0;
        triggerWarpBoost(2.0, 4000, 'KONAMI OVERDRIVE // HYPER-WARP ACTIVATED');
      }
    } else {
      konamiPos = k === KONAMI[0] ? 1 : 0;
    }
  };

  document.addEventListener('keydown', onGlobalKey);
  const unsubBus = stageBus.on((ev) => {
    if (ev === 'command-palette:toggle') {
      if (isOpen) closePalette();
      else openPalette();
    }
  });

  return () => {
    stopFavicon();
    kolamCleanup?.();
    window.clearTimeout(toastTimer);
    window.clearTimeout(warpTimer);
    unsubBus();
    document.removeEventListener('keydown', onGlobalKey);
    host.remove();
  };
}
