import React from 'react';
import type { AlumnoInfo } from '../../types';

interface AlumnoCardProps {
  alumno: AlumnoInfo;
}

const AlumnoCard: React.FC<AlumnoCardProps> = ({ alumno }) => {
  return (
    <div style={{
      background: 'var(--color-surface)',
      borderRadius: 'var(--radius-lg)',
      padding: 'var(--space-4)',
      border: '1px solid var(--color-border)',
      boxShadow: 'var(--shadow-sm)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
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
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}>
            {alumno.nombre} {alumno.apellido}
          </p>
          <div style={{
            display: 'flex',
            gap: 'var(--space-4)',
            marginTop: 'var(--space-1)',
          }}>
            {alumno.dni && (
              <span style={{
                fontSize: 'var(--text-xs)',
                color: 'var(--color-text-muted)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-1)',
              }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <line x1="3" y1="9" x2="21" y2="9" />
                  <line x1="9" y1="21" x2="9" y2="9" />
                </svg>
                {alumno.dni}
              </span>
            )}
          </div>
        </div>
        {alumno.telefono && (
          <a
            href={`https://api.whatsapp.com/send?phone=${alumno.telefono}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: 'var(--space-2)',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(34, 197, 94, 0.1)',
              color: '#16a34a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              textDecoration: 'none',
            }}
            aria-label="Contactar por WhatsApp"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
          </a>
        )}
      </div>
    </div>
  );
};

export default React.memo(AlumnoCard);
