# Tasks: Alumnos Module Refactor

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~1,460 (additions) + ~400 (deletions) |
| 400-line budget risk | High |
| Chained PRs recommended | Yes (but commits-only per delivery strategy) |
| Suggested split | 3 work-unit commits |
| Delivery strategy | commits-only |
| Chain strategy | stacked commits to main |

Decision needed before apply: No
Chained PRs recommended: Yes
Chain strategy: stacked-to-main
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely Commit | Lines | Notes |
|------|------|---------------|-------|-------|
| 1 | Foundation + CascadeFilters + AlumnoTable | Commit 1 | ~430 | Base layer; reducer + filters + table; unit tests included |
| 2 | SidePanel components | Commit 2 | ~480 | DaySelector + Profile + Attendance + Notes + SidePanel adaptation |
| 3 | Page integration + cleanup | Commit 3 | ~550 | AlumnosPage rewrite + NotesPage update + delete old components + integration tests |

## Phase 1: Foundation (State Management + Types)

- [x] 1.1 Create `src/types/alumnos.ts` with filter state interfaces (~30 lines)
  - `FilterState { fecha, tallerId, hora }`
  - `FilterAction` union type
  - `CascadeFiltersProps`, `AlumnoTableProps`, `SidePanelProps`
  - **Depends on**: None
  - **Verified by**: TypeScript compilation

- [x] 1.2 Create `src/hooks/useFilterReducer.ts` with reducer logic (~80 lines)
  - Reducer function handling: SET_FECHA, SET_TALLER, SET_HORA, RESET_ALL
  - Cascade logic: fecha change → reset hora; taller change → reset hora
  - **Depends on**: 1.1
  - **Verified by**: Unit test — dispatch SET_FECHA → hora resets to null

- [x] 1.3 Create `src/hooks/useFilterURLSync.ts` for URL search params (~40 lines)
  - Read initial state from URL on mount
  - Sync reducer dispatch to URL via `useSearchParams`
  - Wrapper around useFilterReducer that writes to URL
  - **Depends on**: 1.2
  - **Verified by**: Unit test — dispatch SET_TALLER → URL contains `?taller=1`

## Phase 2: Core Components (CascadeFilters + AlumnoTable)

- [x] 2.1 Create `src/components/domain/CascadeFilters.tsx` (~120 lines)
  - Three `<select>` dropdowns: Fecha, Taller, Hora
  - Props: `fechas`, `talleres`, `horas`, `selected`, `onChange`
  - "Todos" option for each dropdown
  - Progressive option reduction (fecha → talleres; taller → horas)
  - **Depends on**: 1.1
  - **Verified by**: Scenario — select fecha "15/06" → taller dropdown shows only 3 options

- [x] 2.2 Create `src/components/domain/AlumnoTable.tsx` (~150 lines)
  - Desktop: `<table>` with columns: Nombre, DNI, Teléfono, Talleres, Última Asistencia, Acción
  - Mobile (≤768px): card grid via `useWindowWidth`
  - Taller badges with truncation at 12 chars + tooltip
  - "Inspeccionar" button (min-height 44px)
  - Empty state: "No hay alumnos inscritos en este ciclo"
  - **Depends on**: 1.1
  - **Verified by**: Scenario — 375px width → cards render; 1024px → table renders

- [x] 2.3 Create `src/components/domain/AlumnoCard.tsx` (~30 lines)
  - Mobile card variant for AlumnoTable
  - Displays: name (bold), DNI, phone, taller badges as pills, last attendance
  - Touch targets ≥44px
  - **Depends on**: 2.2
  - **Verified by**: Visual test — 375px → cards with 44px buttons

- [x] 2.4 Write unit tests for Phase 1 + 2 (~180 lines)
  - `src/hooks/__tests__/useFilterReducer.test.ts` — cascade logic
  - `src/components/domain/__tests__/CascadeFilters.test.tsx` — option reduction
  - `src/components/domain/__tests__/AlumnoTable.test.tsx` — responsive rendering
  - **Depends on**: 2.3
  - **Verified by**: `npm test` passes

## Phase 3: SidePanel Components

- [x] 3.1 Create `src/components/domain/DaySelector.tsx` (~80 lines)
  - Horizontal scrollable date chips
  - Props: `dates: string[]`, `selected: string`, `onChange: (date: string) => void`
  - Highlights today + selected date
  - Format: "DD/MM"
  - **Depends on**: None
  - **Verified by**: Scenario — tap "15/06" → chip highlighted

- [x] 3.2 Create `src/components/domain/AlumnoProfile.tsx` (~100 lines)
  - Displays: nombre completo, DNI, teléfono, email, talleres (badges)
  - Props: `alumno: AlumnoCartilla`
  - Missing fields → "No registrado"
  - **Depends on**: 1.1
  - **Verified by**: Scenario — telefono=null → shows "No registrado"

- [x] 3.3 Create `src/components/domain/AttendanceHistory.tsx` (~90 lines)
  - Shows attendance rows for selected date: taller, horario, estado badge
  - Props: `asistencias: Asistencia[]`, `loading: boolean`
  - Empty state: "Sin clases programadas para este día"
  - Estado badges: green (Presente), red (Ausente), yellow (Tardanza)
  - **Depends on**: 3.1
  - **Verified by**: Scenario — student absent → red "Ausente" badge

- [x] 3.4 Create `src/components/domain/NoteSection.tsx` (~150 lines)
  - 5 accordion levels: General, Día, Taller, Clase, Alumno
  - Each level shows count badge: "Notas ({count})"
  - Inline CRUD: "Agregar" button → form → "Guardar"/"Cancelar"
  - Reuses existing `NoteEditor` component
  - Props: `alumnoId`, `cicloId`
  - **Depends on**: None
  - **Verified by**: Scenario — expand "Alumno" → notes list + "Agregar" button visible

- [x] 3.5 Adapt `src/components/domain/SidePanel.tsx` (~60 lines)
  - New props: `alumnoId`, `cicloId`, `onClose`
  - Replace content with: AlumnoProfile + DaySelector + AttendanceHistory + NoteSection
  - Data loading: profile + attendance on open; notes after attendance completes
  - Skeleton loader during fetch
  - **Depends on**: 3.2, 3.3, 3.4
  - **Verified by**: Scenario — tap "Inspeccionar" → panel slides in <300ms with profile

- [x] 3.6 Write unit tests for Phase 3 (~150 lines)
  - `src/components/domain/__tests__/DaySelector.test.tsx` — date selection
  - `src/components/domain/__tests__/AlumnoProfile.test.tsx` — missing fields
  - `src/components/domain/__tests__/AttendanceHistory.test.tsx` — estado badges
  - `src/components/domain/__tests__/NoteSection.test.tsx` — accordion expand
  - **Depends on**: 3.5
  - **Verified by**: `npm test` passes

## Phase 4: Page Integration

- [x] 4.1 Rewrite `src/pages/AlumnosPage.tsx` (~150 lines)
  - Remove 3-level drill-down logic
  - Mount: fetch `getAlumnosCartilla()`, `getHorarios()`, `getAsistenciasPorHorario()`
  - Use `useFilterURLSync` for cascade state
  - Client-side filtering: filter alumnos by fecha/taller/hora
  - Render: `<CascadeFilters>` + `<AlumnoTable>` + `<SidePanel>`
  - "Inspeccionar" → open SidePanel with alumnoId
  - Loading/error states for initial data fetch
  - **Depends on**: 2.2, 3.5
  - **Verified by**: Scenario — mount → table shows all 25 students; filter → table updates <50ms

- [x] 4.2 Update `src/pages/NotesPage.tsx` (~50 lines)
  - Replace `<NotesFilterBar>` with `<CascadeFilters>`
  - Add `nivel` filter dropdown (General, Día, Taller, Clase, Alumno, Todos)
  - Filter notes by nivel + cascade filters
  - **Depends on**: 2.1
  - **Verified by**: Scenario — select nivel "Alumno" → only alumno notes shown

- [x] 4.3 Write integration tests for Phase 4 (~150 lines)
  - `src/pages/__tests__/AlumnosPage.test.tsx` — data flow + filter integration
  - `src/pages/__tests__/AlumnosPage.integration.test.tsx` — SidePanel open/close
  - `src/pages/__tests__/NotesPage.test.tsx` — CascadeFilters integration
  - **Depends on**: 4.2
  - **Verified by**: `npm test` passes; E2E scenario — login → /alumnos → filter → inspeccionar → verify panel

## Phase 5: Cleanup

- [x] 5.1 Delete old drill-down components (~0 lines added, ~400 deleted)
  - `src/components/domain/Level1DayOverview.tsx`
  - `src/components/domain/Level2TallerSessions.tsx`
  - `src/components/domain/Level3SessionDetail.tsx`
  - `src/components/domain/NotesFilterBar.tsx`
  - **Depends on**: 4.1, 4.2
  - **Verified by**: No import errors; `npm run build` succeeds

- [x] 5.2 Remove unused imports and dead code (~20 lines)
  - Search for references to deleted components
  - Remove from `src/components/domain/index.ts` (if exists)
  - Clean up any orphaned types/interfaces
  - **Depends on**: 5.1
  - **Verified by**: `npm run lint` passes; no TypeScript errors

## Phase 6: Visual + E2E Testing

- [x] 6.1 Visual regression tests for responsive breakpoints (~50 lines)
  - 375px → cards with 44px touch targets
  - 768px → transition point
  - 1024px → full table layout
  - **Depends on**: 4.1
  - **Verified by**: Screenshot comparison at 375px, 768px, 1024px

- [x] 6.2 E2E test: full inspection flow (~80 lines)
  - Login → navigate to /alumnos
  - Select fecha → verify table filters
  - Select taller → verify table filters further
  - Tap "Inspeccionar" → verify SidePanel opens
  - Verify profile data + attendance history load
  - Add note → verify note appears in list
  - **Depends on**: 4.1, 4.2
  - **Verified by**: E2E test passes in CI

## Summary

| Phase | Tasks | Focus | Estimated Lines |
|-------|-------|-------|-----------------|
| Phase 1 | 3 | Foundation (state + types) | ~150 |
| Phase 2 | 4 | Core components (filters + table) | ~480 |
| Phase 3 | 6 | SidePanel components | ~630 |
| Phase 4 | 3 | Page integration | ~350 |
| Phase 5 | 2 | Cleanup | ~20 (+400 deleted) |
| Phase 6 | 2 | Visual + E2E tests | ~130 |
| **Total** | **20** | | **~1,760** |

## Implementation Order

1. **Phase 1** → Foundation (state management must come first)
2. **Phase 2** → CascadeFilters + AlumnoTable (core UI components)
3. **Phase 3** → SidePanel components (can be built in parallel, but integration depends on Phase 2)
4. **Phase 4** → Page integration (depends on all components)
5. **Phase 5** → Cleanup (after integration verified)
6. **Phase 6** → Visual + E2E tests (after all functionality in place)

## Work-Unit Commits

**Commit 1**: Phase 1 + Phase 2 (Foundation + Core Components)
- Filter reducer + URL sync
- CascadeFilters + AlumnoTable + AlumnoCard
- Unit tests for reducer + filters + table
- **Lines**: ~430

**Commit 2**: Phase 3 (SidePanel Components)
- DaySelector + AlumnoProfile + AttendanceHistory + NoteSection
- SidePanel adaptation
- Unit tests for all SidePanel components
- **Lines**: ~480

**Commit 3**: Phase 4 + Phase 5 + Phase 6 (Integration + Cleanup + Tests)
- AlumnosPage rewrite + NotesPage update
- Delete old components
- Integration tests + visual tests + E2E
- **Lines**: ~550

## Open Questions (from Design) — Resolved

- [x] **fecha_ultima_asistencia**: `getAlumnosCartilla()` does NOT include it. Computed client-side from `getAsistenciasPorHorario()` by matching student horarios → horario resumen fechas.
- [x] **5 note level APIs**: PARTIAL — `notas-dia` (Día), `notas` (Clase), `notas-alumno` (Alumno) exist. "General" and "Taller" levels not yet available. NoteSection shows graceful message for missing levels.
