# Contributing to GDG Madurai DevFest 2026 Website

Thank you for your interest in contributing to the **GDG Madurai DevFest 2026** website! We welcome contributions of all kinds—bug fixes, performance enhancements, responsive adjustments, accessibility improvements, and documentation updates.

Please take a few moments to review these guidelines before submitting an issue or pull request.

---

## Code of Conduct

All contributors and community participants are expected to adhere to our [Code of Conduct](./CODE_OF_CONDUCT.md) and Google's [Community Guidelines](https://developers.google.com/community-guidelines). Please be respectful, inclusive, and collaborative.

---

## Development Setup

### Prerequisites

- **Node.js**: `v18.0.0` or higher (LTS recommended)
- **npm**: `v9.0.0` or higher
- **Git**

### Local Environment

1. **Fork and clone:**
   ```bash
   git clone https://github.com/<your-username>/DevFest-Madurai-2026.git
   cd DevFest-Madurai-2026
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run local development server:**
   ```bash
   npm run dev
   ```
   Open `http://127.0.0.1:5173/` in your browser.

4. **Test production build:**
   ```bash
   npm run build
   npm run preview
   ```

---

## Design System & Critical Rules

To preserve art direction, branding integrity, and visual consistency, all contributors must observe the following constraints:

### 1. Absolute Hero Lock
The homepage 3D WebGL hero section is locked:
- **Do not modify** hero typography, font scales, line heights, or positioning.
- **Do not modify** the 3D humanoid character, orbital rings, or cosmic background plate.
- **Do not apply global CSS selectors** (such as generic `h1`, `h2`, `p`, or `button` resets) that bleed into `#home` or `.hero-*`. Scope all styling to your specific component.

### 2. Navbar & HUD Lock
- The persistent Mission Control HUD dock, navigation panel, and command palette (`Cmd + K`) have locked dimensions and interactions.
- Do not redesign or replace the navigation system without prior alignment with maintainers.

### 3. Glassmorphism Design Tokens
Components outside the hero must adhere to the shared glassmorphism tokens in `src/styles/tokens.css` and `src/styles/sections.css`:
- **Surfaces:** Translucent midnight-blue backgrounds (`var(--glass-bg-card)`, `var(--glass-bg-surface)`).
- **Backdrop Filters:** Controlled `backdrop-filter: blur(12px)`.
- **Borders:** Restrained hairline borders (`1px solid var(--glass-border)`).
- **Accents:** Dual-tone illumination using cyan (`var(--cyan)`: `#5ef3ff`) and violet (`var(--violet)`: `#9b5cff`).
- **Avoid:** Heavy solid opacities, neon border glow over-saturation, and high-contrast drop shadows.

### 4. Scoped Typography
- **Headings & Card Titles:** `Space Grotesk` (`var(--font-heading)`).
- **Body & Paragraphs:** `Inter` (`var(--font-body)`).
- **Technical Metadata & Telemetry:** `Orbe Mono` (`var(--font-mono)`).
- Keep font sizes scalable using `clamp()` where appropriate.

### 5. Content Accuracy
- Data is managed via JSON files under `src/data/`.
- Do **not** invent speaker names, session times, or unconfirmed venue rooms. Unannounced details must remain as `TBA` or `To be announced`.

---

## Coding Standards

### JavaScript (ES Modules)
- We use vanilla ES2022 modules without heavy frontend framework dependencies.
- Keep components modular under `src/sections/` and views under `src/pages/`.
- Always sanitize interpolated data using `esc()` from `src/utils/dom.js`.
- Always provide cleanup functions in `mount*()` components (e.g., removing event listeners, stopping animation loops).

### CSS & Layouts
- Maintain mobile-first responsive architecture.
- Ensure **zero horizontal scroll overflow** (`scrollWidth <= innerWidth`) across all viewports (`360px`, `390px`, `768px`, `1024px`, `1440px`).
- Always support `prefers-reduced-motion: reduce` by disabling or simplifying complex transitions and WebGL displacements.

### Accessibility (a11y)
- Ensure all interactive elements (`<a>`, `<button>`) have accessible names via visible text or `aria-label`.
- Provide keyboard focus indicators (`:focus-visible`).
- External links must specify `target="_blank" rel="noopener noreferrer"`.
- Images must include meaningful, descriptive `alt` attributes.

---

## Git & Pull Request Workflow

### 1. Branch Naming
Use descriptive branch prefixes:
- `feat/` for new features or sections (e.g., `feat/agenda-export-button`)
- `fix/` for bug or styling fixes (e.g., `fix/mobile-banner-alignment`)
- `docs/` for documentation improvements (e.g., `docs/update-readme-badges`)
- `refactor/` for non-breaking code restructuring (e.g., `refactor/optimize-three-shaders`)

### 2. Commit Messages
Follow conventional commits:
```bash
git commit -m "feat(speakers): add keyboard navigation to constellation filter rail"
git commit -m "fix(tickets): correct QR SVG aspect ratio on mobile viewports"
```

### 3. Submitting a Pull Request
1. Keep PRs focused on a single logical change. Avoid giant multi-purpose PRs.
2. Run `npm run build` locally to verify that there are no compilation errors.
3. Open a Pull Request against the `main` branch.
4. Include a concise summary of what changes were made and attach screenshots or screen recordings for any visual changes.

---

## Reporting Issues

If you encounter a bug or have a suggestion:
1. Check existing [GitHub Issues](https://github.com/Cyrilthetecchieee/DevFest-Madurai-2026/issues) to avoid duplicates.
2. Open a new issue with:
   - A clear, descriptive title.
   - Steps to reproduce the problem.
   - Expected behavior vs. actual behavior.
   - Operating system, browser version, and device viewport.
   - Screenshots or console error logs if applicable.

---

Thank you for helping make **DevFest Madurai 2026** an exceptional community experience!
