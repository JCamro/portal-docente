import { useState, useEffect, useMemo } from 'react';
import { useWindowWidth } from '../../hooks/useWindowWidth';
import { getAlumnoDetalle, getNotasAlumno, createNotaAlumno, updateNotaAlumno } from '../../api/portalDocente';
import { formatDate } from '../../utils/formatters';
import NoteEditor from './NoteEditor';
import type { AlumnoDetalle, TallerActivo, NotaAlumno, EstadisticasTaller } from '../../types';

const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

interface SidePanelProps {
  isOpen: boolean;
  alumnoId: number | null;
  cicloId: number;
  onClose: () => void;
}

const SidePanel = ({
  isOpen,
  alumnoId,
  cicloId,
  onClose,
}: SidePanelProps) => {
  const width = useWindowWidth();
  const isMobile = width <= 768;

  // Detalle from consolidated endpoint
  const [detalle, setDetalle] = useState<AlumnoDetalle | null>(null);
  const [detalleLoading, setDetalleLoading] = useState(false);

  // Selected taller ID (for multi-active resolution)
  const [selectedTallerId, setSelectedTallerId] = useState<number | null>(null);
  const [verHistoricas, setVerHistoricas] = useState(false);
  const [tallerHistoricoExpandido, setTallerHistoricoExpandido] = useState<number | null>(null);
  const [matriculaHistoricaExpandida, setMatriculaHistoricaExpandida] = useState<number | null>(null);

  // Persist talleres_activos list so dropdown stays visible after selection
  const [talleresActivosCache, setTalleresActivosCache] = useState<TallerActivo[] | null>(null);

  // Notas
  const [notasAlumno, setNotasAlumno] = useState<NotaAlumno[]>([]);

  // Fetch consolidated detalle on open
  useEffect(() => {
    if (!alumnoId || !isOpen) {
      setDetalle(null);
      return;
    }

    let cancelled = false;
    const fetchDetalle = async () => {
      setDetalleLoading(true);
      try {
        const data = await getAlumnoDetalle(cicloId, alumnoId, selectedTallerId ?? undefined);
        if (cancelled) return;
        setDetalle(data);
        // Cache talleres_activos on first load so dropdown persists after selection
        if (data.talleres_activos) {
          // Deduplicate by taller_id
          const seen = new Map<number, TallerActivo>();
          for (const t of data.talleres_activos) {
            if (!seen.has(t.taller_id)) seen.set(t.taller_id, t);
          }
          setTalleresActivosCache(Array.from(seen.values()));
        }
      } catch {
        if (!cancelled) setDetalle(null);
      } finally {
        if (!cancelled) setDetalleLoading(false);
      }
    };

    fetchDetalle();
    return () => { cancelled = true; };
  }, [alumnoId, isOpen, cicloId, selectedTallerId]);

  // Fetch notas del alumno
  useEffect(() => {
    if (!alumnoId || !isOpen) return;
    let cancelled = false;

    const fetchNotas = async () => {
      try {
        const notas = await getNotasAlumno(cicloId, { alumno_id: alumnoId });
        if (cancelled) return;
        setNotasAlumno(notas);
      } catch {
        // ignore
      }
    };

    fetchNotas();
    return () => { cancelled = true; };
  }, [alumnoId, isOpen, cicloId]);

  // Handle taller selection
  const handleTallerSelect = (value: string) => {
    setSelectedTallerId(value ? Number(value) : null);
  };

  // Reset when alumno changes
  useEffect(() => {
    setSelectedTallerId(null);
    setVerHistoricas(false);
    setTallerHistoricoExpandido(null);
    setMatriculaHistoricaExpandida(null);
    setTalleresActivosCache(null);
  }, [alumnoId]);

  // Existing nota
  const existingNota = notasAlumno.length > 0 ? notasAlumno[0] : null;

  const handleSaveNotaAlumno = async (content: string) => {
    if (!alumnoId || !detalle) return;
    if (existingNota) {
      await updateNotaAlumno(cicloId, existingNota.id, { contenido: content });
    } else {
      await createNotaAlumno(cicloId, {
        horario: detalle.matricula_activa?.horario_id ?? detalle.matricula_activa?.id ?? 0,
        alumno: alumnoId,
        fecha: new Date().toISOString().split('T')[0],
        contenido: content,
      });
    }
    const updated = await getNotasAlumno(cicloId, { alumno_id: alumnoId });
    setNotasAlumno(updated);
  };

  const panelWidth = isMobile ? '100vw' : 420;

  // --- Render helpers ---

  const renderHorarioSection = () => {
    if (!detalle?.matricula_activa) return null;
    const ma = detalle.matricula_activa;
    const horarios = ma.horarios && ma.horarios.length > 0 ? ma.horarios : null;
    return (
      <div style={{
        background: 'var(--color-surface)',
        borderRadius: 'var(--radius-md)',
        padding: 'var(--space-3)',
        border: '1px solid var(--color-border)',
      }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 'var(--space-2)' }}>
          Horario Activo
        </div>
        <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text)' }}>
          <div style={{ marginBottom: 'var(--space-1)' }}>
            <strong>Taller:</strong> {ma.taller_nombre}
          </div>
          {horarios ? (
            horarios.map((h, i) => {
              const diaLabel = DIAS[h.dia_semana] ?? '—';
              return (
                <div key={h.horario_id} style={{
                  padding: 'var(--space-1) var(--space-2)',
                  marginTop: i > 0 ? 2 : 0,
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--color-bg)',
                  fontSize: 'var(--text-xs)',
                }}>
                  <span style={{ fontWeight: 500 }}>{diaLabel}</span>
                  <span style={{ color: 'var(--color-text-muted)', marginLeft: 'var(--space-2)' }}>
                    {h.hora_inicio?.slice(0,5) ?? '—'} – {h.hora_fin?.slice(0,5) ?? '—'}
                  </span>
                </div>
              );
            })
          ) : (
            <div style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)' }}>Sin horario asignado</div>
          )}
        </div>
      </div>
    );
  };

  const renderProgressSection = () => {
    if (!detalle?.matricula_activa) return null;
    const ma = detalle.matricula_activa;
    const pct = ma.sesiones_contratadas > 0
      ? Math.round((ma.sesiones_consumidas / ma.sesiones_contratadas) * 100)
      : 0;
    return (
      <div style={{
        background: 'var(--color-surface)',
        borderRadius: 'var(--radius-md)',
        padding: 'var(--space-3)',
        border: '1px solid var(--color-border)',
      }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 'var(--space-2)' }}>
          Progreso
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
            {ma.sesiones_consumidas} / {ma.sesiones_contratadas} sesiones
          </span>
          <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-gold)' }}>
            {ma.sesiones_disponibles} disponibles
          </span>
        </div>
        {/* Progress bar */}
        <div style={{
          height: 8,
          borderRadius: 4,
          background: 'var(--color-border)',
          overflow: 'hidden',
        }}>
          <div style={{
            height: '100%',
            width: `${Math.min(pct, 100)}%`,
            borderRadius: 4,
            background: pct >= 100 ? '#22c55e' : 'var(--color-gold)',
            transition: 'width 0.3s ease',
          }} />
        </div>
      </div>
    );
  };

  const renderEstadisticasSection = () => {
    // When a taller is selected: show focused stats for that taller
    if (detalle?.estadisticas) {
      const stats = detalle.estadisticas;
      return (
        <div style={{
          background: 'var(--color-surface)',
          borderRadius: 'var(--radius-md)',
          padding: 'var(--space-3)',
          border: '1px solid var(--color-border)',
        }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 'var(--space-2)' }}>
            Estadísticas del Taller
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
            <div>
              <span style={{ fontSize: 10, color: 'var(--color-text-muted)', display: 'block' }}>Asistencia</span>
              <span style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: stats.tasa_asistencia >= 75 ? '#22c55e' : '#ef4444' }}>
                {stats.tasa_asistencia}%
              </span>
            </div>
            <div>
              <span style={{ fontSize: 10, color: 'var(--color-text-muted)', display: 'block' }}>Asistencias</span>
              <span style={{ fontSize: 'var(--text-base)', fontWeight: 600, color: 'var(--color-text)' }}>
                {stats.total_asistencias}
              </span>
            </div>
            <div>
              <span style={{ fontSize: 10, color: 'var(--color-text-muted)', display: 'block' }}>Faltas</span>
              <span style={{ fontSize: 'var(--text-base)', fontWeight: 600, color: 'var(--color-text)' }}>
                {stats.total_faltas}
              </span>
            </div>
          </div>
        </div>
      );
    }

    // No taller selected: show per-taller breakdown
    if (detalle?.estadisticas_por_taller && detalle.estadisticas_por_taller.length > 0) {
      return (
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 'var(--space-2)' }}>
            Estadísticas por Taller
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            {detalle.estadisticas_por_taller.map((st: EstadisticasTaller) => (
              <div key={st.taller_id} style={{
                background: 'var(--color-surface)',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--space-2) var(--space-3)',
                border: '1px solid var(--color-border)',
              }}>
                <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-text)', marginBottom: 'var(--space-1)' }}>
                  {st.taller_nombre}
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-3)', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                  <span style={{ color: st.tasa_asistencia >= 75 ? '#22c55e' : '#ef4444', fontWeight: 600 }}>
                    {st.tasa_asistencia}%
                  </span>
                  <span>{st.total_asistencias} asist.</span>
                  <span>{st.total_faltas} faltas</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    return null;
  };

  const renderMatriculasHistoricas = () => {
    if (!detalle?.matriculas_historicas || detalle.matriculas_historicas.length === 0) return null;

    // Group by taller_id
    const grupos = new Map<number, { taller_id: number; taller_nombre: string; matriculas: typeof detalle.matriculas_historicas }>();
    for (const mh of detalle.matriculas_historicas) {
      if (!grupos.has(mh.taller_id)) {
        grupos.set(mh.taller_id, { taller_id: mh.taller_id, taller_nombre: mh.taller_nombre, matriculas: [] });
      }
      grupos.get(mh.taller_id)!.matriculas.push(mh);
    }
    const gruposArray = Array.from(grupos.values());

    return (
      <div>
        <button
          onClick={() => { setVerHistoricas(!verHistoricas); setTallerHistoricoExpandido(null); setMatriculaHistoricaExpandida(null); }}
          style={{
            padding: 'var(--space-2) var(--space-3)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border)',
            background: 'transparent',
            color: 'var(--color-text-secondary)',
            fontSize: 'var(--text-xs)',
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
          <span>Matrículas históricas ({detalle.matriculas_historicas.length} en {gruposArray.length} taller{gruposArray.length > 1 ? 'es' : ''})</span>
          <span style={{ transform: verHistoricas ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>▼</span>
        </button>
        {verHistoricas && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', marginTop: 'var(--space-2)' }}>
            {gruposArray.map((grupo) => {
              const isTallerExpanded = tallerHistoricoExpandido === grupo.taller_id;
              return (
                <div key={grupo.taller_id}>
                  {/* Level 1: Taller group */}
                  <button
                    onClick={() => {
                      setTallerHistoricoExpandido(isTallerExpanded ? null : grupo.taller_id);
                      setMatriculaHistoricaExpandida(null);
                    }}
                    style={{
                      padding: 'var(--space-2) var(--space-3)',
                      background: 'var(--color-surface)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--color-border)',
                      cursor: 'pointer',
                      fontFamily: 'var(--font-body)',
                      width: '100%',
                      textAlign: 'left',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <span style={{ fontWeight: 600, fontSize: 'var(--text-xs)', color: 'var(--color-text)' }}>
                        {grupo.taller_nombre}
                      </span>
                      <span style={{ fontSize: 10, color: 'var(--color-text-muted)', marginLeft: 'var(--space-2)' }}>
                        ({grupo.matriculas.length} matrícula{grupo.matriculas.length > 1 ? 's' : ''})
                      </span>
                    </div>
                    <span style={{
                      transform: isTallerExpanded ? 'rotate(180deg)' : 'none',
                      transition: 'transform 0.2s',
                      fontSize: 10,
                      color: 'var(--color-text-muted)',
                    }}>▼</span>
                  </button>

                  {/* Level 2: Individual matriculas */}
                  {isTallerExpanded && (
                    <div style={{
                      marginTop: 'var(--space-1)',
                      marginLeft: 'var(--space-3)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 'var(--space-1)',
                    }}>
                      {grupo.matriculas.map((mh) => {
                        const isMatExpanded = matriculaHistoricaExpandida === mh.id;
                        return (
                          <div key={mh.id}>
                            <button
                              onClick={() => setMatriculaHistoricaExpandida(isMatExpanded ? null : mh.id)}
                              style={{
                                padding: 'var(--space-1) var(--space-2)',
                                background: 'var(--color-bg)',
                                borderRadius: 'var(--radius-sm)',
                                border: '1px solid var(--color-border)',
                                cursor: 'pointer',
                                fontFamily: 'var(--font-body)',
                                width: '100%',
                                textAlign: 'left',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                              }}
                            >
                              <div style={{ fontSize: 10 }}>
                                <span style={{ color: 'var(--color-text-muted)' }}>{mh.fecha_matricula}</span>
                                <span style={{ marginLeft: 'var(--space-2)', color: 'var(--color-text)', fontWeight: 500 }}>
                                  {mh.sesiones_consumidas}/{mh.sesiones_contratadas}
                                </span>
                                <span style={{ marginLeft: 'var(--space-1)', fontSize: 9, color: mh.concluida ? '#22c55e' : '#ef4444' }}>
                                  {mh.concluida ? 'Concluida' : 'Inactiva'}
                                </span>
                                {mh.dia_semana !== null && (
                                  <span style={{ display: 'block', color: 'var(--color-text-muted)', fontSize: 9, marginTop: 1 }}>
                                    {DIAS[mh.dia_semana] ?? '—'} {mh.hora_inicio?.slice(0, 5) ?? '—'}–{mh.hora_fin?.slice(0, 5) ?? '—'}
                                  </span>
                                )}
                              </div>
                              <span style={{
                                transform: isMatExpanded ? 'rotate(180deg)' : 'none',
                                transition: 'transform 0.2s',
                                fontSize: 8,
                                color: 'var(--color-text-muted)',
                              }}>▼</span>
                            </button>

                            {/* Level 3: Asistencias */}
                            {isMatExpanded && mh.asistencias && mh.asistencias.length > 0 && (
                              <div style={{
                                marginTop: 2,
                                marginLeft: 'var(--space-2)',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 1,
                              }}>
                                {mh.asistencias.map((a, i) => {
                                  const isAsistio = a.estado === 'asistio';
                                  return (
                                    <div key={i} style={{
                                      display: 'flex',
                                      justifyContent: 'space-between',
                                      alignItems: 'center',
                                      padding: '1px var(--space-1)',
                                    }}>
                                      <span style={{ fontSize: 9, color: 'var(--color-text-muted)' }}>
                                        {formatDate(a.fecha)}
                                      </span>
                                      <span style={{
                                        padding: '0px 4px',
                                        borderRadius: 'var(--radius-sm)',
                                        fontSize: 8,
                                        fontWeight: 600,
                                        background: isAsistio ? '#dcfce7' : '#fee2e2',
                                        color: isAsistio ? '#16a34a' : '#dc2626',
                                      }}>
                                        {isAsistio ? 'Asistió' : a.estado === 'falta_grave' ? 'Falta Grave' : 'Falta'}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                            {isMatExpanded && (!mh.asistencias || mh.asistencias.length === 0) && (
                              <div style={{
                                marginTop: 2,
                                marginLeft: 'var(--space-2)',
                                fontSize: 9,
                                color: 'var(--color-text-muted)',
                                fontStyle: 'italic',
                              }}>
                                Sin registros
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const renderAsistenciasSection = () => {
    if (!detalle?.matricula_activa?.asistencias) return null;
    const asistencias = detalle.matricula_activa.asistencias;
    if (asistencias.length === 0) return null;

    return (
      <div>
        <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 'var(--space-2)' }}>
          Últimas Asistencias
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
          {asistencias.map((a, i) => {
            const isAsistio = a.estado === 'asistio';
            return (
              <div key={i} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: 'var(--space-1) var(--space-3)',
                background: 'var(--color-surface)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
              }}>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text)' }}>
                  {formatDate(a.fecha)}
                </span>
                <span style={{
                  padding: 'var(--space-1) var(--space-2)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 10,
                  fontWeight: 600,
                  background: isAsistio ? '#dcfce7' : '#fee2e2',
                  color: isAsistio ? '#16a34a' : '#dc2626',
                }}>
                  {isAsistio ? 'Asistió' : a.estado === 'falta_grave' ? 'Falta Grave' : 'Falta'}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderTallerSelector = () => {
    const talleres = talleresActivosCache;
    if (!talleres || talleres.length <= 1) return null;
    return (
      <div>
        <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 'var(--space-2)' }}>
          Seleccionar Taller
        </div>
        <select
          value={selectedTallerId ?? ''}
          onChange={(e) => handleTallerSelect(e.target.value)}
          style={{
            padding: 'var(--space-2) var(--space-3)',
            fontSize: 'var(--text-sm)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            background: 'var(--color-surface)',
            color: 'var(--color-text)',
            fontFamily: 'var(--font-body)',
            minHeight: 44,
            width: '100%',
          }}
          aria-label="Seleccionar taller"
        >
          <option value="">Selecciona un taller...</option>
          {talleres.map((t: TallerActivo) => (
            <option key={t.matricula_id} value={t.taller_id}>{t.taller_nombre}</option>
          ))}
        </select>
      </div>
    );
  };

  return (
    <>
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            {detalle?.alumno && (
              <div style={{
                width: 40,
                height: 40,
                borderRadius: 'var(--radius-full)',
                background: 'var(--color-gold-glow)',
                color: 'var(--color-gold)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 'var(--text-sm)',
                fontWeight: 700,
                fontFamily: 'var(--font-heading)',
                flexShrink: 0,
              }}>
                {detalle.alumno.nombre.charAt(0)}{detalle.alumno.apellido.charAt(0)}
              </div>
            )}
            <div>
              <h2 style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 'var(--text-base)',
                color: 'var(--color-text)',
                margin: 0,
              }}>
                {detalle?.alumno ? `${detalle.alumno.nombre} ${detalle.alumno.apellido}` : 'Alumno'}
              </h2>
              {detalle?.alumno && (
                <>
                  <p style={{
                    fontSize: 'var(--text-xs)',
                    color: 'var(--color-text-muted)',
                    margin: 'var(--space-1) 0 0 0',
                  }}>
                    Teléfono: {detalle.alumno.telefono || '—'}
                  </p>
                  <p style={{
                    fontSize: 'var(--text-xs)',
                    color: 'var(--color-text-muted)',
                    margin: '2px 0 0 0',
                  }}>
                    Correo: {detalle.alumno.email || '—'}
                  </p>
                </>
              )}
            </div>
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
              minHeight: 36,
              minWidth: 36,
            }}
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: 'var(--space-4)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-4)',
        }}>
          {detalleLoading ? (
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', textAlign: 'center', padding: 'var(--space-8) 0' }}>
              Cargando...
            </p>
          ) : detalle ? (
            <>
              {/* Taller selector (multi-active) */}
              {renderTallerSelector()}

              {/* Active horario */}
              {renderHorarioSection()}

              {/* Progress */}
              {renderProgressSection()}

              {/* Estadisticas */}
              {renderEstadisticasSection()}

              {/* Asistencias */}
              {renderAsistenciasSection()}

              {/* Matriculas historicas */}
              {renderMatriculasHistoricas()}

              {/* Nota del alumno */}
              <div>
                <div style={{
                  fontSize: 'var(--text-xs)',
                  fontWeight: 700,
                  color: 'var(--color-text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  margin: 0,
                  marginBottom: 'var(--space-2)',
                }}>
                  Nota del alumno
                </div>
                <NoteEditor
                  value={existingNota?.contenido || ''}
                  onSave={handleSaveNotaAlumno}
                  placeholder="Escribe una nota sobre este alumno..."
                />
              </div>
            </>
          ) : (
            <p style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--color-text-muted)',
              textAlign: 'center',
              padding: 'var(--space-8) 0',
            }}>
              Alumno no encontrado.
            </p>
          )}
        </div>
      </div>
    </>
  );
};

export default SidePanel;
