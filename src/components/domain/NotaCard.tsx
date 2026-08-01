import { memo, useCallback } from 'react';
import { formatDate } from '../../utils/formatters';

interface NotaCardProps {
  type: 'general' | 'clase';
  titulo?: string;
  contenido?: string;
  fecha: string;
  tallerNombre?: string;
  onEdit?: () => void;
  onDelete?: () => void;
  onGoToHorarios?: () => void;
}

const NotaCard = memo(({
  type,
  titulo,
  contenido,
  fecha,
  tallerNombre,
  onEdit,
  onDelete,
  onGoToHorarios,
}: NotaCardProps) => {
  const handleEdit = useCallback(() => onEdit?.(), [onEdit]);
  const handleDelete = useCallback(() => onDelete?.(), [onDelete]);
  const handleGoToHorarios = useCallback(() => onGoToHorarios?.(), [onGoToHorarios]);

  return (
    <div style={{
      background: 'var(--color-surface)',
      borderRadius: 'var(--radius-lg)',
      padding: 'var(--space-4)',
      border: '1px solid var(--color-border)',
      transition: 'border-color 150ms ease',
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: titulo || tallerNombre ? 'var(--space-2)' : 0,
      }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Badges row */}
          <div style={{
            display: 'flex',
            gap: 'var(--space-2)',
            alignItems: 'center',
            flexWrap: 'wrap',
            marginBottom: 'var(--space-1)',
          }}>
            {type === 'general' && titulo && (
              <span style={{
                fontSize: 'var(--text-sm)',
                fontWeight: 700,
                color: 'var(--color-text)',
              }}>
                {titulo}
              </span>
            )}
            {type === 'clase' && tallerNombre && (
              <span style={{
                padding: '2px 8px',
                borderRadius: 'var(--radius-md)',
                fontSize: 10,
                fontWeight: 600,
                background: 'var(--color-gold-glow)',
                color: 'var(--color-gold)',
              }}>
                {tallerNombre}
              </span>
            )}
            <span style={{
              fontSize: 'var(--text-xs)',
              color: 'var(--color-text-muted)',
            }}>
              {formatDate(fecha)}
            </span>
          </div>

          {/* Title for non-general types */}
          {type !== 'general' && titulo && (
            <div style={{
              fontSize: 'var(--text-sm)',
              fontWeight: 700,
              color: 'var(--color-text)',
              marginBottom: 'var(--space-1)',
            }}>
              {titulo}
            </div>
          )}

          {/* Content */}
          {contenido && (
            <p style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--color-text-secondary)',
              margin: 0,
              whiteSpace: 'pre-wrap',
              lineHeight: 1.5,
            }}>
              {contenido}
            </p>
          )}
        </div>

        {/* Actions */}
        {(onEdit || onDelete || onGoToHorarios) && (
          <div style={{ display: 'flex', gap: 'var(--space-2)', flexShrink: 0, marginLeft: 'var(--space-3)' }}>
            {onGoToHorarios && (
              <button
                onClick={handleGoToHorarios}
                style={{
                  padding: 'var(--space-1)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  background: 'transparent',
                  color: '#6366f1',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: 32,
                  minWidth: 32,
                }}
                aria-label="Ver en horarios"
                title="Ver en Horarios"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </button>
            )}
            {onEdit && (
              <button
                onClick={handleEdit}
                style={{
                  padding: 'var(--space-1)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  background: 'transparent',
                  color: 'var(--color-text-muted)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: 32,
                  minWidth: 32,
                }}
                aria-label="Editar nota"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </button>
            )}
            {onDelete && (
              <button
                onClick={handleDelete}
                style={{
                  padding: 'var(--space-1)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  background: 'transparent',
                  color: '#fca5a5',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: 32,
                  minWidth: 32,
                }}
                aria-label="Eliminar nota"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
});

NotaCard.displayName = 'NotaCard';

export default NotaCard;
