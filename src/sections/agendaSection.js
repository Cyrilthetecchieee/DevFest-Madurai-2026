/**
 * Agenda Section (#16, S8):
 * - Self-drawing vertical timeline spine driven by scroll transit.
 * - Expandable track rows with pulse-lock COMING SOON badges.
 * - My Day localStorage pin planner + valid .ics calendar export clearly labelled [DEMO SLOT — SCHEDULE TBA].
 */
import agendaData from '../data/agenda.json';
import { esc } from '../utils/dom.js';
import { prefersReducedMotion } from '../utils/env.js';

const STORAGE_KEY = 'df26_my_day_pins_v1';

const TRACK_GROUPS = [
  'Opening & Closing',
  'Main Stage',
  'Multi-Track',
  'Hands-On Labs',
  'Community',
  'Schedule Status',
];

const TRACK_DETAILS = [
  'Community opening, opening remarks from GDG Madurai organizers, keynote launch, and end-of-day wrap.',
  'Full-stage flagship talks covering next-generation AI workflows, web platform advances, and community lessons.',
  'Deep-dive technical sessions across AI & ML, Web & Cloud, Android, Open Source, Design & Product.',
  'Hands-on guided build labs where attendees ship real prototypes and test modern developer toolchains.',
  'Open corridor networking, lightning exchanges, community booths, and peer mentoring across Madurai.',
  'Full session timetable, room assignments, and speaker time slots will publish here upon final schedule lock.',
];

function loadPins() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function savePins(pins) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(pins));
  } catch {
    // Ignore storage quota errors in private mode
  }
}

function formatIcsContent(tracksToExport) {
  const dtStamp = '20261114T000000Z';
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//GDG Madurai//DevFest Madurai 2026 Demo Planner//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
  ];

  tracksToExport.forEach((t, i) => {
    const hourStart = 9 + i;
    const pad = (n) => String(n).padStart(2, '0');
    lines.push(
      'BEGIN:VEVENT',
      `UID:devfest-madurai-2026-demo-${t.id || i}@gdgmadurai`,
      `DTSTAMP:${dtStamp}`,
      `DTSTART;TZID=Asia/Kolkata:20261212T${pad(hourStart)}0000`,
      `DTEND;TZID=Asia/Kolkata:20261212T${pad(hourStart)}4500`,
      `SUMMARY:[DEMO SLOT - SCHEDULE TBA] DevFest Madurai 2026: ${t.title}`,
      `DESCRIPTION:${t.body} (Demo planning reminder - official venue & timetable to be announced by GDG Madurai.)`,
      'LOCATION:Madurai, Tamil Nadu, India (Venue To Be Announced)',
      'STATUS:TENTATIVE',
      'END:VEVENT',
    );
  });

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

function triggerIcsDownload(filename, content) {
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function renderAgendaSection() {
  const tracks = agendaData.tracks || [];

  return `
    <section id="agenda" class="stage-section ag-stage" data-waypoint="4" aria-labelledby="heading-agenda">
      <div class="ag-header">
        <div>
          <span class="stage-eyebrow" data-scramble="true">${esc(agendaData.tag)}</span>
          <h2 id="heading-agenda" class="stage-display" data-reveal="mask" data-track-scroll="true">${esc(agendaData.heading)}</h2>
          <p class="stage-lead">${esc(agendaData.copy)}</p>
        </div>

        <aside class="ag-planner-bar" aria-label="My Day Planner Controls">
          <div class="ag-planner-status">
            <span class="ag-planner-label">MY DAY PLANNER // <strong id="ag-pin-count">00</strong> PINNED</span>
            <span class="ag-demo-tag">SCHEDULE TBA · DRAFT REMINDER</span>
          </div>
          <button type="button" id="ag-export-ics" class="ag-export-btn">EXPORT .ICS CALENDAR</button>
        </aside>
      </div>

      <div class="ag-timeline-shell" id="ag-timeline-shell">
        <div class="ag-spine-track" aria-hidden="true">
          <div class="ag-spine-fill" id="ag-spine-fill"></div>
        </div>

        <div class="ag-rows-list" aria-label="Agenda Format &amp; Placeholders">
          ${tracks.map((t, idx) => `
            <article class="ag-row" data-ag-index="${idx}" data-track-id="${esc(t.id || `track-${idx}`)}" style="--ag-i:${idx}">
              <span class="ag-row-node" aria-hidden="true"></span>
              <div class="ag-row-top">
                <div class="ag-row-meta">
                  <span class="ag-row-num">0${idx + 1}</span>
                  <span class="ag-group-tag">${esc(TRACK_GROUPS[idx] || 'Session Group')}</span>
                  <span class="ag-pulse-badge"><span class="ag-lock-dot" aria-hidden="true"></span>${esc(t.badge)}</span>
                </div>
                <div class="ag-row-actions">
                  <button type="button" class="ag-pin-btn" data-pin-id="${esc(t.id || `track-${idx}`)}" aria-pressed="false">PIN TO MY DAY</button>
                  <button type="button" class="ag-expand-btn" aria-expanded="${idx === 0 ? 'true' : 'false'}" aria-controls="ag-panel-${idx}">
                    <span>DETAILS</span>
                    <span class="ag-chevron" aria-hidden="true">+</span>
                  </button>
                </div>
              </div>

              <h3 class="ag-row-title">${esc(t.title)}</h3>
              <p class="ag-row-body">${esc(t.body)}</p>

              <div class="ag-row-drawer" id="ag-panel-${idx}" ${idx === 0 ? '' : 'hidden'}>
                <p class="ag-drawer-note">${esc(TRACK_DETAILS[idx] || t.body)}</p>
                <div class="ag-drawer-foot">
                  <span>12 December 2026 · Madurai, Tamil Nadu</span>
                  <span class="ag-demo-inline">TIME &amp; ROOM: TBA</span>
                </div>
              </div>
            </article>
          `).join('')}
        </div>
      </div>
    </section>
  `;
}

export function mountAgendaSection() {
  const shell = document.getElementById('ag-timeline-shell');
  const spineFill = document.getElementById('ag-spine-fill');
  const pinCountEl = document.getElementById('ag-pin-count');
  const exportBtn = document.getElementById('ag-export-ics');
  if (!shell) return () => {};

  let pins = new Set(loadPins());
  const pinBtns = Array.from(shell.querySelectorAll('.ag-pin-btn'));
  const expandBtns = Array.from(shell.querySelectorAll('.ag-expand-btn'));
  const rows = Array.from(shell.querySelectorAll('.ag-row'));

  function syncPinsUi() {
    if (pinCountEl) pinCountEl.textContent = String(pins.size).padStart(2, '0');
    pinBtns.forEach((btn) => {
      const id = btn.dataset.pinId;
      const pinned = pins.has(id);
      btn.classList.toggle('is-pinned', pinned);
      btn.setAttribute('aria-pressed', pinned ? 'true' : 'false');
      btn.textContent = pinned ? 'PINNED ✓' : 'PIN TO MY DAY';
    });
    rows.forEach((row) => {
      row.classList.toggle('is-pinned', pins.has(row.dataset.trackId));
    });
  }

  pinBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.pinId;
      if (!id) return;
      if (pins.has(id)) pins.delete(id);
      else pins.add(id);
      savePins([...pins]);
      syncPinsUi();
    });
  });

  expandBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('aria-controls');
      const panel = targetId ? document.getElementById(targetId) : null;
      const nextOpen = btn.getAttribute('aria-expanded') !== 'true';
      btn.setAttribute('aria-expanded', nextOpen ? 'true' : 'false');
      if (panel) panel.hidden = !nextOpen;
    });
  });

  exportBtn?.addEventListener('click', () => {
    const allTracks = agendaData.tracks || [];
    const selected = pins.size
      ? allTracks.filter((t, i) => pins.has(t.id || `track-${i}`))
      : [allTracks[0]].filter(Boolean);
    const ics = formatIcsContent(selected);
    triggerIcsDownload('devfest-madurai-2026-demo-schedule-tba.ics', ics);
    exportBtn.textContent = 'EXPORTED .ICS ✓';
    window.setTimeout(() => {
      exportBtn.textContent = 'EXPORT .ICS CALENDAR';
    }, 1800);
  });

  syncPinsUi();

  // Scroll-driven self-drawing timeline spine & row activation
  const reduced = prefersReducedMotion();
  function updateSpine() {
    if (!spineFill) return;
    if (reduced) {
      spineFill.style.transform = 'scaleY(1)';
      rows.forEach((r) => r.classList.add('is-lit'));
      return;
    }
    const r = shell.getBoundingClientRect();
    const vh = window.innerHeight || 800;
    const raw = (vh * 0.72 - r.top) / Math.max(240, r.height);
    const p = Math.max(0.05, Math.min(1, raw));
    spineFill.style.transform = `scaleY(${p.toFixed(3)})`;
    rows.forEach((row) => {
      const rr = row.getBoundingClientRect();
      row.classList.toggle('is-lit', rr.top < vh * 0.78);
    });
  }

  window.addEventListener('scroll', updateSpine, { passive: true });
  updateSpine();

  return () => {
    window.removeEventListener('scroll', updateSpine);
  };
}
