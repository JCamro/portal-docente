import React, { memo, useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../stores/authStore';
import { getPagos } from '../api/portalDocente';
import type { PagoProfesorPortal, PagoProfesorDetallePortal } from '../types';
import Loading from '../components/ui/Loading';
import ErrorState from '../components/ui/ErrorState';
import EmptyState from '../components/ui/EmptyState';
import { useWindowWidth } from '../hooks/useWindowWidth';
import { ESTADO_PAGO_MAP } from '../utils/constants';
import { formatMonto, formatDate } from '../utils/formatters';

type EstadoFilter = '' | 'calculado' | 'pagado' | 'anulado';

const PagosPage = memo(() => {
  const cicloActivo = useAuthStore((s) => s.cicloActivo);
  const width = useWindowWidth();
  const isMobile = width <= 768;

  const [records, setRecords] = useState<PagoProfesorPortal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtroEstado, setFiltroEstado] = useState<EstadoFilter>('');
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const fetchData = useCallback(async () => {
    if (!cicloActivo) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await getPagos(cicloActivo.id, filtroEstado || undefined);
      setRecords(data);
    } catch {
      setError('Error al cargar pagos');
    } finally {
      setLoading(false);
    }
  }, [cicloActivo, filtroEstado]);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!cancelled) await fetchData();
    };
    run();
    return () => { cancelled = true; };
  }, [fetchData]);

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

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

  if (loading && records.length === 0) return <Loading message="Cargando pagos..." />;
  if (error && records.length === 0) return <ErrorState message={error} onRetry={fetchData} />;

  const totalMontoFinal = records.reduce((sum, r) => sum + r.monto_final, 0);
  const countByEstado = {
    calculado: records.filter(r => r.estado === 'calculado').length,
    pagado: records.filter(r => r.estado === 'pagado').length,
    anulado: records.filter(r => r.estado === 'anulado').length,
  };

  const columnHeaders = [
    { key: 'periodo', label: 'Período' },
    { key: 'horas', label: 'Horas' },
    { key: 'monto', label: 'Monto Final' },
    { key: 'clases', label: 'Detalles' },
    { key: 'estado', label: 'Estado' },
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
          Mis Pagos
        </h1>
        {records.length > 0 && (
          <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
            {records.length} {records.length === 1 ? 'pago' : 'pagos'}
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
            Estado
          </label>
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value as EstadoFilter)}
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
            <option value="">Todos</option>
            <option value="calculado">Calculado</option>
            <option value="pagado">Pagado</option>
            <option value="anulado">Anulado</option>
          </select>
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
          <SummaryCard label="Total pagos" value={formatMonto(totalMontoFinal)} />
          <SummaryCard label="Calculados" value={String(countByEstado.calculado)} />
          <SummaryCard label="Pagados" value={String(countByEstado.pagado)} />
          <SummaryCard label="Anulados" value={String(countByEstado.anulado)} />
        </div>
      )}

      {records.length === 0 ? (
        <EmptyState
          message="No hay pagos registrados"
          description="Aún no se han procesado pagos para este ciclo."
          icon={
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          }
        />
      ) : isMobile ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {records.map((r) => {
            const estadoInfo = ESTADO_PAGO_MAP[r.estado] || ESTADO_PAGO_MAP.calculado;
            const isExpanded = expandedId === r.id;
            return (
              <div key={r.id} style={{
                background: 'var(--color-surface)',
                borderRadius: 'var(--radius-xl)',
                padding: 'var(--space-4)',
                border: '1px solid var(--color-border)',
                boxShadow: 'var(--shadow-sm)',
              }}>
                <div
                  onClick={() => r.detalles.length > 0 && toggleExpand(r.id)}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 'var(--space-3)',
                    cursor: r.detalles.length > 0 ? 'pointer' : 'default',
                  }}
                >
                  <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-text)' }}>
                    {formatDate(r.fecha_inicio)} — {formatDate(r.fecha_fin)}
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
                  <InfoRow label="Período" value={`${formatDate(r.fecha_inicio)} — ${formatDate(r.fecha_fin)}`} />
                  <InfoRow label="Horas calculadas" value={`${r.horas_calculadas}h`} />
                  <InfoRow label="Monto final" value={formatMonto(r.monto_final)} />
                  <InfoRow label="Detalles" value={String(r.detalles.length)} />
                  {r.estado === 'pagado' && r.fecha_pago && (
                    <InfoRow label="Fecha de pago" value={formatDate(r.fecha_pago)} />
                  )}
                </div>

                {/* Expandable Detalles */}
                {isExpanded && r.detalles.length > 0 && (
                  <div style={{
                    marginTop: 'var(--space-4)',
                    paddingTop: 'var(--space-4)',
                    borderTop: '1px solid var(--color-border)',
                  }}>
                    <p style={{
                      fontSize: 'var(--text-xs)',
                      fontWeight: 600,
                      color: 'var(--color-text-muted)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      margin: 0,
                      marginBottom: 'var(--space-3)',
                    }}>
                      Detalle por clase
                    </p>
                    {r.detalles.map((d) => (
                      <DetalleCard key={d.id} detalle={d} />
                    ))}
                  </div>
                )}

                {r.detalles.length > 0 && (
                  <div
                    onClick={() => toggleExpand(r.id)}
                    style={{
                      marginTop: 'var(--space-3)',
                      textAlign: 'center',
                      fontSize: 'var(--text-xs)',
                      color: 'var(--color-gold)',
                      cursor: 'pointer',
                      fontWeight: 600,
                      padding: 'var(--space-2)',
                    }}
                  >
                    {isExpanded ? 'Ocultar detalle' : `Ver detalle (${r.detalles.length} clases)`}
                  </div>
                )}
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
          overflowX: 'auto',
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
            <thead>
              <tr style={{ background: 'var(--color-bg)' }}>
                {columnHeaders.map(col => (
                  <th key={col.key} style={thStyle}>{col.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {records.map((r) => {
                const estadoInfo = ESTADO_PAGO_MAP[r.estado] || ESTADO_PAGO_MAP.calculado;
                const isExpanded = expandedId === r.id;
                return (
                  <React.Fragment key={r.id}>
                    <tr
                      onClick={() => r.detalles.length > 0 && toggleExpand(r.id)}
                      style={{
                        borderTop: '1px solid var(--color-border)',
                        cursor: r.detalles.length > 0 ? 'pointer' : 'default',
                      }}
                    >
                      <td style={tdStyle}>
                        {formatDate(r.fecha_inicio)} — {formatDate(r.fecha_fin)}
                      </td>
                      <td style={tdStyle}>{r.horas_calculadas}h</td>
                      <td style={tdStyle}>{formatMonto(r.monto_final)}</td>
                      <td style={tdStyle}>
                        {r.detalles.length > 0 ? (
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 'var(--space-1)',
                            color: 'var(--color-gold)',
                            fontWeight: 600,
                            fontSize: 'var(--text-xs)',
                          }}>
                            {r.detalles.length} clases
                            <svg
                              width="14" height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              style={{
                                transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                                transition: 'transform 0.15s',
                              }}
                            >
                              <polyline points="6 9 12 15 18 9" />
                            </svg>
                          </span>
                        ) : (
                          <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)' }}>
                            Sin detalle
                          </span>
                        )}
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
                    {isExpanded && r.detalles.length > 0 && (
                      <tr>
                        <td colSpan={5} style={{ padding: 0, background: 'var(--color-bg)' }}>
                          <div style={{
                            padding: 'var(--space-4) var(--space-6)',
                            borderBottom: '1px solid var(--color-border)',
                          }}>
                            <p style={{
                              fontSize: 'var(--text-xs)',
                              fontWeight: 600,
                              color: 'var(--color-text-muted)',
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em',
                              margin: 0,
                              marginBottom: 'var(--space-3)',
                            }}>
                              Detalle por clase
                            </p>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                              <thead>
                                <tr>
                                  <th style={innerThStyle}>Fecha</th>
                                  <th style={innerThStyle}>Taller</th>
                                  <th style={innerThStyle}>Alumnos</th>
                                  <th style={innerThStyle}>Monto Prof.</th>
                                  <th style={innerThStyle}>Ganancia Taller</th>
                                </tr>
                              </thead>
                              <tbody>
                                {r.detalles.map((d) => (
                                  <tr key={d.id} style={{ borderTop: '1px solid var(--color-border)' }}>
                                    <td style={innerTdStyle}>{formatDate(d.fecha)}</td>
                                    <td style={innerTdStyle}>{d.taller_nombre || '-'}</td>
                                    <td style={innerTdStyle}>{d.num_alumnos}</td>
                                    <td style={innerTdStyle}>{formatMonto(d.monto_profesor)}</td>
                                    <td style={innerTdStyle}>{formatMonto(d.ganancia_taller)}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
});

// ─── Sub-components ─────────────────────────────────────────────────────────

interface DetalleCardProps {
  detalle: PagoProfesorDetallePortal;
}

const DetalleCard = React.memo<DetalleCardProps>(({ detalle }) => (
  <div style={{
    background: 'var(--color-bg)',
    borderRadius: 'var(--radius-lg)',
    padding: 'var(--space-3)',
    marginBottom: 'var(--space-2)',
    border: '1px solid var(--color-border)',
  }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
      <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-text)' }}>
        {formatDate(detalle.fecha)}
      </span>
      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
        {detalle.taller_nombre || '-'}
      </span>
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-1)' }}>
      <InfoRow label="Alumnos" value={String(detalle.num_alumnos)} />
      <InfoRow label="Monto Prof." value={formatMonto(detalle.monto_profesor)} />
      <InfoRow label="Ganancia taller" value={formatMonto(detalle.ganancia_taller)} />
    </div>
  </div>
));

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

const innerThStyle: React.CSSProperties = {
  padding: 'var(--space-2) var(--space-3)',
  textAlign: 'left',
  fontSize: 'var(--text-2xs)',
  fontWeight: 600,
  color: 'var(--color-text-muted)',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  whiteSpace: 'nowrap',
};

const innerTdStyle: React.CSSProperties = {
  padding: 'var(--space-2) var(--space-3)',
  fontSize: 'var(--text-xs)',
  color: 'var(--color-text)',
  whiteSpace: 'nowrap',
};

export default PagosPage;
