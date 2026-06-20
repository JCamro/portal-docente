import React, { useState, useEffect, useMemo } from 'react';
import { useWindowWidth } from '../../hooks/useWindowWidth';
import { getAsistencias } from '../../api/portalDocente';
import { getTodayString, formatDate } from '../../utils/formatters';
import AlumnoProfile from './AlumnoProfile';
import DaySelector from './DaySelector';
import AttendanceHistory from './AttendanceHistory';
import NoteSection from './NoteSection';
import type { AlumnoCartilla, AsistenciaPorHorario, HorarioDetalle } from '../../types';

interface SidePanelProps {
  isOpen: boolean;
  alumnoId: number | null;
  cicloId: number;
  onClose: () => void;
  alumnos: AlumnoCartilla[];
  horarios: HorarioDetalle[];
  fechas: string[];
}

const SidePanel: React.FC<SidePanelProps> = ({
  isOpen,
  alumnoId,
  cicloId,
  onClose,
  alumnos,
  horarios,
  fechas,
}) => {
  const width = useWindowWidth();
  const isMobile = width <= 768;

  const [selectedDate, setSelectedDate] = useState(() => getTodayString());
  const [asistencias, setAsistencias] = useState<AsistenciaPorHorario[]>([]);
  const [attendanceLoading, setAttendanceLoading] = useState(false);

  // Find alumno from pre-fetched list
  const alumno = useMemo(() => {
    if (!alumnoId) return null;
    return alumnos.find((a) => a.id === alumnoId) || null;
  }, [alumnos, alumnoId]);

  // Reset date when alumno changes
  useEffect(() => {
    if (alumnoId) {
      setSelectedDate(getTodayString());
      setAsistencias([]);
    }
  }, [alumnoId]);

  // Fetch attendance when date or alumno changes
  useEffect(() => {
    if (!alumnoId || !isOpen || !alumno) return;
    let cancelled = false;

    const fetchAttendance = async () => {
      setAttendanceLoading(true);
      try {
        // Fetch attendance for ALL horarios the student is enrolled in
        const promises = alumno.horarios.map((h) =>
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
  }, [alumnoId, isOpen, cicloId, selectedDate, alumno]);

  const panelWidth = isMobile ? '100vw' : 400;

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
              {alumno ? `${alumno.nombre} ${alumno.apellido}` : 'Perfil del alumno'}
            </h2>
            {alumno && (
              <p style={{
                fontSize: 'var(--text-xs)',
                color: 'var(--color-text-muted)',
                margin: 'var(--space-1) 0 0 0',
              }}>
                {alumno.dni}
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

        {/* Content */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: 'var(--space-4)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-5)',
        }}>
          {/* AlumnoProfile section */}
          <section>
            <AlumnoProfile
              alumno={alumno}
              loading={false}
            />
          </section>

          {/* DaySelector section */}
          {alumno && (
            <section>
              <h3 style={{
                fontSize: 'var(--text-xs)',
                fontWeight: 700,
                color: 'var(--color-text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                margin: 0,
                marginBottom: 'var(--space-2)',
              }}>
                Seleccionar día
              </h3>
              <DaySelector
                dates={fechas}
                selected={selectedDate}
                onChange={setSelectedDate}
              />
            </section>
          )}

          {/* AttendanceHistory section */}
          {alumno && (
            <section>
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
              <AttendanceHistory
                asistencias={asistencias}
                loading={attendanceLoading}
              />
            </section>
          )}

          {/* NoteSection section */}
          {alumno && (
            <section>
              <h3 style={{
                fontSize: 'var(--text-xs)',
                fontWeight: 700,
                color: 'var(--color-text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                margin: 0,
                marginBottom: 'var(--space-2)',
              }}>
                Notas
              </h3>
              <NoteSection
                alumnoId={alumno.id}
                cicloId={cicloId}
                selectedDate={selectedDate}
                horarios={horarios}
              />
            </section>
          )}

          {/* Empty state when no alumno */}
          {!alumno && alumnoId && (
            <p style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--color-text-muted)',
              textAlign: 'center',
              padding: 'var(--space-8) 0',
            }}>
              Selecciona un alumno para ver su perfil.
            </p>
          )}
        </div>
      </div>
    </>
  );
};

export default React.memo(SidePanel);
