# Lufe Audio – Refactor Phase 2

## What changed
- Added `JS/utils.js` as a shared utility layer.
- Moved shared helpers into one place:
  - `$(id)`
  - `escapeHTML()`
  - `safeLink()`
  - `normalizeText()`
  - `setText()`
  - `fetchJson()`
  - `injectStyleOnce()`
- Updated these files to use shared helpers instead of repeating the same logic:
  - `JS/common.js`
  - `JS/main.js`
  - `JS/chords.js`
  - `JS/chord-page.js`
  - `JS/post.js`
- Removed duplicated scroll-top logic from `JS/chords.js` because `common.js` already owns it.
- Removed JS CSS-injection from `JS/chords.js` because the styles already exist in `CSS/chords.css`.
- Added one shared injected style in `main.js` using `injectStyleOnce()`.

## Why this helps
- Less duplicated code across the project.
- Easier to maintain shared helpers in one place.
- Lower risk of inconsistent bug fixes between pages.
- Cleaner separation between page scripts and common utilities.

## Next good step (Phase 3 suggestion)
- Extract reusable render helpers (cards, list items, social buttons).
- Introduce a small page-level data layer for JSON/file loading.
- Start improving metronome timing with audio scheduling instead of only `setInterval`.
