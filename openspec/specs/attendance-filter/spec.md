# Attendance Filter Specification

## Purpose

Replace the flat attendance list with a two-step browsing flow: select a horario from a grouped summary, then filter by specific date.

## Requirements

### Requirement: Grouped Horario Summary

The attendance page MUST display a grouped summary where each horario shows `taller_nombre`, `dia_semana`, `hora_inicio`, `hora_fin`, and total class count.

#### Scenario: Teacher sees grouped horarios

- GIVEN a teacher with 3 active horarios in the current cycle
- WHEN the attendance page loads
- THEN 3 horario cards are displayed grouped by taller

#### Scenario: No horarios for cycle

- GIVEN a teacher with no horarios in the current cycle
- WHEN the attendance page loads
- THEN an empty state message is shown: "No tienes horarios en este ciclo"

### Requirement: Date Drill-Down

When a horario card is selected, the system MUST display a date-filtered list of attendance records for that specific horario.

#### Scenario: Select horario shows attendance dates

- GIVEN a horario with attendance records on 5 different dates
- WHEN the teacher taps the horario card
- THEN a list of dates is shown, each with a count of present/absent/tardanza students

#### Scenario: Filter by specific date

- GIVEN the date list for a horario
- WHEN the teacher selects "2026-06-15"
- THEN the detailed attendance list for that date is displayed

### Requirement: ≤2 Taps to Specific Class

The flow from page load to viewing a specific class date MUST require at most 2 taps: (1) select horario, (2) select date.

#### Scenario: Two-tap navigation

- GIVEN the attendance page is loaded
- WHEN the teacher taps a horario card and then a date
- THEN the detailed attendance for that date is visible

### Requirement: API Contract

The backend MUST provide a grouped endpoint for attendance browsing.

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

#### Scenario: API returns grouped data

- GIVEN a teacher with 2 horarios
- WHEN `GET /api/portal/ciclos/{id}/asistencias/por-horario/` is called
- THEN the response contains a `horarios` array with 2 entries
- AND each entry includes `fechas` array of recorded dates

## Impact Analysis

### Backend
- **File**: `core/views/portal_docente/asistencia_view.py` — add `por_horario` action returning grouped data
- **New endpoint**: `GET /api/portal/ciclos/{id}/asistencias/por-horario/`
- **No new models** — queries existing `Asistencia` + `Horario` tables

### Frontend
- **File**: `frontend/src/pages/HorariosPage.tsx` — replace flat list with grouped card view + date drill-down
- **File**: `frontend/src/api/portalDocente.ts` — add `getAsistenciasPorHorario()` API call
- **New types**: `HorarioResumen`, `FechaAsistencia`
