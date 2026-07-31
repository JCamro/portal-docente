import { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useWindowWidth } from '../hooks/useWindowWidth';
import { formatDate } from '../utils/formatters';
import type { Ciclo } from '../types';

const SeleccionCicloPage = memo(() => {
  const navigate = useNavigate();
  const ciclos = useAuthStore((s) => s.ciclos);
  const profesor = useAuthStore((s) => s.profesor);
  const setCicloActivo = useAuthStore((s) => s.setCicloActivo);
  const width = useWindowWidth();
  const isMobile = width <= 768;

  const handleSelect = (ciclo: Ciclo) => {
    setCicloActivo(ciclo);
    navigate('/dashboard', { replace: true });
  };

  return (
    <div style={{
      padding: isMobile ? 'var(--space-4)' : 'var(--space-8)',
      maxWidth: 800,
      margin: '0 auto',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 'var(--space-6)',
    }}>
      {/* Greeting */}
      <div style={{ textAlign: 'center' }}>
        <p style={{
          fontSize: 'var(--text-sm)',
          color: 'var(--color-text-muted)',
          margin: 0,
        }}>
          ¡Hola{profesor ? `, ${profesor.nombre}` : ''}!
        </p>
        <h1 style={{
          fontFamily: 'var(--font-heading)',
          fontSize: isMobile ? 'var(--text-xl)' : 'var(--text-2xl)',
          color: 'var(--color-gold)',
          margin: 'var(--space-2) 0 0 0',
        }}>
          Selecciona un ciclo
        </h1>
        <p style={{
          fontSize: 'var(--text-sm)',
          color: 'var(--color-text-muted)',
          margin: 'var(--space-2) 0 0 0',
        }}>
          Elige el ciclo académico con el que deseas trabajar
        </p>
      </div>

      {/* Ciclo cards */}
      {ciclos.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: 'var(--space-10) var(--space-4)',
          color: 'var(--color-text-muted)',
        }}>
          <p style={{ fontSize: 'var(--text-base)', fontWeight: 600 }}>
            No tienes ciclos asignados
          </p>
          <p style={{ fontSize: 'var(--text-sm)', marginTop: 'var(--space-2)' }}>
            Contacta a secretaría para que te asignen a un ciclo académico.
          </p>
        </div>
      ) : (
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: 'var(--space-4)',
        width: '100%',
      }}>
        {ciclos.map((ciclo) => (
          <button
            key={ciclo.id}
            onClick={() => handleSelect(ciclo)}
            style={{
              background: 'var(--color-surface)',
              borderRadius: 'var(--radius-xl)',
              padding: isMobile ? 'var(--space-5)' : 'var(--space-6)',
              border: '1px solid var(--color-border)',
              cursor: 'pointer',
              textAlign: 'left',
              width: '100%',
              transition: 'transform 0.15s, box-shadow 0.15s, border-color 0.15s',
              fontFamily: 'var(--font-body)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-3)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = 'var(--shadow-md)';
              e.currentTarget.style.borderColor = 'var(--color-gold)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
              e.currentTarget.style.borderColor = 'var(--color-border)';
            }}
          >
            {/* Icon + Name */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
              <div style={{
                width: 48,
                height: 48,
                borderRadius: 'var(--radius-lg)',
                background: 'var(--color-gold-glow)',
                color: 'var(--color-gold)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 'var(--text-lg)',
                fontWeight: 700,
                flexShrink: 0,
              }}>
                {ciclo.nombre.charAt(0)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{
                  fontSize: 'var(--text-base)',
                  fontWeight: 600,
                  color: 'var(--color-text)',
                  margin: 0,
                }}>
                  {ciclo.nombre}
                </p>
                <p style={{
                  fontSize: 'var(--text-xs)',
                  color: 'var(--color-text-muted)',
                  margin: 'var(--space-1) 0 0 0',
                  textTransform: 'capitalize',
                }}>
                  {ciclo.tipo}
                </p>
              </div>
            </div>

            {/* Dates */}
            <div style={{
              display: 'flex',
              gap: 'var(--space-4)',
              fontSize: 'var(--text-xs)',
              color: 'var(--color-text-muted)',
            }}>
              <div>
                <span style={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: 10, display: 'block', marginBottom: 2 }}>
                  Inicio
                </span>
                {formatDate(ciclo.fecha_inicio)}
              </div>
              <div>
                <span style={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: 10, display: 'block', marginBottom: 2 }}>
                  Fin
                </span>
                {formatDate(ciclo.fecha_fin)}
              </div>
            </div>

            {/* CTA */}
            <div style={{
              marginTop: 'var(--space-1)',
              padding: 'var(--space-2) 0',
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--text-xs)',
              fontWeight: 600,
              color: 'var(--color-gold)',
              textAlign: 'center',
            }}>
              Entrar →
            </div>
          </button>
        ))}
      </div>
      )}
    </div>
  );
});

SeleccionCicloPage.displayName = 'SeleccionCicloPage';

export default SeleccionCicloPage;
