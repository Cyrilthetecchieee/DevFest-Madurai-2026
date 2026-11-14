/**
 * Speakers Constellation & Editorial Roster (#15, S14):
 * - Interactive 3D Fibonacci-sphere drag-rotate Constellation on 2D Canvas.
 * - GDG Hosts solid locked node + pulsing "SIGNAL ACQUIRING" TBA/CFP nodes.
 * - Morphing active filter indicator bar + accessible [ CONSTELLATION // LIST ] toggle.
 * - Used in both Home #speakers section and dedicated /speakers page.
 */
import speakersData from '../data/speakers.json';
import { esc } from '../utils/dom.js';
import { prefersReducedMotion } from '../utils/env.js';

function fibonacciSpherePoint(i, n) {
  if (n <= 1) return { x: 0, y: 0, z: 1 };
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  const y = 1 - (i / (n - 1)) * 2;
  const radius = Math.sqrt(Math.max(0, 1 - y * y));
  const theta = goldenAngle * i + 0.6;
  return {
    x: Math.cos(theta) * radius,
    y: y * 0.85,
    z: Math.sin(theta) * radius,
  };
}

export function renderSpeakersExperience({
  id = 'speakers',
  headingId = 'heading-speakers',
  isPage = false,
  links = {},
  cfpCtaLabel = 'SUBMIT YOUR PROPOSAL.',
} = {}) {
  const { homeSection, pageSection, filters, speakers } = speakersData;
  const meta = isPage ? pageSection : homeSection;
  const items = isPage ? speakers : speakers.filter((s) => s.showOnHome !== false);
  const firstSpeaker = items[0] || speakers[0];

  return `
    <section id="${esc(id)}" class="stage-section spk-stage" data-waypoint="3" aria-labelledby="${esc(headingId)}">
      <div class="spk-header-row">
        <div>
          <span class="stage-eyebrow" data-scramble="true">${esc(meta.tag)}</span>
          <h2 id="${esc(headingId)}" class="stage-display" data-reveal="mask" data-track-scroll="true">${esc(meta.heading)}</h2>
          ${isPage && Array.isArray(meta.paragraphs)
            ? meta.paragraphs.map((p) => `<p class="stage-lead">${esc(p)}</p>`).join('')
            : `<p class="stage-lead">${esc(meta.copy || '')}</p>`}
        </div>

        <div class="spk-mode-toggle" role="group" aria-label="Speakers view mode">
          <button type="button" class="spk-mode-btn is-active" data-spk-mode="constellation" aria-pressed="true">CONSTELLATION</button>
          <button type="button" class="spk-mode-btn" data-spk-mode="list" aria-pressed="false">ROSTER LIST</button>
        </div>
      </div>

      ${isPage ? `
        <div class="spk-filter-strip" id="spk-filter-strip" role="tablist" aria-label="Filter Speakers by Track">
          <span class="spk-filter-underline" id="spk-filter-underline" aria-hidden="true"></span>
          ${filters.map((f, idx) => `
            <button type="button" role="tab" aria-selected="${idx === 0 ? 'true' : 'false'}" class="spk-filter-tab${idx === 0 ? ' active' : ''}" data-track="${esc(f.id)}">${esc(f.label)}</button>
          `).join('')}
        </div>
      ` : ''}

      <div class="spk-constellation-layout" data-spk-view="constellation">
        <div class="spk-canvas-wrap">
          <canvas class="spk-constellation-canvas" id="${esc(id)}-canvas" aria-label="Interactive 3D speaker signal constellation — drag to rotate, click any node to inspect"></canvas>
          <div class="spk-canvas-hud" aria-hidden="true">
            <span>ORBITAL SPHERE // DRAG TO ROTATE</span>
            <span class="spk-signal-live">ACQUIRING 2026 SIGNALS</span>
          </div>
          <div class="spk-node-pills" role="list" aria-label="Constellation quick-select nodes">
            ${items.map((s, idx) => `
              <button type="button" class="spk-node-pill${idx === 0 ? ' is-selected' : ''}" data-node-idx="${idx}">${esc(s.monogram === '[ GDG ]' ? 'GDG HOSTS' : s.code || s.name)}</button>
            `).join('')}
          </div>
        </div>

        <aside class="spk-inspector" id="${esc(id)}-inspector" aria-live="polite" aria-label="Selected Speaker Slot Telemetry">
          <div class="spk-inspector-top">
            <span class="spk-inspector-code" data-field="code">${esc(firstSpeaker?.code || 'SPK_01')}</span>
            <span class="orbe-badge-tba" data-field="badge">${esc(firstSpeaker?.pageBadge || firstSpeaker?.homeBadge || 'SIGNAL ACQUIRING')}</span>
          </div>
          <div class="spk-inspector-sigil" data-field="monogram">${esc(firstSpeaker?.monogram || '[ TBA ]')}</div>
          <h3 class="spk-inspector-name" data-field="name">${esc(isPage ? (firstSpeaker?.pageName || firstSpeaker?.name) : firstSpeaker?.name)}</h3>
          <p class="spk-inspector-sub" data-field="subtitle">${esc(firstSpeaker?.subtitle || '')}</p>
          <p class="spk-inspector-bio" data-field="bio">${esc(firstSpeaker?.bio || firstSpeaker?.homeSubtitle || '')}</p>
          <div class="spk-inspector-meta">
            <span>STATUS: <strong data-field="status">${esc(firstSpeaker?.status || 'SIGNAL ACQUIRING')}</strong></span>
            <span>SECTOR: <strong>MADURAI</strong></span>
          </div>
        </aside>
      </div>

      <div class="spk-roster-list" id="${esc(id)}-list" data-spk-view="list" hidden>
        ${items.map((s, idx) => `
          <article class="spk-roster-row speaker-item" data-category="${esc(s.category)}" data-idx="${idx}">
            <div class="spk-roster-id">
              <span class="spk-roster-num">${String(idx + 1).padStart(2, '0')}</span>
              <span class="spk-roster-monogram">${esc(s.monogram || '[ TBA ]')}</span>
            </div>
            <div class="spk-roster-main">
              <div class="spk-roster-head">
                <h3 class="spk-roster-name">${esc(isPage ? (s.pageName || s.name) : s.name)}</h3>
                <span class="orbe-badge-tba">${esc(s.pageBadge || s.homeBadge)}</span>
              </div>
              <p class="spk-roster-sub">${esc(isPage ? s.subtitle : (s.homeSubtitle || s.subtitle))}</p>
              ${isPage && s.bio ? `<p class="spk-roster-bio">${esc(s.bio)}</p>` : ''}
            </div>
            <div class="spk-roster-state">${esc(s.status || s.homeBadge)}</div>
          </article>
        `).join('')}
      </div>

      ${!isPage ? `
        <div class="orbe-cta-row">
          <a href="/speakers" data-spa-link="true" class="btn-link-inline" data-magnetic="true">EXPLORE SPEAKERS PAGE //</a>
          <a href="#cfp" class="btn-link-inline">${esc(cfpCtaLabel)}</a>
          ${links?.cfp ? `<a href="${esc(links.cfp)}" target="_blank" rel="noopener noreferrer" class="btn-link-inline">DIRECT CFP FORM //</a>` : ''}
        </div>
      ` : ''}
    </section>
  `;
}

export function mountSpeakersExperience({ id = 'speakers', isPage = false } = {}) {
  const section = document.getElementById(id);
  if (!section) return () => {};

  const items = isPage ? speakersData.speakers : speakersData.speakers.filter((s) => s.showOnHome !== false);
  const canvas = document.getElementById(`${id}-canvas`);
  const inspector = document.getElementById(`${id}-inspector`);
  const listView = section.querySelector('[data-spk-view="list"]');
  const constView = section.querySelector('[data-spk-view="constellation"]');
  const modeBtns = Array.from(section.querySelectorAll('.spk-mode-btn'));
  const nodePills = Array.from(section.querySelectorAll('.spk-node-pill'));
  const filterTabs = Array.from(section.querySelectorAll('.spk-filter-tab'));
  const underlineEl = section.querySelector('#spk-filter-underline');
  const rosterRows = Array.from(section.querySelectorAll('.speaker-item'));

  let activeTrack = 'all';
  let selectedIdx = 0;
  let yaw = 0.35;
  let pitch = 0.22;
  let dragging = false;
  let lastX = 0;
  let lastY = 0;
  let velYaw = 0;
  let velPitch = 0;
  let rafId = 0;
  let destroyed = false;

  const nodes = items.map((s, i) => ({
    ...s,
    idx: i,
    base: fibonacciSpherePoint(i, items.length),
    isConfirmed: s.status === 'CONFIRMED' || s.category === 'hosts',
    sx: 0,
    sy: 0,
    sz: 0,
    scale: 1,
    active: true,
  }));

  function selectSpeaker(idx) {
    const item = items[idx];
    if (!item || !inspector) return;
    selectedIdx = idx;
    nodePills.forEach((p, pIdx) => p.classList.toggle('is-selected', pIdx === idx));
    const setField = (key, val) => {
      const el = inspector.querySelector(`[data-field="${key}"]`);
      if (el) el.textContent = val;
    };
    setField('code', item.code || `SPK_0${idx + 1}`);
    setField('badge', item.pageBadge || item.homeBadge || 'SIGNAL ACQUIRING');
    setField('monogram', item.monogram || '[ TBA ]');
    setField('name', isPage ? (item.pageName || item.name) : item.name);
    setField('subtitle', item.subtitle || '');
    setField('bio', item.bio || item.homeSubtitle || '');
    setField('status', item.status || (item.category === 'hosts' ? 'CONFIRMED' : 'SIGNAL ACQUIRING'));
  }

  function moveUnderline(tab) {
    if (!underlineEl || !tab) return;
    underlineEl.style.width = `${tab.offsetWidth}px`;
    underlineEl.style.transform = `translateX(${tab.offsetLeft}px)`;
  }

  filterTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      activeTrack = tab.dataset.track || 'all';
      filterTabs.forEach((t) => {
        const active = t === tab;
        t.classList.toggle('active', active);
        t.setAttribute('aria-selected', active ? 'true' : 'false');
      });
      moveUnderline(tab);
      nodes.forEach((n) => {
        n.active = activeTrack === 'all' || n.category === activeTrack;
      });
      rosterRows.forEach((row) => {
        row.hidden = !(activeTrack === 'all' || row.dataset.category === activeTrack);
      });
      const firstMatch = nodes.findIndex((n) => n.active);
      if (firstMatch >= 0) selectSpeaker(firstMatch);
    });
  });

  if (filterTabs[0]) {
    requestAnimationFrame(() => moveUnderline(filterTabs[0]));
  }

  modeBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const mode = btn.dataset.spkMode;
      const showList = mode === 'list';
      modeBtns.forEach((b) => {
        const active = b === btn;
        b.classList.toggle('is-active', active);
        b.setAttribute('aria-pressed', active ? 'true' : 'false');
      });
      if (constView) constView.hidden = showList;
      if (listView) listView.hidden = !showList;
    });
  });

  nodePills.forEach((pill) => {
    pill.addEventListener('click', () => {
      const idx = Number(pill.dataset.nodeIdx || 0);
      selectSpeaker(idx);
    });
  });

  const ctx = canvas?.getContext('2d');
  let cw = 520;
  let ch = 360;
  const reduced = prefersReducedMotion();

  function resizeCanvas() {
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    cw = rect.width;
    ch = rect.height;
    canvas.width = Math.round(cw * dpr);
    canvas.height = Math.round(ch * dpr);
    ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function project(p) {
    const cy = Math.cos(yaw);
    const sy = Math.sin(yaw);
    const cp = Math.cos(pitch);
    const sp = Math.sin(pitch);

    const x1 = p.x * cy - p.z * sy;
    const z1 = p.z * cy + p.x * sy;
    const y2 = p.y * cp - z1 * sp;
    const z2 = z1 * cp + p.y * sp;

    const r = Math.min(cw, ch) * 0.34;
    const depthScale = 3.2 / (3.2 - z2 * 0.9);
    return {
      x: cw * 0.5 + x1 * r * depthScale,
      y: ch * 0.5 + y2 * r * depthScale,
      z: z2,
      s: depthScale,
    };
  }

  function renderFrame(now) {
    if (destroyed || !ctx || !cw || !ch) return;
    const t = now * 0.001;

    if (!dragging && !reduced) {
      yaw += 0.0024 + velYaw;
      pitch += velPitch;
      velYaw *= 0.92;
      velPitch *= 0.92;
    }

    ctx.clearRect(0, 0, cw, ch);

    // Subtle latitude & equatorial orbit guide ellipses
    ctx.save();
    ctx.strokeStyle = 'rgba(94, 243, 255, 0.14)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(cw * 0.5, ch * 0.5, Math.min(cw, ch) * 0.36, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(155, 92, 255, 0.16)';
    ctx.beginPath();
    ctx.ellipse(cw * 0.5, ch * 0.5, Math.min(cw, ch) * 0.36, Math.min(cw, ch) * 0.14, yaw * 0.25, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    nodes.forEach((n) => {
      const proj = project(n.base);
      n.sx = proj.x;
      n.sy = proj.y;
      n.sz = proj.z;
      n.scale = proj.s;
    });

    // Chord links between nearby sphere neighbors
    ctx.save();
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i];
        const b = nodes[j];
        if (!a.active && !b.active) continue;
        const dx = a.sx - b.sx;
        const dy = a.sy - b.sy;
        const d = Math.hypot(dx, dy);
        if (d < Math.min(cw, ch) * 0.56) {
          ctx.strokeStyle = a.idx === selectedIdx || b.idx === selectedIdx
            ? 'rgba(94, 243, 255, 0.38)'
            : 'rgba(94, 243, 255, 0.11)';
          ctx.lineWidth = a.idx === selectedIdx || b.idx === selectedIdx ? 1.2 : 0.7;
          ctx.beginPath();
          ctx.moveTo(a.sx, a.sy);
          ctx.lineTo(b.sx, b.sy);
          ctx.stroke();
        }
      }
    }
    ctx.restore();

    const sorted = [...nodes].sort((a, b) => a.sz - b.sz);
    for (const n of sorted) {
      const isSelected = n.idx === selectedIdx;
      const alpha = n.active ? (0.45 + 0.55 * ((n.sz + 1) * 0.5)) : 0.14;
      const r = (isSelected ? 12 : 8) * n.scale;

      ctx.save();
      ctx.globalAlpha = Math.max(0.12, Math.min(1, alpha));

      // Pulsing radar halo for selected / TBA slots
      if (!n.isConfirmed || isSelected) {
        const pulse = reduced ? 1.4 : 1.3 + Math.sin(t * 2.8 + n.idx) * 0.35;
        ctx.strokeStyle = isSelected ? '#5ef3ff' : '#9b5cff';
        ctx.lineWidth = isSelected ? 1.6 : 1;
        ctx.beginPath();
        ctx.arc(n.sx, n.sy, r * pulse, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.beginPath();
      ctx.arc(n.sx, n.sy, r * 0.62, 0, Math.PI * 2);
      if (n.isConfirmed) {
        ctx.fillStyle = '#5ef3ff';
        ctx.fill();
      } else {
        ctx.fillStyle = isSelected ? 'rgba(94, 243, 255, 0.35)' : 'rgba(11, 15, 58, 0.85)';
        ctx.fill();
        ctx.strokeStyle = isSelected ? '#f3f6ff' : '#5ef3ff';
        ctx.lineWidth = 1.4;
        ctx.stroke();
      }

      if (isSelected || n.sz > -0.15) {
        ctx.fillStyle = isSelected ? '#f3f6ff' : 'rgba(243, 246, 255, 0.78)';
        ctx.font = `${isSelected ? 12 : 10}px "Orbe Mono", monospace`;
        ctx.fillText(n.monogram === '[ GDG ]' ? 'GDG' : `0${n.idx + 1}`, n.sx + r + 8, n.sy + 4);
      }
      ctx.restore();
    }

    if (!reduced) {
      rafId = window.requestAnimationFrame(renderFrame);
    }
  }

  function onPointerDown(e) {
    dragging = true;
    lastX = e.clientX;
    lastY = e.clientY;
    canvas?.setPointerCapture?.(e.pointerId);
  }

  function onPointerMove(e) {
    if (!dragging) return;
    const dx = e.clientX - lastX;
    const dy = e.clientY - lastY;
    lastX = e.clientX;
    lastY = e.clientY;
    yaw += dx * 0.008;
    pitch = Math.max(-0.95, Math.min(0.95, pitch + dy * 0.006));
    velYaw = dx * 0.0008;
    velPitch = dy * 0.0005;
    if (reduced) renderFrame(performance.now());
  }

  function onPointerUp(e) {
    dragging = false;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;
    let closest = -1;
    let bestD = 34;
    for (const n of nodes) {
      const d = Math.hypot(cx - n.sx, cy - n.sy);
      if (d < bestD) {
        bestD = d;
        closest = n.idx;
      }
    }
    if (closest >= 0) {
      selectSpeaker(closest);
      if (reduced) renderFrame(performance.now());
    }
  }

  const ro = new ResizeObserver(() => {
    resizeCanvas();
    if (reduced) renderFrame(performance.now());
    if (filterTabs.length) {
      const activeTab = filterTabs.find((t) => t.classList.contains('active'));
      if (activeTab) moveUnderline(activeTab);
    }
  });
  if (canvas) {
    ro.observe(canvas);
    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerup', onPointerUp);
    resizeCanvas();
    rafId = window.requestAnimationFrame(renderFrame);
  }

  return () => {
    destroyed = true;
    window.cancelAnimationFrame(rafId);
    ro.disconnect();
    canvas?.removeEventListener('pointerdown', onPointerDown);
    canvas?.removeEventListener('pointermove', onPointerMove);
    canvas?.removeEventListener('pointerup', onPointerUp);
  };
}
