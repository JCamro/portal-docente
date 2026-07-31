import React, { memo, useState, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { getHorasTrabajadas } from '../api/portalDocente';
import type { HoraTrabajada } from '../types';
import Loading from '../components/ui/Loading';
import ErrorState from '../components/ui/ErrorState';
import EmptyState from '../components/ui/EmptyState';
import DatePicker from '../components/ui/DatePicker';
import { useWindowWidth } from '../hooks/useWindowWidth';
import { TIPO_HT_MAP, DIA_SEMANA_CORTO } from '../utils/constants';
import { formatMonto, getTodayString } from '../utils/formatters';

/** Format date like "Lun 15/06" */
function formatFechaConDia(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  // JS getDay(): 0=Dom → backend: 0=Lun
  const jsDay = date.getDay();
  const backendDay = jsDay === 0 ? 6 : jsDay - 1;
  const dia = DIA_SEMANA_CORTO[backendDay] || '';
  return `${dia} ${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}`;
}

function formatTipo(tipo: string): string {
  return TIPO_HT_MAP[tipo] || tipo;
}

const HorasTrabajadasPage = memo(() => {
  const cicloActivo = useAuthStore((s) => s.cicloActivo);
  const width = useWindowWidth();
  const isMobile = width <= 768;

  const todayStr = getTodayString();

  const [records, setRecords] = useState<HoraTrabajada[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fechaDesde, setFechaDesde] = useState(todayStr);
  const [fechaHasta, setFechaHasta] = useState(todayStr);

  const fetchData = async () => {
    if (!cicloActivo) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const params: { fecha_desde?: string; fecha_hasta?: string } = {};
      if (fechaDesde) params.fecha_desde = fechaDesde;
      if (fechaHasta) params.fecha_hasta = fechaHasta;
      const data = await getHorasTrabajadas(cicloActivo.id, params);
      setRecords(data);
    } catch {
      setError('Error al cargar horas trabajadas');
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
  }, [cicloActivo?.id, fechaDesde, fechaHasta]);

  if (!cicloActivo) {
    return (
      <div style={{ padding: 'var(--space-lg)' }}>
        <EmptyState message="Selecciona un ciclo" description="Elige un ciclo académico para ver tus horas trabajadas." />
      </div>
    );
  }

  if (loading && records.length === 0) return <Loading message="Cargando horas trabajadas..." />;
  if (error && records.length === 0) return <ErrorState message={error} onRetry={fetchData} />;

  const totalHoras = records.reduce((sum, r) => sum + Number(r.horas_trabajadas), 0);
  const totalMonto = records.reduce((sum, r) => sum + parseFloat(r.monto_profesor || '0'), 0);

  const columnHeaders = [
    { key: 'fecha', label: 'Fecha' },
    { key: 'taller', label: 'Taller' },
    { key: 'tipo', label: 'Tipo' },
    { key: 'horas', label: 'Horas' },
    { key: 'alumnos', label: 'Alumnos' },
    { key: 'monto', label: 'Monto' },
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
          Horas Trabajadas
        </h1>
        {records.length > 0 && (
          <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
            {records.length} {records.length === 1 ? 'registro' : 'registros'}
          </span>
        )}
      </div>

      {/* Filters */}
      <div style={{
        display: 'flex',
        gap: 'var(--space-4)',
        marginBottom: 'var(--space-6)',
        flexDirection: isMobile ? 'column' : 'row',
        alignItems: isMobile ? 'stretch' : 'flex-end',
      }}>
        <div style={{ flex: 1, minWidth: 150 }}>
          <DatePicker value={fechaDesde} onChange={setFechaDesde} label="Desde" />
        </div>
        <div style={{ flex: 1, minWidth: 150 }}>
          <DatePicker value={fechaHasta} onChange={setFechaHasta} label="Hasta" />
        </div>
      </div>

      {/* Summary */}
      {records.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)',
          gap: 'var(--space-4)',
          marginBottom: 'var(--space-6)',
        }}>
          <SummaryCard label="Total monto" value={formatMonto(totalMonto)} />
          <SummaryCard label="Total horas" value={`${totalHoras.toFixed(1)}h`} />
          <SummaryCard label="Clases" value={String(records.length)} />
          <SummaryCard label="Promedio" value={formatMonto(records.length > 0 ? totalMonto / records.length : 0)} />
        </div>
      )}

      {records.length === 0 ? (
        <EmptyState
          message="No hay registros"
          description="No se encontraron horas trabajadas en el período seleccionado."
        />
      ) : isMobile ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {records.map((r) => (
            <div key={r.id} style={{
              background: 'var(--color-surface)',
              borderRadius: 'var(--radius-xl)',
              padding: 'var(--space-4)',
              border: '1px solid var(--color-border)',
              boxShadow: 'var(--shadow-sm)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
                <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-text)' }}>
                  {formatFechaConDia(r.fecha)}
                </span>
                <span style={{
                  padding: 'var(--space-1) var(--space-3)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 'var(--text-xs)',
                  fontWeight: 600,
                  background: 'var(--color-gold-light)',
                  color: 'var(--color-gold-dark)',
                }}>
                  {formatTipo(r.tipo)}
                </span>
              </div>
              {r.taller_nombre && (
                <div style={{ marginBottom: 'var(--space-2)' }}>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                    {r.taller_nombre}
                  </span>
                </div>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-2)' }}>
                <InfoRow label="Horas" value={`${r.horas_trabajadas}h`} />
                <InfoRow label="Alumnos" value={String(r.num_alumnos)} />
                <InfoRow label="Monto" value={formatMonto(parseFloat(r.monto_profesor || '0'))} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card" style={{
          background: 'var(--color-surface)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-sm)',
          border: '1px solid var(--color-border)',
          overflowX: 'auto',
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 650 }}>
            <thead>
              <tr style={{ background: 'var(--color-bg)' }}>
                {columnHeaders.map(col => (
                  <th key={col.key} style={thStyle}>{col.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r.id} style={{ borderTop: '1px solid var(--color-border)' }}>
                  <td style={tdStyle}>{formatFechaConDia(r.fecha)}</td>
                  <td style={tdStyle}>{r.taller_nombre || '-'}</td>
                  <td style={tdStyle}>{formatTipo(r.tipo)}</td>
                  <td style={tdStyle}>{Number(r.horas_trabajadas).toFixed(1)}h</td>
                  <td style={tdStyle}>{r.num_alumnos}</td>
                  <td style={tdStyle}>{formatMonto(parseFloat(r.monto_profesor || '0'))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
});

interface InfoRowProps {
  label: string;
  value: string;
}

const InfoRow = React.memo<InfoRowProps>(({ label, value }) => (
  <div>
    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', display: 'block' }}>{label}</span>
    <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-text)' }}>{value}</span>
  </div>
));

interface SummaryCardProps {
  label: string;
  value: string;
}

const SummaryCard = React.memo<SummaryCardProps>(({ label, value }) => (
  <div style={{
    background: 'var(--color-surface)',
    borderRadius: 'var(--radius-lg)',
    padding: 'var(--space-4)',
    border: '1px solid var(--color-border)',
    boxShadow: 'var(--shadow-sm)',
  }}>
    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', margin: 0, marginBottom: 'var(--space-1)' }}>
      {label}
    </p>
    <p style={{
      fontSize: 'var(--text-lg)',
      fontFamily: 'var(--font-heading)',
      color: 'var(--color-gold)',
      margin: 0,
    }}>
      {value}
    </p>
  </div>
));

const thStyle: React.CSSProperties = {
  padding: 'var(--space-4) var(--space-5)',
  textAlign: 'left',
  fontSize: 'var(--text-xs)',
  fontWeight: 600,
  color: 'var(--color-text-muted)',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  whiteSpace: 'nowrap',
};

const tdStyle: React.CSSProperties = {
  padding: 'var(--space-4) var(--space-5)',
  fontSize: 'var(--text-sm)',
  color: 'var(--color-text)',
  whiteSpace: 'nowrap',
};

export default HorasTrabajadasPage;
