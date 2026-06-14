import React, { useState, useEffect } from 'react';
import { getAsistencias, getNotas, createNota, updateNota, getNotasAlumno, createNotaAlumno, updateNotaAlumno } from '../../api/portalDocente';
import { ESTADO_ASISTENCIA_MAP, formatHora } from '../../utils/constants';
import { formatDate } from '../../utils/formatters';
import NoteEditor from './NoteEditor';
import type { AsistenciaPorHorario, NotaClase, NotaAlumno, HorarioDetalle } from '../../types';
import Loading from '../ui/Loading';

interface Level3SessionDetailProps {
  cicloId: number;
  horarioId: number;
  fecha: string;
  horarios: HorarioDetalle[];
  onBack: () => void;
}

const Level3SessionDetail: React.FC<Level3SessionDetailProps> = ({
  cicloId,
  horarioId,
  fecha,
  horarios,
  onBack,
}) => {
  const [asistencias, setAsistencias] = useState<AsistenciaPorHorario[]>([]);
  const [notasClase, setNotasClase] = useState<NotaClase[]>([]);
  const [notasAlumno, setNotasAlumno] = useState<NotaAlumno[]>([]);
  const [loading, setLoading] = useState(true);

  // Find the horario details
  const horario = horarios.find((h) => h.id === horarioId);

  useEffect(() => {
    let cancelled = false;
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [asis, nots, notasAlu] = await Promise.all([
          getAsistencias(cicloId, horarioId, fecha),
          getNotas(cicloId, { horario_id: horarioId, fecha }),
          getNotasAlumno(cicloId, { horario_id: horarioId, fecha }),
        ]);
        if (cancelled) return;
        setAsistencias(asis);
        setNotasClase(nots);
        setNotasAlumno(notasAlu);
      } catch {
        // ignore
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchAll();
    return () => { cancelled = true; };
  }, [cicloId, horarioId, fecha]);

  const allRegistros = asistencias.flatMap((a) => a.registros || []);

  const existingNotaClase = notasClase.length > 0 ? notasClase[0] : null;

  const handleSaveNotaClase = async (content: string) => {
    if (existingNotaClase) {
      await updateNota(cicloId, existingNotaClase.id, { contenido: content });
    } else {
      await createNota(cicloId, { horario_id: horarioId, fecha, contenido: content });
    }
    const updated = await getNotas(cicloId, { horario_id: horarioId, fecha });
    setNotasClase(updated);
  };

  const getNotaAlumno = (alumnoId: number): NotaAlumno | undefined => {
    return notasAlumno.find((n) => n.alumno === alumnoId);
  };

  const handleSaveNotaAlumno = async (alumnoId: number, content: string) => {
    const existing = getNotaAlumno(alumnoId);
    if (existing) {
      await updateNotaAlumno(cicloId, existing.id, { contenido: content });
    } else {
      await createNotaAlumno(cicloId, {
        horario: horarioId,
        alumno: alumnoId,
        fecha,
        contenido: content,
      });
    }
    const updated = await getNotasAlumno(cicloId, { horario_id: horarioId, fecha });
    setNotasAlumno(updated);
  };

  if (loading) return <Loading message="Cargando sesión..." />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      {/* Back button + title */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)' }}>
        <button
          onClick={onBack}
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
            flexShrink: 0,
            marginTop: 2,
          }}
          aria-label="Volver"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
        </button>
        <div>
          <h2 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'var(--text-lg)',
            color: 'var(--color-text)',
            margin: 0,
          }}>
            {horario?.taller_nombre || 'Sesión'}
          </h2>
          <p style={{
            fontSize: 'var(--text-xs)',
            color: 'var(--color-text-muted)',
            margin: 'var(--space-1) 0 0 0',
          }}>
            {formatDate(fecha)} · {horario ? `${formatHora(horario.hora_inicio)} - ${formatHora(horario.hora_fin)}` : ''} · {allRegistros.length} {allRegistros.length === 1 ? 'alumno' : 'alumnos'}
          </p>
        </div>
      </div>

      {/* NotaClase editor */}
      <div style={{
        background: 'var(--color-surface)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-4)',
        border: '1px solid var(--color-border)',
      }}>
        <h3 style={{
          fontSize: 'var(--text-sm)',
          fontWeight: 700,
          color: 'var(--color-text)',
          fontFamily: 'var(--font-heading)',
          margin: 0,
          marginBottom: 'var(--space-3)',
        }}>
          Nota de clase
        </h3>
        <NoteEditor
          value={existingNotaClase?.contenido || ''}
          onSave={handleSaveNotaClase}
          placeholder="Escribe una nota sobre esta clase..."
        />
      </div>

      {/* Student list */}
      <div>
        <h3 style={{
          fontSize: 'var(--text-sm)',
          fontWeight: 700,
          color: 'var(--color-text)',
          fontFamily: 'var(--font-heading)',
          margin: 0,
          marginBottom: 'var(--space-3)',
        }}>
          Alumnos
        </h3>
        {allRegistros.length === 0 ? (
          <p style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--color-text-muted)',
            textAlign: 'center',
            padding: 'var(--space-8) 0',
          }}>
            Sin registros de asistencia para esta fecha.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {allRegistros.map((r, idx) => {
              const estadoInfo = ESTADO_ASISTENCIA_MAP[r.estado] || ESTADO_ASISTENCIA_MAP.ausente;
              const notaAlumno = getNotaAlumno(r.alumno.id);
              return (
                <div
                  key={idx}
                  style={{
                    background: 'var(--color-surface)',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--color-border)',
                    overflow: 'hidden',
                  }}
                >
                  {/* Student header */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: 'var(--space-3) var(--space-4)',
                    borderBottom: '1px solid var(--color-border)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                      <div style={{
                        width: 32,
                        height: 32,
                        borderRadius: 'var(--radius-full)',
                        background: 'var(--color-gold-glow)',
                        color: 'var(--color-gold)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 'var(--text-xs)',
                        fontWeight: 700,
                        fontFamily: 'var(--font-heading)',
                        flexShrink: 0,
                      }}>
                        {r.alumno.nombre.charAt(0)}{r.alumno.apellido.charAt(0)}
                      </div>
                      <span style={{
                        fontSize: 'var(--text-sm)',
                        fontWeight: 600,
                        color: 'var(--color-text)',
                      }}>
                        {r.alumno.nombre} {r.alumno.apellido}
                      </span>
                    </div>
                    <span style={{
                      padding: 'var(--space-1) var(--space-3)',
                      borderRadius: 'var(--radius-md)',
                      fontSize: 10,
                      fontWeight: 600,
                      background: estadoInfo.bg,
                      color: estadoInfo.color,
                    }}>
                      {estadoInfo.label}
                    </span>
                  </div>

                  {/* NotaAlumno editor */}
                  <div style={{ padding: 'var(--space-3) var(--space-4)' }}>
                    <span style={{
                      fontSize: 10,
                      fontWeight: 600,
                      color: 'var(--color-text-muted)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      display: 'block',
                      marginBottom: 'var(--space-2)',
                    }}>
                      Nota individual
                    </span>
                    <NoteEditor
                      value={notaAlumno?.contenido || ''}
                      onSave={(content) => handleSaveNotaAlumno(r.alumno.id, content)}
                      placeholder="Nota sobre este alumno..."
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(Level3SessionDetail);
