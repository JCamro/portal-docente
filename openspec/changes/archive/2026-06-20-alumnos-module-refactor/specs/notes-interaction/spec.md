# Delta for Notes Interaction

## MODIFIED Requirements

### Requirement: Notes Filtering by Taller

The notes view MUST provide filtering by taller through CascadeFilters (shared component), replacing the standalone NotesFilterBar. CascadeFilters provide progressive filtering: fecha → taller → hora.

(Previously: Standalone filter dropdown in NotesFilterBar component)

#### Scenario: Filter notes by taller via CascadeFilters

- GIVEN a teacher has notes across 3 different talleres
- WHEN the teacher selects "Guitarra" in the Taller dropdown of CascadeFilters
- THEN only notes associated with Guitarra horarios are displayed
- AND the Hora dropdown updates to show only Guitarra hours

#### Scenario: Clear taller filter

- GIVEN the taller filter is active in CascadeFilters
- WHEN the teacher selects "Todos" on the Taller dropdown
- THEN all notes are displayed again
- AND the Hora dropdown restores all options

### Requirement: Notes Filtering by Hora

The notes view MUST provide time-range filtering through CascadeFilters (shared component), not a standalone filter. Hora options are derived from taller selection.

(Previously: Standalone time-range filter in NotesFilterBar)

#### Scenario: Filter notes by hora via CascadeFilters

- GIVEN a teacher has notes at 10:00 and 14:00
- WHEN taller "Guitarra" is selected and the teacher picks "10:00 - 11:00"
- THEN only notes from the 10:00 horario are shown

#### Scenario: Hora resets when taller changes

- GIVEN hora filter is "10:00 - 11:00" for Guitarra
- WHEN the teacher changes taller to "Canto"
- THEN the hora filter resets to "Todos"
- AND all Canto notes are shown

### Requirement: Inline Create/Edit Flow

Notes MUST be created and edited inline within the notes list, without opening a SidePanel or modal. This requirement is UNCHANGED from current behavior.

#### Scenario: Create new note inline

- GIVEN the notes list is visible
- WHEN the teacher taps "Nueva Nota"
- THEN an inline form appears at the top of the list with fields: titulo, contenido, nivel (dropdown), taller (dropdown), horario (dropdown)

#### Scenario: Edit existing note inline

- GIVEN a note is displayed in the list
- WHEN the teacher taps the edit icon on that note
- THEN the note transforms into an editable form with pre-filled values

#### Scenario: Save note

- GIVEN the inline form is open (create or edit)
- WHEN the teacher taps "Guardar"
- THEN the note is saved via API and the list refreshes

### Requirement: Remove SidePanel Dependency

The notes functionality MUST NOT require opening the SidePanel to view, create, or edit notes. Notes in the standalone NotesPage are fully independent. Notes in AlumnoProfile SidePanel are a secondary access point.

(Previously: SidePanel was the primary note management interface)

#### Scenario: Notes accessible without SidePanel on NotesPage

- GIVEN the teacher is on the NotesPage
- WHEN all note operations (list, create, edit) are performed
- THEN the SidePanel is never opened

#### Scenario: Notes accessible within SidePanel for specific student

- GIVEN the SidePanel is open for a student
- WHEN the teacher expands a note level accordion
- THEN notes for that student and level are shown
- AND create/edit operations work inline within the panel

### Requirement: API Contract

**Create**: `POST /api/portal/notas/`
```json
{ "titulo": "...", "contenido": "...", "nivel": "clase", "horario_id": 1 }
```

**Update**: `PUT /api/portal/notas/{id}/`
```json
{ "titulo": "...", "contenido": "...", "nivel": "clase", "horario_id": 1 }
```

**List with filters**: `GET /api/portal/notas/?horario_id=1&ciclo_id=1&nivel=clase&alumno_id=5`

(Previously: API did not support `nivel` or `alumno_id` filter params)

#### Scenario: Create note with level via API

- GIVEN the inline form is filled with nivel="alumno" and alumno_id=5
- WHEN the teacher taps "Guardar"
- THEN `POST /api/portal/notas/` is called with nivel and alumno_id fields
- AND the new note appears in the correct level accordion
