import { memo } from 'react';
import { useWindowWidth } from '../../hooks/useWindowWidth';
import { formatDate } from '../../utils/formatters';
import EmptyState from '../ui/EmptyState';
import type { AlumnoTableProps } from '../../types/alumnos';

/**
 * Responsive student table: desktop <table> / mobile card grid.
 * Shows estado badge, name, DNI, phone, taller badges, last attendance, actions.
 * Includes server-side pagination controls.
 */
const AlumnoTable = memo<AlumnoTableProps>(({
  alumnos,
  count,
  page,
  pageSize,
  onPageChange,
  onInspect,
  loading = false,
}) => {
  const width = useWindowWidth();
  const isMobile = width <= 768;
  const totalPages = Math.max(1, Math.ceil(count / pageSize));

  if (alumnos.length === 0) {
    return (
      <EmptyState
        message="No hay alumnos en este ciclo"
        description="Los alumnos aparecerán aquí una vez que se matriculen."
      />
    );
  }

  const estadoBadge = (estado: string) => {
    const isActivo = estado === 'activo';
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          padding: '2px 8px',
          borderRadius: 'var(--radius-md)',
          fontSize: 10,
          fontWeight: 600,
          background: isActivo ? 'rgba(34, 197, 94, 0.1)' : 'rgba(156, 163, 175, 0.1)',
          color: isActivo ? '#22c55e' : '#9ca3af',
          whiteSpace: 'nowrap',
        }}
      >
        <span style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: isActivo ? '#22c55e' : '#9ca3af',
          display: 'inline-block',
        }} />
        {isActivo ? 'Activo' : 'Histórico'}
      </span>
    );
  };

  // Pagination controls
  const pagination = (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 'var(--space-3) 0',
      fontSize: 'var(--text-xs)',
      color: 'var(--color-text-muted)',
    }}>
      <span>
        Mostrando {((page - 1) * pageSize) + 1}–{Math.min(page * pageSize, count)} de {count}
      </span>
      <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          style={{
            padding: 'var(--space-2) var(--space-3)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border)',
            background: page <= 1 ? 'var(--color-surface)' : 'transparent',
            color: page <= 1 ? 'var(--color-text-muted)' : 'var(--color-text-secondary)',
            cursor: page <= 1 ? 'not-allowed' : 'pointer',
            fontSize: 'var(--text-xs)',
            fontWeight: 500,
            minHeight: 36,
            fontFamily: 'var(--font-body)',
          }}
          aria-label="Página anterior"
        >
          Anterior
        </button>
        <span style={{
          padding: 'var(--space-1) var(--space-3)',
          fontWeight: 600,
          color: 'var(--color-text)',
        }}>
          {page} / {totalPages}
        </span>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          style={{
            padding: 'var(--space-2) var(--space-3)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border)',
            background: page >= totalPages ? 'var(--color-surface)' : 'transparent',
            color: page >= totalPages ? 'var(--color-text-muted)' : 'var(--color-text-secondary)',
            cursor: page >= totalPages ? 'not-allowed' : 'pointer',
            fontSize: 'var(--text-xs)',
            fontWeight: 500,
            minHeight: 36,
            fontFamily: 'var(--font-body)',
          }}
          aria-label="Página siguiente"
        >
          Siguiente
        </button>
      </div>
    </div>
  );

  // ── Desktop: <table> ─────────────────────────────────────────────────
  if (!isMobile) {
    return (
      <div>
        {pagination}
        <div style={{ position: 'relative' }}>
          {loading && (
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(255,255,255,0.7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10,
              borderRadius: 'var(--radius-md)',
            }}>
              <div className="spinner" style={{
                width: 24,
                height: 24,
                border: '2px solid var(--color-border)',
                borderTopColor: 'var(--color-gold)',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
              }} />
            </div>
          )}
          <div style={{ overflowX: 'auto' }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: 'var(--text-sm)',
          }}>
            <thead>
              <tr style={{
                borderBottom: '1px solid var(--color-border)',
                color: 'var(--color-text-muted)',
                fontSize: 'var(--text-xs)',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}>
                <th style={thStyle}>Estado</th>
                <th style={thStyle}>Nombre</th>
                <th style={thStyle}>Teléfono</th>
                <th style={thStyle}>Talleres</th>
                <th style={thStyle}>Última Asistencia</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>Acción</th>
              </tr>
            </thead>
            <tbody>
              {alumnos.map((alumno) => (
                <tr
                  key={alumno.id}
                  style={{
                    borderBottom: '1px solid var(--color-border)',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--color-surface-hover)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <td style={tdStyle}>{estadoBadge(alumno.estado)}</td>
                  <td style={tdStyle}>
                    <span style={{ fontWeight: 600, color: 'var(--color-text)' }}>
                      {alumno.nombre} {alumno.apellido}
                    </span>
                  </td>
                  <td style={tdStyle}>{alumno.telefono || '—'}</td>
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', gap: 'var(--space-1)', flexWrap: 'wrap', alignItems: 'center' }}>
                      {alumno.horarios.length === 0 ? (
                        <span style={{ color: 'var(--color-text-muted)' }}>—</span>
                      ) : (
                        (() => {
                          const seen = new Map<number | string, typeof alumno.horarios[0]>();
                          for (const h of alumno.horarios) {
                            const key = h.taller_id ?? h.taller_nombre;
                            if (!seen.has(key)) seen.set(key, h);
                          }
                          const uniques = Array.from(seen.values());
                          const visible = uniques.slice(0, 2);
                          const hidden = uniques.slice(2);
                          return (
                            <>
                              {visible.map((h) => (
                                <span
                                  key={h.id}
                                  style={{
                                    padding: '2px 8px',
                                    borderRadius: 'var(--radius-md)',
                                    fontSize: 10,
                                    fontWeight: 600,
                                    background: h.taller_tipo === 'instrumento'
                                      ? 'var(--color-gold-glow)'
                                      : 'rgba(99, 102, 241, 0.1)',
                                    color: h.taller_tipo === 'instrumento'
                                      ? 'var(--color-gold)'
                                      : '#6366f1',
                                    maxWidth: 120,
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                  }}
                                >
                                  {h.taller_nombre.length > 12
                                    ? h.taller_nombre.slice(0, 12) + '\u2026'
                                    : h.taller_nombre}
                                </span>
                              ))}
                              {hidden.length > 0 && (
                                <span
                                  style={{
                                    padding: '2px 8px',
                                    borderRadius: 'var(--radius-md)',
                                    fontSize: 10,
                                    fontWeight: 600,
                                    background: 'var(--color-surface-hover)',
                                    color: 'var(--color-text-muted)',
                                    cursor: 'default',
                                    position: 'relative',
                                  }}
                                  title={hidden.map((h) => h.taller_nombre).join(', ')}
                                >
                                  +{hidden.length}
                                </span>
                              )}
                            </>
                          );
                        })()
                      )}
                    </div>
                  </td>
                  <td style={tdStyle}>
                    {alumno.fecha_ultima_asistencia
                      ? formatDate(alumno.fecha_ultima_asistencia)
                      : <span style={{ color: 'var(--color-text-muted)' }}>Sin registros</span>
                    }
                  </td>
                  <td style={{ ...tdStyle, textAlign: 'right' }}>
                    <button
                      onClick={() => onInspect(alumno.id)}
                      style={{
                        padding: 'var(--space-2) var(--space-4)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--color-border)',
                        background: 'transparent',
                        color: 'var(--color-text-secondary)',
                        fontSize: 'var(--text-xs)',
                        fontWeight: 500,
                        cursor: 'pointer',
                        minHeight: 36,
                        fontFamily: 'var(--font-body)',
                        transition: 'all 0.15s',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'var(--color-gold)';
                        e.currentTarget.style.color = 'var(--color-gold)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'var(--color-border)';
                        e.currentTarget.style.color = 'var(--color-text-secondary)';
                      }}
                      aria-label={`Inspeccionar ${alumno.nombre} ${alumno.apellido}`}
                    >
                      Inspeccionar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
        {pagination}
      </div>
    );
  }

  // ── Mobile: cards ─────────────────────────────────────────────────────
  return (
    <div>
      {pagination}
      <div style={{ position: 'relative' }}>
        {loading && (
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(255,255,255,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
            borderRadius: 'var(--radius-md)',
          }}>
            <div className="spinner" style={{
              width: 24,
              height: 24,
              border: '2px solid var(--color-border)',
              borderTopColor: 'var(--color-gold)',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
            }} />
          </div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        {alumnos.map((alumno) => (
          <div
            key={alumno.id}
            style={{
              background: 'var(--color-surface)',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--space-4)',
              border: '1px solid var(--color-border)',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            {/* Name + estado badge + initials */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
              <div style={{
                width: 40,
                height: 40,
                borderRadius: 'var(--radius-full)',
                background: 'var(--color-gold-glow)',
                color: 'var(--color-gold)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 'var(--text-base)',
                fontWeight: 700,
                fontFamily: 'var(--font-heading)',
                flexShrink: 0,
              }}>
                {alumno.nombre.charAt(0)}{alumno.apellido.charAt(0)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{
                  fontSize: 'var(--text-sm)',
                  fontWeight: 600,
                  color: 'var(--color-text)',
                  margin: 0,
                  marginBottom: 4,
                }}>
                  {alumno.nombre} {alumno.apellido}
                </p>
                {estadoBadge(alumno.estado)}
              </div>
              <button
                onClick={() => onInspect(alumno.id)}
                style={{
                  padding: 'var(--space-3) var(--space-4)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  background: 'transparent',
                  color: 'var(--color-gold)',
                  fontSize: 'var(--text-xs)',
                  fontWeight: 600,
                  cursor: 'pointer',
                  minHeight: 44,
                  fontFamily: 'var(--font-body)',
                  flexShrink: 0,
                  whiteSpace: 'nowrap',
                }}
                aria-label={`Inspeccionar ${alumno.nombre} ${alumno.apellido}`}
              >
                Inspeccionar
              </button>
            </div>

            {/* Details */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 'var(--space-2) var(--space-4)',
              marginBottom: 'var(--space-3)',
            }}>
              <div>
                <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 2 }}>
                  Teléfono
                </span>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text)' }}>{alumno.telefono || '—'}</span>
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 2 }}>
                  Última Asistencia
                </span>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text)' }}>
                  {alumno.fecha_ultima_asistencia
                    ? formatDate(alumno.fecha_ultima_asistencia)
                    : 'Sin registros'}
                </span>
              </div>
            </div>

            {/* Taller badges */}
            <div style={{ display: 'flex', gap: 'var(--space-1)', flexWrap: 'wrap', alignItems: 'center' }}>
              {(() => {
                const seen = new Map<number | string, typeof alumno.horarios[0]>();
                for (const h of alumno.horarios) {
                  const key = h.taller_id ?? h.taller_nombre;
                  if (!seen.has(key)) seen.set(key, h);
                }
                const uniques = Array.from(seen.values());
                const visible = uniques.slice(0, 3);
                const hidden = uniques.slice(3);
                return (
                  <>
                    {visible.map((h) => (
                      <span
                        key={h.id}
                        style={{
                          padding: '4px 10px',
                          borderRadius: 'var(--radius-md)',
                          fontSize: 10,
                          fontWeight: 600,
                          background: h.taller_tipo === 'instrumento'
                            ? 'var(--color-gold-glow)'
                            : 'rgba(99, 102, 241, 0.1)',
                          color: h.taller_tipo === 'instrumento'
                            ? 'var(--color-gold)'
                            : '#6366f1',
                          minHeight: 28,
                          display: 'inline-flex',
                          alignItems: 'center',
                        }}
                      >
                        {h.taller_nombre.length > 12
                          ? h.taller_nombre.slice(0, 12) + '\u2026'
                          : h.taller_nombre}
                      </span>
                    ))}
                    {hidden.length > 0 && (
                      <span
                        style={{
                          padding: '4px 10px',
                          borderRadius: 'var(--radius-md)',
                          fontSize: 10,
                          fontWeight: 600,
                          background: 'var(--color-surface-hover)',
                          color: 'var(--color-text-muted)',
                          cursor: 'default',
                          minHeight: 28,
                          display: 'inline-flex',
                          alignItems: 'center',
                        }}
                        title={hidden.map((h) => h.taller_nombre).join(', ')}
                      >
                        +{hidden.length}
                      </span>
                    )}
                  </>
                );
              })()}
            </div>
          </div>
        ))}
      </div>
      </div>
      {pagination}
    </div>
  );
});

AlumnoTable.displayName = 'AlumnoTable';

const thStyle: React.CSSProperties = {
  padding: 'var(--space-3) var(--space-3)',
  textAlign: 'left',
  whiteSpace: 'nowrap',
};

const tdStyle: React.CSSProperties = {
  padding: 'var(--space-3) var(--space-3)',
  verticalAlign: 'middle',
};

export default AlumnoTable;
