import { memo, useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { getHorariosSemanales } from '../api/portalDocente';
import type { TallerAgrupado, HorarioSemanalConTaller } from '../types';
import Loading from '../components/ui/Loading';
import ErrorState from '../components/ui/ErrorState';
import EmptyState from '../components/ui/EmptyState';
import HorarioNavBar from '../components/domain/horarios/HorarioNavBar';
import DiaView from '../components/domain/horarios/DiaView';
import WeekView from '../components/domain/horarios/WeekView';
import PeriodoView from '../components/domain/horarios/PeriodoView';
import { flattenSchedules, dateToISO } from '../utils/schedule';

type ViewMode = 'dia' | 'semana' | 'periodo';

const HorariosPage = memo(() => {
  const cicloActivo = useAuthStore((s) => s.cicloActivo);
  const [searchParams] = useSearchParams();
  const initialFecha = useMemo(() => {
    const f = searchParams.get('fecha');
    return f != null ? f : undefined;
  }, [searchParams]);
  const initialHorarioId = useMemo(() => {
    const h = searchParams.get('horario');
    return h != null ? Number(h) : undefined;
  }, [searchParams]);

  const [talleres, setTalleres] = useState<TallerAgrupado[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('dia');

  // Periodo date range state
  const today = useMemo(() => dateToISO(new Date()), []);
  const [periodStart, setPeriodStart] = useState(today);
  const [periodEnd, setPeriodEnd] = useState(today);

  const fetchData = useCallback(async () => {
    if (!cicloActivo) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await getHorariosSemanales(cicloActivo.id);
      setTalleres(data.talleres || []);
    } catch {
      setError('Error al cargar los horarios');
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

  const allSchedules = useMemo(() => flattenSchedules(talleres), [talleres]);

  const weekSchedules = useMemo(() => {
    const map = new Map<number, HorarioSemanalConTaller[]>();
    for (const s of allSchedules) {
      const list = map.get(s.dia_semana) || [];
      list.push(s);
      map.set(s.dia_semana, list);
    }
    return map;
  }, [allSchedules]);

  if (!cicloActivo) {
    return (
      <div style={{ padding: 'var(--space-lg)' }}>
        <EmptyState
          message="Selecciona un ciclo"
          description="Elige un ciclo académico para ver tus horarios."
        />
      </div>
    );
  }

  if (loading) return <Loading message="Cargando horarios..." />;
  if (error) return <ErrorState message={error} onRetry={fetchData} />;

  return (
    <div style={{
      padding: 'var(--space-4) var(--space-4) var(--space-8)',
      maxWidth: 960,
      margin: '0 auto',
    }}>
      <h1 style={{
        fontFamily: 'var(--font-heading)',
        fontSize: 'var(--text-2xl)',
        color: 'var(--color-gold)',
        margin: 0,
        marginBottom: 'var(--space-5)',
      }}>
        Mis Horarios
      </h1>

      <HorarioNavBar
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {talleres.length === 0 ? (
        <EmptyState
          message="No tienes horarios en este ciclo"
          description="No se encontraron clases asignadas para este ciclo."
        />
      ) : (
        <div style={{ marginTop: 'var(--space-4)' }}>
          {viewMode === 'dia' && (
            <DiaView
              key={`${initialFecha ?? 'default'}-${initialHorarioId ?? ''}`}
              allSchedules={allSchedules}
              cicloId={cicloActivo.id}
              initialFecha={initialFecha}
              initialHorarioId={initialHorarioId}
            />
          )}
          {viewMode === 'semana' && (
            <WeekView
              weekSchedules={weekSchedules}
              cicloId={cicloActivo.id}
            />
          )}
          {viewMode === 'periodo' && (
            <PeriodoView
              allSchedules={allSchedules}
              cicloId={cicloActivo.id}
              periodStart={periodStart}
              periodEnd={periodEnd}
              onPeriodStartChange={setPeriodStart}
              onPeriodEndChange={setPeriodEnd}
            />
          )}
        </div>
      )}
    </div>
  );
});

HorariosPage.displayName = 'HorariosPage';

export default HorariosPage;
