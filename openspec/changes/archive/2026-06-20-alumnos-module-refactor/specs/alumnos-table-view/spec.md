# Alumnos Table View Specification

## Purpose

Display all students across all horarios in a single responsive table, replacing the 3-level drill-down navigation. Teachers see every student at a glance with context badges and quick inspection access.

## Requirements

### Requirement: Full Student Table on Mount

The system MUST load and display all students for the current ciclo on page mount, with no filters applied by default. Data MUST come from `getAlumnosCartilla()`.

#### Scenario: Students visible on load

- GIVEN a teacher with 25 students across 3 talleres
- WHEN the AlumnosPage mounts
- THEN a table shows all 25 students sorted by `apellido, nombre`
- AND each row displays: nombre completo, dni, telefono, taller badges, fecha_ultima_asistencia, action button

#### Scenario: Empty state

- GIVEN a teacher with zero enrolled students
- WHEN the AlumnosPage mounts
- THEN an empty state shows: "No hay alumnos inscritos en este ciclo"
- AND a secondary message: "Los alumnos aparecerán aquí una vez que se matriculen"

### Requirement: Responsive Table → Card Layout

The table MUST render as a data table on screens >768px and as stacked cards on screens ≤768px. Cards MUST maintain ≥44px touch targets.

#### Scenario: Desktop table view

- GIVEN a screen width of 1024px
- WHEN the AlumnosPage renders
- THEN columns are: Nombre, DNI, Teléfono, Talleres, Última Asistencia, Acción
- AND columns are sortable by tapping headers

#### Scenario: Mobile card view

- GIVEN a screen width of 375px
- WHEN the AlumnosPage renders
- THEN each student renders as a card with: name (bold), DNI, phone, taller badges as pills, last attendance date
- AND an "Inspeccionar" button with min-height 44px

### Requirement: Taller Badges

Each student row MUST display one badge per taller they are enrolled in. Badges MUST show the taller name truncated at 12 chars with tooltip on overflow.

#### Scenario: Student in multiple talleres

- GIVEN a student enrolled in Guitarra and Canto
- WHEN the row renders
- THEN two badges appear: "Guitarra" and "Canto"
- AND badges use distinct color coding per taller type

#### Scenario: Student with no taller

- GIVEN a student with no active enrollment
- WHEN the row renders
- THEN taller column shows "—"

### Requirement: Last Attendance Column

The table MUST show the most recent attendance date for each student, formatted as `DD/MM/YYYY`. If no attendance exists, show "Sin registros".

#### Scenario: Student with recent attendance

- GIVEN a student whose last attendance was 2026-06-15
- WHEN the row renders
- THEN "Última Asistencia" shows "15/06/2026"

#### Scenario: Student never attended

- GIVEN a student with zero attendance records
- WHEN the row renders
- THEN "Última Asistencia" shows "Sin registros"

### Requirement: Inspect Action

Each row MUST have an "Inspeccionar" action that opens the SidePanel with AlumnoProfile for that student.

#### Scenario: Open inspection panel

- GIVEN the student table is visible
- WHEN the teacher taps "Inspeccionar" on a student row
- THEN the SidePanel slides in from the right within 300ms
- AND the panel shows AlumnoProfile for the selected student
- AND the table remains visible (panel overlays, does not navigate)

### Requirement: API Contract

**Endpoint**: `GET /api/portal/ciclos/{ciclo_id}/alumnos-cartilla/`

Response shape:
```json
{
  "alumnos": [
    {
      "id": 1,
      "nombre": "Juan",
      "apellido": "Pérez",
      "dni": "12345678",
      "telefono": "999888777",
      "talleres": [{"id": 1, "nombre": "Guitarra"}],
      "fecha_ultima_asistencia": "2026-06-15"
    }
  ]
}
```

#### Scenario: API returns student list

- GIVEN a teacher with students in the current cycle
- WHEN the endpoint is called
- THEN response contains `alumnos` array
- AND each entry includes `talleres` array and `fecha_ultima_asistencia`

### Requirement: Loading State

The table MUST show a skeleton loader (3-5 pulsing rows) while data is being fetched.

#### Scenario: Data loading

- GIVEN the page has just mounted
- WHEN API call is in progress
- THEN skeleton rows replace table rows
- AND no flash of empty state occurs

### Requirement: Error State

If the API call fails, the system MUST display an error message with a retry button.

#### Scenario: API error

- GIVEN the network request fails
- WHEN the error response is received
- THEN a message shows: "No se pudieron cargar los alumnos"
- AND a "Reintentar" button triggers a new fetch
