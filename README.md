# DevFest Madurai 2026 — GDG Madurai

Official web application for **GDG Madurai presents DevFest Madurai 2026** (`12 December 2026 · Madurai, Tamil Nadu, India`).

## Development

```bash
npm install
npm run dev       # Start local dev server
npm run build     # Build production bundle into dist/
npm run preview   # Preview production build
```

## Routes & Navigation

- `/` (`index.html`): Main landing experience (`#home`, `#about`, `#venue`, `#speakers`, `#agenda`, `#tickets`, `#sponsors`, `#memories`)
- `/speakers` (`speakers.html`): Full speakers directory with track filters and bio modals
- `/memories` (`memories.html`): Community photographic chronicle across past editions

All routes resolve cleanly via SPA navigation and Vercel rewrites (`vercel.json`).

## How to add a speaker

1. **Prepare the headshot photo**:
   - Aspect ratio: **4:5 portrait** (`800×1000 px` recommended).
   - Format & size: **WebP**, **< 150 KB**.
   - Naming: `<speaker-id>.webp` or `firstname-lastname.webp` saved in `public/assets/speakers/`.
   - If `"photo": ""` (or unset), the card renders an automatic portrait placeholder with `"Speaker to be announced"`.

2. **Add or update an entry in `src/data/speakers.json`**:

```json
{
  "id": "spk-08",
  "name": "Speaker Full Name",
  "role": "Staff Engineer",
  "organisation": "Company or Community",
  "track": "ai",
  "topic": "Talk or Session Title",
  "bio": "2–3 concise sentences describing speaker expertise and session takeaways.",
  "photo": "/assets/speakers/firstname-lastname.webp",
  "socials": {
    "linkedin": "https://www.linkedin.com/in/handle/",
    "x": "https://x.com/handle",
    "github": "https://github.com/handle",
    "website": "https://example.com"
  },
  "status": "confirmed",
  "showOnHome": true
}
```

- **Valid `track` keys**: `"hosts"`, `"ai"`, `"cloud"`, `"android"`, `"workshop"`, `"opensource"`, `"design"`.
- **Valid `status` values**: `"confirmed"` (shows confirmed badge & enables bio/socials modal) or `"tba"` (shows TBA placeholder state).

## How to add or update an agenda session

Edit `src/data/agenda.json`. Sessions sort chronologically automatically when `"time"` uses `HH:MM` 24-hour format (or `"TBA"` until schedule lock):

```json
{
  "id": "ag-07",
  "time": "10:30",
  "title": "Session Title",
  "track": "ai",
  "description": "What attendees will build or learn during this session.",
  "speakerId": "spk-08",
  "room": "Main Auditorium"
}
```

## How to update sponsors & community partners

Replace logos in `public/assets/sponsors/` and `public/assets/partners/`, then edit `src/data/sponsors.json` (Platinum, Gold, and Partner entries).
