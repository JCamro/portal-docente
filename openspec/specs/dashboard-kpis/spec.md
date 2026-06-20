# Dashboard KPIs Specification

## Purpose

Fix incorrect `horas_mes` and `tiene_pagos` values across cycles, and add permanent QuickLinks to the teacher dashboard.

## Requirements

### Requirement: Cycle-Aware Payment Check

The `tiene_pagos` KPI MUST query payments using the resolved `profesor_id` for the active cycle, not the JWT-locked ID.

#### Scenario: Teacher has payments in cycle B but not cycle A

- GIVEN teacher has `PagoProfesor` records in cycle B only
- WHEN the teacher views the dashboard for cycle A
- THEN `tiene_pagos` returns `false`
- AND when switching to cycle B, `tiene_pagos` returns `true`

### Requirement: Correct Monthly Hours Calculation

The `horas_mes` KPI MUST sum `horas_calculadas` from `PagoProfesor` records matching the resolved `profesor_id` and the current month boundary.

#### Scenario: Hours computed for current month in active cycle

- GIVEN teacher has `PagoProfesor` with `horas_calculadas=12` for June 2026 in the active cycle
- WHEN the dashboard loads for June 2026
- THEN `horas_mes` returns `12`

#### Scenario: No payments this month

- GIVEN teacher has no `PagoProfesor` records for the current month
- WHEN the dashboard loads
- THEN `horas_mes` returns `0`

### Requirement: Dashboard QuickLinks

The dashboard MUST display at least 3 QuickLinks: "Mis Alumnos", "Horarios de Hoy", and "Horas Trabajadas".

Each QuickLink MUST navigate to the corresponding route (`/alumnos`, `/horarios`, `/pagos`).

#### Scenario: QuickLinks visible on dashboard load

- GIVEN the teacher is authenticated and has selected a cycle
- WHEN the dashboard page renders
- THEN 3 QuickLink cards are visible without scrolling

#### Scenario: QuickLink navigation

- GIVEN the dashboard is rendered
- WHEN the teacher taps "Mis Alumnos"
- THEN the app navigates to `/alumnos`

## Impact Analysis

### Backend
- **File**: `core/views/portal_docente/dashboard_view.py` — use resolved `profesor_id` for `tiene_pagos` and `horas_mes` queries
- **API contract**: `GET /api/portal/ciclos/{id}/dashboard/` response unchanged shape

### Frontend
- **File**: `frontend/src/pages/DashboardPage.tsx` — add QuickLinks section above KPIs
- **No new API calls** — QuickLinks are static navigation elements
