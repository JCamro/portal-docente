import { memo } from 'react';
import { useWindowWidth } from '../../hooks/useWindowWidth';
import { formatDate } from '../../utils/formatters';
import EmptyState from '../ui/EmptyState';
import type { AlumnoTableProps } from '../../types/alumnos';

/**
 * Responsive student table: desktop <table> / mobile card grid.
 * Shows name, DNI, phone, taller badges, last attendance, and Inspect action.
 */
const AlumnoTable = memo<AlumnoTableProps>(({
  alumnos,
  fechaUltimaAsistencia,
  onInspect,
}) => {
  const width = useWindowWidth();
  const isMobile = width <= 768;

  if (alumnos.length === 0) {
    return (
      <EmptyState
        message="No hay alumnos inscritos en este ciclo"
        description="Los alumnos aparecerán aquí una vez que se matriculen."
      />
    );
  }

  // ── Desktop: <table> ─────────────────────────────────────────────────
  if (!isMobile) {
    return (
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
              <th style={thStyle}>Nombre</th>
              <th style={thStyle}>DNI</th>
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
                <td style={tdStyle}>
                  <span style={{ fontWeight: 600, color: 'var(--color-text)' }}>
                    {alumno.nombre} {alumno.apellido}
                  </span>
                </td>
                <td style={tdStyle}>{alumno.dni}</td>
                <td style={tdStyle}>{alumno.telefono || '—'}</td>
                <td style={tdStyle}>
                  <div style={{ display: 'flex', gap: 'var(--space-1)', flexWrap: 'wrap' }}>
                    {alumno.horarios.length === 0 ? (
                      <span style={{ color: 'var(--color-text-muted)' }}>—</span>
                    ) : (
                      alumno.horarios.map((h) => (
                        <span
                          key={h.id}
                          title={h.taller_nombre.length > 12 ? h.taller_nombre : undefined}
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
                            ? h.taller_nombre.slice(0, 12) + '…'
                            : h.taller_nombre}
                        </span>
                      ))
                    )}
                  </div>
                </td>
                <td style={tdStyle}>
                  {fechaUltimaAsistencia[alumno.id]
                    ? formatDate(fechaUltimaAsistencia[alumno.id]!)
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
    );
  }

  // ── Mobile: cards ─────────────────────────────────────────────────────
  return (
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
          {/* Name + initials */}
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
              }}>
                {alumno.nombre} {alumno.apellido}
              </p>
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
                DNI
              </span>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text)' }}>{alumno.dni}</span>
            </div>
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
                {fechaUltimaAsistencia[alumno.id]
                  ? formatDate(fechaUltimaAsistencia[alumno.id]!)
                  : 'Sin registros'}
              </span>
            </div>
          </div>

          {/* Taller badges */}
          <div style={{ display: 'flex', gap: 'var(--space-1)', flexWrap: 'wrap' }}>
            {alumno.horarios.map((h) => (
              <span
                key={h.id}
                title={h.taller_nombre.length > 12 ? h.taller_nombre : undefined}
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
                  ? h.taller_nombre.slice(0, 12) + '…'
                  : h.taller_nombre}
              </span>
            ))}
          </div>
        </div>
      ))}
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
