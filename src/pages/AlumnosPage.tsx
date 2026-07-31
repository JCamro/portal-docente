import { memo, useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { getAlumnosCartilla, getHorarios } from '../api/portalDocente';
import { useWindowWidth } from '../hooks/useWindowWidth';
import { useFilterURLSync } from '../hooks/useFilterURLSync';
import CascadeFilters from '../components/domain/CascadeFilters';
import AlumnoTable from '../components/domain/AlumnoTable';
import Loading from '../components/ui/Loading';
import ErrorState from '../components/ui/ErrorState';
import EmptyState from '../components/ui/EmptyState';
import type { AlumnoCartilla, HorarioDetalle } from '../types';

/**
 * AlumnosPage — Server-side paginated student roster.
 * All filtering is done server-side via query params.
 * Student detail opens via route /alumnos/:alumnoId.
 */
const AlumnosPage = memo(() => {
  const cicloActivo = useAuthStore((s) => s.cicloActivo);
  const navigate = useNavigate();
  const width = useWindowWidth();
  const isMobile = width <= 768;

  // Filter state synced to URL
  const { state: filterState, onChange: onFilterChange, resetAll } = useFilterURLSync();

  // Data state
  const [alumnosData, setAlumnosData] = useState<{ results: AlumnoCartilla[]; count: number }>({
    results: [],
    count: 0,
  });
  const [page, setPage] = useState(1);
  const [horarios, setHorarios] = useState<HorarioDetalle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!cicloActivo) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      // Fetch students with server-side filters + pagination
      const cartillaParams: Record<string, string | number | undefined> = {
        page,
        search: filterState.search ?? undefined,
        taller_id: filterState.tallerId ?? undefined,
        estado: filterState.estado ?? undefined,
        dia_semana: filterState.dia_semana ?? undefined,
        hora: filterState.hora ? String(parseInt(filterState.hora.split(':')[0])) : undefined,
      };

      const [paginatedData, horariosData] = await Promise.all([
        getAlumnosCartilla(cicloActivo.id, cartillaParams as any),
        getHorarios(cicloActivo.id),
      ]);

      setAlumnosData({ results: paginatedData.results, count: paginatedData.count });
      setHorarios(horariosData);
    } catch {
      setError('No se pudieron cargar los alumnos');
    } finally {
      setLoading(false);
    }
  }, [cicloActivo, page, filterState.search, filterState.tallerId, filterState.estado, filterState.dia_semana, filterState.hora]);

  // Fetch data when ciclo, page, or filters change. Reset to page 1 on filter change.
  const prevFiltersRef = useRef({ search: filterState.search, tallerId: filterState.tallerId, estado: filterState.estado, dia_semana: filterState.dia_semana, hora: filterState.hora });

  useEffect(() => {
    const filters = { search: filterState.search, tallerId: filterState.tallerId, estado: filterState.estado, dia_semana: filterState.dia_semana, hora: filterState.hora };
    const prev = prevFiltersRef.current;
    const filtersChanged = (
      prev.search !== filters.search ||
      prev.tallerId !== filters.tallerId ||
      prev.estado !== filters.estado ||
      prev.dia_semana !== filters.dia_semana ||
      prev.hora !== filters.hora
    );

    if (filtersChanged) {
      setPage(1);
    }
    prevFiltersRef.current = filters;

    let cancelled = false;
    const run = async () => {
      if (!cancelled) await fetchData();
    };
    run();
    return () => { cancelled = true; };
  }, [fetchData]);

  // Reset everything when ciclo changes
  useEffect(() => {
    resetAll();
    setPage(1);
  }, [cicloActivo?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleInspect = useCallback((alumnoId: number) => {
    navigate(`/alumnos/${alumnoId}`);
  }, [navigate]);

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  // Compute talleres list for CascadeFilters from horarios
  const talleres = horarios
    .filter((h, i, arr) => h.taller_id && arr.findIndex((x) => x.taller_id === h.taller_id) === i)
    .map((h) => ({ id: h.taller_id!, nombre: h.taller_nombre }));

  // ── Render ────────────────────────────────────────────────────────────
  if (!cicloActivo) {
    return (
      <div style={{ padding: 'var(--space-lg)' }}>
        <EmptyState message="Selecciona un ciclo" description="Elige un ciclo académico para ver tus alumnos." />
      </div>
    );
  }

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

      {/* Cascade filters — always visible */}
      <CascadeFilters
        fechas={[]}
        talleres={talleres}
        horas={[]}
        selected={filterState}
        onChange={onFilterChange}
      />

      {/* Student table or loading/empty state */}
      {loading && alumnosData.results.length === 0 ? (
        <Loading message="Cargando alumnos..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchData} />
      ) : (
        <AlumnoTable
          alumnos={alumnosData.results}
          count={alumnosData.count}
          page={page}
          pageSize={20}
          onPageChange={handlePageChange}
          onInspect={handleInspect}
          loading={loading}
        />
      )}
    </div>
  );
});

export default AlumnosPage;
