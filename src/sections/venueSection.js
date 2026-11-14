/** Venue & Event Info Section — Clear 4-Card Grid, Countdown, Maps & .ics Export */
import eventData from '../data/event.json';
import { esc, renderStatusChip } from '../utils/dom.js';
import { spinCountdownDigit } from '../motion/textMotion.js';

export const EVENT_TARGET_MS = Date.parse('2026-12-12T09:00:00+05:30');
const MADURAI_MAPS_URL = 'https://www.google.com/maps/search/?api=1&query=Madurai%2C+Tamil+Nadu%2C+India';

export function computeCountdownParts(nowMs = Date.now()) {
  const diff = EVENT_TARGET_MS - nowMs;
  if (diff <= 0) {
    return { passed: true, days: '00', hours: '00', mins: '00' };
  }
  const totalMins = Math.floor(diff / 60000);
  const days = Math.floor(totalMins / (60 * 24));
  const hours = Math.floor((totalMins % (60 * 24)) / 60);
  const mins = totalMins % 60;
  return {
    passed: false,
    days: String(days).padStart(2, '0'),
    hours: String(hours).padStart(2, '0'),
    mins: String(mins).padStart(2, '0'),
  };
}

function buildEventIcs(links) {
  const url = links?.tickets || 'https://gdg.community.dev/gdg-madurai/';
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//GDG Madurai//DevFest Madurai 2026//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    'UID:devfest-madurai-2026@gdgmadurai.in',
    'DTSTAMP:20260101T000000Z',
    'DTSTART;VALUE=DATE:20261212',
    'DTEND;VALUE=DATE:20261213',
    'SUMMARY:DevFest Madurai 2026 — GDG Madurai',
    'DESCRIPTION:Where Curiosity Meets Creation. Build. Learn. Connect. Create. Full-day tech festival in Madurai, Tamil Nadu.',
    'LOCATION:Madurai, Tamil Nadu, India',
    `URL:${url}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}

function triggerIcsDownload(filename, content) {
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function renderVenueSection(venueData, links) {
  const cd = computeCountdownParts();

  return `
    <section id="venue" class="stage-section" aria-labelledby="heading-venue">
      <div class="stage-asymmetric stage-asymmetric--flip">
        <div class="graphic-window" data-creature-zone="venue" aria-hidden="true"></div>

        <div class="content-zone local-scrim">
          <div class="stage-section-head">
            <div>
              <span class="stage-eyebrow" data-scramble="true">${esc(venueData.tag)}</span>
              <h2 id="heading-venue" class="stage-display" data-reveal="mask">${esc(venueData.heading)}</h2>
            </div>
          </div>
          <p class="stage-lead">${esc(venueData.copy)}</p>

          <div class="hud-bevel-card venue-countdown-panel" aria-live="polite" aria-label="Countdown to DevFest Madurai 2026">
            <div class="venue-countdown-header">
              <span class="venue-countdown-kicker">COUNTDOWN TO DEVFEST MADURAI 2026</span>
              ${renderStatusChip('12 DEC 2026', 'cyan')}
            </div>
            ${cd.passed
              ? `<p class="venue-countdown-passed">DevFest Madurai 2026 is underway in Madurai, Tamil Nadu.</p>`
              : `<div class="venue-countdown-digits" id="venue-countdown">
                  <div class="venue-unit"><strong id="cd-days">${cd.days}</strong><span>DAYS</span></div>
                  <span class="venue-colon" aria-hidden="true">:</span>
                  <div class="venue-unit"><strong id="cd-hours">${cd.hours}</strong><span>HOURS</span></div>
                  <span class="venue-colon" aria-hidden="true">:</span>
                  <div class="venue-unit"><strong id="cd-mins">${cd.mins}</strong><span>MINUTES</span></div>
                </div>`
            }
          </div>

          <div class="venue-info-grid">
            <article class="hud-bevel-card venue-info-card venue-info-card--blue">
              <div class="venue-info-top">
                <span class="venue-info-label">01 // DATE</span>
                ${renderStatusChip('CONFIRMED', 'open')}
              </div>
              <h3 class="venue-info-value">${esc(eventData.dateDisplay)}</h3>
              <p class="venue-info-note">${esc(eventData.dateSub)}</p>
            </article>

            <article class="hud-bevel-card venue-info-card venue-info-card--green">
              <div class="venue-info-top">
                <span class="venue-info-label">02 // TIME</span>
                ${renderStatusChip('TBA', 'tba')}
              </div>
              <h3 class="venue-info-value">To be announced.</h3>
              <p class="venue-info-note">Full-day tech festival schedule locking soon.</p>
            </article>

            <article class="hud-bevel-card venue-info-card venue-info-card--yellow">
              <div class="venue-info-top">
                <span class="venue-info-label">03 // LOCATION</span>
                ${renderStatusChip('CITY CONFIRMED', 'blue')}
              </div>
              <h3 class="venue-info-value">${esc(eventData.locationDisplay)}</h3>
              <p class="venue-info-note">${esc(eventData.locationSub)}</p>
            </article>

            <article class="hud-bevel-card venue-info-card venue-info-card--red">
              <div class="venue-info-top">
                <span class="venue-info-label">04 // VENUE</span>
                ${renderStatusChip('TBA', 'tba')}
              </div>
              <h3 class="venue-info-value">${esc(eventData.venueDisplay)}</h3>
              <p class="venue-info-note">${esc(eventData.venueSub)}</p>
            </article>
          </div>

          <div class="venue-actions-row">
            <a href="${esc(links.tickets)}" target="_blank" rel="noopener noreferrer" class="btn-g-primary">REGISTER NOW</a>
            <a href="#agenda" class="btn-g-secondary">EXPLORE AGENDA</a>
            <button type="button" id="venue-ics-btn" class="btn-g-secondary">ADD TO CALENDAR (.ICS)</button>
            <a href="${MADURAI_MAPS_URL}" target="_blank" rel="noopener noreferrer" class="btn-g-secondary">VIEW MADURAI ON GOOGLE MAPS ↗</a>
          </div>
        </div>
      </div>
    </section>
  `;
}

export function mountVenueSection() {
  const daysEl = document.getElementById('cd-days');
  const hoursEl = document.getElementById('cd-hours');
  const minsEl = document.getElementById('cd-mins');
  const icsBtn = document.getElementById('venue-ics-btn');

  let timer = null;
  if (daysEl && hoursEl && minsEl) {
    const tick = () => {
      const cd = computeCountdownParts();
      if (cd.passed) {
        if (timer) clearInterval(timer);
        return;
      }
      spinCountdownDigit(daysEl, cd.days);
      spinCountdownDigit(hoursEl, cd.hours);
      spinCountdownDigit(minsEl, cd.mins);
    };
    tick();
    timer = setInterval(tick, 15000);
  }

  const onIcsClick = () => {
    triggerIcsDownload('devfest-madurai-2026.ics', buildEventIcs(eventData.links));
  };
  icsBtn?.addEventListener('click', onIcsClick);

  return () => {
    if (timer) clearInterval(timer);
    icsBtn?.removeEventListener('click', onIcsClick);
  };
}
