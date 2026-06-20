import React, { useState, useEffect } from 'react';
import { useWindowWidth } from '../../hooks/useWindowWidth';
import { getHorarioDetalle, getAsistencias } from '../../api/portalDocente';
import { DIA_SEMANA_MAP, ESTADO_ASISTENCIA_MAP, formatHora } from '../../utils/constants';
import { formatDate, getTodayString } from '../../utils/formatters';
import type { HorarioDetalle, AsistenciaPorHorario } from '../../types';
import Loading from '../ui/Loading';

interface SidePanelProps {
  isOpen: boolean;
  horarioId: number | null;
  cicloId: number;
  onClose: () => void;
}

const SidePanel: React.FC<SidePanelProps> = ({ isOpen, horarioId, cicloId, onClose }) => {
  const width = useWindowWidth();
  const isMobile = width <= 768;

  const [detalle, setDetalle] = useState<HorarioDetalle | null>(null);
  const [asistencias, setAsistencias] = useState<AsistenciaPorHorario[]>([]);
  const [loading, setLoading] = useState(false);
  const [fecha, setFecha] = useState(() => getTodayString());

  useEffect(() => {
    if (!horarioId || !isOpen) return;
    let cancelled = false;

    const fetchData = async () => {
      setLoading(true);
      try {
        const [det, asis] = await Promise.all([
          getHorarioDetalle(cicloId, horarioId),
          getAsistencias(cicloId, horarioId, fecha),
        ]);
        if (cancelled) return;
        setDetalle(det);
        setAsistencias(asis);
      } catch {
        // ignore errors
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchData();
    return () => { cancelled = true; };
  }, [horarioId, cicloId, fecha, isOpen]);

  const panelWidth = isMobile ? '100vw' : 400;

  const allRegistros = asistencias.flatMap(a => a.registros || []);

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.3)',
            zIndex: 99,
          }}
        />
      )}

      {/* Panel */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          width: panelWidth,
          height: '100vh',
          background: 'var(--color-bg)',
          borderLeft: isMobile ? 'none' : '1px solid var(--color-border)',
          boxShadow: isMobile ? 'none' : '-4px 0 20px rgba(0,0,0,0.08)',
          zIndex: 100,
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 250ms ease',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: 'var(--space-4)',
          borderBottom: '1px solid var(--color-border)',
          flexShrink: 0,
        }}>
          <div>
            <h2 style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'var(--text-base)',
              color: 'var(--color-text)',
              margin: 0,
            }}>
              {detalle?.taller_nombre || 'Detalle de clase'}
            </h2>
            {detalle && (
              <p style={{
                fontSize: 'var(--text-xs)',
                color: 'var(--color-text-muted)',
                margin: 'var(--space-1) 0 0 0',
              }}>
                {DIA_SEMANA_MAP[detalle.dia_semana]} | {formatHora(detalle.hora_inicio)} - {formatHora(detalle.hora_fin)}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            style={{
              padding: 'var(--space-2)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              background: 'transparent',
              color: 'var(--color-text-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 36,
              minWidth: 36,
            }}
            aria-label="Cerrar"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Date selector */}
        <div style={{
          padding: 'var(--space-3) var(--space-4)',
          borderBottom: '1px solid var(--color-border)',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-3)',
        }}>
          <label style={{
            fontSize: 'var(--text-xs)',
            fontWeight: 600,
            color: 'var(--color-text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            whiteSpace: 'nowrap',
          }}>
            Fecha
          </label>
          <input
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            style={{
              padding: 'var(--space-2) var(--space-3)',
              fontSize: 'var(--text-sm)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              background: 'var(--color-surface)',
              color: 'var(--color-text)',
              fontFamily: 'var(--font-body)',
              flex: 1,
            }}
          />
        </div>

        {/* Content */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: 'var(--space-4)',
        }}>
          {loading ? (
            <Loading message="Cargando..." />
          ) : !detalle ? (
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', textAlign: 'center', padding: 'var(--space-8) 0' }}>
              Selecciona una clase para ver sus detalles.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
              {/* Summary */}
              <div style={{
                background: 'var(--color-surface)',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--space-4)',
                border: '1px solid var(--color-border)',
              }}>
                <p style={{
                  fontSize: 'var(--text-sm)',
                  fontWeight: 600,
                  color: 'var(--color-text)',
                  margin: 0,
                  marginBottom: 'var(--space-1)',
                }}>
                  {detalle.alumnos_count} {detalle.alumnos_count === 1 ? 'alumno inscrito' : 'alumnos inscritos'}
                </p>
                <p style={{
                  fontSize: 'var(--text-xs)',
                  color: 'var(--color-text-muted)',
                  margin: 0,
                }}>
                  {detalle.taller_tipo === 'instrumento' ? 'Instrumento' : 'Taller'}
                </p>
              </div>

              {/* Attendance list */}
              <div>
                <h3 style={{
                  fontSize: 'var(--text-sm)',
                  fontWeight: 700,
                  color: 'var(--color-text)',
                  fontFamily: 'var(--font-heading)',
                  margin: 0,
                  marginBottom: 'var(--space-3)',
                }}>
                  Asistencia - {formatDate(fecha)}
                </h3>
                {allRegistros.length === 0 ? (
                  <p style={{
                    fontSize: 'var(--text-xs)',
                    color: 'var(--color-text-muted)',
                    textAlign: 'center',
                    padding: 'var(--space-4) 0',
                  }}>
                    Sin registros de asistencia para esta fecha.
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                    {allRegistros.map((r, idx) => {
                      const estadoInfo = ESTADO_ASISTENCIA_MAP[r.estado] || ESTADO_ASISTENCIA_MAP.ausente;
                      return (
                        <div key={idx} style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: 'var(--space-2) var(--space-3)',
                          background: 'var(--color-surface)',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--color-border)',
                        }}>
                          <span style={{
                            fontSize: 'var(--text-xs)',
                            fontWeight: 500,
                            color: 'var(--color-text)',
                          }}>
                            {r.alumno.nombre} {r.alumno.apellido}
                          </span>
                          <span style={{
                            padding: 'var(--space-1) var(--space-2)',
                            borderRadius: 'var(--radius-md)',
                            fontSize: 10,
                            fontWeight: 600,
                            background: estadoInfo.bg,
                            color: estadoInfo.color,
                          }}>
                            {estadoInfo.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default React.memo(SidePanel);
