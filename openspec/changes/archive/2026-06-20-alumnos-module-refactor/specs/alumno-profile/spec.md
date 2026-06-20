# Alumno Profile Specification

## Purpose

Display a student-centric SidePanel with profile information, day-by-day attendance history, and multi-level notes. Replaces the old Level1-3 drill-down components.

## Requirements

### Requirement: SidePanel Trigger

Tapping "Inspeccionar" on a student row MUST open a SidePanel sliding from the right. Panel MUST load student data within 300ms.

#### Scenario: Open panel

- GIVEN the student table is visible
- WHEN the teacher taps "Inspeccionar" on student "Juan Pérez"
- THEN a SidePanel slides in from the right
- AND the panel header shows "Juan Pérez — 12345678"
- AND a close button (X) is visible in the top-right corner

#### Scenario: Close panel

- GIVEN the SidePanel is open
- WHEN the teacher taps the close button or taps outside the panel
- THEN the panel slides out
- AND the student table regains focus

### Requirement: AlumnoProfile Section

The top section of the SidePanel MUST show student profile data: nombre completo, dni, telefono, email, talleres inscritos (as badges).

#### Scenario: Profile data displayed

- GIVEN a student with dni "12345678", telefono "999888777", enrolled in Guitarra and Canto
- WHEN the SidePanel opens
- THEN profile section shows all fields
- AND talleres appear as colored badges

#### Scenario: Missing phone/email

- GIVEN a student with telefono=null
- WHEN the SidePanel opens
- THEN telefono shows "No registrado"
- AND no empty whitespace appears

### Requirement: DaySelector

Below the profile, the SidePanel MUST show a date selector (horizontal scrollable chips or calendar) to choose which day's attendance to view.

#### Scenario: Default to today

- GIVEN the SidePanel opens on 2026-06-20
- WHEN the panel loads
- THEN DaySelector highlights today's date

#### Scenario: Select past date

- GIVEN the DaySelector shows dates 15-20 June
- WHEN the teacher taps "15/06"
- THEN AttendanceHistory updates to show attendance for 2026-06-15
- AND the date chip is highlighted

### Requirement: AttendanceHistory

The SidePanel MUST show attendance records for the selected date: taller, horario, estado (presente/ausente/tardanza), with visual indicators.

#### Scenario: Student attended on date

- GIVEN student attended Guitarra on 2026-06-15 at 10:00
- WHEN DaySelector shows 15/06
- THEN AttendanceHistory shows: "Guitarra — 10:00-11:00" with green "Presente" badge

#### Scenario: Student absent on date

- GIVEN student was absent on 2026-06-15
- WHEN DaySelector shows 15/06
- THEN AttendanceHistory shows: red "Ausente" badge

#### Scenario: No classes on date

- GIVEN no classes scheduled for 2026-06-18
- WHEN DaySelector shows 18/06
- THEN AttendanceHistory shows: "Sin clases programadas para este día"

### Requirement: NoteSection

Below AttendanceHistory, the SidePanel MUST display a NoteSection with all 5 note levels for the student. Each level is an expandable accordion section.

#### Scenario: Note levels visible

- GIVEN the SidePanel is open for a student
- WHEN the panel loads
- THEN 5 accordion sections appear: General, Día, Taller, Clase, Alumno
- AND each shows a count badge: "Notas (3)"

#### Scenario: Expand note level

- GIVEN the "Alumno" accordion is collapsed
- WHEN the teacher taps "Alumno"
- THEN the section expands showing notes for that level
- AND an "Agregar" button is visible

### Requirement: Data Loading Strategy

Profile data MUST load on demand when the panel opens. Attendance and notes load per DaySelector selection.

#### Scenario: Lazy load on open

- GIVEN the teacher taps "Inspeccionar"
- WHEN the panel opens
- THEN profile data and attendance for today load in parallel
- AND notes load after attendance completes
- AND a skeleton shows during load

### Requirement: API Contracts

**Profile**: `GET /api/portal/alumnos/{id}/` — returns student data with enrolled talleres.

**Attendance by date**: `GET /api/portal/ciclos/{ciclo_id}/asistencias/?alumno_id={id}&fecha=YYYY-MM-DD`

**Notes by student**: `GET /api/portal/notas/?alumno_id={id}&ciclo_id={ciclo_id}`

#### Scenario: Profile API call

- GIVEN the SidePanel opens for student id=5
- WHEN data loads
- THEN `GET /api/portal/alumnos/5/` is called once
- AND `GET /api/portal/ciclos/{ciclo_id}/asistencias/?alumno_id=5&fecha=2026-06-20` is called
- AND `GET /api/portal/notas/?alumno_id=5&ciclo_id={ciclo_id}` is called
