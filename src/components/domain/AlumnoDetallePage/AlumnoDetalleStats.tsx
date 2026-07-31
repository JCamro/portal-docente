import { memo } from 'react';
import { useWindowWidth } from '../../../hooks/useWindowWidth';
import { cardStyle, sectionLabel } from './utils';
import type { EstadisticasAlumno, EstadisticasTaller } from '../../../types';

interface Props {
  estadisticas: EstadisticasAlumno | null;
  estadisticasPorTaller: EstadisticasTaller[] | null;
  selectedTallerId: number | null;
  onSelectTaller: (id: number) => void;
}

const AlumnoDetalleStats = memo(({ estadisticas, estadisticasPorTaller, selectedTallerId, onSelectTaller }: Props) => {
  const width = useWindowWidth();
  const isMobile = width <= 768;

  // When a taller is selected and we have overall stats, show the 3-column grid
  if (selectedTallerId && estadisticas) {
    const pct = estadisticas.tasa_asistencia;
    return (
      <div style={cardStyle}>
        <div style={{ ...sectionLabel, textAlign: 'center' }}>Estadísticas del Taller</div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? 'repeat(3, 1fr)' : 'repeat(3, 1fr)',
          gap: 'var(--space-4)',
          textAlign: 'center',
        }}>
          <div style={{ background: 'var(--color-bg)', borderRadius: 'var(--radius-md)', padding: 'var(--space-3)' }}>
            <div style={{
              fontSize: isMobile ? 'var(--text-2xl)' : 'var(--text-3xl)',
              fontWeight: 700,
              color: pct >= 75 ? 'var(--color-gold)' : 'var(--color-error)',
              lineHeight: 1.1,
            }}>
              {pct}%
            </div>
            <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginTop: 'var(--space-1)' }}>Asistencia</div>
          </div>
          <div style={{ background: 'var(--color-bg)', borderRadius: 'var(--radius-md)', padding: 'var(--space-3)' }}>
            <div style={{ fontSize: isMobile ? 'var(--text-xl)' : 'var(--text-2xl)', fontWeight: 700, color: 'var(--color-text)', lineHeight: 1.1 }}>
              {estadisticas.total_asistencias}
            </div>
            <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginTop: 'var(--space-1)' }}>Asist.</div>
          </div>
          <div style={{ background: 'var(--color-bg)', borderRadius: 'var(--radius-md)', padding: 'var(--space-3)' }}>
            <div style={{ fontSize: isMobile ? 'var(--text-xl)' : 'var(--text-2xl)', fontWeight: 700, color: 'var(--color-text)', lineHeight: 1.1 }}>
              {estadisticas.total_faltas}
            </div>
            <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginTop: 'var(--space-1)' }}>Faltas</div>
          </div>
        </div>
      </div>
    );
  }

  // When no taller selected, show list view of all talleres
  if (estadisticasPorTaller && estadisticasPorTaller.length > 0) {
    return (
      <div>
        <div style={sectionLabel}>Estadísticas por Taller</div>
        <div style={{ ...cardStyle, padding: 0, overflow: 'hidden' }}>
          {estadisticasPorTaller.map((st: EstadisticasTaller) => {
            const selected = selectedTallerId === st.taller_id;
            return (
              <button
                key={st.taller_id}
                onClick={() => onSelectTaller(st.taller_id)}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr auto auto auto',
                  gap: 'var(--space-3)',
                  alignItems: 'center',
                  width: '100%',
                  textAlign: 'left',
                  cursor: 'pointer',
                  background: selected ? 'var(--color-gold-glow)' : 'transparent',
                  border: 'none',
                  borderBottom: '1px solid var(--color-border)',
                  padding: 'var(--space-3) var(--space-4)',
                  fontFamily: 'var(--font-body)',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => {
                  if (!selected) e.currentTarget.style.background = 'var(--color-bg)';
                }}
                onMouseLeave={(e) => {
                  if (!selected) e.currentTarget.style.background = 'transparent';
                }}
              >
                <span style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--color-text)' }}>
                  {st.taller_nombre}
                </span>
                <span style={{
                  fontSize: 'var(--text-base)',
                  fontWeight: 700,
                  color: st.tasa_asistencia >= 75 ? 'var(--color-gold)' : 'var(--color-error)',
                }}>
                  {st.tasa_asistencia}%
                </span>
                <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                  {st.total_asistencias} asist.
                </span>
                <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                  {st.total_faltas} faltas
                </span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return null;
});

export default AlumnoDetalleStats;
