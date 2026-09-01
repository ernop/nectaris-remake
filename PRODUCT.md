# Product decisions

Settled product and UI decisions for this remake. Mechanics reconstruction
(with sources) lives in `MECHANICS.md`. Link this file from `agents.md` and
the README so later sessions load it.

## Strength chrome (2026-08-30)

Full-strength units do **not** show `8`. Squad size 8 is the default, so
printing it on every healthy unit is redundant. The remaining count is shown
only when damaged (1–7):

- Map unit chrome (bottom-left badge)
- Sidebar unit inspector (Strength row omitted when full)
- Factory stored-unit list
- Battle-preview name line

`COMBAT.strengthCaption` is the single check. Combat still uses 1–8 internally.
