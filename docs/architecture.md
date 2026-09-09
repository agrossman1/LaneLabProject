# LaneLab architecture migration

LaneLab stays deployable as a static GitHub Pages site while its logic moves
toward a shared app core. The migration is intentionally incremental:

1. Keep `index.html` and the existing browser behavior as the compatibility shell.
2. Extract deterministic bowling rules into `src/core/` first.
3. Extract persistence and JSON/CSV handling into `src/data/` behind adapters.
4. Move Arsenal, stats, coach, and profile workflows into `src/features/`.
5. Keep browser-only APIs in `src/platform/web/`; native camera/OCR integrations
   can later live in `src/platform/mobile/` without entering scoring logic.
6. Replace inline screen handlers only after the existing regression suite and
   focused module tests both pass.

The app currently uses compatibility modules under `js/` (`stats.js`,
`profile.js`, `arsenal.js`, and `history.js`). They remain unchanged until an
equivalent `src/` implementation is ready, so this scaffolding cannot change
saved data or the deployed user experience.
