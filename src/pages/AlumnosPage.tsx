import { memo, useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { getHorarios } from '../api/portalDocente';
import type { HorarioDetalle } from '../types';
import Loading from '../components/ui/Loading';
import ErrorState from '../components/ui/ErrorState';
import EmptyState from '../components/ui/EmptyState';
import Level1DayOverview from '../components/domain/Level1DayOverview';
import Level2TallerSessions from '../components/domain/Level2TallerSessions';
import Level3SessionDetail from '../components/domain/Level3SessionDetail';
import { useWindowWidth } from '../hooks/useWindowWidth';

import { getTodayString } from '../utils/formatters';

const AlumnosPage = memo(() => {
  const cicloActivo = useAuthStore((s) => s.cicloActivo);
  const width = useWindowWidth();
  const isMobile = width <= 768;
  const [searchParams, setSearchParams] = useSearchParams();

  // Level state derived from URL params
  const fecha = searchParams.get('fecha') || getTodayString();
  const tallerId = searchParams.get('tallerId');
  const horarioId = searchParams.get('horarioId');

  const [horarios, setHorarios] = useState<HorarioDetalle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHorarios = useCallback(async () => {
    if (!cicloActivo) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await getHorarios(cicloActivo.id);
      setHorarios(data);
    } catch {
      setError('Error al cargar horarios');
    } finally {
      setLoading(false);
    }
  }, [cicloActivo]);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!cancelled) await fetchHorarios();
    };
    run();
    return () => { cancelled = true; };
  }, [fetchHorarios]);

  const setParam = (key: string, value: string | null) => {
    const next = new URLSearchParams(searchParams);
    if (value === null || value === undefined) {
      next.delete(key);
    } else {
      next.set(key, value);
    }
    // When going back to level 1, clear deeper levels
    if (key === 'fecha' || (key === 'tallerId' && value === null)) {
      next.delete('tallerId');
      next.delete('horarioId');
    }
    if (key === 'horarioId' && value === null) {
      next.delete('horarioId');
    }
    setSearchParams(next, { replace: true });
  };

  const handleSelectDate = (date: string) => {
    setParam('fecha', date);
  };

  const handleSelectTaller = (tid: number) => {
    setParam('tallerId', String(tid));
  };

  const handleSelectSession = (hid: number) => {
    setParam('horarioId', String(hid));
  };

  const handleBackFromTaller = () => {
    setParam('tallerId', null);
  };

  const handleBackFromSession = () => {
    setParam('horarioId', null);
  };

  if (!cicloActivo) {
    return (
      <div style={{ padding: 'var(--space-lg)' }}>
        <EmptyState message="Selecciona un ciclo" description="Elige un ciclo académico para ver tus alumnos." />
      </div>
    );
  }

  if (loading) return <Loading message="Cargando horarios..." />;
  if (error) return <ErrorState message={error} onRetry={fetchHorarios} />;

  return (
    <div style={{
      padding: isMobile ? 'var(--space-4)' : 'var(--space-6)',
      maxWidth: 1200,
      margin: '0 auto',
    }}>
      <h1 style={{
        fontFamily: 'var(--font-heading)',
        fontSize: isMobile ? 'var(--text-xl)' : 'var(--text-2xl)',
        color: 'var(--color-gold)',
        margin: 0,
        marginBottom: 'var(--space-6)',
      }}>
        Mis Alumnos
      </h1>

      {/* Level 3: Session detail */}
      {horarioId && fecha ? (
        <Level3SessionDetail
          cicloId={cicloActivo.id}
          horarioId={Number(horarioId)}
          fecha={fecha}
          horarios={horarios}
          onBack={handleBackFromSession}
        />
      ) : /* Level 2: Taller sessions */
      tallerId && fecha ? (
        <Level2TallerSessions
          horarios={horarios}
          tallerId={Number(tallerId)}
          fecha={fecha}
          onSelectSession={handleSelectSession}
          onBack={handleBackFromTaller}
        />
      ) : /* Level 1: Day overview (default) */
      (
        <Level1DayOverview
          cicloId={cicloActivo.id}
          horarios={horarios}
          selectedDate={fecha}
          onSelectDate={handleSelectDate}
          onSelectTaller={handleSelectTaller}
        />
      )}
    </div>
  );
});

export default AlumnosPage;
