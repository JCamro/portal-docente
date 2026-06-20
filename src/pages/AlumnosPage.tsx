import { memo, useState, useEffect, useCallback, useMemo } from 'react';
import { useAuthStore } from '../stores/authStore';
import { getAlumnosCartilla, getHorarios, getAsistenciasPorHorario } from '../api/portalDocente';
import { useWindowWidth } from '../hooks/useWindowWidth';
import { useFilterURLSync } from '../hooks/useFilterURLSync';
import CascadeFilters from '../components/domain/CascadeFilters';
import AlumnoTable from '../components/domain/AlumnoTable';
import SidePanel from '../components/domain/SidePanel';
import Loading from '../components/ui/Loading';
import ErrorState from '../components/ui/ErrorState';
import EmptyState from '../components/ui/EmptyState';
import type { AlumnoCartilla, HorarioDetalle, HorarioResumen } from '../types';

/**
 * AlumnosPage — Single-page rewrite.
 * Flat student table + cascade filters + inspection side panel.
 * All data fetched once on mount, client-side filtered.
 */
const AlumnosPage = memo(() => {
  const cicloActivo = useAuthStore((s) => s.cicloActivo);
  const width = useWindowWidth();
  const isMobile = width <= 768;

  // Filter state synced to URL
  const { state: filterState, onChange: onFilterChange, resetAll } = useFilterURLSync();

  // Data state
  const [alumnos, setAlumnos] = useState<AlumnoCartilla[]>([]);
  const [horarios, setHorarios] = useState<HorarioDetalle[]>([]);
  const [asistenciaResumen, setAsistenciaResumen] = useState<{ horarios: HorarioResumen[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // SidePanel state
  const [panelAlumnoId, setPanelAlumnoId] = useState<number | null>(null);

  const fetchData = useCallback(async () => {
    if (!cicloActivo) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [alumnosData, horariosData, asistenciaData] = await Promise.all([
        getAlumnosCartilla(cicloActivo.id),
        getHorarios(cicloActivo.id),
        getAsistenciasPorHorario(cicloActivo.id),
      ]);
      setAlumnos(alumnosData);
      setHorarios(horariosData);
      setAsistenciaResumen(asistenciaData);
    } catch {
      setError('No se pudieron cargar los alumnos');
    } finally {
      setLoading(false);
    }
  }, [cicloActivo]);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!cancelled) await fetchData();
    };
    run();
    return () => { cancelled = true; };
  }, [fetchData]);

  // Reset filters when ciclo changes
  useEffect(() => {
    resetAll();
    setPanelAlumnoId(null);
  }, [cicloActivo?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Computed: fecha_ultima_asistencia per student ─────────────────────
  const fechaUltimaAsistencia = useMemo<Record<number, string | null>>(() => {
    if (!asistenciaResumen) return {};

    const result: Record<number, string | null> = {};

    for (const alumno of alumnos) {
      let lastDate: string | null = null;

      // For each horario the student is enrolled in
      for (const horarioBadge of alumno.horarios) {
        const resumen = asistenciaResumen.horarios.find(
          (h) => h.horario_id === horarioBadge.id
        );
        if (resumen && resumen.fechas.length > 0) {
          // Find the latest date
          const maxDate = resumen.fechas.reduce((max, f) =>
            f > max ? f : max
          );
          if (maxDate && (!lastDate || maxDate > lastDate)) {
            lastDate = maxDate;
          }
        }
      }

      result[alumno.id] = lastDate;
    }

    return result;
  }, [alumnos, asistenciaResumen]);

  // ── Computed: filter options ──────────────────────────────────────────
  const fechas = useMemo<string[]>(() => {
    if (!asistenciaResumen) return [];
    const set = new Set<string>();
    for (const h of asistenciaResumen.horarios) {
      for (const f of h.fechas) {
        set.add(f);
      }
    }
    return Array.from(set).sort();
  }, [asistenciaResumen]);

  const talleres = useMemo(() => {
    const map = new Map<number, string>();
    for (const h of horarios) {
      if (h.taller_id && !map.has(h.taller_id)) {
        map.set(h.taller_id, h.taller_nombre);
      }
    }
    return Array.from(map.entries()).map(([id, nombre]) => ({ id, nombre }));
  }, [horarios]);

  const horas = useMemo(() => {
    const horasSet = new Set<string>();
    for (const h of horarios) {
      horasSet.add(`${h.hora_inicio}-${h.hora_fin}`);
    }
    return Array.from(horasSet).sort().map((slot) => {
      const [inicio, fin] = slot.split('-');
      return { inicio, fin, horarioId: 0 }; // horarioId not needed for filter UI
    });
  }, [horarios]);

  // ── Computed: cascade-filtered option arrays ──────────────────────────
  // These are pre-reduced so dropdowns only show matching options.

  const filteredTalleres = useMemo(() => {
    if (!filterState.fecha || !asistenciaResumen) return talleres;
    const horariosOnDate = new Set(
      asistenciaResumen.horarios
        .filter((h) => h.fechas.includes(filterState.fecha!))
        .map((h) => h.horario_id)
    );
    const tallerIdsOnDate = new Set<number>();
    for (const h of horarios) {
      if (horariosOnDate.has(h.id) && h.taller_id) {
        tallerIdsOnDate.add(h.taller_id);
      }
    }
    return talleres.filter((t) => tallerIdsOnDate.has(t.id));
  }, [talleres, filterState.fecha, asistenciaResumen, horarios]);

  const filteredHoras = useMemo(() => {
    let result = horas;
    if (filterState.tallerId !== null) {
      const horarioIdsForTaller = new Set(
        horarios
          .filter((h) => h.taller_id === filterState.tallerId)
          .map((h) => h.id)
      );
      result = result.filter((h) => {
        const horario = horarios.find(
          (hr) => hr.hora_inicio === h.inicio && hr.hora_fin === h.fin
        );
        return horario && horarioIdsForTaller.has(horario.id);
      });
    }
    if (filterState.fecha && asistenciaResumen) {
      const horariosOnDate = new Set(
        asistenciaResumen.horarios
          .filter((h) => h.fechas.includes(filterState.fecha!))
          .map((h) => h.horario_id)
      );
      result = result.filter((h) => {
        const horario = horarios.find(
          (hr) => hr.hora_inicio === h.inicio && hr.hora_fin === h.fin
        );
        return horario && horariosOnDate.has(horario.id);
      });
    }
    return result;
  }, [horas, filterState.tallerId, filterState.fecha, horarios, asistenciaResumen]);

  // ── Client-side filtering ─────────────────────────────────────────────
  const filteredAlumnos = useMemo(() => {
    let result = [...alumnos];

    // Filter by tallerId
    if (filterState.tallerId !== null) {
      result = result.filter((a) =>
        a.horarios.some((h) => h.taller_id === filterState.tallerId)
      );
    }

    // Filter by hora
    if (filterState.hora) {
      const [horaInicio] = filterState.hora.split('-');
      // Get horario IDs matching this hour
      const matchingHorarioIds = horarios
        .filter((h) => h.hora_inicio === horaInicio)
        .map((h) => h.id);
      result = result.filter((a) =>
        a.horarios.some((h) => matchingHorarioIds.includes(h.id))
      );
    }

    // Filter by fecha — find horarios that have classes on that date
    if (filterState.fecha && asistenciaResumen) {
      const horariosOnDate = asistenciaResumen.horarios
        .filter((h) => h.fechas.includes(filterState.fecha!))
        .map((h) => h.horario_id);
      if (horariosOnDate.length > 0) {
        result = result.filter((a) =>
          a.horarios.some((h) => horariosOnDate.includes(h.id))
        );
      }
    }

    // Sort by apellido, nombre
    result.sort((a, b) => {
      const cmp = a.apellido.localeCompare(b.apellido);
      if (cmp !== 0) return cmp;
      return a.nombre.localeCompare(b.nombre);
    });

    return result;
  }, [alumnos, filterState, horarios, asistenciaResumen]);

  const handleInspect = useCallback((alumnoId: number) => {
    setPanelAlumnoId(alumnoId);
  }, []);

  const handleClosePanel = useCallback(() => {
    setPanelAlumnoId(null);
  }, []);

  // ── Render ────────────────────────────────────────────────────────────
  if (!cicloActivo) {
    return (
      <div style={{ padding: 'var(--space-lg)' }}>
        <EmptyState message="Selecciona un ciclo" description="Elige un ciclo académico para ver tus alumnos." />
      </div>
    );
  }

  if (loading) return <Loading message="Cargando alumnos..." />;
  if (error) return <ErrorState message={error} onRetry={fetchData} />;

  return (
    <div style={{
      padding: isMobile ? 'var(--space-4)' : 'var(--space-6)',
      maxWidth: 1200,
      margin: '0 auto',
      position: 'relative',
    }}>
      <h1 style={{
        fontFamily: 'var(--font-heading)',
        fontSize: isMobile ? 'var(--text-xl)' : 'var(--text-2xl)',
        color: 'var(--color-gold)',
        margin: 0,
        marginBottom: 'var(--space-5)',
      }}>
        Mis Alumnos
      </h1>

      {/* Cascade filters */}
      <CascadeFilters
        fechas={fechas}
        talleres={filteredTalleres}
        horas={filteredHoras}
        selected={filterState}
        onChange={onFilterChange}
      />

      {/* Student table */}
      <AlumnoTable
        alumnos={filteredAlumnos}
        fechaUltimaAsistencia={fechaUltimaAsistencia}
        onInspect={handleInspect}
      />

      {/* SidePanel */}
      <SidePanel
        isOpen={panelAlumnoId !== null}
        alumnoId={panelAlumnoId}
        cicloId={cicloActivo.id}
        onClose={handleClosePanel}
        alumnos={alumnos}
        fechas={fechas}
      />
    </div>
  );
});

export default AlumnosPage;
