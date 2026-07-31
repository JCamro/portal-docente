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
const AlumnoDetallePage = React.lazy(() => import('./pages/AlumnoDetallePage'));
const HorasTrabajadasPage = React.lazy(() => import('./pages/HorasTrabajadasPage'));
const PagosPage = React.lazy(() => import('./pages/PagosPage'));
const NotesPage = React.lazy(() => import('./pages/NotesPage'));
const SeleccionCicloPage = React.lazy(() => import('./pages/SeleccionCicloPage'));

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
    label: 'Notas',
    to: '/notas',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
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
  const hasHydrated = useAuthStore((state) => state._hasHydrated);
  const cicloActivo = useAuthStore((state) => state.cicloActivo);

  // Wait for store to hydrate from localStorage before checking auth
  if (!hasHydrated) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'var(--color-bg)',
      }}>
        <div style={{
          width: 24,
          height: 24,
          border: '3px solid var(--color-border)',
          borderTopColor: 'var(--color-gold)',
          borderRadius: '50%',
          animation: 'spin 0.6s linear infinite',
        }} />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Show cycle selection screen when no cycle is active
  if (!cicloActivo) {
    return (
      <AppLayout>
        <SeleccionCicloPage />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Routes>
        <Route index element={<DashboardPage />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="horarios" element={<HorariosPage />} />
        <Route path="alumnos" element={<AlumnosPage />} />
        <Route path="alumnos/:alumnoId" element={<AlumnoDetallePage />} />
        <Route path="horas-trabajadas" element={<HorasTrabajadasPage />} />
        <Route path="pagos" element={<PagosPage />} />
        <Route path="notas" element={<NotesPage />} />
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
