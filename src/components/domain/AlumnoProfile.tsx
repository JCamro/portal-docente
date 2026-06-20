import { memo } from 'react';
import Loading from '../ui/Loading';
import type { AlumnoProfileProps } from '../../types/alumnos';

/**
 * Student profile section for SidePanel.
 * Displays name, DNI, phone, email, and taller badges.
 * Missing fields show "No registrado".
 */
const AlumnoProfile = memo<AlumnoProfileProps>(({ alumno, loading }) => {
  if (loading) {
    return <Loading message="Cargando perfil..." />;
  }

  if (!alumno) {
    return (
      <p style={{
        fontSize: 'var(--text-sm)',
        color: 'var(--color-text-muted)',
        textAlign: 'center',
        padding: 'var(--space-4) 0',
      }}>
        No se pudo cargar el perfil del alumno.
      </p>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
      {/* Name with initials */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
        <div style={{
          width: 48,
          height: 48,
          borderRadius: 'var(--radius-full)',
          background: 'var(--color-gold-glow)',
          color: 'var(--color-gold)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 'var(--text-lg)',
          fontWeight: 700,
          fontFamily: 'var(--font-heading)',
          flexShrink: 0,
        }}>
          {alumno.nombre.charAt(0)}{alumno.apellido.charAt(0)}
        </div>
        <div>
          <h3 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'var(--text-base)',
            color: 'var(--color-text)',
            margin: 0,
          }}>
            {alumno.nombre} {alumno.apellido}
          </h3>
          <p style={{
            fontSize: 'var(--text-xs)',
            color: 'var(--color-text-muted)',
            margin: 'var(--space-1) 0 0 0',
          }}>
            {alumno.dni}
          </p>
        </div>
      </div>

      {/* Contact info */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 'var(--space-2)',
      }}>
        <div>
          <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 2 }}>
            Teléfono
          </span>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text)' }}>
            {alumno.telefono || 'No registrado'}
          </span>
        </div>
        <div>
          <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 2 }}>
            Email
          </span>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text)' }}>
            {alumno.email || 'No registrado'}
          </span>
        </div>
      </div>

      {/* Taller badges */}
      <div>
        <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 'var(--space-2)' }}>
          Talleres inscritos
        </span>
        <div style={{ display: 'flex', gap: 'var(--space-1)', flexWrap: 'wrap' }}>
          {alumno.horarios.length === 0 ? (
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
              Sin talleres inscritos
            </span>
          ) : (
            alumno.horarios.map((h) => (
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
                  display: 'inline-flex',
                  alignItems: 'center',
                  minHeight: 28,
                }}
              >
                {h.taller_nombre}
              </span>
            ))
          )}
        </div>
      </div>
    </div>
  );
});

AlumnoProfile.displayName = 'AlumnoProfile';

export default AlumnoProfile;
