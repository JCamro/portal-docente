import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import Header from './components/layout/Header';
import MobileDrawer from './components/layout/MobileDrawer';

// Lazy-loaded pages
const LoginPage = React.lazy(() => import('./pages/LoginPage'));
const DashboardPage = React.lazy(() => import('./pages/DashboardPage'));
const HorariosPage = React.lazy(() => import('./pages/HorariosPage'));
const AlumnosPage = React.lazy(() => import('./pages/AlumnosPage'));
const AsistenciaPage = React.lazy(() => import('./pages/AsistenciaPage'));
const HorasTrabajadasPage = React.lazy(() => import('./pages/HorasTrabajadasPage'));
const NotasPage = React.lazy(() => import('./pages/NotasPage'));
const PagosPage = React.lazy(() => import('./pages/PagosPage'));

const AuthRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

// Navigation items for the drawer
const navItems = [
  {
    label: 'Dashboard',
    to: '/',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
      </svg>
    ),
  },
  {
    label: 'Mis Horarios',
    to: '/horarios',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
  {
    label: 'Mis Alumnos',
    to: '/alumnos',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    label: 'Asistencia',
    to: '/asistencia',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
  },
  {
    label: 'Horas Trabajadas',
    to: '/horas-trabajadas',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
  {
    label: 'Notas de Clase',
    to: '/notas',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
      </svg>
    ),
  },
  {
    label: 'Mis Pagos',
    to: '/pagos',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
  },
];

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      <Header
        title="Portal Docente"
        onMenuClick={() => setDrawerOpen(true)}
      />
      <MobileDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        items={navItems}
      />
      <main style={{
        minHeight: 'calc(100vh - 120px)',
        background: 'var(--color-bg)',
      }}>
        {children}
      </main>
    </>
  );
};

const ProtectedAppLayout: React.FC = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return (
    <AppLayout>
      <Routes>
        <Route index element={<DashboardPage />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="horarios" element={<HorariosPage />} />
        <Route path="alumnos" element={<AlumnosPage />} />
        <Route path="asistencia" element={<AsistenciaPage />} />
        <Route path="horas-trabajadas" element={<HorasTrabajadasPage />} />
        <Route path="notas" element={<NotasPage />} />
        <Route path="pagos" element={<PagosPage />} />
      </Routes>
    </AppLayout>
  );
};

const App: React.FC = () => {
  return (
    <React.Suspense
      fallback={
        <div className="flex items-center justify-center" style={{ minHeight: '100vh' }}>
          <div className="skeleton" style={{ width: '200px', height: '20px' }} />
        </div>
      }
    >
      <BrowserRouter>
        <Routes>
          <Route
            path="/login"
            element={
              <AuthRoute>
                <LoginPage />
              </AuthRoute>
            }
          />
          <Route path="/*" element={<ProtectedAppLayout />} />
        </Routes>
      </BrowserRouter>
    </React.Suspense>
  );
};

export default App;
