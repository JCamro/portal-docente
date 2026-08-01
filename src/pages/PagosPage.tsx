import { memo, useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../stores/authStore';
import { getPagos } from '../api/portalDocente';
import type { EgresoPortal, PagosStats } from '../types';
import Loading from '../components/ui/Loading';
import ErrorState from '../components/ui/ErrorState';
import EmptyState from '../components/ui/EmptyState';
import { useWindowWidth } from '../hooks/useWindowWidth';
import { formatMonto, formatDate } from '../utils/formatters';

const METODO_PAGO_MAP: Record<string, { label: string; icon: React.ReactNode }> = {
  efectivo: {
    label: 'Efectivo',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
  },
  transferencia: {
    label: 'Transferencia',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
        <line x1="1" y1="10" x2="23" y2="10" />
      </svg>
    ),
  },
  yape: {
    label: 'Yape',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
        <line x1="12" y1="18" x2="12.01" y2="18" />
      </svg>
    ),
  },
  plin: {
    label: 'Plin',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
        <line x1="12" y1="18" x2="12.01" y2="18" />
      </svg>
    ),
  },
};

const ESTADO_MAP: Record<string, { label: string; color: string; bg: string }> = {
  pendiente: { label: 'Pendiente', color: '#d97706', bg: '#fef3c7' },
  cancelado: { label: 'Cancelado', color: '#16a34a', bg: '#dcfce7' },
};

const PagosPage = memo(() => {
  const cicloActivo = useAuthStore((s) => s.cicloActivo);
  const width = useWindowWidth();
  const isMobile = width <= 768;

  const [pagos, setPagos] = useState<EgresoPortal[]>([]);
  const [stats, setStats] = useState<PagosStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [selectedPago, setSelectedPago] = useState<EgresoPortal | null>(null);

  const fetchData = useCallback(async () => {
    if (!cicloActivo) { setLoading(false); return; }
    setLoading(true);
    setError(null);
    try {
      const params: { fecha_desde?: string; fecha_hasta?: string } = {};
      if (fechaDesde) params.fecha_desde = fechaDesde;
      if (fechaHasta) params.fecha_hasta = fechaHasta;
      const data = await getPagos(cicloActivo.id, Object.keys(params).length ? params : undefined);
      setPagos(data.pagos);
      setStats(data.stats);
    } catch {
      setError('Error al cargar pagos');
    } finally {
      setLoading(false);
    }
  }, [cicloActivo, fechaDesde, fechaHasta]);

  useEffect(() => {
    let cancelled = false;
    const run = async () => { if (!cancelled) await fetchData(); };
    run();
    return () => { cancelled = true; };
  }, [fetchData]);

  if (!cicloActivo) {
    return (
      <div style={{ padding: 'var(--space-lg)' }}>
        <EmptyState
          message="Selecciona un ciclo"
          description="Elige un ciclo académico para ver tus pagos."
        />
      </div>
    );
  }

  if (loading && pagos.length === 0) return <Loading message="Cargando pagos..." />;
  if (error && pagos.length === 0) return <ErrorState message={error} onRetry={fetchData} />;

  return (
    <div style={{
      padding: isMobile ? 'var(--space-4)' : 'var(--space-6)',
      maxWidth: 1200,
      margin: '0 auto',
    }}>
      {/* Header */}
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
          Mis Pagos
        </h1>
        {stats && (
          <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
            {stats.cantidad_pagos} {stats.cantidad_pagos === 1 ? 'pago' : 'pagos'}
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
        flexWrap: 'wrap',
      }}>
        <div style={{ flex: 1, minWidth: 150, display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          <label style={{
            fontSize: 'var(--text-xs)',
            fontWeight: 600,
            color: 'var(--color-text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}>
            Desde
          </label>
          <input
            type="date"
            value={fechaDesde}
            onChange={(e) => setFechaDesde(e.target.value)}
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
          />
        </div>
        <div style={{ flex: 1, minWidth: 150, display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          <label style={{
            fontSize: 'var(--text-xs)',
            fontWeight: 600,
            color: 'var(--color-text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}>
            Hasta
          </label>
          <input
            type="date"
            value={fechaHasta}
            onChange={(e) => setFechaHasta(e.target.value)}
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
          />
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)',
          gap: 'var(--space-4)',
          marginBottom: 'var(--space-6)',
        }}>
          <SummaryCard label="Total pagado" value={formatMonto(stats.total_pagado)} />
          <SummaryCard label="Pagos" value={String(stats.cantidad_pagos)} />
          <SummaryCard label="Promedio" value={formatMonto(stats.promedio_pago)} />
          <SummaryCard label="Último pago" value={stats.ultimo_pago ? formatDate(stats.ultimo_pago) : '-'} />
        </div>
      )}

      {/* Pago list */}
      {pagos.length === 0 ? (
        <EmptyState
          message="No hay pagos registrados"
          description="Aún no se han registrado pagos para este ciclo."
          icon={
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          }
        />
      ) : isMobile ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {pagos.map((pago) => {
            const estadoInfo = ESTADO_MAP[pago.estado] || ESTADO_MAP.pendiente;
            return (
              <div
                key={pago.id}
                onClick={() => setSelectedPago(pago)}
                style={{
                  background: 'var(--color-surface)',
                  borderRadius: 'var(--radius-xl)',
                  padding: 'var(--space-4)',
                  border: '1px solid var(--color-border)',
                  boxShadow: 'var(--shadow-sm)',
                  cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
                  <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-text)' }}>
                    {formatDate(pago.fecha)} — {pago.dia_semana}
                  </span>
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
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-2)' }}>
                  <InfoRow label="Monto" value={formatMonto(pago.monto)} />
                  <InfoRow
                    label="Método"
                    value={
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-1)' }}>
                        {METODO_PAGO_MAP[pago.metodo_pago]?.icon}
                        {METODO_PAGO_MAP[pago.metodo_pago]?.label || pago.metodo_pago}
                      </span>
                    }
                  />
                  {pago.descripcion && (
                    <InfoRow label="Descripción" value={pago.descripcion} />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{
          background: 'var(--color-surface)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-sm)',
          border: '1px solid var(--color-border)',
          overflowX: 'auto',
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
            <thead>
              <tr style={{ background: 'var(--color-bg)' }}>
                <th style={thStyle}>Fecha</th>
                <th style={thStyle}>Día</th>
                <th style={thStyle}>Monto</th>
                <th style={thStyle}>Método</th>
                <th style={thStyle}>Estado</th>
              </tr>
            </thead>
            <tbody>
              {pagos.map((pago) => {
                const estadoInfo = ESTADO_MAP[pago.estado] || ESTADO_MAP.pendiente;
                const metodoInfo = METODO_PAGO_MAP[pago.metodo_pago];
                return (
                  <tr
                    key={pago.id}
                    onClick={() => setSelectedPago(pago)}
                    style={{
                      borderTop: '1px solid var(--color-border)',
                      cursor: 'pointer',
                    }}
                  >
                    <td style={tdStyle}>{formatDate(pago.fecha)}</td>
                    <td style={tdStyle}>{pago.dia_semana}</td>
                    <td style={tdStyle}>{formatMonto(pago.monto)}</td>
                    <td style={tdStyle}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-1)' }}>
                        {metodoInfo?.icon}
                        {metodoInfo?.label || pago.metodo_pago}
                      </span>
                    </td>
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

      {/* Detail modal */}
      {selectedPago && (
        <div
          onClick={() => setSelectedPago(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 'var(--space-4)',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'var(--color-surface)',
              borderRadius: 'var(--radius-xl)',
              padding: 'var(--space-6)',
              maxWidth: 400,
              width: '100%',
              boxShadow: 'var(--shadow-lg)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
              <h2 style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 'var(--text-lg)',
                color: 'var(--color-gold)',
                margin: 0,
              }}>
                Detalle del Pago
              </h2>
              <button
                onClick={() => setSelectedPago(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-text-muted)',
                  cursor: 'pointer',
                  padding: 'var(--space-1)',
                  minHeight: 44,
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                ✕
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              <InfoRow label="Fecha" value={`${formatDate(selectedPago.fecha)} — ${selectedPago.dia_semana}`} />
              <InfoRow label="Monto" value={formatMonto(selectedPago.monto)} />
              <InfoRow
                label="Método de pago"
                value={
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-1)' }}>
                    {METODO_PAGO_MAP[selectedPago.metodo_pago]?.icon}
                    {METODO_PAGO_MAP[selectedPago.metodo_pago]?.label || selectedPago.metodo_pago}
                  </span>
                }
              />
              {selectedPago.profesor_nombre && (
                <InfoRow label="Profesor" value={selectedPago.profesor_nombre} />
              )}
              {selectedPago.descripcion && (
                <InfoRow label="Descripción" value={selectedPago.descripcion} />
              )}
              <InfoRow label="Estado" value={
                <span style={{
                  padding: 'var(--space-1) var(--space-3)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 'var(--text-xs)',
                  fontWeight: 600,
                  background: (ESTADO_MAP[selectedPago.estado] || ESTADO_MAP.pendiente).bg,
                  color: (ESTADO_MAP[selectedPago.estado] || ESTADO_MAP.pendiente).color,
                  display: 'inline-block',
                }}>
                  {(ESTADO_MAP[selectedPago.estado] || ESTADO_MAP.pendiente).label}
                </span>
              } />
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

// ─── Sub-components ─────────────────────────────────────────────────────────

interface InfoRowProps {
  label: string;
  value: React.ReactNode;
}

const InfoRow = memo<InfoRowProps>(({ label, value }) => (
  <div>
    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', display: 'block' }}>{label}</span>
    <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-text)' }}>{value}</span>
  </div>
));

interface SummaryCardProps {
  label: string;
  value: string;
}

const SummaryCard = memo<SummaryCardProps>(({ label, value }) => (
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

export default PagosPage;
