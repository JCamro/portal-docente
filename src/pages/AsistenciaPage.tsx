import React, { memo, useState, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { getHorarios, getAsistencias } from '../api/portalDocente';
import type { Horario, AsistenciaRegistro } from '../types';
import Loading from '../components/ui/Loading';
import ErrorState from '../components/ui/ErrorState';
import EmptyState from '../components/ui/EmptyState';
import DatePicker from '../components/ui/DatePicker';
import { useWindowWidth } from '../hooks/useWindowWidth';
import { DIA_SEMANA_MAP, ESTADO_ASISTENCIA_MAP, formatHora } from '../utils/constants';

const AsistenciaPage = memo(() => {
  const cicloActivo = useAuthStore((s) => s.cicloActivo);
  const width = useWindowWidth();
  const isMobile = width <= 768;

  const [horarios, setHorarios] = useState<Horario[]>([]);
  const [selectedHorarioId, setSelectedHorarioId] = useState<number | null>(null);
  const [fecha, setFecha] = useState(() => new Date().toISOString().split('T')[0]);
  const [asistencias, setAsistencias] = useState<AsistenciaRegistro[]>([]);
  const [loadingHorarios, setLoadingHorarios] = useState(true);
  const [loadingAsistencia, setLoadingAsistencia] = useState(false);
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
      if (data.length > 0 && !selectedHorarioId) {
        setSelectedHorarioId(data[0].id);
      }
    } catch {
      setError('Error al cargar horarios');
    } finally {
      setLoadingHorarios(false);
    }
  };

  const fetchAsistencias = async () => {
    if (!cicloActivo || !selectedHorarioId || !fecha) return;
    setLoadingAsistencia(true);
    setError(null);
    try {
      const response = await getAsistencias(cicloActivo.id, selectedHorarioId, fecha);
      // Transform flat API response to AsistenciaRegistro[]
      const registros: AsistenciaRegistro[] = (response || []).map((item: any) => ({
        alumno: {
          id: item.alumno_id,
          nombre: item.alumno_nombre.split(', ')[1] || item.alumno_nombre,
          apellido: item.alumno_nombre.split(', ')[0] || '',
          dni: '',
        },
        estado: item.estado,
      }));
      setAsistencias(registros);
    } catch {
      setError('Error al cargar la asistencia');
      setAsistencias([]);
    } finally {
      setLoadingAsistencia(false);
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
    let cancelled = false;
    const run = async () => {
      if (!cancelled) await fetchAsistencias();
    };
    run();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedHorarioId, fecha, cicloActivo?.id]);

  if (!cicloActivo) {
    return (
      <div style={{ padding: 'var(--space-lg)' }}>
        <EmptyState message="Selecciona un ciclo" description="Elige un ciclo académico para ver asistencias." />
      </div>
    );
  }

  if (loadingHorarios) return <Loading message="Cargando horarios..." />;
  if (error && asistencias.length === 0) return <ErrorState message={error} onRetry={fetchAsistencias} />;

  const horarioSel = horarios.find(h => h.id === selectedHorarioId);

  // asistencias is already a flat array of AsistenciaRegistro
  const allRegistros = asistencias;

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
          Asistencia
        </h1>
        {/* Read-only badge */}
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 'var(--space-2)',
          padding: 'var(--space-2) var(--space-3)',
          borderRadius: 'var(--radius-md)',
          background: 'rgba(239, 68, 68, 0.1)',
          color: '#dc2626',
          fontSize: 'var(--text-xs)',
          fontWeight: 600,
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          Solo lectura
        </span>
      </div>

      {/* Filters */}
      <div style={{
        display: 'flex',
        gap: 'var(--space-4)',
        marginBottom: 'var(--space-6)',
        flexDirection: isMobile ? 'column' : 'row',
        alignItems: isMobile ? 'stretch' : 'flex-end',
      }}>
        {/* Horario selector */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          <label style={{
            fontSize: 'var(--text-xs)',
            fontWeight: 600,
            color: 'var(--color-text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}>
            Clase
          </label>
          <select
            value={selectedHorarioId ?? ''}
            onChange={(e) => setSelectedHorarioId(e.target.value ? Number(e.target.value) : null)}
            style={{
              padding: 'var(--space-3) var(--space-4)',
              fontSize: 'var(--text-sm)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              background: 'var(--color-surface)',
              color: 'var(--color-text)',
              fontFamily: 'var(--font-body)',
              minHeight: 44,
            }}
          >
            {horarios.map((h) => (
              <option key={h.id} value={h.id}>
                {DIA_SEMANA_MAP[h.dia_semana]} - {h.taller_nombre} ({formatHora(h.hora_inicio)})
              </option>
            ))}
          </select>
        </div>

        <DatePicker
          value={fecha}
          onChange={setFecha}
          label="Fecha"
        />
      </div>

      {loadingAsistencia ? (
        <Loading message="Cargando asistencia..." />
      ) : asistencias.length === 0 || allRegistros.length === 0 ? (
        <EmptyState
          message="Sin registros de asistencia"
          description={horarioSel
            ? `No hay registros de asistencia para ${horarioSel.taller_nombre} en esta fecha.`
            : 'Selecciona una clase y fecha para ver la asistencia.'}
        />
      ) : isMobile ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {allRegistros.map((r, idx) => {
            const estadoInfo = ESTADO_ASISTENCIA_MAP[r.estado] || ESTADO_ASISTENCIA_MAP.ausente;
            return (
              <div key={idx} style={{
                background: 'var(--color-surface)',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--space-4)',
                border: '1px solid var(--color-border)',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                <div>
                  <p style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-text)', margin: 0 }}>
                    {r.alumno.nombre} {r.alumno.apellido}
                  </p>
                  {r.alumno.dni && (
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', margin: 'var(--space-1) 0 0 0' }}>
                      DNI: {r.alumno.dni}
                    </p>
                  )}
                </div>
                <span style={{
                  padding: 'var(--space-1) var(--space-3)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 'var(--text-xs)',
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
                <th style={thStyle}>Alumno</th>
                <th style={thStyle}>DNI</th>
                <th style={thStyle}>Estado</th>
              </tr>
            </thead>
            <tbody>
              {allRegistros.map((r, idx) => {
                const estadoInfo = ESTADO_ASISTENCIA_MAP[r.estado] || ESTADO_ASISTENCIA_MAP.ausente;
                return (
                  <tr key={idx} style={{ borderTop: '1px solid var(--color-border)' }}>
                    <td style={tdStyle}>
                      {r.alumno.nombre} {r.alumno.apellido}
                    </td>
                    <td style={tdStyle}>{r.alumno.dni || '-'}</td>
                    <td style={tdStyle}>
                      <span style={{
                        padding: 'var(--space-1) var(--space-3)',
                        borderRadius: 'var(--radius-md)',
                        fontSize: 'var(--text-xs)',
                        fontWeight: 600,
                        background: estadoInfo.bg,
                        color: estadoInfo.color,
                      }}>
                        {estadoInfo.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
});

const thStyle: React.CSSProperties = {
  padding: 'var(--space-4) var(--space-5)',
  textAlign: 'left',
  fontSize: 'var(--text-xs)',
  fontWeight: 600,
  color: 'var(--color-text-muted)',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
};

const tdStyle: React.CSSProperties = {
  padding: 'var(--space-4) var(--space-5)',
  fontSize: 'var(--text-sm)',
  color: 'var(--color-text)',
};

export default AsistenciaPage;
