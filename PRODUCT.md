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

## No two-letter unit badges (2026-09-03)

Map units do **not** carry the two-letter stencil badge ("BI", "LY", …). The
silhouettes are the identification, as in the original, and the sidebar names
the unit under the cursor. Together with the hidden full-strength `8` and the
mirrored enemy facing (player units face right, enemy units face left —
`drawUnitBody`'s `ctx.scale(-1, 1)`), this keeps the field clean of text.
This trio was rebuilt on request after an earlier uncommitted version of the
same look was lost; the facing and strength parts were already in `main`
(commits `ba660e9`, `f1491b5`), the badge removal is new here.
