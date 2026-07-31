import { memo } from 'react';
import { useWindowWidth } from '../../../hooks/useWindowWidth';
import type { AlumnoCartilla } from '../../../types';

interface Props {
  alumno: AlumnoCartilla;
}

const AlumnoDetalleHeader = memo(({ alumno }: Props) => {
  const width = useWindowWidth();
  const isMobile = width <= 768;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: isMobile ? 'var(--space-3)' : 'var(--space-4)',
      marginBottom: 'var(--space-6)',
    }}>
      <div style={{
        width: isMobile ? 56 : 72,
        height: isMobile ? 56 : 72,
        borderRadius: 'var(--radius-full)',
        background: 'var(--color-gold-glow)',
        color: 'var(--color-gold)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: isMobile ? 'var(--text-lg)' : 'var(--text-xl)',
        fontWeight: 700,
        fontFamily: 'var(--font-heading)',
        flexShrink: 0,
      }}>
        {alumno.nombre.charAt(0)}{alumno.apellido.charAt(0)}
      </div>
      <div>
        <h1 style={{
          fontFamily: 'var(--font-heading)',
          fontSize: isMobile ? 'var(--text-xl)' : 'var(--text-2xl)',
          color: 'var(--color-text)',
          margin: 0,
          lineHeight: 1.2,
        }}>
          {alumno.nombre} {alumno.apellido}
        </h1>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 'var(--space-2)',
          marginTop: 'var(--space-1)',
          fontSize: 'var(--text-sm)',
          color: 'var(--color-text-muted)',
        }}>
          {alumno.telefono && <span>Tel: {alumno.telefono}</span>}
          {alumno.telefono && alumno.email && <span>·</span>}
          {alumno.email && <span>Correo: {alumno.email}</span>}
        </div>
      </div>
    </div>
  );
});

export default AlumnoDetalleHeader;
