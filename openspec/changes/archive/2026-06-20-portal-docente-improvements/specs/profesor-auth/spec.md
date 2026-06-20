# Profesor Auth Specification

## Purpose

Resolve the correct `Profesor` record per request using DNI + ciclo_id, bypassing the stale JWT `profesor_id` that locks to a single cycle.

## Background

`Profesor` has `unique_together = ['ciclo', 'dni']`. A teacher gets a different `profesor_id` per cycle. JWT stores one `profesor_id` at login — wrong cycle returns empty data (`tiene_pagos=false`, `horas_mes=0`).

## Requirements

### Requirement: Per-Request Profesor Resolution

The system MUST resolve `Profesor` by `dni` + `ciclo_id` on every portal request instead of trusting the JWT `profesor_id`.

The resolution helper `get_profesor_for_ciclo(dni, ciclo_id)` MUST perform a single indexed query against the `Profesor` table.

#### Scenario: Teacher logged in for cycle A accesses cycle B data

- GIVEN a teacher with DNI "12345678" has `profesor_id=10` in cycle A and `profesor_id=25` in cycle B
- WHEN the teacher requests `/api/portal/ciclos/{cycle_B_id}/horarios/`
- THEN the system resolves `Profesor` where `dni="12345678"` AND `ciclo=cycle_B_id`
- AND returns data for `profesor_id=25`

#### Scenario: Teacher record does not exist for target cycle

- GIVEN a teacher with DNI "12345678" has no `Profesor` record in cycle C
- WHEN the teacher requests any cycle-C endpoint
- THEN the system returns HTTP 404 with detail "Profesor no encontrado para este ciclo"

#### Scenario: JWT contains dni field

- GIVEN the login token includes `dni` in the payload
- WHEN any portal view calls `get_profesor_for_ciclo`
- THEN the helper extracts `dni` from the request user and `ciclo_id` from the URL path

### Requirement: ProfesorDummyUser Enrichment

The `ProfesorDummyUser` class MUST expose a `dni` attribute populated from the JWT payload.

#### Scenario: DNI available on request user

- GIVEN a JWT token with `dni: "12345678"`
- WHEN the view accesses `request.user.dni`
- THEN the value `"12345678"` is returned

### Requirement: Backward Compatibility

The existing JWT `profesor_id` field MUST remain in the token payload. The resolution helper is additive — it does not remove or ignore the existing field.

#### Scenario: Old tokens without dni still work

- GIVEN a legacy token without `dni` field
- WHEN the system attempts resolution
- THEN it falls back to `profesor_id` from JWT with a deprecation warning in logs

## Impact Analysis

### Backend
- **File**: `core/authentication.py` — add `dni` to `ProfesorDummyUser`, add `get_profesor_for_ciclo()` helper
- **File**: `core/views/portal_docente/*.py` — replace `request.user.profesor_id` with resolved `profesor_id`
- **No migration required** — DNI already stored in `Profesor` model

### Frontend
- **No changes required** — JWT already includes `dni` from login response
