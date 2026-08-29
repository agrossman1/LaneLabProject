# LaneLab Project Instructions

## Project overview

LaneLab is a mobile-first bowling tracker. The GitHub Pages build is the browser-testing version of a future mobile application.

Before changing code, inspect the current repository and preserve working behavior. Prefer small, modular changes to the existing files over rebuilding the application from scratch.

## Current repository state

At the time this file was added, the repository contains:

- `README.md` with GitHub Pages notes.
- An empty root `index.html`.
- No committed `css/`, `js/`, or `assets/` implementation yet.

Treat the structure below as the intended architecture. Confirm which files actually exist before editing or referring to them.

## Intended architecture

```text
LaneLab/
├── index.html
├── css/
│   └── styles.css
├── js/
│   ├── scoring.js
│   ├── stats.js
│   ├── arsenal.js
│   └── app.js
├── assets/
└── README.md
```

Keep responsibilities separated:

- `index.html`: accessible semantic markup, application shell, navigation, and module loading.
- `css/styles.css`: mobile-first layout, responsive behavior, theme tokens, light/dark mode, and component states.
- `js/scoring.js`: bowling rules, frame state, validation, score calculation, and scoring-specific rendering helpers.
- `js/stats.js`: raw game history, aggregates, rolling averages, and trend calculations.
- `js/arsenal.js`: bowling-ball records, typed-name normalization, image matching, and fallback image behavior.
- `js/app.js`: application startup, shared state coordination, navigation, persistence wiring, and UI event handling.
- `assets/`: local images and other static assets used by the GitHub Pages build.

Do not collapse all logic into `app.js` or inline large scripts and styles in `index.html`.

## Product behavior

- Design for phone screens first, then enhance layouts for wider screens.
- Support frame-by-frame ten-pin bowling scoring, including strikes, spares, open frames, and tenth-frame fill balls.
- Keep raw game scores available in stats; rolling-average trends supplement them rather than replacing them.
- Arsenal ball-name matching must normalize user input and degrade gracefully when no image is confidently matched.
- Profile settings include light and dark themes. Respect the saved user choice and keep controls accessible.
- Keep the scoreboard photo-import interface usable in the browser build.

## Scoring correctness

Bowling scoring is domain-critical. Keep score calculation deterministic and separate from DOM manipulation where practical.

When scoring changes, verify at least:

- A perfect game scores 300.
- All spares with five pins on each throw score 150.
- All nines followed by misses score 90.
- Mixed strike/spare sequences calculate bonuses from subsequent deliveries correctly.
- Tenth-frame fill balls are allowed only when earned.
- Invalid pinfall and impossible frame states are rejected or prevented.

Do not silently change saved-game data shapes. If a migration becomes necessary, make it explicit and backward-compatible where practical.

## Photo import and OCR

- Never fabricate OCR output, player names, scores, or sample players after a user uploads a real scoreboard image.
- A browser upload may preview the image and present a pending, unsupported, or manual-entry state when real OCR is unavailable.
- Clearly distinguish extracted text from user-entered corrections and placeholder UI.
- Native Google ML Kit OCR is planned for the mobile build; do not add a fake browser OCR implementation that implies ML Kit ran.
- Keep OCR-related interfaces separable so a native implementation can replace or extend the browser adapter later.

## GitHub Pages constraints

- The browser version must remain deployable as a static site on GitHub Pages.
- Use relative repository paths; do not assume a site is hosted at the domain root.
- Avoid server-only dependencies, secrets, or runtime requirements.
- Do not require a build step unless the project explicitly adopts and documents one.
- Keep native-only mobile integrations behind clear boundaries so they do not break browser execution.
- Update `README.md` when setup, deployment, storage, or supported-browser behavior changes.

## Implementation style

- Use modern, dependency-light JavaScript compatible with current evergreen mobile browsers.
- Prefer ES modules and explicit exports for reusable logic.
- Keep state transitions and calculations testable without the page DOM when practical.
- Use semantic HTML, labeled controls, visible focus states, adequate contrast, and touch-friendly targets.
- Reuse existing CSS variables and component patterns once established.
- Preserve user-authored and unrelated changes.
- Do not invent production data to make an incomplete feature appear functional.

## Verification

After relevant changes:

1. Exercise the affected flow at a narrow mobile viewport and a wider viewport.
2. Check the browser console for errors.
3. Verify light and dark themes when UI or CSS changes.
4. Run or add focused scoring tests when scoring logic changes.
5. Confirm direct GitHub Pages paths and asset imports remain relative.
6. For photo import, verify a real upload never produces invented OCR results.

Report what was verified and call out anything that could not be tested.

