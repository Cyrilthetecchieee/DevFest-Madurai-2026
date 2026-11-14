/**
 * Tickets & Client-Side Kolam Mission Badge Studio (#17, S5):
 * - Monumental holographic boarding pass with pointer/gyro foil shimmer and magnetic CTA.
 * - Live deterministic Kolam-seeded Mission Badge generator:
 *   - 1080x1350 Portrait PNG export
 *   - 1200x630 OG Social Card PNG export
 *   - Web Share API file sharing with download fallback
 *   - Explicit "Generated locally on your device" notice.
 */
import { esc, renderDiscoverButton } from '../utils/dom.js';
import { prefersReducedMotion } from '../utils/env.js';
import { hashSeed, generateKolamSpec, mountInteractiveKolamSvg } from '../visuals/kolamEngine.js';

const BADGE_ROLES = [
  'AI & ML BUILDER',
  'WEB & CLOUD ARCHITECT',
  'ANDROID DEVELOPER',
  'OPEN SOURCE CONTRIBUTOR',
  'DESIGN & PRODUCT',
  'MADURAI COMMUNITY',
];

function drawBadgeCanvas(canvas, { callsign, role, width, height }) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  canvas.width = width;
  canvas.height = height;
  const isWide = width > height;
  const cleanName = (callsign || 'EXPLORER').trim().slice(0, 26).toUpperCase() || 'EXPLORER';
  const seed = hashSeed(`${cleanName}:${role}:DF26`);

  // Deep navy cosmic backing
  const bg = ctx.createLinearGradient(0, 0, width, height);
  bg.addColorStop(0, '#04071d');
  bg.addColorStop(0.55, '#0b0f3a');
  bg.addColorStop(1, '#100a2e');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);

  // Subtle aurora ribbons
  const glowA = ctx.createRadialGradient(width * 0.2, height * 0.18, 10, width * 0.2, height * 0.18, width * 0.6);
  glowA.addColorStop(0, 'rgba(94, 243, 255, 0.24)');
  glowA.addColorStop(1, 'rgba(94, 243, 255, 0)');
  ctx.fillStyle = glowA;
  ctx.fillRect(0, 0, width, height);

  const glowB = ctx.createRadialGradient(width * 0.85, height * 0.78, 10, width * 0.85, height * 0.78, width * 0.55);
  glowB.addColorStop(0, 'rgba(155, 92, 255, 0.26)');
  glowB.addColorStop(1, 'rgba(155, 92, 255, 0)');
  ctx.fillStyle = glowB;
  ctx.fillRect(0, 0, width, height);

  // Outer HUD architectural border & chamfer corners
  const pad = Math.round(Math.min(width, height) * 0.048);
  ctx.strokeStyle = 'rgba(94, 243, 255, 0.55)';
  ctx.lineWidth = Math.max(1.5, width * 0.0022);
  ctx.strokeRect(pad, pad, width - pad * 2, height - pad * 2);

  // Deterministic generative Kolam motif from engine
  const kolamSize = isWide ? Math.round(height * 0.62) : Math.round(width * 0.52);
  const spec = generateKolamSpec({
    gridRadius: 3,
    size: kolamSize,
    seed,
    complexity: 0.72,
  });

  const kx = isWide ? width - pad * 2 - kolamSize : Math.round((width - kolamSize) * 0.5);
  const ky = isWide ? Math.round((height - kolamSize) * 0.5) : Math.round(height * 0.21);

  ctx.save();
  ctx.translate(kx, ky);
  const gradStroke = ctx.createLinearGradient(0, 0, kolamSize, kolamSize);
  gradStroke.addColorStop(0, '#5ef3ff');
  gradStroke.addColorStop(0.55, '#f3f6ff');
  gradStroke.addColorStop(1, '#9b5cff');

  (spec.paths || []).forEach((loop, idx) => {
    const p2d = new Path2D(loop.d);
    ctx.strokeStyle = idx % 2 === 0 ? gradStroke : 'rgba(155, 92, 255, 0.88)';
    ctx.lineWidth = Math.max(2, kolamSize * 0.008);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke(p2d);
  });

  ctx.fillStyle = '#f3f6ff';
  (spec.dots || []).forEach((dot) => {
    ctx.beginPath();
    ctx.arc(dot.x, dot.y, Math.max(2.2, kolamSize * 0.009), 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.restore();

  // Mission Control typography overlay
  ctx.textBaseline = 'top';
  const leftX = pad * 1.75;
  ctx.fillStyle = '#5ef3ff';
  ctx.font = `${Math.round(height * 0.022)}px "Orbe Mono", monospace`;
  ctx.fillText('GDG MADURAI // DEVFEST MADURAI 2026', leftX, pad * 1.65);

  ctx.fillStyle = 'rgba(243, 246, 255, 0.65)';
  ctx.font = `${Math.round(height * 0.017)}px "Orbe Mono", monospace`;
  ctx.fillText(`KOLAM HASH // 0x${seed.toString(16).toUpperCase().padStart(8, '0')}`, leftX, pad * 2.35);

  const nameY = isWide ? Math.round(height * 0.36) : Math.round(height * 0.69);
  const nameSize = isWide ? Math.round(height * 0.088) : Math.round(width * 0.072);
  ctx.fillStyle = '#f3f6ff';
  ctx.font = `${nameSize}px "Orbe Mono", monospace`;
  ctx.fillText(cleanName, leftX, nameY, isWide ? width * 0.52 : width - leftX * 2);

  ctx.fillStyle = '#9b5cff';
  ctx.font = `${Math.round(height * 0.025)}px "Orbe Mono", monospace`;
  ctx.fillText(`TRACK // ${role}`, leftX, nameY + nameSize * 1.24);

  // Bottom bar metadata
  const footY = height - pad * 2.15;
  ctx.strokeStyle = 'rgba(243, 246, 255, 0.2)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(leftX, footY - 14);
  ctx.lineTo(width - leftX, footY - 14);
  ctx.stroke();

  ctx.fillStyle = '#f3f6ff';
  ctx.font = `${Math.round(height * 0.02)}px "Orbe Mono", monospace`;
  ctx.fillText('12 DEC 2026 · MADURAI · WHERE CURIOSITY MEETS CREATION.', leftX, footY);
}

export function renderTicketsSection(ticketsData, links) {
  return `
    <section id="tickets" class="stage-section tkt-stage" data-waypoint="5" aria-labelledby="heading-tickets">
      <div class="tkt-header">
        <span class="stage-eyebrow" data-scramble="true">${esc(ticketsData.tag)}</span>
        <h2 id="heading-tickets" class="stage-display" data-reveal="mask" data-track-scroll="true">${esc(ticketsData.heading)}</h2>
        <p class="stage-lead">${esc(ticketsData.copy)}</p>
      </div>

      <div class="tkt-split-grid">
        <!-- Holographic Boarding Pass -->
        <div class="tkt-pass-card" id="tkt-boarding-pass">
          <div class="tkt-foil-layer" aria-hidden="true"></div>
          <div class="tkt-pass-main">
            <div class="tkt-pass-top">
              <span class="tkt-pass-code">BOARDING PASS // DF-MDU-26</span>
              <span class="orbe-badge-tba">12 DEC 2026</span>
            </div>

            <div class="tkt-pass-title-wrap">
              <span class="tkt-pass-kicker">GDG MADURAI PRESENTS</span>
              <h3 class="tkt-pass-title">DEVFEST MADURAI 2026</h3>
              <p class="tkt-pass-meta">${esc(ticketsData.metaLine)}</p>
            </div>

            <div class="tkt-pass-cta">
              ${renderDiscoverButton({
                label: ticketsData.ctaLabel,
                ariaLabel: 'Get Your Tickets',
                href: links.tickets,
                external: true,
                inline: true,
              })}
            </div>
          </div>

          <div class="tkt-pass-stub" aria-hidden="true">
            <div id="tkt-kolam-stub" class="tkt-kolam-stub"></div>
            <span class="tkt-stub-serial">09.92N // 78.12E</span>
          </div>
        </div>

        <!-- Client-Side Holographic Mission Badge Studio (S5) -->
        <aside class="tkt-badge-studio" aria-label="Mission Badge Studio">
          <div class="tkt-studio-head">
            <span class="stage-eyebrow">S5 // HOLOGRAPHIC MISSION BADGE</span>
            <p class="tkt-local-note">Generated locally on your device — zero server upload.</p>
          </div>

          <div class="tkt-studio-body">
            <div class="tkt-preview-wrap">
              <canvas id="badge-preview-canvas" width="360" height="450" class="tkt-badge-canvas" aria-label="Live Kolam Mission Badge preview"></canvas>
            </div>

            <div class="tkt-controls">
              <label class="tkt-field-label" for="badge-callsign-input">CALLSIGN / NAME</label>
              <input type="text" id="badge-callsign-input" class="tkt-input" maxlength="26" placeholder="YOUR NAME OR HANDLE" value="EXPLORER" />

              <label class="tkt-field-label" for="badge-role-select">MISSION TRACK</label>
              <select id="badge-role-select" class="tkt-select">
                ${BADGE_ROLES.map((r) => `<option value="${esc(r)}">${esc(r)}</option>`).join('')}
              </select>

              <div class="tkt-export-actions">
                <button type="button" id="badge-dl-portrait" class="tkt-export-btn">EXPORT PNG (1080×1350)</button>
                <button type="button" id="badge-dl-og" class="tkt-export-btn tkt-export-btn-alt">EXPORT OG CARD (1200×630)</button>
                <button type="button" id="badge-share-btn" class="tkt-share-btn">SHARE MISSION PASS</button>
              </div>
              <div id="badge-status-msg" class="tkt-status-msg" aria-live="polite"></div>
            </div>
          </div>
        </aside>
      </div>
    </section>
  `;
}

export function mountTicketsSection() {
  const passEl = document.getElementById('tkt-boarding-pass');
  const stubKolamEl = document.getElementById('tkt-kolam-stub');
  const previewCanvas = document.getElementById('badge-preview-canvas');
  const nameInput = document.getElementById('badge-callsign-input');
  const roleSelect = document.getElementById('badge-role-select');
  const dlPortraitBtn = document.getElementById('badge-dl-portrait');
  const dlOgBtn = document.getElementById('badge-dl-og');
  const shareBtn = document.getElementById('badge-share-btn');
  const statusEl = document.getElementById('badge-status-msg');

  const cleanups = [];
  const reduced = prefersReducedMotion();

  if (stubKolamEl) {
    const kolam = mountInteractiveKolamSvg(stubKolamEl, {
      gridRadius: 2,
      size: 160,
      seed: 202612,
      drawOnScroll: true,
    });
    cleanups.push(() => kolam.destroy());
  }

  // Holographic boarding pass tilt + foil sheen
  if (passEl && !reduced) {
    const onMove = (e) => {
      const r = passEl.getBoundingClientRect();
      const nx = (e.clientX - r.left) / Math.max(1, r.width) - 0.5;
      const ny = (e.clientY - r.top) / Math.max(1, r.height) - 0.5;
      passEl.style.setProperty('--foil-x', `${(50 + nx * 70).toFixed(1)}%`);
      passEl.style.setProperty('--foil-y', `${(50 + ny * 70).toFixed(1)}%`);
      passEl.style.transform = `perspective(1000px) rotateY(${(nx * 6).toFixed(2)}deg) rotateX(${(-ny * 5).toFixed(2)}deg)`;
    };
    const onLeave = () => {
      passEl.style.transform = '';
    };
    passEl.addEventListener('pointermove', onMove);
    passEl.addEventListener('pointerleave', onLeave);
    cleanups.push(() => {
      passEl.removeEventListener('pointermove', onMove);
      passEl.removeEventListener('pointerleave', onLeave);
    });
  }

  function redrawPreview() {
    if (!previewCanvas) return;
    drawBadgeCanvas(previewCanvas, {
      callsign: nameInput?.value || 'EXPLORER',
      role: roleSelect?.value || BADGE_ROLES[0],
      width: 540,
      height: 675,
    });
  }

  nameInput?.addEventListener('input', redrawPreview);
  roleSelect?.addEventListener('change', redrawPreview);
  redrawPreview();

  function exportPng(width, height, filename) {
    const offscreen = document.createElement('canvas');
    drawBadgeCanvas(offscreen, {
      callsign: nameInput?.value || 'EXPLORER',
      role: roleSelect?.value || BADGE_ROLES[0],
      width,
      height,
    });
    const url = offscreen.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    if (statusEl) statusEl.textContent = `Downloaded ${filename} locally on your device.`;
  }

  dlPortraitBtn?.addEventListener('click', () => exportPng(1080, 1350, 'devfest-madurai-2026-badge.png'));
  dlOgBtn?.addEventListener('click', () => exportPng(1200, 630, 'devfest-madurai-2026-og-card.png'));

  shareBtn?.addEventListener('click', async () => {
    const offscreen = document.createElement('canvas');
    drawBadgeCanvas(offscreen, {
      callsign: nameInput?.value || 'EXPLORER',
      role: roleSelect?.value || BADGE_ROLES[0],
      width: 1080,
      height: 1350,
    });
    const blob = await new Promise((resolve) => offscreen.toBlob(resolve, 'image/png'));
    const file = blob ? new File([blob], 'devfest-madurai-2026-badge.png', { type: 'image/png' }) : null;

    if (file && navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({
          title: 'DevFest Madurai 2026 — Mission Badge',
          text: 'GDG Madurai presents DevFest Madurai 2026 · 12 December 2026.',
          files: [file],
        });
        if (statusEl) statusEl.textContent = 'Shared via device share sheet.';
        return;
      } catch {
        // User cancelled or share blocked — fall back quietly to download
      }
    }
    exportPng(1080, 1350, 'devfest-madurai-2026-badge.png');
  });

  return () => {
    cleanups.forEach((fn) => fn());
  };
}
