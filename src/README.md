# LaneLab application architecture

This directory is the migration boundary for the future web/mobile application.
The current GitHub Pages entrypoint remains at `index.html` until each module has
an equivalent regression test and can be switched over safely.

## Boundaries

- `core/` — framework-free bowling rules, frame state, notation, and validation.
- `data/` — storage adapters, import/export, schema migrations, and backups.
- `features/` — Arsenal, statistics, coach, profile, and scoring use cases.
- `platform/` — browser, Capacitor/mobile, camera, OCR, and notification adapters.
- `ui/` — screen rendering and input bindings for a specific client.

The existing `js/` modules are compatibility modules during this migration. New
logic should be added to the appropriate `src/` boundary first, then connected to
the web client after focused tests pass.
