# Tasks: Portal Docente — Bug Fixes & UX Improvements

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~550 (BE ~240 + FE ~320) |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 (BE fixes) → PR 2 (BE features) → PR 3 (FE core) → PR 4 (FE notes) |
| Delivery strategy | ask-on-risk |
| Chain strategy | stacked-to-main |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: stacked-to-main
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Backend auth helper + fix all existing views | PR 1 (sistema-asistencia-taller) | ~135 lines; tests included; no frontend dependency |
| 2 | Backend new endpoints (por-horario + notes filters) | PR 2 (sistema-asistencia-taller) | ~105 lines; depends on PR 1 auth helper |
| 3 | Frontend types/API + Dashboard QuickLinks + HorariosPage rewrite | PR 3 (portal-docente) | ~200 lines; depends on PR 1+PR 2 deployed |
| 4 | Frontend NotesPage + components + SidePanel cleanup | PR 4 (portal-docente) | ~180 lines; depends on PR 2 notes endpoints |

## Phase 1: Backend Foundation — Auth Resolution

- [x] 1.1 Add `get_profesor_for_ciclo(dni, ciclo_id)` helper to `core/authentication.py` — single indexed query `Profesor.objects.get(dni=dni, ciclo_id=ciclo_id)`, raises `Http404` with "Profesor no encontrado para este ciclo" on not-found. ~15 lines.
- [x] 1.2 Write unit tests for `get_profesor_for_ciclo` in `core/tests/test_portal_auth_helper.py` — parametrized: found, not-found (404), cross-cycle resolution, inactive profesor. ~30 lines. Deps: 1.1.

## Phase 2: Backend Views — Fix Existing Endpoints

- [x] 2.1 Modify `core/views/portal_docente/dashboard_view.py` — call `get_profesor_for_ciclo(request.user.dni, ciclo_id)` replacing `request.user.id`; fix `tiene_pagos` and `horas_mes` queries with resolved ID. ~10 lines. Deps: 1.1.
- [x] 2.2 Modify `core/serializers/portal_docente/serializers.py` — add `dni`, `telefono` to `get_alumnos().values()`. ~20 lines. Deps: none.
- [x] 2.3 Modify `core/views/portal_docente/horarios_view.py` — resolve `profesor_id` via helper. ~10 lines. Deps: 1.1.
- [x] 2.4 Modify `core/views/portal_docente/asistencia_view.py` — resolve `profesor_id` via helper in existing actions. ~10 lines. Deps: 1.1.
- [x] 2.5 Modify `core/views/portal_docente/notas_view.py` — resolve `profesor_id` via helper. ~10 lines. Deps: 1.1.
- [x] 2.6 Write integration tests for fixed views in `core/tests/test_portal_views_fix.py` — verify cross-cycle data correctness for dashboard, horarios, asistencia, notas. ~40 lines. Deps: 2.1–2.5.

## Phase 3: Backend New Features — Endpoints

- [x] 3.1 Add `HorarioResumenSerializer` to `core/serializers/portal_docente/serializers.py` — fields: `horario_id`, `taller_nombre`, `dia_semana`, `hora_inicio`, `hora_fin`, `total_clases`, `fechas`. ~15 lines. Deps: none.
- [x] 3.2 Add `ProfesorAsistenciasPorHorarioView` to `core/views/portal_docente/asistencia_view.py` — grouped query returning `HorarioResumenSerializer` data for resolved profesor. ~30 lines. Deps: 3.1, 1.1.
- [x] 3.3 Add route `asistencias/por-horario/` to `core/views/portal_docente/urls.py`. ~3 lines. Deps: 3.2.
- [x] 3.4 Add `taller_nombre` field to `NotaClaseSerializer`; add `horario_id`/`ciclo_id` query param filtering to notas list endpoint. ~15 lines. Deps: 1.1.
- [x] 3.5 Write tests for new endpoints in `core/tests/test_portal_new_endpoints.py` — `por_horario` grouped response, notas filter params. ~40 lines. Deps: 3.2, 3.4.

## Phase 4: Frontend Foundation — Types & API

- [x] 4.1 Add `HorarioResumen`, `FechaAsistenciaResumen`, interfaces to `src/types/index.ts`; update `NotaClase` with `taller_nombre`. ~15 lines. Deps: none.
- [x] 4.2 Add `getAsistenciasPorHorario(cicloId)` to `src/api/portalDocente.ts`; add filter params to `getNotas()`. ~10 lines. Deps: 4.1.

## Phase 5: Frontend Features — Pages & Components

- [x] 5.1 Add 3 permanent QuickLinks ("Mis Alumnos", "Horarios de Hoy", "Horas Trabajadas") to `src/pages/DashboardPage.tsx` above KPIs. ~30 lines. Deps: 4.1.
- [x] 5.2 Rewrite `src/pages/HorariosPage.tsx` — two-step browse: horario cards (from `getAsistenciasPorHorario`) → date drill-down → attendance records. Display `dni`/`telefono` in student list. ~80 lines. Deps: 4.2.
- [x] 5.3 Create `src/pages/NotesPage.tsx` — standalone notes page with filter bar + inline list + create/edit. ~120 lines. Deps: 4.2.
- [x] 5.4 Create `src/components/domain/NotesFilterBar.tsx` — taller + hora dropdown filters. ~50 lines. Deps: 4.1.
- [x] 5.5 Create `src/components/domain/NotesInlineForm.tsx` — inline create/edit form (contenido, taller, horario). ~60 lines. Deps: 4.2.

## Phase 6: Frontend Cleanup — Routing & Navigation

- [x] 6.1 Remove notes editor section from `src/components/domain/SidePanel.tsx` (keep attendance display). ~-20 lines. Deps: 5.3.
- [x] 6.2 Add `/notas` route → `<NotesPage />` in `src/App.tsx`. ~5 lines. Deps: 5.3.
- [x] 6.3 Add "Notas" nav item to `src/components/layout/MobileDrawer.tsx` (via navItems in App.tsx). ~5 lines. Deps: 6.2.
