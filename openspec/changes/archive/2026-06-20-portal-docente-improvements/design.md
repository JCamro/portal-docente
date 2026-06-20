# Design: Portal Docente — Bug Fixes & UX Improvements

## Technical Approach

The root cause is `Profesor.unique_together = ['ciclo', 'dni']` creating different `profesor_id` per cycle, while JWT locks one ID at login. Fix by resolving `Profesor` per-request via `dni + ciclo_id`. Frontend changes are additive — new attendance browse flow, enriched student lists, permanent QuickLinks, standalone notes page.

## Architecture Decisions

| Decision | Options | Tradeoffs | Choice |
|----------|---------|-----------|--------|
| Auth resolution | Helper per-view vs middleware | Middleware is transparent but hides failure surface; per-view is explicit and debuggable | **Helper function** `get_profesor_for_ciclo(dni, ciclo_id)` called in each view |
| Count alignment | Use `get_alumnos()` filter path for count | `Matricula`-first matches rendered list exactly; `Alumno`-first loses dedup | **`Matricula.objects.filter(horarios__horario=obj, activo=True, concluida=False).distinct().count()`** |
| Attendance flow location | Rewrite HorariosPage vs new page | HorariosPage already shows schedules; new page fragments navigation | **Rewrite HorariosPage** — existing page gains two-step browsing |
| Notes UX | Standalone `NotesPage` vs SidePanel tab | SidePanel requires opening a schedule first (2+ taps); standalone is direct access | **New `NotesPage`** with route; SidePanel loses notes section |
| QuickLinks strategy | Permanent 3 vs conditional 4 | Spec says permanent; conditional adds cognitive load | **3 permanent**: Mis Alumnos, Horarios, Horas Trabajadas |

## Data Flow

```
Login ─→ JWT{dni, profesor_id} ─→ PortalDocente Views
                                        │
                     get_profesor_for_ciclo(dni, ciclo_id)
                                        │
                          Profesor.objects.get(dni=..., ciclo=...)
                                        │
                    ┌───────────────────┼───────────────────┐
                    ▼                   ▼                   ▼
              Dashboard KPIs     Horarios+Alumnos    Asistencias+Notas
              (resolved ID)      (resolved ID)       (resolved ID)
```

## File Changes

### Backend (`sistema-asistencia-taller`)

| File | Action | Description |
|------|--------|-------------|
| `core/authentication.py` | Modify | Add `get_profesor_for_ciclo(dni, ciclo_id)` helper; enrich `ProfesorDummyUser.dni` |
| `core/views/portal_docente/dashboard_view.py` | Modify | Replace `request.user.id` with resolved `profesor_id` |
| `core/views/portal_docente/horarios_view.py` | Modify | Resolve `profesor_id` per-request |
| `core/views/portal_docente/asistencia_view.py` | Modify | Resolve `profesor_id`; add `por_horario` action returning grouped data |
| `core/views/portal_docente/notas_view.py` | Modify | Resolve `profesor_id` |
| `core/views/portal_docente/urls.py` | Modify | Add `asistencias/por-horario/` route |
| `core/serializers/portal_docente/serializers.py` | Modify | Add `dni`/`telefono` to `get_alumnos().values()`; align `alumnos_count`; add `HorarioResumenSerializer`; add `taller_nombre` to `NotaClaseSerializer` |

### Frontend (`portal-docente`)

| File | Action | Description |
|------|--------|-------------|
| `src/types/index.ts` | Modify | Add `HorarioResumen`, `FechaAsistenciaResumen` interfaces |
| `src/api/portalDocente.ts` | Modify | Add `getAsistenciasPorHorario()`; update `NotaClase` type with `taller_nombre` |
| `src/pages/DashboardPage.tsx` | Modify | Add "Mis Alumnos" and "Horas Trabajadas" QuickLinks (3 permanent) |
| `src/pages/HorariosPage.tsx` | Modify | Replace SidePanel attendance flow with two-step browse (horario cards → date drill-down → records) |
| `src/pages/NotesPage.tsx` | Create | Standalone notes page with filter bar + inline create/edit forms |
| `src/components/domain/NotesFilterBar.tsx` | Create | Taller + hora dropdown filters for notes |
| `src/components/domain/NotesInlineForm.tsx` | Create | Inline create/edit form embedded in notes list |
| `src/components/domain/SidePanel.tsx` | Modify | Remove `NotaClase` editor section (attendance display stays) |
| `src/App.tsx` | Modify | Add `/notas` route → `<NotesPage />` |
| `src/components/layout/MobileDrawer.tsx` | Modify | Add "Notas" nav item (if present) |

## Interfaces / Contracts

### New Backend Endpoint

```
GET /api/portal-docente/ciclos/{id}/asistencias/por-horario/
→ { horarios: HorarioResumen[] }

HorarioResumen:
  horario_id: number
  taller_nombre: string
  dia_semana: number
  hora_inicio: string
  hora_fin: string
  total_clases: number
  fechas: string[]       // unique dates with attendance
```

### Modified Serializer Fields

```python
# get_alumnos() — new fields in .values()
.values('id', 'nombre', 'apellido', 'dni', 'telefono', 'edad')

# NotaClaseSerializer gains:
taller_nombre = serializers.CharField(source='horario.taller.nombre', read_only=True)
```

### Auth Helper Contract

```python
def get_profesor_for_ciclo(dni: str, ciclo_id: int) -> int:
    """Returns profesor_id for (dni, ciclo_id). Raises Http404 if not found."""
    ...
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit (BE) | `get_profesor_for_ciclo` — found, not-found, cross-cycle | pytest-django, parametrized |
| Unit (FE) | QuickLinks render, NotesFilterBar filter logic, NotesInlineForm save | Vitest + RTL |
| Integration (BE) | `por-horario` endpoint returns grouped data; existing views return correct cycle data | pytest-django with test DB |
| Integration (FE) | DashboardPage shows 3 QuickLinks; HorariosPage two-step flow | Vitest + MSW |
| E2E | Cross-cycle login → dashboard KPIs correct | Playwright (if available) |

## Migration / Rollout

No migrations required. No data transformation. Rollback: `git revert` auth+view changes. Frontend changes are additive. Backward compat: legacy tokens without `dni` fall back to JWT `profesor_id` with deprecation warning.

## Open Questions

- [ ] Does `PagoProfesor.horas_calculadas` or `HoraTrabajada.horas_trabajadas` represent "horas del mes"? Code currently uses `HoraTrabajada` — spec mentions `PagoProfesor`. Need user confirmation.
- [ ] Should "Mis Pagos" QuickLink remain conditional (when `tiene_pagos=true`) as a 4th card, or be removed in favor of permanent 3?
- [ ] Does `MobileDrawer` need a "Notas" nav entry added, or is `/notas` route-only access acceptable?
