/**
 * Venue Section (#14, S7):
 * - Kinetic 12 12 2026 rolling digits + giant outline-to-fill numerals.
 * - SVG line-drawn Madurai coordinate telemetry map (9.9252 N, 78.1198 E) with radar sweep.
 * - Live countdown instrument to 2026-12-12T09:00:00+05:30 with static reduced-motion & post-event handling.
 */
import { esc } from '../utils/dom.js';
import { prefersReducedMotion } from '../utils/env.js';

const EVENT_TARGET_MS = Date.parse('2026-12-12T09:00:00+05:30');

function computeCountdownParts(nowMs = Date.now()) {
  const diff = EVENT_TARGET_MS - nowMs;
  if (diff <= 0) {
    return {
      passed: true,
      days: '000',
      hours: '00',
      minutes: '00',
      seconds: '00',
    };
  }
  const totalSec = Math.floor(diff / 1000);
  const days = Math.floor(totalSec / 86400);
  const hours = Math.floor((totalSec % 86400) / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = totalSec % 60;
  return {
    passed: false,
    days: String(days).padStart(3, '0'),
    hours: String(hours).padStart(2, '0'),
    minutes: String(minutes).padStart(2, '0'),
    seconds: String(seconds).padStart(2, '0'),
  };
}

export function renderVenueSection(venueData, links) {
  const initial = computeCountdownParts();
  const cards = venueData.cards || [];

  return `
    <section id="venue" class="stage-section venue-stage" data-waypoint="2" aria-labelledby="heading-venue">
      <div class="venue-header-band">
        <div>
          <span class="stage-eyebrow" data-scramble="true">${esc(venueData.tag)}</span>
          <h2 id="heading-venue" class="stage-display" data-reveal="mask" data-track-scroll="true">${esc(venueData.heading)}</h2>
          <p class="stage-lead">${esc(venueData.copy)}</p>
        </div>
        <div class="venue-date-monument">
          <div class="k-outline-display venue-outline-date" data-outline-fill="true" aria-hidden="true">12 12 2026</div>
          <div class="venue-roll-wrap">
            <span class="venue-roll-label">EVENT DATE //</span>
            <div class="venue-counter-date">12 DECEMBER 2026</div>
          </div>
        </div>
      </div>

      <div class="venue-blueprint-grid">
        <div class="venue-telemetry-map" aria-label="Madurai coordinate telemetry map">
          <div class="venue-map-meta">
            <span>LAT 9.9252° N</span>
            <span>LON 78.1198° E</span>
            <span class="venue-map-live">SECTOR // MADURAI</span>
          </div>

          <svg class="venue-radar-svg" viewBox="0 0 420 340" fill="none" role="img" aria-label="Madurai radar telemetry 9.9252 N 78.1198 E">
            <defs>
              <radialGradient id="venueSweepGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stop-color="#5ef3ff" stop-opacity="0.34"/>
                <stop offset="100%" stop-color="#9b5cff" stop-opacity="0"/>
              </radialGradient>
            </defs>

            <!-- Coordinate graticule -->
            <g stroke="#5ef3ff" stroke-opacity="0.14" stroke-width="0.8">
              <line x1="0" y1="68" x2="420" y2="68"/>
              <line x1="0" y1="170" x2="420" y2="170"/>
              <line x1="0" y1="272" x2="420" y2="272"/>
              <line x1="90" y1="0" x2="90" y2="340"/>
              <line x1="210" y1="0" x2="210" y2="340"/>
              <line x1="330" y1="0" x2="330" y2="340"/>
            </g>

            <!-- Stylized Vaigai river vector contour & arterial rings -->
            <path d="M18 112 C98 134, 154 96, 218 124 C284 152, 344 128, 408 158" stroke="#9b5cff" stroke-width="1.6" stroke-dasharray="5 5" opacity="0.72"/>
            <circle cx="210" cy="170" r="136" stroke="#5ef3ff" stroke-opacity="0.24" stroke-width="1" stroke-dasharray="3 6"/>
            <circle cx="210" cy="170" r="92" stroke="#5ef3ff" stroke-opacity="0.35" stroke-width="1"/>
            <circle cx="210" cy="170" r="46" stroke="#9b5cff" stroke-opacity="0.52" stroke-width="1.2"/>

            <!-- Temple gopuram cardinal markers (E/W/N/S) -->
            <rect x="206" y="166" width="8" height="8" stroke="#f3f6ff" stroke-width="1.2"/>
            <line x1="210" y1="26" x2="210" y2="314" stroke="#5ef3ff" stroke-opacity="0.22" stroke-width="1"/>
            <line x1="66" y1="170" x2="354" y2="170" stroke="#5ef3ff" stroke-opacity="0.22" stroke-width="1"/>

            <!-- Rotating radar wedge -->
            <g class="venue-radar-arm">
              <path d="M210,170 L210,34 A136,136 0 0,1 324,96 Z" fill="url(#venueSweepGrad)"/>
              <line x1="210" y1="170" x2="210" y2="34" stroke="#5ef3ff" stroke-width="1.4" stroke-opacity="0.85"/>
            </g>

            <!-- Center lock node -->
            <circle cx="210" cy="170" r="5" fill="#5ef3ff"/>
            <circle cx="210" cy="170" r="16" stroke="#5ef3ff" stroke-width="1" class="venue-ping-ring"/>

            <text x="224" y="162" fill="#f3f6ff" font-size="9" font-family="Orbe Mono, monospace" letter-spacing="1.4">9.9252° N</text>
            <text x="224" y="176" fill="#5ef3ff" font-size="9" font-family="Orbe Mono, monospace" letter-spacing="1.4">78.1198° E</text>
          </svg>

          <div class="venue-radar-status">
            <span class="venue-radar-dot" aria-hidden="true"></span>
            <div>
              <strong class="venue-status-title">Venue: To be announced.</strong>
              <span class="venue-status-sub">${esc(venueData.statusBadge)}</span>
            </div>
          </div>
        </div>

        <div class="venue-instrument-deck">
          <div class="venue-countdown-box" id="venue-countdown" aria-live="off" aria-label="Countdown to DevFest Madurai 2026">
            <span class="venue-countdown-label">T-MINUS // 12 DEC 2026 · 09:00 IST</span>
            ${initial.passed ? `
              <div class="venue-countdown-passed">MISSION WINDOW OPEN — 12 DEC 2026</div>
            ` : `
              <div class="venue-countdown-digits">
                <div class="venue-unit"><strong data-cd="days">${initial.days}</strong><span>DAYS</span></div>
                <span class="venue-colon" aria-hidden="true">:</span>
                <div class="venue-unit"><strong data-cd="hours">${initial.hours}</strong><span>HRS</span></div>
                <span class="venue-colon" aria-hidden="true">:</span>
                <div class="venue-unit"><strong data-cd="minutes">${initial.minutes}</strong><span>MIN</span></div>
                <span class="venue-colon" aria-hidden="true">:</span>
                <div class="venue-unit"><strong data-cd="seconds">${initial.seconds}</strong><span>SEC</span></div>
              </div>
            `}
          </div>

          <dl id="event-info" class="venue-specs-list" aria-label="Event Information">
            ${cards.map((card, i) => `
              <div class="venue-spec-row">
                <dt class="venue-spec-term">
                  <span class="venue-spec-idx">0${i + 1}</span>
                  <span>${esc(card.title)}</span>
                </dt>
                <dd class="venue-spec-val">
                  <strong>${esc(card.body)}</strong>
                  <span class="venue-spec-note">${esc(card.badge)}</span>
                </dd>
              </div>
            `).join('')}
          </dl>

          <div class="orbe-cta-row">
            <a href="${esc(links.tickets)}" target="_blank" rel="noopener noreferrer" class="btn-link-inline" data-magnetic="true">REGISTER NOW //</a>
            <a href="#agenda" class="btn-link-inline">EXPLORE AGENDA //</a>
          </div>
        </div>
      </div>
    </section>
  `;
}

export function mountVenueSection() {
  const box = document.getElementById('venue-countdown');
  if (!box || prefersReducedMotion()) return () => {};

  const dEl = box.querySelector('[data-cd="days"]');
  const hEl = box.querySelector('[data-cd="hours"]');
  const mEl = box.querySelector('[data-cd="minutes"]');
  const sEl = box.querySelector('[data-cd="seconds"]');
  if (!dEl || !hEl || !mEl || !sEl) return () => {};

  let timerId = 0;
  function tick() {
    const next = computeCountdownParts();
    if (next.passed) {
      box.innerHTML = `<span class="venue-countdown-label">T-MINUS // 12 DEC 2026 · 09:00 IST</span><div class="venue-countdown-passed">MISSION WINDOW OPEN — 12 DEC 2026</div>`;
      window.clearInterval(timerId);
      return;
    }
    if (dEl.textContent !== next.days) dEl.textContent = next.days;
    if (hEl.textContent !== next.hours) hEl.textContent = next.hours;
    if (mEl.textContent !== next.minutes) mEl.textContent = next.minutes;
    if (sEl.textContent !== next.seconds) sEl.textContent = next.seconds;
  }

  timerId = window.setInterval(tick, 1000);
  return () => window.clearInterval(timerId);
}
