# Horarios Students Specification

## Purpose

Enrich the student list within horarios with `dni` and `telefono`, and align the student count with the actual list length.

## Requirements

### Requirement: Student Fields Enrichment

The `HorarioConAlumnosSerializer.alumnos` field MUST include `dni` and `telefono` for each student in addition to existing fields.

#### Scenario: Student list includes contact info

- GIVEN a horario with 3 enrolled students
- WHEN the API returns `GET /api/portal/ciclos/{id}/horarios/`
- THEN each student object contains `id`, `nombre`, `apellido`, `dni`, and `telefono`

#### Scenario: Student with missing phone

- GIVEN a student with `telefono=null`
- WHEN the horario response is serialized
- THEN `telefono` is returned as `null` (not omitted)

### Requirement: Count Consistency

The `alumnos_count` field in the horario response MUST equal the length of the `alumnos` array.

#### Scenario: Count matches list

- GIVEN a horario with 5 students in the `alumnos` list
- WHEN the response is returned
- THEN `alumnos_count` equals `5`

#### Scenario: Empty horario

- GIVEN a horario with no enrolled students
- WHEN the response is returned
- THEN `alumnos_count` equals `0` and `alumnos` is an empty array `[]`

### Requirement: Backend Query Optimization

The `get_alumnos()` method MUST use `.values()` with `dni` and `telefono` fields included to avoid additional queries.

#### Scenario: Single query for student data

- GIVEN a horario with 10 students
- WHEN the serializer builds the student list
- THEN only 1 query is executed (no N+1)

## Impact Analysis

### Backend
- **File**: `core/serializers/portal_docente/serializers.py` — add `dni`, `telefono` to `.values()` in `get_alumnos()`
- **File**: `core/views/portal_docente/horarios_view.py` — align `alumnos_count` annotation with `get_alumnos()` filter

### Frontend
- **File**: `frontend/src/pages/HorariosPage.tsx` — display `dni` and `telefono` in student list UI
- **File**: `frontend/src/api/portalDocente.ts` — update `HorarioAlumno` TypeScript interface
