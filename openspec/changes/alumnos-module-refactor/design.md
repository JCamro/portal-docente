# Design: Alumnos Module Refactor

## Technical Approach

Single-page rewrite of AlumnosPage.tsx — replace 3-level drill-down with flat student table + cascade filters + inspection side panel. All data fetched once on mount, client-side filtered. No backend changes.

## Architecture Decisions

### Decision: State management

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Multiple `useState` | Cascade logic scattered; hard to read | ❌ |
| `useReducer` + URL params | Centralized cascade logic; URL shareable; debug-friendly | ✅ |
| Zustand store | Overkill for page-local state; no cross-page sharing needed | ❌ |

**Reducer shape**: `{ fecha, tallerId, hora }` — each dispatch updates dependent filters (e.g., select fecha → reset hora). URL writes via `useSearchParams` setter in the dispatch wrapper.

### Decision: Filter option computation

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Server-side options endpoint | Requires new API | ❌ |
| Compute from `getHorarios()` + `getAsistenciasPorHorario()` | Reuses existing endpoints; instant after mount | ✅ |

**Source mapping**: FECHAS from `AsistenciasPorHorario.horarios[].fechas` unique set; TALLERES from `HorarioDetalle[].taller_nombre` unique set; HORAS from talleres filtered by selected taller.

### Decision: SidePanel adaptation

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Build new panel | Duplicates slide/backdrop/z-index logic | ❌ |
| Extend existing SidePanel | Backdrop/slide mechanics mature; only content differs | ✅ |

Existing `SidePanel` shell (backdrop, fixed right panel, header, scrollable body) stays. Content replaced with `AlumnoProfile`, `DaySelector`, `AttendanceHistory`, `NoteSection`.

## Data Flow

```
Mount → getAlumnosCartilla() ─→ AlumnoTable (client-filtered)
      → getHorarios()        ─→ CascadeFilters (taller/hora options)
      → getAsistenciasPorHorario() ─→ CascadeFilters (fecha options)

Inspeccionar → getAlumno(cicloId, alumnoId)  ─→ AlumnoProfile
             → getAsistencias(cicloId, horarioId, fecha) ─→ AttendanceHistory
             → getNotas() x5 (one per level) ─→ NoteSection accordions
```

Filter drill-down: FECHA selection narrows TALLER dropdown to talleres with classes that day; TALLER selection narrows HORA to that taller's hours. All filtering client-side (<50ms). No extra API calls on filter change.

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/pages/AlumnosPage.tsx` | Rewrite | Flat: `useReducer` state + `<CascadeFilters>` + `<AlumnoTable>` + `<SidePanel>` |
| `src/components/domain/CascadeFilters.tsx` | Create | 3 `<select>` dropdowns: FECHA → TALLER → HORA, progressive option reduction |
| `src/components/domain/AlumnoTable.tsx` | Create | Responsive `<table>` (desktop) / card grid (≤768px) using `useWindowWidth` |
| `src/components/domain/AlumnoProfile.tsx` | Create | Student profile section: name, DNI, phone, email, taller badges |
| `src/components/domain/DaySelector.tsx` | Create | Horizontal scrollable date chips, highlights selected/today |
| `src/components/domain/AttendanceHistory.tsx` | Create | Student attendance rows (taller, horario, estado badge) per selected date |
| `src/components/domain/NoteSection.tsx` | Create | 5 accordion levels: General, Día, Taller, Clase, Alumno; reuses `NoteEditor` |
| `src/components/domain/SidePanel.tsx` | Modify | New props: `alumnoId`, `cicloId`; renders student-centric sub-components |
| `src/pages/NotesPage.tsx` | Modify | Replace `<NotesFilterBar>` with `<CascadeFilters>`; add `nivel` filter dropdown |
| `src/components/domain/Level1DayOverview.tsx` | Delete | Replaced by AlumnoTable + CascadeFilters |
| `src/components/domain/Level2TallerSessions.tsx` | Delete | Replaced by CascadeFilters (taller→hora) |
| `src/components/domain/Level3SessionDetail.tsx` | Delete | Replaced by AlumnoProfile + AttendanceHistory |
| `src/components/domain/NotesFilterBar.tsx` | Delete | Replaced by CascadeFilters (shared) |

## Interfaces / Contracts

```typescript
// CascadeFilters
interface CascadeFiltersProps {
  fechas: string[];           // unique dates from attendance data
  talleres: { id: number; nombre: string }[];
  horas: { inicio: string; fin: string; horarioId: number }[];
  selected: { fecha: string | null; tallerId: number | null; hora: string | null };
  onChange: (field: 'fecha' | 'tallerId' | 'hora', value: string | null) => void;
}

// AlumnoTable
interface AlumnoTableProps {
  alumnos: AlumnoCartilla[];  // pre-fetched, already client-filtered
  onInspect: (alumnoId: number) => void;
}

// SidePanel adapted
interface SidePanelProps {
  isOpen: boolean;
  alumnoId: number | null;
  cicloId: number;
  onClose: () => void;
}
// Content: AlumnoProfile → DaySelector → AttendanceHistory → NoteSection
```

## Testing Strategy

| Layer | What | Approach |
|-------|------|----------|
| Unit | CascadeFilters reducer logic | Pure function tests: dispatch fecha → taller resets; dispatch taller → hora resets |
| Unit | Client-side filter functions | Given mock alumnos + horarios, assert filtered output matches talleres/dates |
| Integration | AlumnosPage mount → data flow | Mock `getAlumnosCartilla`, `getHorarios`, `getAsistenciasPorHorario`; assert table renders all rows |
| Integration | SidePanel open/close | Mock `getAlumnosCartilla` for profile; assert attendance + notes load on demand |
| Visual | Responsive breakpoints | 375px → cards; 1024px → table; touch targets ≥44px |
| E2E | Full inspection flow | Login → /alumnos → select fecha → select taller → inspeccionar → verify panel content → add note |

## Migration / Rollout

No migration required. No DB/API changes. Feature gated by component swap: build new AlumnosPage alongside old, switch route when ready. Rollback: restore previous AlumnosPage + Level* components via git revert.

## Open Questions

- [ ] Does `getAlumnosCartilla()` include `fecha_ultima_asistencia`? Specs assume it does; verify API response shape or compute from attendance data.
- [ ] Are all 5 note level APIs (`notas-general`, `notas-dia`, `notas-taller`, `notas`, `notas-alumno`) fully built? Specs reference `nivel` filter param on a unified endpoint — confirm API supports this or plan to use separate endpoints.
