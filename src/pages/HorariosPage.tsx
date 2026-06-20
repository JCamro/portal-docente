import { memo, useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../stores/authStore';
import { getAsistenciasPorHorario, getAsistencias, getHorarioDetalle } from '../api/portalDocente';
import type { HorarioResumen, HorarioDetalle, AsistenciaRegistro } from '../types';
import Loading from '../components/ui/Loading';
import ErrorState from '../components/ui/ErrorState';
import EmptyState from '../components/ui/EmptyState';
import { useWindowWidth } from '../hooks/useWindowWidth';
import { DIA_SEMANA_MAP, ESTADO_ASISTENCIA_MAP, formatHora } from '../utils/constants';
import { formatDate } from '../utils/formatters';

type Step = 'cards' | 'dates' | 'records';

const HorariosPage = memo(() => {
  const cicloActivo = useAuthStore((s) => s.cicloActivo);
  const width = useWindowWidth();
  const isMobile = width <= 768;

  // Step navigation
  const [step, setStep] = useState<Step>('cards');

  // Data
  const [resumenes, setResumenes] = useState<HorarioResumen[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Date drill-down
  const [selectedResumen, setSelectedResumen] = useState<HorarioResumen | null>(null);
  const [selectedFecha, setSelectedFecha] = useState<string | null>(null);

  // Attendance records
  const [detalle, setDetalle] = useState<HorarioDetalle | null>(null);
  const [registros, setRegistros] = useState<AsistenciaRegistro[]>([]);
  const [loadingRegistros, setLoadingRegistros] = useState(false);

  const fetchResumenes = useCallback(async () => {
    if (!cicloActivo) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await getAsistenciasPorHorario(cicloActivo.id);
      setResumenes(data.horarios || []);
    } catch {
      setError('Error al cargar los horarios');
    } finally {
      setLoading(false);
    }
  }, [cicloActivo]);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!cancelled) await fetchResumenes();
    };
    run();
    return () => { cancelled = true; };
  }, [fetchResumenes]);

  const handleSelectHorario = useCallback(async (resumen: HorarioResumen) => {
    setSelectedResumen(resumen);
    setSelectedFecha(null);
    setStep('dates');
  }, []);

  const handleSelectFecha = useCallback(async (fecha: string) => {
    if (!cicloActivo || !selectedResumen) return;
    setSelectedFecha(fecha);
    setStep('records');
    setLoadingRegistros(true);
    try {
      const [asis, det] = await Promise.all([
        getAsistencias(cicloActivo.id, selectedResumen.horario_id, fecha),
        getHorarioDetalle(cicloActivo.id, selectedResumen.horario_id),
      ]);
      // Flatten registros from the response
      const allRegistros: AsistenciaRegistro[] = [];
      for (const entry of asis) {
        if (entry.registros) {
          allRegistros.push(...entry.registros);
        }
      }
      setRegistros(allRegistros);
      setDetalle(det);
    } catch {
      setError('Error al cargar la asistencia');
    } finally {
      setLoadingRegistros(false);
    }
  }, [cicloActivo, selectedResumen]);

  const handleBack = useCallback(() => {
    if (step === 'dates') {
      setStep('cards');
      setSelectedResumen(null);
    } else if (step === 'records') {
      setStep('dates');
      setSelectedFecha(null);
      setRegistros([]);
    }
  }, [step]);

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
  if (error) return <ErrorState message={error} onRetry={fetchResumenes} />;

  return (
    <div style={{
      padding: isMobile ? 'var(--space-4)' : 'var(--space-6)',
      maxWidth: 1200,
      margin: '0 auto',
    }}>
      {/* Header with back button */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-3)',
        marginBottom: 'var(--space-6)',
      }}>
        {step !== 'cards' && (
          <button
            onClick={handleBack}
            style={{
              padding: 'var(--space-2)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              background: 'var(--color-surface)',
              color: 'var(--color-text)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 36,
              minWidth: 36,
            }}
            aria-label="Volver"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
          </button>
        )}
        <h1 style={{
          fontFamily: 'var(--font-heading)',
          fontSize: isMobile ? 'var(--text-xl)' : 'var(--text-2xl)',
          color: 'var(--color-gold)',
          margin: 0,
        }}>
          {step === 'cards' && 'Mis Horarios'}
          {step === 'dates' && selectedResumen?.taller_nombre}
          {step === 'records' && `${selectedResumen?.taller_nombre} - ${selectedFecha ? formatDate(selectedFecha) : ''}`}
        </h1>
      </div>

      {step === 'cards' && (
        <>
          {resumenes.length === 0 ? (
            <EmptyState
              message="No tienes horarios en este ciclo"
              description="No se encontraron clases asignadas para este ciclo."
            />
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: 'var(--space-4)',
            }}>
              {resumenes.map((r) => (
                <div
                  key={r.horario_id}
                  onClick={() => handleSelectHorario(r)}
                  style={{
                    background: 'var(--color-surface)',
                    borderRadius: 'var(--radius-xl)',
                    padding: 'var(--space-5)',
                    boxShadow: 'var(--shadow-sm)',
                    border: '1px solid var(--color-border)',
                    cursor: 'pointer',
                    transition: 'transform 0.15s, box-shadow 0.15s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-3)',
                    marginBottom: 'var(--space-3)',
                  }}>
                    <div style={{
                      width: 40,
                      height: 40,
                      borderRadius: 'var(--radius-lg)',
                      background: 'var(--color-gold-glow)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--color-gold)',
                      flexShrink: 0,
                      fontSize: 'var(--text-lg)',
                      fontWeight: 700,
                    }}>
                      {r.taller_nombre.charAt(0)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-text)', margin: 0 }}>
                        {r.taller_nombre}
                      </p>
                      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', margin: 'var(--space-1) 0 0 0' }}>
                        {DIA_SEMANA_MAP[r.dia_semana]} | {formatHora(r.hora_inicio)} - {formatHora(r.hora_fin)}
                      </p>
                    </div>
                  </div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: 'var(--text-xs)',
                    color: 'var(--color-text-muted)',
                  }}>
                    <span>{r.total_clases} {r.total_clases === 1 ? 'clase' : 'clases'}</span>
                    <span>{r.fechas.length} {r.fechas.length === 1 ? 'fecha' : 'fechas'}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {step === 'dates' && selectedResumen && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: 'var(--space-3)',
        }}>
          {selectedResumen.fechas.length === 0 ? (
            <EmptyState
              message="Sin registros de asistencia"
              description="No hay fechas registradas para este horario."
            />
          ) : (
            selectedResumen.fechas.map((fecha) => (
              <div
                key={fecha}
                onClick={() => handleSelectFecha(fecha)}
                style={{
                  background: 'var(--color-surface)',
                  borderRadius: 'var(--radius-lg)',
                  padding: 'var(--space-4)',
                  border: '1px solid var(--color-border)',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'transform 0.15s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <p style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-text)', margin: 0 }}>
                  {formatDate(fecha)}
                </p>
              </div>
            ))
          )}
        </div>
      )}

      {step === 'records' && (
        <>
          {loadingRegistros ? (
            <Loading message="Cargando asistencia..." />
          ) : (
            <div>
              {/* Summary */}
              {detalle && (
                <div style={{
                  background: 'var(--color-surface)',
                  borderRadius: 'var(--radius-lg)',
                  padding: 'var(--space-4)',
                  border: '1px solid var(--color-border)',
                  marginBottom: 'var(--space-4)',
                }}>
                  <p style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-text)', margin: 0 }}>
                    {detalle.alumnos_count} {detalle.alumnos_count === 1 ? 'alumno inscrito' : 'alumnos inscritos'}
                  </p>
                </div>
              )}

              {/* Attendance records with dni/telefono */}
              {registros.length === 0 ? (
                <EmptyState
                  message="Sin registros de asistencia"
                  description="No hay alumnos registrados para esta fecha."
                />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                  {registros.map((r, idx) => {
                    const estadoInfo = ESTADO_ASISTENCIA_MAP[r.estado] || ESTADO_ASISTENCIA_MAP.ausente;
                    return (
                      <div key={idx} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: 'var(--space-3) var(--space-4)',
                        background: 'var(--color-surface)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--color-border)',
                      }}>
                        <div style={{ flex: 1 }}>
                          <span style={{ fontSize: 'var(--text-xs)', fontWeight: 500, color: 'var(--color-text)' }}>
                            {r.alumno.nombre} {r.alumno.apellido}
                          </span>
                          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--space-1)' }}>
                            {r.alumno.dni && <span style={{ marginRight: 'var(--space-3)' }}>DNI: {r.alumno.dni}</span>}
                            {r.alumno.telefono && <span>Tel: {r.alumno.telefono}</span>}
                          </div>
                        </div>
                        <span style={{
                          padding: 'var(--space-1) var(--space-2)',
                          borderRadius: 'var(--radius-md)',
                          fontSize: 10,
                          fontWeight: 600,
                          background: estadoInfo.bg,
                          color: estadoInfo.color,
                          whiteSpace: 'nowrap',
                        }}>
                          {estadoInfo.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
});

export default HorariosPage;
