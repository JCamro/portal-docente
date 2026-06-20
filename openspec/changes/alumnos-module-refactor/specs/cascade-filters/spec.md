# Cascade Filters Specification

## Purpose

Provide a 3-stage progressive filter (FECHA → TALLER → HORA) above the student table. Each selection reduces options in subsequent stages. Replaces the old NotesFilterBar and drill-down navigation.

## Requirements

### Requirement: Three-Stage Filter Bar

The system MUST display three linked dropdowns above the student table: Fecha, Taller, Hora. All start with "Todos" selected.

#### Scenario: Default state — no filters

- GIVEN the AlumnosPage loads
- WHEN no filter is selected
- THEN all three dropdowns show "Todos"
- AND the table shows all students

#### Scenario: All filters active

- GIVEN fecha=2026-06-15, taller=Guitarra, hora=10:00
- WHEN filters are applied
- THEN the table shows only students matching all three criteria
- AND the active filter count badge shows "3"

### Requirement: Fecha → Taller Cascade

Selecting a Fecha MUST filter the Taller dropdown to show only talleres with classes on that date.

#### Scenario: Select fecha reduces talleres

- GIVEN 5 talleres exist, 3 have classes on 2026-06-15
- WHEN the teacher selects fecha "15/06/2026"
- THEN the Taller dropdown shows only 3 talleres
- AND the Hora dropdown resets to "Todos"
- AND the table filters to students in those 3 talleres on that date

#### Scenario: Clear fecha restores talleres

- GIVEN fecha is selected
- WHEN the teacher clears the fecha filter
- THEN the Taller dropdown restores all talleres
- AND the Hora dropdown restores all hours
- AND the table shows all students

### Requirement: Taller → Hora Cascade

Selecting a Taller MUST filter the Hora dropdown to show only hours with classes for that taller.

#### Scenario: Select taller reduces hours

- GIVEN taller "Guitarra" has classes at 10:00 and 14:00
- WHEN the teacher selects "Guitarra"
- THEN the Hora dropdown shows "10:00 - 11:00" and "14:00 - 15:00"
- AND the table filters to Guitarra students only

### Requirement: Filter State in URL

All filter selections MUST be persisted in URL search params (`?fecha=...&taller=...&hora=...`).

#### Scenario: Shareable filtered view

- GIVEN filters are set to fecha=2026-06-15, taller=Guitarra
- WHEN the teacher copies the URL
- THEN the URL contains `?fecha=2026-06-15&taller=1`
- AND opening the URL restores the filter state

#### Scenario: Default URL has no params

- GIVEN no filters are active
- WHEN the page loads
- THEN the URL has no search params

### Requirement: Client-Side Filtering

Filtering MUST happen client-side using data already fetched on mount. No additional API calls per filter change.

#### Scenario: Instant filter response

- GIVEN 100 students loaded on mount
- WHEN the teacher changes any filter
- THEN the table updates within 50ms
- AND no loading spinner appears

### Requirement: Filter Reset on Ciclo Change

Changing the active ciclo MUST reset all filters to "Todos" and reload the student list.

#### Scenario: Ciclo change clears filters

- GIVEN filters are active on ciclo "2026-I"
- WHEN the teacher switches to ciclo "2026-II"
- THEN all filters reset to "Todos"
- AND the table loads students for ciclo "2026-II"

### Requirement: API Contract for Filter Source Data

**Fecha source**: Derived from `getAsistenciasPorHorario()` response — unique dates from `fechas` arrays.

**Taller/Hora source**: `getHorarios()` response — talleres and hours for current ciclo.

No new endpoints required. Filter options computed from existing data.

#### Scenario: Filter options computed

- GIVEN `getHorarios()` returns 4 horarios across 2 talleres
- WHEN CascadeFilters initializes
- THEN Fecha dropdown shows unique dates from attendance data
- AND Taller dropdown shows 2 unique talleres
- AND Hora dropdown shows 3 unique hour ranges
