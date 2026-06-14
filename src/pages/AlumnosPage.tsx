import { memo, useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { getHorarios, getHorarioDetalle } from '../api/portalDocente';
import type { HorarioDetalle, AlumnoInfo } from '../types';
import Loading from '../components/ui/Loading';
import ErrorState from '../components/ui/ErrorState';
import EmptyState from '../components/ui/EmptyState';
import AlumnoCard from '../components/domain/AlumnoCard';
import { useWindowWidth } from '../hooks/useWindowWidth';
import { DIA_SEMANA_MAP } from '../utils/constants';

const AlumnosPage = memo(() => {
  const cicloActivo = useAuthStore((s) => s.cicloActivo);
  const width = useWindowWidth();
  const isMobile = width <= 768;
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedHorarioId = searchParams.get('horarioId');

  const [horarios, setHorarios] = useState<HorarioDetalle[]>([]);
  const [detalle, setDetalle] = useState<HorarioDetalle | null>(null);
  const [loadingHorarios, setLoadingHorarios] = useState(true);
  const [loadingDetalle, setLoadingDetalle] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHorarios = async () => {
    if (!cicloActivo) {
      setLoadingHorarios(false);
      return;
    }
    setLoadingHorarios(true);
    try {
      const data = await getHorarios(cicloActivo.id);
      setHorarios(data);
      // Auto-select first horario if none selected
      if (!selectedHorarioId && data.length > 0) {
        setSearchParams({ horarioId: String(data[0].id) }, { replace: true });
      }
    } catch {
      setError('Error al cargar horarios');
    } finally {
      setLoadingHorarios(false);
    }
  };

  const fetchDetalle = async (horarioId: number) => {
    if (!cicloActivo) return;
    setLoadingDetalle(true);
    setError(null);
    try {
      const data = await getHorarioDetalle(cicloActivo.id, horarioId);
      setDetalle(data);
    } catch {
      setError('Error al cargar los alumnos');
    } finally {
      setLoadingDetalle(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!cancelled) await fetchHorarios();
    };
    run();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cicloActivo?.id]);

  useEffect(() => {
    if (!selectedHorarioId) return;
    let cancelled = false;
    const run = async () => {
      if (!cancelled) await fetchDetalle(Number(selectedHorarioId));
    };
    run();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedHorarioId, cicloActivo?.id]);

  if (!cicloActivo) {
    return (
      <div style={{ padding: 'var(--space-lg)' }}>
        <EmptyState message="Selecciona un ciclo" description="Elige un ciclo académico para ver tus alumnos." />
      </div>
    );
  }

  if (loadingHorarios) return <Loading message="Cargando horarios..." />;
  if (error && !detalle) return <ErrorState message={error} onRetry={() => selectedHorarioId && fetchDetalle(Number(selectedHorarioId))} />;

  const horarioSeleccionado = horarios.find(h => h.id === Number(selectedHorarioId));

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

      {/* Horario selector */}
      {horarios.length > 1 && (
        <div style={{
          display: 'flex',
          gap: 'var(--space-3)',
          marginBottom: 'var(--space-6)',
          overflowX: 'auto',
          paddingBottom: 'var(--space-2)',
        }}>
          {horarios.map((h) => (
            <button
              key={h.id}
              onClick={() => setSearchParams({ horarioId: String(h.id) }, { replace: true })}
              style={{
                padding: 'var(--space-3) var(--space-4)',
                borderRadius: 'var(--radius-md)',
                border: h.id === Number(selectedHorarioId)
                  ? '2px solid var(--color-gold)'
                  : '1px solid var(--color-border)',
                background: h.id === Number(selectedHorarioId)
                  ? 'var(--color-gold-glow)'
                  : 'var(--color-surface)',
                color: h.id === Number(selectedHorarioId) ? 'var(--color-gold)' : 'var(--color-text-secondary)',
                cursor: 'pointer',
                fontSize: 'var(--text-sm)',
                fontWeight: 500,
                fontFamily: 'var(--font-body)',
                whiteSpace: 'nowrap',
                minHeight: 44,
                transition: 'all 0.15s',
              }}
            >
              {DIA_SEMANA_MAP[h.dia_semana]} - {h.taller_nombre}
            </button>
          ))}
        </div>
      )}

      {loadingDetalle ? (
        <Loading message="Cargando alumnos..." />
      ) : !detalle ? (
        <EmptyState message="Selecciona un horario" description="Elige una clase para ver sus alumnos." />
      ) : detalle.alumnos.length === 0 ? (
        <EmptyState
          message="No hay alumnos inscritos"
          description={`No hay alumnos matriculados en ${horarioSeleccionado?.taller_nombre || 'esta clase'}.`}
        />
      ) : (
        <>
          <div style={{
            background: 'var(--color-surface)',
            borderRadius: 'var(--radius-xl)',
            padding: 'var(--space-5)',
            marginBottom: 'var(--space-6)',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-sm)',
          }}>
            <h2 style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'var(--text-lg)',
              color: 'var(--color-text)',
              margin: 0,
              marginBottom: 'var(--space-2)',
            }}>
              {detalle.taller_nombre}
            </h2>
            <p style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--color-text-muted)',
              margin: 0,
            }}>
              {DIA_SEMANA_MAP[detalle.dia_semana]} | {detalle.alumnos.length} {detalle.alumnos.length === 1 ? 'alumno' : 'alumnos'}
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
            gap: 'var(--space-4)',
          }}>
            {detalle.alumnos.map((alumno: AlumnoInfo) => (
              <AlumnoCard key={alumno.id} alumno={alumno} />
            ))}
          </div>
        </>
      )}
    </div>
  );
});

export default AlumnosPage;
