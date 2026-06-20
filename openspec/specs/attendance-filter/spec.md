# Attendance Filter Specification

## Purpose

Attendance browsing is absorbed into CascadeFilters and AlumnoProfile. Teachers access attendance data through: (1) CascadeFilters on AlumnosPage for cross-student views, (2) AlumnoProfile SidePanel for individual student history.

## Requirements

### Requirement: Grouped Horario Summary

The attendance browsing flow MUST be absorbed into CascadeFilters and AlumnoProfile. The standalone grouped horario card view is removed. Teachers access attendance data through: (1) CascadeFilters on AlumnosPage for cross-student views, (2) AlumnoProfile SidePanel for individual student history.

(Previously: Standalone grouped horario cards on attendance page)

#### Scenario: Attendance via CascadeFilters

- GIVEN a teacher with 3 active horarios
- WHEN the teacher sets fecha + taller + hora in CascadeFilters
- THEN the student table filters to students in that specific class
- AND no separate attendance page navigation is needed

#### Scenario: Attendance via AlumnoProfile

- GIVEN the SidePanel is open for a student
- WHEN the DaySelector shows a date
- THEN AttendanceHistory displays the student's attendance for that date
- AND taller, horario, and estado are shown

### Requirement: Date Drill-Down

The date drill-down MUST happen through DaySelector in AlumnoProfile SidePanel, not through a standalone date list. Each student's attendance is viewed individually.

(Previously: Date drill-down was a full-page list of dates per horario)

#### Scenario: View student attendance by date

- GIVEN the SidePanel is open for student "Juan Pérez"
- WHEN the teacher taps "15/06" in DaySelector
- THEN Juan's attendance for 2026-06-15 is displayed
- AND shows: taller name, horario range, estado badge

#### Scenario: No classes on selected date

- GIVEN the SidePanel is open
- WHEN DaySelector shows a date with no classes
- THEN AttendanceHistory shows: "Sin clases programadas para este día"

### Requirement: Progressive Filtering Flow

The flow from page load to viewing a specific class attendance is: (1) open table, (2) optionally filter with CascadeFilters, (3) tap "Inspeccionar" to see individual attendance. The concept of "taps to a specific class" is replaced by progressive filtering.

#### Scenario: Access student attendance

- GIVEN the AlumnosPage is loaded
- WHEN the teacher taps "Inspeccionar" on a student
- THEN the SidePanel opens showing today's attendance
- AND the teacher can browse other dates via DaySelector

### Requirement: API Contract

The `GET /api/portal/ciclos/{id}/asistencias/por-horario/` endpoint REMAINS but is now consumed by CascadeFilters for filter option computation, not for direct UI rendering.

**Endpoint**: `GET /api/portal/ciclos/{id}/asistencias/por-horario/`

Response shape:
```json
{
  "horarios": [
    {
      "horario_id": 1,
      "taller_nombre": "Guitarra",
      "dia_semana": 1,
      "hora_inicio": "10:00",
      "hora_fin": "11:00",
      "total_clases": 12,
      "fechas": ["2026-06-01", "2026-06-08"]
    }
  ]
}
```

#### Scenario: CascadeFilters consume por-horario data

- GIVEN the AlumnosPage mounts
- WHEN `getAsistenciasPorHorario()` is called
- THEN the response is used to populate fecha options in CascadeFilters
- AND no grouped cards are rendered from this data

## Impact Analysis

### Backend
- **File**: `core/views/portal_docente/asistencia_view.py` — `por_horario` action remains unchanged
- **No new endpoints** — existing `GET /api/portal/ciclos/{id}/asistencias/por-horario/` is now consumed by CascadeFilters

### Frontend
- **File**: `src/components/domain/CascadeFilters.tsx` — consumes `getAsistenciasPorHorario()` for fecha options
- **File**: `src/pages/AlumnosPage.tsx` — mounts CascadeFilters + AlumnoTable
- **File**: `src/components/domain/AlumnoProfile.tsx` — student-centric attendance view
- **Deleted**: Level1DayOverview, Level2TallerSessions, Level3SessionDetail — replaced by progressive filtering
