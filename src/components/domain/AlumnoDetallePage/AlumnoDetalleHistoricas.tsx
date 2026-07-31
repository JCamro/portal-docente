import { memo, useState } from 'react';
import { cardStyle, sectionLabel, toLocalDate, dotColor, estadoBadge, DIA_SEMANA_MAP } from './utils';
import { formatDate } from '../../../utils/formatters';
import type { MatriculaHistorica } from '../../../types';

const arrowDown: React.CSSProperties = {
  width: 0,
  height: 0,
  borderLeft: '5px solid transparent',
  borderRight: '5px solid transparent',
  borderTop: '6px solid var(--color-text-muted)',
  display: 'inline-block',
  transition: 'transform 0.2s',
};

interface Props {
  matriculasHistoricas: MatriculaHistorica[];
}

const AlumnoDetalleHistoricas = memo(({ matriculasHistoricas }: Props) => {
  const [verHistoricas, setVerHistoricas] = useState(false);

  if (!matriculasHistoricas || matriculasHistoricas.length === 0) return null;

  const grupos = new Map<number, { taller_id: number; taller_nombre: string; matriculas: MatriculaHistorica[] }>();
  for (const mh of matriculasHistoricas) {
    if (!grupos.has(mh.taller_id)) {
      grupos.set(mh.taller_id, { taller_id: mh.taller_id, taller_nombre: mh.taller_nombre, matriculas: [] });
    }
    grupos.get(mh.taller_id)!.matriculas.push(mh);
  }
  const gruposArray = Array.from(grupos.values());

  return (
    <div>
      <div style={sectionLabel}>Matrículas históricas</div>
      <button
        onClick={() => setVerHistoricas(!verHistoricas)}
        style={{
          padding: 'var(--space-3) var(--space-4)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border)',
          background: 'transparent',
          color: 'var(--color-text-secondary)',
          fontSize: 'var(--text-sm)',
          fontWeight: 600,
          cursor: 'pointer',
          fontFamily: 'var(--font-body)',
          width: '100%',
          textAlign: 'left',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          minHeight: 44,
        }}
      >
        <span>Ver histórico ({matriculasHistoricas.length} en {gruposArray.length} taller{gruposArray.length > 1 ? 'es' : ''})</span>
        <span style={{ ...arrowDown, transform: verHistoricas ? 'rotate(180deg)' : 'rotate(0deg)' }} />
      </button>
      {verHistoricas && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', marginTop: 'var(--space-4)' }}>
          {gruposArray.map((grupo) => (
            <div key={grupo.taller_id} style={cardStyle}>
              <div style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--color-text)', marginBottom: 'var(--space-4)' }}>
                {grupo.taller_nombre}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                {grupo.matriculas.map((mh) => {
                  const statusBadge: React.CSSProperties = {
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: 'var(--text-xs)',
                    fontWeight: 600,
                    background: mh.concluida ? 'var(--color-success-bg)' : 'var(--color-error-bg)',
                    color: mh.concluida ? 'var(--color-success)' : 'var(--color-error)',
                    border: `1px solid ${mh.concluida ? 'var(--color-success)' : 'var(--color-error)'}`,
                    whiteSpace: 'nowrap',
                  };
                  return (
                    <div
                      key={mh.id}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 'var(--space-2)',
                        padding: 'var(--space-3)',
                        borderRadius: 'var(--radius-md)',
                        background: 'var(--color-bg)',
                      }}
                    >
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)', alignItems: 'center', fontSize: 'var(--text-sm)' }}>
                        <span style={{ color: 'var(--color-text-muted)' }}>{mh.fecha_matricula}</span>
                        <span style={{ fontWeight: 700, color: 'var(--color-text)' }}>
                          {mh.sesiones_consumidas}/{mh.sesiones_contratadas}
                        </span>
                        <span style={statusBadge}>{mh.concluida ? 'Concluida' : 'Inactiva'}</span>
                        {mh.dia_semana !== null && (
                          <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)' }}>
                            HORARIO: {DIA_SEMANA_MAP[mh.dia_semana]} {mh.hora_inicio?.slice(0, 5)}–{mh.hora_fin?.slice(0, 5)}
                          </span>
                        )}
                      </div>
                      {mh.asistencias && mh.asistencias.length > 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                          {mh.asistencias.map((a, i) => {
                            const d = toLocalDate(a.fecha);
                            const badge = estadoBadge(a.estado);
                            return (
                              <div
                                key={i}
                                style={{
                                  display: 'grid',
                                  gridTemplateColumns: '1fr auto',
                                  alignItems: 'center',
                                  gap: 'var(--space-3)',
                                  padding: 'var(--space-2) var(--space-3)',
                                  borderRadius: 'var(--radius-sm)',
                                  background: 'var(--color-surface)',
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                                  <span
                                    style={{
                                      width: 8,
                                      height: 8,
                                      borderRadius: 'var(--radius-full)',
                                      background: dotColor(a.estado),
                                      flexShrink: 0,
                                    }}
                                  />
                                  <div>
                                    <div style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--color-text)', lineHeight: 1.3 }}>
                                      {DIA_SEMANA_MAP[(d.getUTCDay() + 6) % 7]}
                                    </div>
                                    <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-gold)', lineHeight: 1.3 }}>
                                      {mh.hora_inicio && mh.hora_fin
                                        ? `${mh.hora_inicio.slice(0, 5)}–${mh.hora_fin.slice(0, 5)}`
                                        : '—'}
                                    </div>
                                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', lineHeight: 1.3 }}>
                                      {formatDate(a.fecha)}
                                    </div>
                                  </div>
                                </div>
                                <span style={badge.style}>{badge.label}</span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                      {(!mh.asistencias || mh.asistencias.length === 0) && (
                        <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
                          Sin registros
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

export default AlumnoDetalleHistoricas;
