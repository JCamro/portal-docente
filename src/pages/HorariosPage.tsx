import { memo, useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../stores/authStore';
import { getHorarios } from '../api/portalDocente';
import type { HorarioDetalle } from '../types';
import Loading from '../components/ui/Loading';
import ErrorState from '../components/ui/ErrorState';
import EmptyState from '../components/ui/EmptyState';
import WeeklyCalendar from '../components/domain/WeeklyCalendar';
import SidePanel from '../components/domain/SidePanel';
import { useWindowWidth } from '../hooks/useWindowWidth';

const HorariosPage = memo(() => {
  const cicloActivo = useAuthStore((s) => s.cicloActivo);
  const width = useWindowWidth();
  const isMobile = width <= 768;

  const [horarios, setHorarios] = useState<HorarioDetalle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Side panel state
  const [sidePanelOpen, setSidePanelOpen] = useState(false);
  const [selectedHorarioId, setSelectedHorarioId] = useState<number | null>(null);

  const fetchData = useCallback(async () => {
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

  const handleBlockClick = useCallback((horarioId: number) => {
    setSelectedHorarioId(horarioId);
    setSidePanelOpen(true);
  }, []);

  const handleClosePanel = useCallback(() => {
    setSidePanelOpen(false);
    setSelectedHorarioId(null);
  }, []);

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
      padding: isMobile ? 'var(--space-4)' : 'var(--space-6)',
      maxWidth: 1200,
      margin: '0 auto',
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 'var(--space-6)',
      }}>
        <h1 style={{
          fontFamily: 'var(--font-heading)',
          fontSize: isMobile ? 'var(--text-xl)' : 'var(--text-2xl)',
          color: 'var(--color-gold)',
          margin: 0,
        }}>
          Mis Horarios
        </h1>
        <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
          {horarios.length} {horarios.length === 1 ? 'clase' : 'clases'}
        </span>
      </div>

      {horarios.length === 0 ? (
        <EmptyState
          message="No tienes horarios asignados"
          description="No se encontraron clases para este ciclo."
        />
      ) : (
        <WeeklyCalendar
          horarios={horarios}
          onBlockClick={handleBlockClick}
        />
      )}

      {cicloActivo && (
        <SidePanel
          isOpen={sidePanelOpen}
          horarioId={selectedHorarioId}
          cicloId={cicloActivo.id}
          onClose={handleClosePanel}
        />
      )}
    </div>
  );
});

export default HorariosPage;
