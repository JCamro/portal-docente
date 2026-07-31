import React, { memo, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { getDashboard } from '../api/portalDocente';
import type { DashboardDocente } from '../types';
import Loading from '../components/ui/Loading';
import ErrorState from '../components/ui/ErrorState';
import EmptyState from '../components/ui/EmptyState';
import KpiCard from '../components/ui/KpiCard';
import { useWindowWidth } from '../hooks/useWindowWidth';

const DashboardPage = memo(() => {
  const navigate = useNavigate();
  const cicloActivo = useAuthStore((s) => s.cicloActivo);
  const width = useWindowWidth();
  const isMobile = width <= 768;

  const [data, setData] = useState<DashboardDocente | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [horasShowMes, setHorasShowMes] = useState(false);

  const toggleHoras = useCallback(() => setHorasShowMes((v) => !v), []);

  const fetchData = async () => {
    if (!cicloActivo) {
      setLoading(false);
      return;
    }

    setLoading(true);

    setError(null);

    try {
      const result = await getDashboard(cicloActivo.id);
      setData(result);
      
    } catch {
      setError('Error al cargar el dashboard');
    
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
  }, [cicloActivo?.id]);

  if (!cicloActivo) {
    return (
      <div style={{ padding: 'var(--space-lg)' }}>
        <EmptyState
          message="Selecciona un ciclo"
          description="Elige un ciclo académico desde el selector en la parte superior."
        />
      </div>
    );
  }

  if (loading) return <Loading message="Cargando dashboard..." />;
  if (error) return <ErrorState message={error} onRetry={fetchData} />;
  if (!data) return <EmptyState message="No hay datos disponibles" />;

  const quickLinks = [
    
    {
      title: 'Mis Alumnos',
      description: 'Cartilla de alumnos y horarios',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
      onClick: () => navigate('/alumnos'),
    },

    {
      title: 'Mis Horarios',
      description: 'Consulta tu horario semanal',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      ),
      onClick: () => navigate('/horarios'),
    },

    {
      title: 'Horas Trabajadas',
      description: 'Historial de horas trabajadas',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      ),
      onClick: () => navigate('/horas-trabajadas'),
    },

    {
      title: 'Mis Notas',
      description: 'Notas generadas por clase, taller o alumno',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
      ),
      onClick: () => navigate('/notas'),
    },

    {
      title: 'Mis Pagos',
      description: 'Historial de pagos y movimientos',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="1" x2="12" y2="23" />
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      ),
      onClick: () => navigate('/pagos'),
    },
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
          Dashboard
        </h1>

        <span style={{
          fontSize: 'var(--text-sm)',
          color: 'var(--color-text-muted)',
        }}>
          {cicloActivo.nombre}
        </span>
        
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
        gap: 'var(--space-4)',
      }}>

        <KpiCard
          label="Clases hoy"
          value={data.clases_hoy}
          color="var(--color-gold)"
          icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          }
        />

        <KpiCard
          label="Total alumnos"
          value={data.total_alumnos}
          color="var(--color-success)"
          icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          }
        />

        <div
          onClick={toggleHoras}
          style={{ cursor: 'pointer' }}
          title="Clic para alternar horas del día / mes"
        >
          <KpiCard
            label={horasShowMes ? 'Horas este mes' : 'Horas hoy'}
            value={`${(horasShowMes ? data.horas_mes : data.horas_dia).toFixed(1)}h`}
            color="#3b82f6"
            icon={
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            }
          />
        </div>
        
      </div>

      {/* Quick Links — 3 permanentes */}
      <div style={{
        marginTop: 'var(--space-8)',
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : 'repeat(1, 1fr)',
        gap: 'var(--space-4)',
      }}>

        {quickLinks.map( (link) => (
          <QuickLink key={link.title} {...link} />
        ))}

      </div>

      <style>{`
        @media (max-width: 768px) {
          .quick-links-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
});

interface QuickLinkProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
}

const QuickLink = React.memo<QuickLinkProps>(({ title, description, icon, onClick }) => (
  <div
    onClick={onClick}
    style={{
      background: 'var(--color-surface)',
      borderRadius: 'var(--radius-xl)',
      padding: 'var(--space-5)',
      boxShadow: 'var(--shadow-sm)',
      border: '1px solid var(--color-border)',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-4)',
      transition: 'transform 0.15s, box-shadow 0.15s',
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-2px)';
      e.currentTarget.style.boxShadow = 'var(--shadow-md)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
    }}
  >
    <div style={{
      width: 44,
      height: 44,
      borderRadius: 'var(--radius-lg)',
      background: 'var(--color-gold-glow)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'var(--color-gold)',
      flexShrink: 0,
    }}>
      {icon}
    </div>
    <div>
      <p style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-text)', margin: 0, marginBottom: 'var(--space-1)' }}>
        {title}
      </p>
      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', margin: 0 }}>
        {description}
      </p>
    </div>
  </div>
));

export default DashboardPage;
