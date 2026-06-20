import React, { useState, useEffect, useMemo } from 'react';
import { useWindowWidth } from '../../hooks/useWindowWidth';
import { getAsistencias, getNotasAlumno, createNotaAlumno, updateNotaAlumno } from '../../api/portalDocente';
import { getTodayString, formatDate } from '../../utils/formatters';
import { ESTADO_ASISTENCIA_MAP } from '../../utils/constants';
import NoteEditor from './NoteEditor';
import type { AlumnoCartilla, AsistenciaPorHorario, NotaAlumno } from '../../types';

interface SidePanelProps {
  isOpen: boolean;
  alumnoId: number | null;
  cicloId: number;
  onClose: () => void;
  alumnos: AlumnoCartilla[];
  fechas: string[];
}

const SidePanel: React.FC<SidePanelProps> = ({
  isOpen,
  alumnoId,
  cicloId,
  onClose,
  alumnos,
  fechas,
}) => {
  const width = useWindowWidth();
  const isMobile = width <= 768;

  const [selectedTallerId, setSelectedTallerId] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState(() => getTodayString());
  const [asistencias, setAsistencias] = useState<AsistenciaPorHorario[]>([]);
  const [notasAlumno, setNotasAlumno] = useState<NotaAlumno[]>([]);
  const [attendanceLoading, setAttendanceLoading] = useState(false);

  // Find alumno from pre-fetched list
  const alumno = useMemo(() => {
    if (!alumnoId) return null;
    return alumnos.find((a) => a.id === alumnoId) || null;
  }, [alumnos, alumnoId]);

  // Talleres en los que está inscrito este alumno
  const alumnoTalleres = useMemo(() => {
    if (!alumno) return [];
    const unique = new Map<number, string>();
    for (const h of alumno.horarios) {
      if (h.taller_id && !unique.has(h.taller_id)) {
        unique.set(h.taller_id, h.taller_nombre);
      }
    }
    return Array.from(unique.entries()).map(([id, nombre]) => ({ id, nombre }));
  }, [alumno]);

  // Reset state when alumno changes
  useEffect(() => {
    if (alumnoId) {
      setSelectedTallerId(null);
      setSelectedDate(getTodayString());
      setAsistencias([]);
      setNotasAlumno([]);
    }
  }, [alumnoId]);

  // Fetch attendance for selected taller + date
  useEffect(() => {
    if (!alumnoId || !isOpen || !alumno) return;
    let cancelled = false;

    const fetchAttendance = async () => {
      setAttendanceLoading(true);
      try {
        const horariosToFetch = selectedTallerId
          ? alumno.horarios.filter((h) => h.taller_id === selectedTallerId)
          : alumno.horarios;

        const promises = horariosToFetch.map((h) =>
          getAsistencias(cicloId, h.id, selectedDate)
            .catch(() => [] as AsistenciaPorHorario[])
        );
        const results = await Promise.all(promises);
        if (cancelled) return;
        setAsistencias(results.flat());
      } catch {
        // ignore
      } finally {
        if (!cancelled) setAttendanceLoading(false);
      }
    };

    fetchAttendance();
    return () => { cancelled = true; };
  }, [alumnoId, isOpen, cicloId, selectedDate, selectedTallerId, alumno]);

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

  // All registros from fetched asistencias
  const allRegistros = asistencias.flatMap((a) => a.registros || []);

  // Nota existente para este alumno (for edit)
  const existingNota = notasAlumno.length > 0 ? notasAlumno[0] : null;

  const handleSaveNotaAlumno = async (content: string) => {
    if (!alumnoId || !alumno) return;
    if (existingNota) {
      await updateNotaAlumno(cicloId, existingNota.id, { contenido: content });
    } else {
      // Need a horario — use first from the student
      const horarioId = alumno.horarios[0]?.id;
      if (!horarioId) return;
      await createNotaAlumno(cicloId, {
        horario: horarioId,
        alumno: alumnoId,
        fecha: selectedDate,
        contenido: content,
      });
    }
    const updated = await getNotasAlumno(cicloId, { alumno_id: alumnoId });
    setNotasAlumno(updated);
  };

  const panelWidth = isMobile ? '100vw' : 420;

  // Derive unique dates for date input max
  const fechaMax = fechas.length > 0 ? fechas[fechas.length - 1] : undefined;

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
          <div>
            <h2 style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'var(--text-base)',
              color: 'var(--color-text)',
              margin: 0,
            }}>
              {alumno ? `${alumno.nombre} ${alumno.apellido}` : 'Alumno'}
            </h2>
            {alumno && (
              <p style={{
                fontSize: 'var(--text-xs)',
                color: 'var(--color-text-muted)',
                margin: 'var(--space-1) 0 0 0',
              }}>
                DNI: {alumno.dni}
                {alumno.telefono ? ` · ${alumno.telefono}` : ''}
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
          gap: 'var(--space-5)',
        }}>
          {/* Taller badges */}
          {alumno && alumnoTalleres.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
              {alumnoTalleres.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTallerId(selectedTallerId === t.id ? null : t.id)}
                  style={{
                    padding: 'var(--space-1) var(--space-3)',
                    borderRadius: 'var(--radius-full)',
                    fontSize: 'var(--text-xs)',
                    fontWeight: 600,
                    border: selectedTallerId === t.id
                      ? '1px solid var(--color-gold)'
                      : '1px solid var(--color-border)',
                    background: selectedTallerId === t.id
                      ? 'var(--color-gold-glow)'
                      : 'var(--color-surface)',
                    color: selectedTallerId === t.id ? 'var(--color-gold)' : 'var(--color-text)',
                    cursor: 'pointer',
                    minHeight: 32,
                  }}
                >
                  {t.nombre}
                </button>
              ))}
            </div>
          )}

          {/* Fecha selector */}
          <div>
            <label style={{
              fontSize: 'var(--text-xs)',
              fontWeight: 700,
              color: 'var(--color-text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              display: 'block',
              marginBottom: 'var(--space-2)',
            }}>
              Fecha
            </label>
            <input
              type="date"
              value={selectedDate}
              max={fechaMax}
              onChange={(e) => setSelectedDate(e.target.value)}
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
            />
          </div>

          {/* Attendance */}
          <div>
            <h3 style={{
              fontSize: 'var(--text-xs)',
              fontWeight: 700,
              color: 'var(--color-text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              margin: 0,
              marginBottom: 'var(--space-2)',
            }}>
              Asistencia - {formatDate(selectedDate)}
            </h3>
            {attendanceLoading ? (
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>Cargando...</p>
            ) : allRegistros.length === 0 ? (
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', textAlign: 'center', padding: 'var(--space-6) 0' }}>
                Sin asistencia para esta fecha.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                {allRegistros.map((r, i) => {
                  const estadoInfo = ESTADO_ASISTENCIA_MAP[r.estado] || ESTADO_ASISTENCIA_MAP.falta;
                  return (
                    <div key={`asis-${i}`} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: 'var(--space-2) var(--space-3)',
                      background: 'var(--color-surface)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--color-border)',
                    }}>
                      <div>
                        <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-text)' }}>
                          {r.alumno.nombre} {r.alumno.apellido}
                        </span>
                      </div>
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

          {/* Nota del alumno */}
          <div>
            <h3 style={{
              fontSize: 'var(--text-xs)',
              fontWeight: 700,
              color: 'var(--color-text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              margin: 0,
              marginBottom: 'var(--space-2)',
            }}>
              Nota del alumno
            </h3>
            <NoteEditor
              value={existingNota?.contenido || ''}
              onSave={handleSaveNotaAlumno}
              placeholder="Escribe una nota sobre este alumno..."
            />
          </div>

          {/* Empty state */}
          {!alumno && alumnoId && (
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

export default React.memo(SidePanel);
