import { memo, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { getDashboard } from '../api/portalDocente';
import type { DashboardDocente } from '../types';
import Loading from '../components/ui/Loading';
import ErrorState from '../components/ui/ErrorState';
import EmptyState from '../components/ui/EmptyState';
import { useWindowWidth } from '../hooks/useWindowWidth';

const DashboardPage = memo(() => {
  const navigate = useNavigate();
  const cicloActivo = useAuthStore((s) => s.cicloActivo);
  const profesor = useAuthStore((s) => s.profesor);
  const width = useWindowWidth();
  const isMobile = width <= 768;

  const [data, setData] = useState<DashboardDocente | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [horasShowMes, setHorasShowMes] = useState(false);

  const toggleHoras = useCallback(() => setHorasShowMes((v) => !v), []);

  const fetchData = async () => {
    if (!cicloActivo) { setLoading(false); return; }
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
    const run = async () => { if (!cancelled) await fetchData(); };
    run();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cicloActivo?.id]);

  if (!cicloActivo) {
    return (
      <div style={{ padding: 'var(--space-lg)' }}>
        <EmptyState message="Selecciona un ciclo" description="Elige un ciclo académico desde el selector en la parte superior." />
      </div>
    );
  }

  if (loading) return <Loading message="Cargando dashboard..." />;
  if (error) return <ErrorState message={error} onRetry={fetchData} />;
  if (!data) return <EmptyState message="No hay datos disponibles" />;

  const horasValor = horasShowMes ? data.horas_mes : data.horas_dia;
  const horasLabel = horasShowMes ? 'Este mes' : 'Hoy';
  const profesorNombre = profesor ? profesor.nombre : 'Docente';

  const horaActual = new Date().getHours();
  let saludo = 'Hola de nuevo!';
  if (horaActual >= 12 && horaActual < 18) saludo = 'Buenas tardes';
  else if (horaActual >= 18) saludo = 'Buenas noches';

  const cardHover = (color: string) => ({
    onMouseEnter: (e: React.MouseEvent<HTMLDivElement>) => {
      e.currentTarget.style.transform = 'translateY(-2px)';
      e.currentTarget.style.boxShadow = `0 8px 24px ${color}20`;
    },
    onMouseLeave: (e: React.MouseEvent<HTMLDivElement>) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = 'none';
    },
  });

  return (
    <div style={{ minHeight: '100%', background: '#f8f9fc' }}>
      {/* Hero */}
      <div style={{
        background: 'linear-gradient(160deg, #0f172a 0%, #1e293b 60%, #334155 100%)',
        padding: isMobile ? 'var(--space-8) var(--space-5) var(--space-8)' : 'var(--space-12) var(--space-10) var(--space-10)',
        color: '#fff',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -60, right: -60, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(212,175,55,0.15) 0%, transparent 70%)' }} />
        <div style={{ position: 'absolute', bottom: -40, left: '30%', width: 150, height: 150, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)' }} />
        <div style={{ position: 'absolute', top: '20%', right: '10%', fontSize: isMobile ? '60px' : '100px', opacity: 0.04, fontFamily: 'serif', transform: 'rotate(-10deg)', userSelect: 'none', lineHeight: 1 }}>♪</div>
        <div style={{ position: 'absolute', bottom: '15%', right: '25%', fontSize: isMobile ? '40px' : '70px', opacity: 0.05, fontFamily: 'serif', transform: 'rotate(15deg)', userSelect: 'none', lineHeight: 1 }}>♫</div>

        <div style={{ maxWidth: 1200, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <p style={{ fontSize: 'var(--text-xs)', color: 'rgba(255,255,255,0.5)', margin: 0, fontWeight: 500, letterSpacing: '0.15em', textTransform: 'uppercase' }}>{saludo}</p>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: isMobile ? 'var(--text-3xl)' : '40px', margin: 'var(--space-2) 0 var(--space-3)', fontWeight: 400, color: '#fff' }}>{profesorNombre}</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
            <span style={{ background: 'var(--color-gold)', color: '#0f172a', fontSize: '11px', fontWeight: 700, padding: '5px 12px', borderRadius: 'var(--radius-full)', letterSpacing: '0.03em' }}>{cicloActivo.nombre}</span>
            {data.clases_hoy > 0 && <span style={{ fontSize: 'var(--text-sm)', color: 'rgba(255,255,255,0.6)' }}>{data.clases_hoy} {data.clases_hoy === 1 ? 'clase' : 'clases'} hoy</span>}
          </div>
        </div>
      </div>

      {/* Stats floating */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: isMobile ? '0 var(--space-4)' : '0 var(--space-10)', marginTop: isMobile ? 'var(--space-5)' : 'var(--space-6)', position: 'relative', zIndex: 10 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-3)' }}>
          {[
            { value: horasValor.toFixed(1), label: horasLabel, color: '#3b82f6', onClick: toggleHoras },
            { value: data.clases_hoy.toString(), label: 'Clases', color: 'var(--color-gold)', onClick: () => navigate('/horarios') },
            { value: data.total_alumnos.toString(), label: 'Alumnos', color: '#10b981', onClick: () => navigate('/alumnos') },
          ].map((stat) => (
            <div key={stat.label} onClick={stat.onClick} style={{ background: '#fff', borderRadius: 'var(--radius-lg)', padding: isMobile ? 'var(--space-4)' : 'var(--space-5) var(--space-4)', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s ease', border: '1px solid #e5e7eb' }} {...cardHover(stat.color)}>
              <p style={{ fontSize: isMobile ? 'var(--text-2xl)' : 'var(--text-3xl)', fontWeight: 700, color: stat.color, margin: 0, fontFamily: 'var(--font-heading)', lineHeight: 1 }}>{stat.value}</p>
              <p style={{ fontSize: '10px', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.12em', margin: '6px 0 0', fontWeight: 600 }}>{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: isMobile ? 'var(--space-6) var(--space-4)' : 'var(--space-8) var(--space-10)' }}>
        {!isMobile ? (
          /* Desktop: flexbox */
          <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'stretch' }}>
            {/* Alumnos - fixed width, full height */}
            <div onClick={() => navigate('/alumnos')} style={{ background: 'linear-gradient(135deg, var(--color-gold) 0%, #c9a227 100%)', borderRadius: 'var(--radius-xl)', padding: 'var(--space-6)', cursor: 'pointer', flex: '0 0 300px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative', overflow: 'hidden', boxShadow: '0 4px 24px rgba(212,175,55,0.25)', transition: 'all 0.25s ease' }} {...cardHover('rgba(212,175,55,0.4)')}>
              <div style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.12)' }} />
              <div style={{ position: 'relative', zIndex: 1 }}>
                <p style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(0,0,0,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>Mis Alumnos</p>
                <p style={{ fontSize: '56px', fontWeight: 700, color: '#0f172a', margin: '4px 0 0', fontFamily: 'var(--font-heading)', lineHeight: 1 }}>{data.total_alumnos}</p>
              </div>
              <p style={{ fontSize: 'var(--text-sm)', color: 'rgba(0,0,0,0.6)', margin: 0, position: 'relative', zIndex: 1 }}>Cartilla completa →</p>
            </div>

            {/* Right column */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {[
                { label: 'Mis Horarios', desc: 'Consulta diaria, semanal e historica de horarios', color: '#6366f1', path: '/horarios' },
                { label: 'Mis Horas Trabajadas', desc: 'Revision de horas trabajadas y alumnos asistentes de talleres asignados', color: '#3b82f6', path: '/horas-trabajadas' },
                { label: 'Mis Notas', desc: 'Guardar anotaciones', color: '#8b5cf6', path: '/notas' },
                { label: 'Mis Pagos', desc: 'Pagos realizados durante el ciclo', color: '#10b981', path: '/pagos' },
              ].map((item) => (
                <div key={item.label} onClick={() => navigate(item.path)} style={{ background: '#fff', borderRadius: 'var(--radius-lg)', padding: 'var(--space-4) var(--space-5)', boxShadow: '0 1px 8px rgba(0,0,0,0.04)', cursor: 'pointer', transition: 'all 0.2s ease', border: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} {...cardHover(item.color)}>
                  <div>
                    <p style={{ fontSize: '11px', fontWeight: 600, color: item.color, textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>{item.label}</p>
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', margin: '2px 0 0' }}>{item.desc}</p>
                  </div>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', margin: 0 }}>→</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Mobile */
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div onClick={() => navigate('/alumnos')} style={{ background: 'linear-gradient(135deg, var(--color-gold) 0%, #c9a227 100%)', borderRadius: 'var(--radius-xl)', padding: 'var(--space-5)', cursor: 'pointer', position: 'relative', overflow: 'hidden', boxShadow: '0 4px 24px rgba(212,175,55,0.25)' }}>
              <div style={{ position: 'absolute', top: -30, right: -30, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.12)' }} />
              <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(0,0,0,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>Mis Alumnos</p>
                  <p style={{ fontSize: '40px', fontWeight: 700, color: '#0f172a', margin: '4px 0 0', fontFamily: 'var(--font-heading)', lineHeight: 1 }}>{data.total_alumnos}</p>
                </div>
                <p style={{ fontSize: 'var(--text-lg)', color: 'rgba(0,0,0,0.4)', margin: 0 }}>→</p>
              </div>
            </div>

            {[
              { label: 'Mis Horarios', desc: 'Consulta dia, semana, historico ', color: '#6366f1', path: '/horarios' },
              { label: 'Mis Horas Trabajadas', desc: 'Revision de clases trabajadas', color: '#3b82f6', path: '/horas-trabajadas' },
              { label: 'Mis Notas', desc: 'Anotaciones del ciclo', color: '#8b5cf6', path: '/notas' },
              { label: 'Mis Pagos', desc: 'Pagos realizados en el ciclo', color: '#10b981', path: '/pagos' },
            ].map((item) => (
              <div key={item.label} onClick={() => navigate(item.path)} style={{ background: '#fff', borderRadius: 'var(--radius-lg)', padding: 'var(--space-4) var(--space-5)', boxShadow: '0 1px 8px rgba(0,0,0,0.04)', cursor: 'pointer', border: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ fontSize: '11px', fontWeight: 600, color: item.color, textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>{item.label}</p>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', margin: '2px 0 0' }}>{item.desc}</p>
                </div>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', margin: 0 }}>→</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
});

export default DashboardPage;
