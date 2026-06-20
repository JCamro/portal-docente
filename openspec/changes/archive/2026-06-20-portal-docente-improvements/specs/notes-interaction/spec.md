# Notes Interaction Specification

## Purpose

Redesign the notes UI to support modular filtering by taller/hora and a clearer create/edit flow, removing dependency on the SidePanel for note management.

## Requirements

### Requirement: Notes Filtering by Taller

The notes view MUST provide a filter dropdown to show notes belonging to a specific taller.

#### Scenario: Filter notes by taller

- GIVEN a teacher has notes across 3 different talleres
- WHEN the teacher selects "Guitarra" from the taller filter
- THEN only notes associated with Guitarra horarios are displayed

#### Scenario: Clear taller filter

- GIVEN the taller filter is active
- WHEN the teacher selects "Todos" (or clears the filter)
- THEN all notes are displayed again

### Requirement: Notes Filtering by Hora

The notes view MUST provide a time-range filter to show notes within a specific hour range.

#### Scenario: Filter notes by hora

- GIVEN a teacher has notes at 10:00 and 14:00
- WHEN the teacher filters by "10:00 - 11:00"
- THEN only notes from the 10:00 horario are shown

### Requirement: Inline Create/Edit Flow

Notes MUST be created and edited inline within the notes list, without opening a SidePanel or modal.

#### Scenario: Create new note inline

- GIVEN the notes list is visible
- WHEN the teacher taps "Nueva Nota"
- THEN an inline form appears at the top of the list with fields: titulo, contenido, taller (dropdown), horario (dropdown)

#### Scenario: Edit existing note inline

- GIVEN a note is displayed in the list
- WHEN the teacher taps the edit icon on that note
- THEN the note transforms into an editable form with pre-filled values

#### Scenario: Save note

- GIVEN the inline form is open (create or edit)
- WHEN the teacher taps "Guardar"
- THEN the note is saved via API and the list refreshes

### Requirement: API Contract

**Create**: `POST /api/portal/notas/`
```json
{ "titulo": "...", "contenido": "...", "horario_id": 1 }
```

**Update**: `PUT /api/portal/notas/{id}/`
```json
{ "titulo": "...", "contenido": "...", "horario_id": 1 }
```

**List with filters**: `GET /api/portal/notas/?horario_id=1&ciclo_id=1`

#### Scenario: Create note via API

- GIVEN the inline form is filled
- WHEN the teacher taps "Guardar"
- THEN `POST /api/portal/notas/` is called with the form data
- AND the new note appears in the list

### Requirement: Remove SidePanel Dependency

The notes functionality MUST NOT require opening the SidePanel to view, create, or edit notes.

#### Scenario: Notes accessible without SidePanel

- GIVEN the teacher is on the notes page
- WHEN all note operations (list, create, edit) are performed
- THEN the SidePanel is never opened

## Impact Analysis

### Backend
- **File**: `core/views/portal_docente/notas_view.py` — add filter params (`horario_id`, `ciclo_id`) to list endpoint
- **API**: Existing CRUD endpoints gain query parameter filtering

### Frontend
- **File**: `frontend/src/components/domain/SidePanel.tsx` — remove notes tab/section
- **New component**: `NotesFilterBar` — taller + hora dropdown filters
- **New component**: `NotesInlineForm` — create/edit form embedded in list
- **File**: `frontend/src/pages/NotesPage.tsx` — full rewrite with inline flow
- **File**: `frontend/src/api/portalDocente.ts` — add filter params to `getNotas()`
