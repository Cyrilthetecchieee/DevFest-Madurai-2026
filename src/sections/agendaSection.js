/**
 * Agenda Section — THE DAY RING Interactive Radial Dial, Session Inspector,
 * Swipeable Mobile Rail, Accessible List Toggle, Saved Sessions & .ics Export.
 */
import agendaData from '../data/agenda.json';
import speakersData from '../data/speakers.json';
import {
  esc,
  renderTrackChip,
  renderStatusChip,
} from '../utils/dom.js';

const PIN_KEY = 'devfest_my_agenda_v2';

const TRACK_COLORS = {
  ai: '#5ef3ff',
  cloud: '#3ee8b5',
  android: '#7dd3fc',
  opensource: '#f472b6',
  design: '#f472b6',
  workshop: '#9b5cff',
  general: '#a5b4fc',
};

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

function polarToXY(cx, cy, r, deg) {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function describeArc(cx, cy, r, startDeg, endDeg) {
  const start = polarToXY(cx, cy, r, startDeg);
  const end = polarToXY(cx, cy, r, endDeg);
  const large = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${start.x.toFixed(2)} ${start.y.toFixed(2)} A ${r} ${r} 0 ${large} 1 ${end.x.toFixed(2)} ${end.y.toFixed(2)}`;
}

function describeAnnularSector(cx, cy, rInner, rOuter, startDeg, endDeg) {
  const o0 = polarToXY(cx, cy, rOuter, startDeg);
  const o1 = polarToXY(cx, cy, rOuter, endDeg);
  const i1 = polarToXY(cx, cy, rInner, endDeg);
  const i0 = polarToXY(cx, cy, rInner, startDeg);
  const large = endDeg - startDeg > 180 ? 1 : 0;
  return [
    `M ${o0.x.toFixed(2)} ${o0.y.toFixed(2)}`,
    `A ${rOuter} ${rOuter} 0 ${large} 1 ${o1.x.toFixed(2)} ${o1.y.toFixed(2)}`,
    `L ${i1.x.toFixed(2)} ${i1.y.toFixed(2)}`,
    `A ${rInner} ${rInner} 0 ${large} 0 ${i0.x.toFixed(2)} ${i0.y.toFixed(2)}`,
    'Z',
  ].join(' ');
}

function renderRingArcsMarkup(sessions, activeId) {
  const count = Math.max(1, sessions.length);
  const span = 360 / count;
  const gap = count === 1 ? 0 : Math.min(8, span * 0.2);

  return sessions
    .map((s, idx) => {
      const a0 = idx * span + gap * 0.5;
      const a1 = (idx + 1) * span - gap * 0.5;
      const mid = (a0 + a1) * 0.5;
      const labelPos = polarToXY(210, 210, 186, mid);
      const col = TRACK_COLORS[s.track] || '#5ef3ff';
      const isActive = s.id === activeId;
      const pathD = count === 1
        ? describeArc(210, 210, 152, 0, 359.2)
        : describeArc(210, 210, 152, a0, a1);
      const hitD = count === 1
        ? describeAnnularSector(210, 210, 118, 198, 0, 359.2)
        : describeAnnularSector(210, 210, 118, 198, a0, a1);

      return `
        <g class="ag-ring-sector ${isActive ? 'is-active' : ''}" data-ag-sector="${esc(s.id)}">
          <path d="${hitD}" class="ag-ring-hit" />
          <path
            d="${pathD}"
            stroke="${col}"
            stroke-width="${isActive ? 22 : 13}"
            stroke-linecap="round"
            fill="none"
            class="ag-ring-arc-path"
            role="button"
            tabindex="0"
            aria-pressed="${isActive ? 'true' : 'false'}"
            aria-label="Track session ${idx + 1}: ${esc(s.title)}"
          />
          <text
            x="${labelPos.x.toFixed(1)}"
            y="${(labelPos.y + 4).toFixed(1)}"
            text-anchor="middle"
            class="ag-ring-arc-label ${isActive ? 'is-active' : ''}"
          >${String(idx + 1).padStart(2, '0')}</text>
        </g>
      `;
    })
    .join('');
}

export function renderAgendaSection() {
  const pins = readPins();
  const speakerById = new Map((speakersData.speakers || []).map((sp) => [sp.id, sp]));
  const orderedSessions = sortSessionsChronologically(agendaData.sessions || []);
  const pinnedCount = orderedSessions.filter((s) => pins.has(s.id)).length;
  const firstSession = orderedSessions[0];

  const getSpeakerText = (s) => {
    const sp = s?.speakerId ? speakerById.get(s.speakerId) : null;
    return sp && sp.status === 'confirmed' ? `${sp.name} (${sp.role})` : 'Speaker TBA';
  };
  const getTimeText = (s) => (!s?.time || s.time.toUpperCase() === 'TBA' ? 'Time to be announced' : s.time);
  const getRoomText = (s) => (!s?.room || s.room.toUpperCase() === 'TBA' ? 'Room to be announced' : s.room);

  return `
    <section id="agenda" class="stage-section ag-stage" aria-labelledby="heading-agenda">
      <div class="stage-asymmetric stage-asymmetric--flip">
        <div class="ag-ring-dial-wrap graphic-window" data-creature-zone="agenda">
          <div class="ag-ring-dial" id="ag-ring-dial">
            <svg class="ag-ring-svg" viewBox="0 0 420 420" role="group" aria-label="Interactive schedule Day Ring">
              <circle cx="210" cy="210" r="152" fill="none" stroke="rgba(94, 243, 255, 0.12)" stroke-width="2" />
              <circle cx="210" cy="210" r="118" fill="none" stroke="rgba(155, 92, 255, 0.24)" stroke-width="1" stroke-dasharray="4 6" />
              <g id="ag-ring-arcs-layer">
                ${firstSession ? renderRingArcsMarkup(orderedSessions, firstSession.id) : ''}
              </g>
              <circle id="ag-ring-sweep-dot" cx="210" cy="58" r="6" fill="#5ef3ff" />
            </svg>

            <div class="ag-ring-core">
              <span class="ag-ring-core-idx" id="ag-ring-idx">01 / ${String(orderedSessions.length).padStart(2, '0')}</span>
              <span class="ag-ring-core-time" id="ag-ring-time">${esc(firstSession ? getTimeText(firstSession) : 'TBA')}</span>
              <span class="ag-ring-core-room" id="ag-ring-room">${esc(firstSession ? getRoomText(firstSession) : 'TBA')}</span>
            </div>
          </div>
        </div>

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
              <span class="ag-planner-count">Saved: <strong id="ag-pin-count">${pinnedCount}</strong></span>
              <button type="button" id="ag-export-ics" class="btn-g-secondary">EXPORT (.ICS)</button>
              <button type="button" id="ag-view-toggle" class="btn-g-secondary" aria-pressed="false">LIST VIEW</button>
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

          ${firstSession ? `
            <article class="hud-bevel-card ag-inspector-card" id="ag-inspector" aria-live="polite">
              <div class="ag-inspector-top">
                <div class="ag-row-badges" id="ag-insp-badges">
                  ${renderTrackChip(firstSession.track)}
                  <span class="ag-speaker-pill ${firstSession.speakerId && speakerById.get(firstSession.speakerId)?.status === 'confirmed' ? '' : 'ag-speaker-pill--tba'}">${esc(getSpeakerText(firstSession))}</span>
                  <span class="ag-room-pill">${esc(getRoomText(firstSession))}</span>
                </div>
                <div class="ag-insp-nav">
                  <button type="button" id="ag-ring-prev" class="hero-pillar-nav-btn" aria-label="Previous session">&lsaquo;</button>
                  <button type="button" id="ag-ring-next" class="hero-pillar-nav-btn" aria-label="Next session">&rsaquo;</button>
                </div>
              </div>

              <div class="ag-insp-time" id="ag-insp-time">${esc(getTimeText(firstSession))}</div>
              <h3 class="ag-insp-title" id="ag-insp-title">${esc(firstSession.title)}</h3>
              <p class="ag-insp-desc" id="ag-insp-desc">${esc(firstSession.description)}</p>

              <div class="ag-row-actions">
                <button
                  type="button"
                  id="ag-insp-pin"
                  class="ag-pin-btn ${pins.has(firstSession.id) ? 'is-pinned' : ''}"
                  data-ag-pin-active="${esc(firstSession.id)}"
                  aria-pressed="${pins.has(firstSession.id) ? 'true' : 'false'}"
                >
                  ${pins.has(firstSession.id) ? 'SAVED TO MY SCHEDULE' : '+ SAVE SESSION'}
                </button>
              </div>
            </article>
          ` : ''}

          <div class="ag-timeline ag-timeline--collapsible" id="ag-timeline" hidden>
            ${orderedSessions.map((session) => {
              const isPinned = pins.has(session.id);
              const isTimeTba = !session.time || session.time.toUpperCase() === 'TBA';
              const resolvedSpeaker = session.speakerId ? speakerById.get(session.speakerId) : null;
              const hasConfirmedSpeaker = Boolean(resolvedSpeaker && resolvedSpeaker.status === 'confirmed');
              const roomLabel = getRoomText(session);

              return `
                <article class="ag-row ag-row--${esc(session.track)} ${isPinned ? 'is-pinned' : ''}" data-ag-id="${esc(session.id)}" data-track="${esc(session.track)}">
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
                    <p class="ag-drawer-note">${esc(session.description)}</p>

                    <div class="ag-row-actions">
                      <button
                        type="button"
                        class="ag-pin-btn ${isPinned ? 'is-pinned' : ''}"
                        data-ag-pin="${esc(session.id)}"
                        aria-pressed="${isPinned ? 'true' : 'false'}"
                      >
                        ${isPinned ? 'SAVED TO MY SCHEDULE' : '+ SAVE SESSION'}
                      </button>
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
  const speakerById = new Map((speakersData.speakers || []).map((sp) => [sp.id, sp]));
  const allSessions = sortSessionsChronologically(agendaData.sessions || []);
  let filteredSessions = [...allSessions];
  let activeId = allSessions[0]?.id || '';

  const countEl = document.getElementById('ag-pin-count');
  const exportBtn = document.getElementById('ag-export-ics');
  const viewToggleBtn = document.getElementById('ag-view-toggle');
  const timelineEl = document.getElementById('ag-timeline');
  const inspectorEl = document.getElementById('ag-inspector');
  const dialWrapEl = document.getElementById('ag-ring-dial');
  const arcsLayer = document.getElementById('ag-ring-arcs-layer');
  const sweepDot = document.getElementById('ag-ring-sweep-dot');
  const ringIdxEl = document.getElementById('ag-ring-idx');
  const ringTimeEl = document.getElementById('ag-ring-time');
  const ringRoomEl = document.getElementById('ag-ring-room');
  const inspBadgesEl = document.getElementById('ag-insp-badges');
  const inspTimeEl = document.getElementById('ag-insp-time');
  const inspTitleEl = document.getElementById('ag-insp-title');
  const inspDescEl = document.getElementById('ag-insp-desc');
  const inspPinBtn = document.getElementById('ag-insp-pin');
  const prevBtn = document.getElementById('ag-ring-prev');
  const nextBtn = document.getElementById('ag-ring-next');
  const rows = Array.from(section.querySelectorAll('.ag-row'));
  const filterBtns = Array.from(section.querySelectorAll('[data-ag-filter]'));
  const emptyEl = document.getElementById('ag-empty-state');
  const cleanups = [];

  const refreshPinCount = () => {
    const active = allSessions.filter((s) => pins.has(s.id)).length;
    if (countEl) countEl.textContent = String(active);
  };

  const renderActiveRingState = () => {
    const list = filteredSessions;
    const idx = Math.max(0, list.findIndex((s) => s.id === activeId));
    const current = list[idx] || list[0];
    if (!current) return;
    activeId = current.id;

    if (arcsLayer) {
      arcsLayer.innerHTML = renderRingArcsMarkup(list, current.id);
    }

    const span = 360 / Math.max(1, list.length);
    const midDeg = idx * span + span * 0.5;
    const pt = polarToXY(210, 210, 152, midDeg);
    if (sweepDot) {
      sweepDot.setAttribute('cx', pt.x.toFixed(1));
      sweepDot.setAttribute('cy', pt.y.toFixed(1));
      sweepDot.setAttribute('fill', TRACK_COLORS[current.track] || '#5ef3ff');
    }

    const timeText = !current.time || current.time.toUpperCase() === 'TBA' ? 'Time to be announced' : current.time;
    const roomText = !current.room || current.room.toUpperCase() === 'TBA' ? 'Room to be announced' : current.room;
    const sp = current.speakerId ? speakerById.get(current.speakerId) : null;
    const confirmedSp = sp && sp.status === 'confirmed';
    const isPinned = pins.has(current.id);

    if (ringIdxEl) ringIdxEl.textContent = `${String(idx + 1).padStart(2, '0')} / ${String(list.length).padStart(2, '0')}`;
    if (ringTimeEl) ringTimeEl.textContent = timeText;
    if (ringRoomEl) ringRoomEl.textContent = roomText;
    if (inspTimeEl) inspTimeEl.textContent = timeText;
    if (inspTitleEl) inspTitleEl.textContent = current.title;
    if (inspDescEl) inspDescEl.textContent = current.description;
    if (inspBadgesEl) {
      inspBadgesEl.innerHTML = `
        ${renderTrackChip(current.track)}
        <span class="ag-speaker-pill ${confirmedSp ? '' : 'ag-speaker-pill--tba'}">${esc(confirmedSp ? `${sp.name} (${sp.role})` : 'Speaker TBA')}</span>
        <span class="ag-room-pill">${esc(roomText)}</span>
      `;
    }
    if (inspPinBtn) {
      inspPinBtn.dataset.agPinActive = current.id;
      inspPinBtn.classList.toggle('is-pinned', isPinned);
      inspPinBtn.setAttribute('aria-pressed', String(isPinned));
      inspPinBtn.textContent = isPinned ? 'SAVED TO MY SCHEDULE' : '+ SAVE SESSION';
    }
  };

  const selectByOffset = (delta) => {
    if (!filteredSessions.length) return;
    const cur = Math.max(0, filteredSessions.findIndex((s) => s.id === activeId));
    const next = (cur + delta + filteredSessions.length) % filteredSessions.length;
    activeId = filteredSessions[next].id;
    renderActiveRingState();
  };

  const onArcInteract = (e) => {
    const sector = e.target.closest('[data-ag-sector]');
    if (!sector) return;
    activeId = sector.dataset.agSector || activeId;
    renderActiveRingState();
  };

  const onArcKey = (e) => {
    const sector = e.target.closest('[data-ag-sector]');
    if (!sector) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      activeId = sector.dataset.agSector || activeId;
      renderActiveRingState();
    } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      selectByOffset(1);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      selectByOffset(-1);
    }
  };

  arcsLayer?.addEventListener('click', onArcInteract);
  arcsLayer?.addEventListener('keydown', onArcKey);
  cleanups.push(() => {
    arcsLayer?.removeEventListener('click', onArcInteract);
    arcsLayer?.removeEventListener('keydown', onArcKey);
  });

  const onPrev = () => selectByOffset(-1);
  const onNext = () => selectByOffset(1);
  prevBtn?.addEventListener('click', onPrev);
  nextBtn?.addEventListener('click', onNext);
  cleanups.push(() => {
    prevBtn?.removeEventListener('click', onPrev);
    nextBtn?.removeEventListener('click', onNext);
  });

  // Swipe support on the Inspector card for effortless phone browsing
  let touchStartX = 0;
  const onTouchStart = (e) => { touchStartX = e.touches[0]?.clientX || 0; };
  const onTouchEnd = (e) => {
    const dx = (e.changedTouches[0]?.clientX || 0) - touchStartX;
    if (Math.abs(dx) > 48) selectByOffset(dx < 0 ? 1 : -1);
  };
  inspectorEl?.addEventListener('touchstart', onTouchStart, { passive: true });
  inspectorEl?.addEventListener('touchend', onTouchEnd, { passive: true });
  cleanups.push(() => {
    inspectorEl?.removeEventListener('touchstart', onTouchStart);
    inspectorEl?.removeEventListener('touchend', onTouchEnd);
  });

  const syncAllPinButtons = (targetId) => {
    const isPinned = pins.has(targetId);
    section.querySelectorAll(`[data-ag-pin="${CSS.escape(targetId)}"]`).forEach((btn) => {
      btn.classList.toggle('is-pinned', isPinned);
      btn.setAttribute('aria-pressed', String(isPinned));
      btn.textContent = isPinned ? 'SAVED TO MY SCHEDULE' : '+ SAVE SESSION';
      btn.closest('.ag-row')?.classList.toggle('is-pinned', isPinned);
    });
    if (inspPinBtn && inspPinBtn.dataset.agPinActive === targetId) {
      inspPinBtn.classList.toggle('is-pinned', isPinned);
      inspPinBtn.setAttribute('aria-pressed', String(isPinned));
      inspPinBtn.textContent = isPinned ? 'SAVED TO MY SCHEDULE' : '+ SAVE SESSION';
    }
    refreshPinCount();
  };

  if (inspPinBtn) {
    const onInspPin = () => {
      const id = inspPinBtn.dataset.agPinActive;
      if (!id) return;
      if (pins.has(id)) pins.delete(id);
      else pins.add(id);
      writePins(pins);
      syncAllPinButtons(id);
    };
    inspPinBtn.addEventListener('click', onInspPin);
    cleanups.push(() => inspPinBtn.removeEventListener('click', onInspPin));
  }

  section.querySelectorAll('[data-ag-pin]').forEach((btn) => {
    const onClick = () => {
      const id = btn.dataset.agPin;
      if (!id) return;
      if (pins.has(id)) pins.delete(id);
      else pins.add(id);
      writePins(pins);
      syncAllPinButtons(id);
    };
    btn.addEventListener('click', onClick);
    cleanups.push(() => btn.removeEventListener('click', onClick));
  });

  filterBtns.forEach((btn) => {
    const onClick = () => {
      const fid = btn.dataset.agFilter || 'all';
      filterBtns.forEach((b) => {
        const active = b === btn;
        b.classList.toggle('active', active);
        b.setAttribute('aria-pressed', String(active));
      });
      filteredSessions = allSessions.filter((s) => matchesAgendaTrack(s.track, fid));
      rows.forEach((row) => {
        row.hidden = !matchesAgendaTrack(row.dataset.track || '', fid);
      });
      const hasResults = filteredSessions.length > 0;
      if (emptyEl) emptyEl.hidden = hasResults;
      if (dialWrapEl) dialWrapEl.classList.toggle('is-dimmed', !hasResults);
      if (hasResults) {
        if (!filteredSessions.some((s) => s.id === activeId)) {
          activeId = filteredSessions[0].id;
        }
        renderActiveRingState();
      }
    };
    btn.addEventListener('click', onClick);
    cleanups.push(() => btn.removeEventListener('click', onClick));
  });

  if (viewToggleBtn && timelineEl) {
    const onToggleView = () => {
      const showList = timelineEl.hidden;
      timelineEl.hidden = !showList;
      viewToggleBtn.setAttribute('aria-pressed', String(showList));
      viewToggleBtn.textContent = showList ? 'DAY RING FOCUS' : 'LIST VIEW';
    };
    viewToggleBtn.addEventListener('click', onToggleView);
    cleanups.push(() => viewToggleBtn.removeEventListener('click', onToggleView));
  }

  if (exportBtn) {
    const onExport = () => {
      downloadText('devfest-madurai-2026-schedule.ics', buildMyAgendaIcs(allSessions, pins));
    };
    exportBtn.addEventListener('click', onExport);
    cleanups.push(() => exportBtn.removeEventListener('click', onExport));
  }

  renderActiveRingState();
  return () => cleanups.forEach((fn) => fn());
}
