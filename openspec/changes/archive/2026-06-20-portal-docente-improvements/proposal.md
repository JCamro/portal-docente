# Proposal: Portal Docente — Bug Fixes & UX Improvements

## Intent

Teacher portal has 3 backend bugs (wrong data across cycles) and 3 frontend UX gaps. Root cause: `Profesor` has `unique_together = ['ciclo', 'dni']`, so same teacher gets different `profesor_id` per cycle, but JWT locks one `profesor_id` at login.

## Scope

### In Scope
- Fix cross-cycle `profesor_id` resolution (root cause of `tiene_pagos=false`, `horas_mes=0`)
- Enrich `HorarioConAlumnosSerializer.alumnos` with `dni` + `telefono`
- Add "Mis Alumnos" and "Horas Trabajadas" QuickLinks to Dashboard
- Redesign attendance filter: two-step flow (taller summary → specific date)
- Improve notes interaction: modular filtering by taller/hora

### Out of Scope
- Student portal, admin panel, payment logic, new note types

## Capabilities

### New Capabilities
- `attendance-filter`: Two-step attendance browsing — select horario from grouped list, then filter by date
- `notes-interaction`: Modular notes UI with taller/hora filtering and clearer create/edit flow

### Modified Capabilities
- `profesor-auth`: Resolve `Profesor` by DNI + ciclo_id per request instead of trusting JWT `profesor_id`
- `dashboard-kpis`: Fix `horas_mes`/`tiene_pagos` queries; add permanent QuickLinks
- `horarios-students`: Include `dni`/`telefono` in student list; align count consistency

## Approach

**Backend auth fix**: Store `dni` in `ProfesorDummyUser`. Each view resolves `profesor_id` via `get_profesor_for_ciclo(dni, ciclo_id)` — single indexed query. No token reissue needed.

**Backend data fix**: Add `dni`, `telefono` to `.values()` in `get_alumnos()`. Align `alumnos_count` filter with `get_alumnos()` for consistency.

**Frontend**: Add 2 QuickLinks. Replace attendance call with grouped horario list → date drill-down. Extract notes into filterable view.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `core/authentication.py` | Modified | `ProfesorDummyUser` gains `dni`; add helper |
| `core/views/portal_docente/*.py` | Modified | Views use resolved `profesor_id` |
| `core/serializers/portal_docente/serializers.py` | Modified | Adds fields to `get_alumnos()` |
| `frontend/src/pages/DashboardPage.tsx` | Modified | Add QuickLinks |
| `frontend/src/pages/HorariosPage.tsx` | Modified | Attendance drill-down |
| `frontend/src/components/domain/SidePanel.tsx` | Modified | Notes UX |
| `frontend/src/api/portalDocente.ts` | Modified | New endpoint calls |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Auth change breaks tokens | Low | DNI already in JWT |
| N+1 from helper | Low | Indexed `unique_together` query |
| Attendance scope creep | Medium | Backend read-only first |
| Count mismatch | Medium | Align filters in serializer |

## Rollback Plan

`git revert` auth+view changes. Frontend changes are additive. No migrations, no data transformation.

## Dependencies

None. All internal to both repos.

## Success Criteria

- [ ] Cross-cycle teacher sees correct `tiene_pagos`/`horas_mes` in all cycles
- [ ] `alumnos` returns `dni`/`telefono`; count matches list length
- [ ] Dashboard shows 3+ QuickLinks always visible
- [ ] Attendance: ≤2 taps to specific class date
- [ ] Notes filterable by taller/hora without SidePanel
