# Task 3: Frontend — Types + API

**Status:** DONE

## What Implemented

1. Added `EgresoPortal`, `PagosStats`, and `PagosResponse` interfaces to `src/types/index.ts`
2. Updated `getPagos` in `src/api/portalDocente.ts` to match new backend response format (`PagosResponse` with `pagos[]` + `stats`)
3. Kept old `getPagos` as `getPagosLegacy` to avoid breaking `PagosPage.tsx` until it's rewritten

## Files Changed

- `src/types/index.ts` — Added 3 new interfaces
- `src/api/portalDocente.ts` — Updated import, added `getPagosLegacy`, rewrote `getPagos`
- `src/pages/PagosPage.tsx` — Switched import to `getPagosLegacy` (minimal change to keep build green)

## Test Results

- `npm run build` — PASS (tsc + vite build, no errors)

## Self-Review

- Old types `PagoProfesorPortal` / `PagoProfesorDetallePortal` intentionally kept — still used by `PagosPage.tsx`. They should be removed when that page is rewritten (Task 4+).
- `getPagosLegacy` marked with `ponytail:` comment for easy discovery during cleanup.
