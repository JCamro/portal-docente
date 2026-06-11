import React, { memo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { docenteLogin } from '../api/portalDocente';

const LoginPage = memo(() => {
  const navigate = useNavigate();
  const setTokens = useAuthStore((s) => s.setTokens);
  const setProfesor = useAuthStore((s) => s.setProfesor);
  const setCiclos = useAuthStore((s) => s.setCiclos);
  const setCicloActivo = useAuthStore((s) => s.setCicloActivo);

  const [dni, setDni] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmedDni = dni.trim();
    if (trimmedDni.length < 7 || trimmedDni.length > 15) {
      setError('El DNI debe tener entre 7 y 15 caracteres.');
      return;
    }

    setIsLoading(true);
    try {
      const data = await docenteLogin(trimmedDni);
      setTokens(data.access, data.refresh);
      setProfesor(data.user);
      setCiclos(data.ciclos);

      if (data.ciclos.length === 1) {
        setCicloActivo(data.ciclos[0]);
      }

      navigate('/', { replace: true });
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const resp = (err as { response?: { status?: number } }).response;
        if (resp?.status === 401) {
          setError('DNI no encontrado. Verifica tus datos e intenta nuevamente.');
        } else {
          setError('Error de conexión. Intenta más tarde.');
        }
      } else {
        setError('Error de conexión. Intenta más tarde.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-bg">
        <div className="bg-gradient" />
        <div className="bg-pattern" />
      </div>

      <div className="login-container">
        <div className="login-card">
          <div className="login-logo">
            <img src="/logo-taller.png" alt="Taller de Música Elguera" />
          </div>

          <div className="login-brand">
            <h1>Taller de Música Elguera</h1>
            <p>Portal del Docente</p>
          </div>

          <form onSubmit={handleLogin} noValidate className="login-form">
            <div className="form-group">
              <label htmlFor="dni" className="form-label">Número de DNI</label>
              <input
                id="dni"
                type="text"
                inputMode="text"
                pattern="[0-9A-Za-z\-]{7,15}"
                autoComplete="current-password"
                value={dni}
                onChange={(e) => setDni(e.target.value)}
                placeholder="Ej: 12345678"
                disabled={isLoading}
                className="form-input"
                maxLength={15}
              />
            </div>

            {error && (
              <div className="alert alert-error">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !dni.trim()}
              className="btn btn-primary btn-full"
            >
              {isLoading ? (
                <>
                  <span className="spinner" />
                  Ingresando...
                </>
              ) : (
                'Continuar'
              )}
            </button>
          </form>

          <p className="login-help">
            <a
              href="https://api.whatsapp.com/send?phone=51976331229"
              target="_blank"
              rel="noopener noreferrer"
            >
              Contacta a Secretaría
            </a>
          </p>
        </div>

        <div className="login-features">
          <div className="feature">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <span>Registra tu asistencia</span>
          </div>
          <div className="feature">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <span>Consulta tus horarios</span>
          </div>
          <div className="feature">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
            </svg>
            <span>Revisa tus pagos</span>
          </div>
        </div>
      </div>

      <style>{`
        .login-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: var(--space-4);
          position: relative;
          overflow: hidden;
        }

        .login-bg {
          position: fixed;
          inset: 0;
          z-index: 0;
        }

        .bg-gradient {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, #0a0a0a 0%, #141414 50%, #1a1a1a 100%);
        }

        .bg-pattern {
          position: absolute;
          inset: 0;
          background-image:
            radial-gradient(circle at 20% 50%, rgba(212, 175, 55, 0.08) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(212, 175, 55, 0.05) 0%, transparent 50%);
        }

        .login-container {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 400px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-6);
        }

        .login-card {
          width: 100%;
          background: #141414;
          border: 1px solid rgba(212, 175, 55, 0.2);
          border-radius: var(--radius-xl);
          padding: var(--space-8);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-6);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        }

        .login-logo {
          width: 80px;
          height: 80px;
          border-radius: var(--radius-lg);
          padding: var(--space-2);
        }

        .login-logo img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        .login-brand {
          text-align: center;
        }

        .login-brand h1 {
          font-family: var(--font-heading);
          font-size: var(--text-xl);
          color: var(--color-text-inverse);
          margin-bottom: var(--space-1);
          line-height: 1.3;
        }

        .login-brand p {
          font-size: var(--text-sm);
          color: var(--color-gold);
          text-transform: uppercase;
          letter-spacing: 0.1em;
          font-weight: 500;
          margin: 0;
        }

        .login-form {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
        }

        .form-label {
          font-size: var(--text-xs);
          font-weight: 600;
          color: rgba(255, 255, 255, 0.6);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .form-input {
          width: 100%;
          padding: var(--space-4);
          font-size: var(--text-base);
          font-family: var(--font-body);
          border: 2px solid rgba(255, 255, 255, 0.1);
          border-radius: var(--radius-md);
          background: #1a1a1a;
          color: var(--color-text-inverse);
          transition: all var(--transition-fast);
        }

        .form-input:focus {
          border-color: var(--color-gold);
          box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.15);
          background: #222222;
        }

        .form-input::placeholder {
          color: rgba(255, 255, 255, 0.3);
        }

        .form-input:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .alert {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          padding: var(--space-3) var(--space-4);
          border-radius: var(--radius-md);
          font-size: var(--text-sm);
          font-weight: 500;
        }

        .alert-error {
          background: rgba(239, 68, 68, 0.15);
          color: #fca5a5;
          border: 1px solid rgba(239, 68, 68, 0.3);
        }

        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: var(--space-2);
          padding: var(--space-4);
          border-radius: var(--radius-md);
          font-size: var(--text-sm);
          font-weight: 600;
          font-family: var(--font-body);
          transition: all var(--transition-fast);
          cursor: pointer;
          border: none;
          min-height: 48px;
        }

        .btn-primary {
          background: linear-gradient(135deg, var(--color-gold) 0%, var(--color-gold-dark) 100%);
          color: #0a0a0a;
          box-shadow: 0 4px 12px rgba(212, 175, 55, 0.3);
        }

        .btn-primary:hover:not(:disabled) {
          background: linear-gradient(135deg, var(--color-gold-light) 0%, var(--color-gold) 100%);
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(212, 175, 55, 0.4);
        }

        .btn-primary:active:not(:disabled) {
          transform: translateY(0);
        }

        .btn-primary:disabled {
          background: #404040;
          color: #888;
          cursor: not-allowed;
          box-shadow: none;
        }

        .btn-full {
          width: 100%;
        }

        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid transparent;
          border-top-color: currentColor;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .login-help {
          font-size: var(--text-sm);
          color: rgba(255, 255, 255, 0.4);
          text-align: center;
          margin: 0;
        }

        .login-help a {
          color: var(--color-gold);
        }

        .login-features {
          display: flex;
          gap: var(--space-6);
          justify-content: center;
        }

        .feature {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          color: rgba(255, 255, 255, 0.5);
          font-size: var(--text-xs);
        }

        .feature svg {
          color: var(--color-gold);
        }

        @media (max-width: 480px) {
          .login-card {
            padding: var(--space-6);
          }
          .login-logo {
            width: 64px;
            height: 64px;
          }
          .login-brand h1 {
            font-size: var(--text-lg);
          }
          .login-features {
            flex-direction: column;
            gap: var(--space-3);
            align-items: center;
          }
        }
      `}</style>
    </div>
  );
});

export default LoginPage;
