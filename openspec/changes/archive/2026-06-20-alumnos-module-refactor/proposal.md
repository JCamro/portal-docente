# Proposal: Alumnos Module Refactor

## Intent

Replace the 3-level drill-down (DayOverview → TallerSessions → SessionDetail) with a student-centric module. Teachers need all students at a glance, progressive filtering (fecha → taller → hora), and individual inspection with attendance history and multi-level notes.

## Scope

### In Scope
- Flat table: all students across all horarios (name, DNI, phone, taller badges, last attendance, inspect action)
- Cascade filters: FECHA → TALLER → HORA with progressive option reduction
- 5-level notes: general, día, taller, clase, alumno individual
- Student inspection side panel: profile, attendance history, per-student notes

### Out of Scope
- Backend API changes (all endpoints exist)
- NotesPage.tsx refactor (separate spec)
- Attendance recording (stays in HorariosPage)

## Capabilities

### New Capabilities
- `alumnos-table-view`: Responsive student table reusing `AlumnoCartilla` type and `getAlumnosCartilla()` API
- `cascade-filters`: 3-stage filter built on `getHorarios()` + `getAsistenciasPorHorario()` data
- `alumno-profile`: Adapted SidePanel with student-centric profile, attendance history, notes
- `multi-level-notes`: 5-level notes using existing CRUD APIs (NotaDia, NotaClase, NotaAlumno)

### Modified Capabilities
- `notes-interaction`: Expanded from 2-level to 5-level; NotesFilterBar → CascadeFilters
- `attendance-filter`: Drill-down absorbed into cascade filters and alumno-profile

## Approach

Single-page rewrite of `AlumnosPage.tsx`. Default: full table, no filters. CascadeFilters above table. "Inspeccionar" opens adapted SidePanel with AlumnoProfile.

**Component tree:**
```
AlumnosPage (memo)
├── CascadeFilters
├── AlumnoTable → AlumnoCard (mobile)
└── SidePanel (adapted)
    ├── AlumnoProfile
    ├── DaySelector
    ├── AttendanceHistory
    └── NoteSection → NoteEditor (reused)
```

**Data flow:** Single `getAlumnosCartilla()` on mount → client-side filtering. Side panel fetches on demand.

**Deleted:** Level1DayOverview, Level2TallerSessions, Level3SessionDetail

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/pages/AlumnosPage.tsx` | Modified | Full rewrite |
| `src/components/domain/CascadeFilters.tsx` | New | 3-stage filter |
| `src/components/domain/AlumnoTable.tsx` | New | Responsive table |
| `src/components/domain/AlumnoProfile.tsx` | New | Student profile |
| `src/components/domain/NoteSection.tsx` | New | Multi-level notes |
| `src/components/domain/DaySelector.tsx` | New | Date picker |
| `src/components/domain/SidePanel.tsx` | Modified | Student-centric content |
| `src/components/domain/Level{1,2,3}*.tsx` | Removed | Replaced by above |

## Risks

| Risk | Likelihood | Mitigation |
|------|-----------|------------|
| Large list (>100 alumnos) perf | Med | Virtualization/pagination if needed |
| Cascade state complexity | Low | Single useReducer + URL searchParams |

## Rollback Plan

Git revert restores deleted Level components. No DB/API changes = zero backend rollback.

## Dependencies

None — all backend endpoints already exist.

## Success Criteria

- [ ] All students visible without filters
- [ ] Cascade filters reduce options correctly
- [ ] Inspection opens <300ms with profile + history
- [ ] 5 note levels accessible from profile
- [ ] Mobile: cards ≥44px touch targets
- [ ] Zero regression on NotesPage/HorariosPage
