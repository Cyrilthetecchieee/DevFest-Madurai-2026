/**
 * Agenda Section — Chronological Track-Filterable Timeline & Expandable Session Details
 */
import agendaData from '../data/agenda.json';
import speakersData from '../data/speakers.json';
import {
  esc,
  renderTrackChip,
  renderStatusChip,
} from '../utils/dom.js';

const PIN_KEY = 'devfest_my_agenda_v2';

function parseMinutes(timeStr) {
  const m = String(timeStr || '').trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return Number.POSITIVE_INFINITY;
  const hh = Number(m[1]);
  const mm = Number(m[2]);
  if (hh < 0 || hh > 23 || mm < 0 || mm > 59) return Number.POSITIVE_INFINITY;
  return hh * 60 + mm;
}

export function sortSessionsChronologically(sessions) {
  return sessions
    .map((s, index) => ({ session: s, index, mins: parseMinutes(s.time) }))
    .sort((a, b) => (a.mins !== b.mins ? a.mins - b.mins : a.index - b.index))
    .map((item) => item.session);
}

function matchesAgendaTrack(track, filterId) {
  if (!filterId || filterId === 'all') return true;
  if (filterId === 'opensource-design') {
    return track === 'opensource' || track === 'design';
  }
  return track === filterId;
}

function readPins() {
  try {
    const raw = localStorage.getItem(PIN_KEY);
    return new Set(Array.isArray(JSON.parse(raw)) ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
}

function writePins(pinSet) {
  try {
    localStorage.setItem(PIN_KEY, JSON.stringify([...pinSet]));
  } catch {
    /* ignore storage quota failures */
  }
}

function buildMyAgendaIcs(sessions, pinSet) {
  const chosen = sessions.filter((s) => pinSet.has(s.id));
  const list = chosen.length ? chosen : sessions.slice(0, 1);
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//GDG Madurai//DevFest Madurai 2026//EN',
    'CALSCALE:GREGORIAN',
  ];
  list.forEach((s) => {
    lines.push(
      'BEGIN:VEVENT',
      `UID:${s.id}@gdgmadurai.in`,
      'DTSTAMP:20260101T000000Z',
      'DTSTART;VALUE=DATE:20261212',
      'DTEND;VALUE=DATE:20261213',
      `SUMMARY:DevFest Madurai 2026 — ${s.title}`,
      `DESCRIPTION:${s.description.replace(/\r?\n/g, ' ')}`,
      `LOCATION:${s.room && s.room !== 'TBA' ? s.room : 'Madurai, Tamil Nadu, India'}`,
      'END:VEVENT',
    );
  });
  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

function downloadText(filename, text) {
  const blob = new Blob([text], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function renderAgendaSection() {
  const pins = readPins();
  const speakerById = new Map((speakersData.speakers || []).map((sp) => [sp.id, sp]));
  const orderedSessions = sortSessionsChronologically(agendaData.sessions || []);
  const pinnedCount = orderedSessions.filter((s) => pins.has(s.id)).length;

  return `
    <section id="agenda" class="stage-section" aria-labelledby="heading-agenda">
      <div class="stage-asymmetric stage-asymmetric--flip">
        <div class="graphic-window" data-creature-zone="agenda" aria-hidden="true"></div>

        <div class="content-zone local-scrim">
          <div class="stage-section-head">
            <div>
              <span class="stage-eyebrow" data-scramble="true">${esc(agendaData.tag)}</span>
              <h2 id="heading-agenda" class="stage-display" data-reveal="mask">${esc(agendaData.heading)}</h2>
            </div>
          </div>
          <p class="stage-lead">${esc(agendaData.copy)}</p>

          <div class="ag-status-banner">
            <div class="ag-status-copy">
              ${renderStatusChip('SCHEDULE LOCK PENDING', 'tba')}
              <span class="ag-status-note">${esc(agendaData.lockNote)}</span>
            </div>
            <div class="ag-planner-controls">
              <span class="ag-planner-count">Saved sessions: <strong id="ag-pin-count">${pinnedCount}</strong></span>
              <button type="button" id="ag-export-ics" class="btn-g-secondary">EXPORT MY SCHEDULE (.ICS)</button>
            </div>
          </div>

          <div class="orbe-filter-bar" role="group" aria-label="Filter agenda by track">
            ${(agendaData.filters || []).map((f, idx) => `
              <button
                type="button"
                class="orbe-filter-btn ${idx === 0 ? 'active' : ''}"
                data-ag-filter="${esc(f.id)}"
                aria-pressed="${idx === 0 ? 'true' : 'false'}"
              >
                ${esc(f.label)}
              </button>
            `).join('')}
          </div>

          <div class="ag-timeline" id="ag-timeline">
            ${orderedSessions.map((session) => {
          const isPinned = pins.has(session.id);
          const isTimeTba = !session.time || session.time.toUpperCase() === 'TBA';
          const resolvedSpeaker = session.speakerId ? speakerById.get(session.speakerId) : null;
          const hasConfirmedSpeaker = Boolean(resolvedSpeaker && resolvedSpeaker.status === 'confirmed');
          const roomLabel = !session.room || session.room.toUpperCase() === 'TBA'
            ? 'Room to be announced'
            : session.room;

          return `
            <article class="ag-row ag-row--${esc(session.track)} ${isPinned ? 'is-pinned' : ''}" data-ag-id="${esc(session.id)}" data-track="${esc(session.track)}">
              <div class="ag-row-node" aria-hidden="true"></div>
              <div class="ag-row-time-col">
                ${isTimeTba
                  ? `<span class="ag-time-tba">Time to be announced</span>`
                  : `<time class="ag-time-confirmed">${esc(session.time)}</time>`
                }
              </div>

              <div class="ag-row-main">
                <div class="ag-row-badges">
                  ${renderTrackChip(session.track)}
                  ${hasConfirmedSpeaker
                    ? `<span class="ag-speaker-pill">${esc(resolvedSpeaker.name)}</span>`
                    : `<span class="ag-speaker-pill ag-speaker-pill--tba">Speaker TBA</span>`
                  }
                  <span class="ag-room-pill">${esc(roomLabel)}</span>
                </div>

                <h3 class="ag-row-title">${esc(session.title)}</h3>

                <div class="ag-row-actions">
                  <button
                    type="button"
                    class="ag-expand-btn"
                    data-ag-expand="${esc(session.id)}"
                    aria-expanded="false"
                    aria-controls="ag-drawer-${esc(session.id)}"
                  >
                    SESSION DETAILS
                  </button>
                  <button
                    type="button"
                    class="ag-pin-btn ${isPinned ? 'is-pinned' : ''}"
                    data-ag-pin="${esc(session.id)}"
                    aria-pressed="${isPinned ? 'true' : 'false'}"
                  >
                    ${isPinned ? 'SAVED TO MY SCHEDULE' : '+ SAVE SESSION'}
                  </button>
                </div>

                <div id="ag-drawer-${esc(session.id)}" class="ag-row-drawer" hidden>
                  <p class="ag-drawer-note">${esc(session.description)}</p>
                  <div class="ag-drawer-meta">
                    <span>Speaker: ${hasConfirmedSpeaker ? esc(`${resolvedSpeaker.name} (${resolvedSpeaker.role})`) : 'To be announced'}</span>
                    <span>Room: ${esc(roomLabel)}</span>
                  </div>
                </div>
              </div>
            </article>
          `;
        }).join('')}
          </div>
          <p id="ag-empty-state" class="spk-empty-state" hidden>No agenda sessions in this track yet.</p>
        </div>
      </div>
    </section>
  `;
}

export function mountAgendaSection() {
  const section = document.getElementById('agenda');
  if (!section) return () => {};

  const pins = readPins();
  const countEl = document.getElementById('ag-pin-count');
  const exportBtn = document.getElementById('ag-export-ics');
  const rows = Array.from(section.querySelectorAll('.ag-row'));
  const filterBtns = Array.from(section.querySelectorAll('[data-ag-filter]'));
  const emptyEl = document.getElementById('ag-empty-state');
  const cleanups = [];

  const refreshPinCount = () => {
    const active = (agendaData.sessions || []).filter((s) => pins.has(s.id)).length;
    if (countEl) countEl.textContent = String(active);
  };

  filterBtns.forEach((btn) => {
    const onClick = () => {
      const fid = btn.dataset.agFilter || 'all';
      filterBtns.forEach((b) => {
        const active = b === btn;
        b.classList.toggle('active', active);
        b.setAttribute('aria-pressed', String(active));
      });
      let visible = 0;
      rows.forEach((row) => {
        const show = matchesAgendaTrack(row.dataset.track || '', fid);
        row.hidden = !show;
        if (show) visible += 1;
      });
      if (emptyEl) emptyEl.hidden = visible > 0;
    };
    btn.addEventListener('click', onClick);
    cleanups.push(() => btn.removeEventListener('click', onClick));
  });

  section.querySelectorAll('[data-ag-pin]').forEach((btn) => {
    const onClick = () => {
      const id = btn.dataset.agPin;
      if (!id) return;
      if (pins.has(id)) {
        pins.delete(id);
      } else {
        pins.add(id);
      }
      writePins(pins);
      const isPinned = pins.has(id);
      btn.classList.toggle('is-pinned', isPinned);
      btn.setAttribute('aria-pressed', String(isPinned));
      btn.textContent = isPinned ? 'SAVED TO MY SCHEDULE' : '+ SAVE SESSION';
      btn.closest('.ag-row')?.classList.toggle('is-pinned', isPinned);
      refreshPinCount();
    };
    btn.addEventListener('click', onClick);
    cleanups.push(() => btn.removeEventListener('click', onClick));
  });

  section.querySelectorAll('[data-ag-expand]').forEach((btn) => {
    const onClick = () => {
      const id = btn.dataset.agExpand;
      const drawer = document.getElementById(`ag-drawer-${id}`);
      if (!drawer) return;
      const open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!open));
      btn.textContent = !open ? 'HIDE DETAILS' : 'SESSION DETAILS';
      drawer.hidden = open;
    };
    btn.addEventListener('click', onClick);
    cleanups.push(() => btn.removeEventListener('click', onClick));
  });

  if (exportBtn) {
    const onExport = () => {
      downloadText('devfest-madurai-2026-schedule.ics', buildMyAgendaIcs(agendaData.sessions || [], pins));
    };
    exportBtn.addEventListener('click', onExport);
    cleanups.push(() => exportBtn.removeEventListener('click', onExport));
  }

  return () => cleanups.forEach((fn) => fn());
}
