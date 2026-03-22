# Refactor notes

This package applies a safe phase-1 refactor:

- Added `JS/common.js` for shared UI helpers:
  - mobile navigation
  - footer year
  - scroll-to-top button
- Moved album fallback styles from JS injection into `CSS/chords.css`
- Removed duplicate mobile-nav / scroll-top setup from page-specific scripts
- Updated HTML pages to load `common.js`
- Kept business logic intact

## Why this is safer

The original project repeated the same UI setup across multiple files. That made maintenance harder and caused regressions when one copy changed and others did not. This refactor centralizes the shared UI behavior while preserving page-specific logic.
