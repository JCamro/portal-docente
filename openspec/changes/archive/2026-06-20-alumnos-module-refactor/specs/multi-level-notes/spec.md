# Multi-Level Notes Specification

## Purpose

Support 5 hierarchical note levels (General, Día, Taller, Clase, Alumno) using existing CRUD APIs. Notes are accessible from the AlumnoProfile SidePanel and from the standalone NotesPage.

## Requirements

### Requirement: Five Note Levels

The system MUST support 5 note levels with this hierarchy: General → Día → Taller → Clase → Alumno. Each level scopes notes to its context.

| Level | Scope | API Model |
|-------|-------|-----------|
| General | Entire ciclo | NotaGeneral |
| Día | Specific date | NotaDia |
| Taller | Specific taller | NotaTaller |
| Clase | Specific horario + date | NotaClase |
| Alumno | Specific student | NotaAlumno |

#### Scenario: Create general note

- GIVEN the teacher is on NotesPage
- WHEN they create a note with level "General"
- THEN the note is saved via `POST /api/portal/notas/` with `nivel: "general"`
- AND it appears in all student profiles for the ciclo

#### Scenario: Create student-specific note

- GIVEN the SidePanel is open for student "Juan Pérez"
- WHEN the teacher creates a note under "Alumno" level
- THEN the note is saved with `alumno_id: 5, nivel: "alumno"`
- AND it only appears in Juan's profile

### Requirement: Inline CRUD for All Levels

Notes MUST be created and edited inline (no modals, no SidePanel dependency for the operation itself).

#### Scenario: Create note inline

- GIVEN a note level accordion is expanded
- WHEN the teacher taps "Agregar"
- THEN an inline form appears with: titulo, contenido, nivel-specific fields
- AND "Guardar" and "Cancelar" buttons are shown

#### Scenario: Edit existing note inline

- GIVEN a note is displayed in the list
- WHEN the teacher taps the edit icon
- THEN the note transforms into an editable form with pre-filled values
- AND save/cancel actions appear

#### Scenario: Delete note

- GIVEN a note is displayed
- WHEN the teacher taps the delete icon and confirms
- THEN `DELETE /api/portal/notas/{id}/` is called
- AND the note is removed from the list

### Requirement: Level-Specific Fields

Each note level MUST include context fields appropriate to its scope:

| Level | Required Fields |
|-------|----------------|
| General | titulo, contenido |
| Día | titulo, contenido, fecha |
| Taller | titulo, contenido, taller_id |
| Clase | titulo, contenido, horario_id, fecha |
| Alumno | titulo, contenido, alumno_id |

#### Scenario: Clase note requires horario and date

- GIVEN the teacher creates a "Clase" note
- WHEN the form is submitted without horario_id
- THEN validation error: "Selecciona un horario"
- AND the note is not saved

### Requirement: Notes Filtering by Level

The notes list MUST support filtering by level. Default: show all levels.

#### Scenario: Filter by level

- GIVEN 10 notes across all levels
- WHEN the teacher selects filter "Alumno"
- THEN only alumno-level notes are shown

#### Scenario: Filter by level + taller

- GIVEN notes filtered to "Taller" level
- WHEN the teacher also selects taller "Guitarra"
- THEN only Guitarra taller notes are shown

### Requirement: CascadeFilters Integration on NotesPage

The NotesPage MUST use CascadeFilters (shared with AlumnosPage) for fecha/taller/hora filtering, replacing the old NotesFilterBar.

#### Scenario: NotesPage uses cascade filters

- GIVEN the teacher navigates to NotesPage
- WHEN the page loads
- THEN CascadeFilters appear above the notes list
- AND selecting fecha/taller/hora filters the notes accordingly

### Requirement: API Contracts

**Create**: `POST /api/portal/notas/`
```json
{
  "titulo": "Revisar postura",
  "contenido": "El alumno tiende a encorvarse",
  "nivel": "alumno",
  "alumno_id": 5
}
```

**Update**: `PUT /api/portal/notas/{id}/`
```json
{
  "titulo": "Revisar postura",
  "contenido": "Corregido en clase del 15/06",
  "nivel": "alumno",
  "alumno_id": 5
}
```

**List**: `GET /api/portal/notas/?ciclo_id=1&nivel=alumno&alumno_id=5`

**Delete**: `DELETE /api/portal/notas/{id}/`

#### Scenario: List with multi-level filter

- GIVEN `GET /api/portal/notas/?ciclo_id=1&nivel=clase`
- WHEN the API responds
- THEN only clase-level notes for ciclo 1 are returned

### Requirement: Note Count Badges

Each level accordion MUST show a count badge: "Notas ({count})". Badge MUST update after create/edit/delete.

#### Scenario: Badge updates after create

- GIVEN "Alumno" level shows "Notas (2)"
- WHEN a new note is created
- THEN the badge updates to "Notas (3)" without page refresh
