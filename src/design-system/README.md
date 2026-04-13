# Design System Kit

Portable design-system files for implementing the Visual Issue Reporter UI language in another app.

## Included Files

- `tokens.css` — core `--nope-*` foundations, components, motion, dot-grid, status dots
- `themes.css` — light mode overrides (`[data-theme="light"]`)
- `semantic-aliases.css` — semantic token bridge (`--bg-*`, `--text-*`, `--accent-*`) + brand themes
- `primitives.css` — reusable classes (`.btn`, `.input`, `.select`, `.card-*`, `.field-group-*`, animation helpers)
- `overlay-theme.ts` — TypeScript overlay theme contract + defaults + resolver
- `DESIGN-SYSTEM.md` — full design-system documentation reference
- `index.css` — convenience entrypoint importing all CSS files in the right order

## Quick Start

1. Copy this folder into your target app.
2. Import `index.css` once at app root.
3. Set `data-theme` on `<html>`:
   - dark/default: no attribute or `data-theme="dark"`
   - light: `data-theme="light"`
   - brand: `data-theme="ask-phill"` or `data-theme="strix"`
4. Use primitive classes (`.btn`, `.input`, `.select`, `.card-header`, `.card-section`) and tokens.

## Notes

- `primitives.css` is framework-agnostic and does not include Tailwind directives.
- If your app already has a typography system, keep tokens but optionally replace the font family tokens.
- `overlay-theme.ts` is useful when you need the same screenshot/canvas overlay palette behavior.
