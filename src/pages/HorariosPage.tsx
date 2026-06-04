import { memo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { getHorarios } from '../api/portalDocente';
import type { Horario } from '../types';
import Loading from '../components/ui/Loading';
import ErrorState from '../components/ui/ErrorState';
import EmptyState from '../components/ui/EmptyState';
import HorarioCard from '../components/domain/HorarioCard';
import { useWindowWidth } from '../hooks/useWindowWidth';
import { DIA_SEMANA_MAP, formatHora } from '../utils/constants';

const HorariosPage = memo(() => {
  const navigate = useNavigate();
  const cicloActivo = useAuthStore((s) => s.cicloActivo);
  const width = useWindowWidth();
  const isMobile = width <= 768;

  const [horarios, setHorarios] = useState<Horario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
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
  };

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!cancelled) await fetchData();
    };
    run();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cicloActivo?.id]);

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

  const sortedHorarios = [...horarios].sort((a, b) => {
    if (a.dia_semana !== b.dia_semana) return a.dia_semana - b.dia_semana;
    return a.hora_inicio.localeCompare(b.hora_inicio);
  });

  const columnHeaders = [
    { key: 'dia', label: 'Día' },
    { key: 'taller', label: 'Taller' },
    { key: 'horario', label: 'Horario' },
    { key: 'tipo', label: 'Tipo' },
  ];

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

      {sortedHorarios.length === 0 ? (
        <EmptyState
          message="No tienes horarios asignados"
          description="No se encontraron clases para este ciclo."
        />
      ) : isMobile ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {sortedHorarios.map((h) => (
            <HorarioCard
              key={h.id}
              horario={h}
              onClick={() => navigate(`/alumnos?horarioId=${h.id}`)}
            />
          ))}
        </div>
      ) : (
        <div className="card" style={{
          background: 'var(--color-surface)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-sm)',
          border: '1px solid var(--color-border)',
          overflow: 'hidden',
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--color-bg)' }}>
                {columnHeaders.map(col => (
                  <th key={col.key} style={{
                    padding: 'var(--space-4) var(--space-5)',
                    textAlign: 'left',
                    fontSize: 'var(--text-xs)',
                    fontWeight: 600,
                    color: 'var(--color-text-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}>
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedHorarios.map((h) => (
                <tr
                  key={h.id}
                  onClick={() => navigate(`/alumnos?horarioId=${h.id}`)}
                  style={{
                    borderTop: '1px solid var(--color-border)',
                    cursor: 'pointer',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--color-surface-hover)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                >
                  <td style={{ padding: 'var(--space-4) var(--space-5)' }}>
                    <span style={{
                      background: 'var(--color-gold-glow)',
                      color: 'var(--color-gold)',
                      borderRadius: 'var(--radius-md)',
                      padding: 'var(--space-1) var(--space-3)',
                      fontSize: 'var(--text-xs)',
                      fontWeight: 600,
                    }}>
                      {DIA_SEMANA_MAP[h.dia_semana]}
                    </span>
                  </td>
                  <td style={{
                    padding: 'var(--space-4) var(--space-5)',
                    fontWeight: 600,
                    color: 'var(--color-text)',
                    fontSize: 'var(--text-sm)',
                  }}>
                    {h.taller_nombre}
                  </td>
                  <td style={{
                    padding: 'var(--space-4) var(--space-5)',
                    color: 'var(--color-text-secondary)',
                    fontSize: 'var(--text-sm)',
                  }}>
                    {formatHora(h.hora_inicio)} - {formatHora(h.hora_fin)}
                  </td>
                  <td style={{
                    padding: 'var(--space-4) var(--space-5)',
                    fontSize: 'var(--text-sm)',
                    color: 'var(--color-text-muted)',
                  }}>
                    <span style={{
                      textTransform: 'capitalize',
                      fontSize: 'var(--text-xs)',
                      background: h.taller_tipo === 'instrumento'
                        ? 'rgba(59, 130, 246, 0.1)'
                        : 'rgba(139, 92, 246, 0.1)',
                      color: h.taller_tipo === 'instrumento' ? '#3b82f6' : '#8b5cf6',
                      borderRadius: 'var(--radius-md)',
                      padding: 'var(--space-1) var(--space-3)',
                      fontWeight: 500,
                    }}>
                      {h.taller_tipo === 'instrumento' ? 'Instrumento' : 'Taller'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
});

export default HorariosPage;
