import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';

interface HeaderProps {
  title: string;
  onMenuClick?: () => void;
}

const LogoutIcon: React.FC<{ size?: number }> = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const MenuIcon: React.FC<{ size?: number }> = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

const ChevronDownIcon: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const Header: React.FC<HeaderProps> = ({ title, onMenuClick }) => {
  const navigate = useNavigate();
  const profesor = useAuthStore((s) => s.profesor);
  const cicloActivo = useAuthStore((s) => s.cicloActivo);
  const ciclos = useAuthStore((s) => s.ciclos);
  const setCicloActivo = useAuthStore((s) => s.setCicloActivo);
  const clearAuth = useAuthStore((s) => s.clearAuth);

  const [showCycleDropdown, setShowCycleDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowCycleDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    clearAuth();
    navigate('/login', { replace: true });
  };

  const handleCycleSelect = (ciclo: typeof cicloActivo) => {
    if (!ciclo) return;
    setCicloActivo(ciclo);
    setShowCycleDropdown(false);
    navigate('/', { replace: true });
  };

  return (
    <header className="header-dark">
      <div className="header-inner">
        <div className="header-left">
          <button
            className="mobile-menu-btn hide-desktop"
            onClick={onMenuClick}
            aria-label="Menú"
          >
            <MenuIcon />
          </button>
        </div>

        <div className="header-brand">
          <img src="/logo-taller.png" alt="Taller de Música Elguera" className="header-logo" />
          <span className="header-title">{title}</span>
        </div>

        <div className="header-right">
          {/* Cycle Selector (Desktop) */}
          <div className="cycle-selector hide-mobile" ref={dropdownRef}>
            <button
              className="cycle-btn"
              onClick={() => setShowCycleDropdown(!showCycleDropdown)}
            >
              <span className="cycle-name">{cicloActivo?.nombre ?? 'Seleccionar ciclo'}</span>
              <ChevronDownIcon />
            </button>
            {showCycleDropdown && ciclos.length > 1 && (
              <div className="cycle-dropdown">
                {ciclos.map((ciclo) => (
                  <button
                    key={ciclo.id}
                    className={`cycle-option ${ciclo.id === cicloActivo?.id ? 'active' : ''}`}
                    onClick={() => handleCycleSelect(ciclo)}
                  >
                    {ciclo.nombre}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* User Info (Desktop) */}
          <div className="header-user hide-mobile">
            <div className="user-info">
              <p className="user-name">{profesor?.nombre} {profesor?.apellido}</p>
            </div>
            <button onClick={handleLogout} className="btn-icon" aria-label="Cerrar sesión">
              <LogoutIcon />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile User Bar */}
      <div className="mobile-user-bar hide-desktop">
        <div className="user-info">
          <p className="user-name">{profesor?.nombre} {profesor?.apellido}</p>
          <p className="user-ciclo">{cicloActivo?.nombre}</p>
        </div>
        <button onClick={handleLogout} className="btn-icon" aria-label="Cerrar sesión">
          <LogoutIcon />
        </button>
      </div>

      <style>{`
        .header-dark {
          background: linear-gradient(180deg, var(--color-dark-bg) 0%, var(--color-dark-card) 100%);
          border-bottom: 1px solid var(--color-gold-border);
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .header-inner {
          max-width: 1200px;
          margin: 0 auto;
          padding: var(--space-3) var(--space-5);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: var(--space-2);
        }

        .header-brand {
          display: flex;
          align-items: center;
          gap: var(--space-3);
        }

        .header-logo {
          width: 36px;
          height: 36px;
          object-fit: contain;
          border-radius: var(--radius-sm);
        }

        .header-title {
          font-family: var(--font-heading);
          font-size: var(--text-lg);
          color: var(--color-gold);
        }

        .header-right {
          display: flex;
          align-items: center;
          gap: var(--space-4);
        }

        .mobile-menu-btn {
          padding: var(--space-2);
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: var(--radius-md);
          color: var(--color-text-inverse);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .cycle-selector {
          position: relative;
        }

        .cycle-btn {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          padding: var(--space-2) var(--space-3);
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: var(--radius-md);
          color: var(--color-text-inverse);
          cursor: pointer;
          font-size: var(--text-sm);
        }

        .cycle-btn:hover {
          background: rgba(255, 255, 255, 0.12);
        }

        .cycle-name {
          max-width: 150px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .cycle-dropdown {
          position: absolute;
          top: calc(100% + 4px);
          right: 0;
          background: var(--color-dark-card);
          border: 1px solid var(--color-gold-border);
          border-radius: var(--radius-md);
          overflow: hidden;
          min-width: 180px;
          z-index: 200;
          box-shadow: var(--shadow-lg);
        }

        .cycle-option {
          width: 100%;
          padding: var(--space-3) var(--space-4);
          background: none;
          border: none;
          color: var(--color-text-inverse);
          font-size: var(--text-sm);
          text-align: left;
          cursor: pointer;
        }

        .cycle-option:hover {
          background: rgba(255, 255, 255, 0.08);
        }

        .cycle-option.active {
          background: var(--color-gold-glow);
          color: var(--color-gold);
        }

        .header-user {
          display: flex;
          align-items: center;
          gap: var(--space-4);
        }

        .user-info {
          text-align: right;
        }

        .user-name {
          font-family: var(--font-body);
          font-size: var(--text-sm);
          font-weight: 600;
          color: var(--color-text-inverse);
          line-height: 1.3;
          margin: 0;
        }

        .user-ciclo {
          font-size: var(--text-xs);
          color: var(--color-text-muted);
          margin: 0;
        }

        .btn-icon {
          padding: var(--space-2);
          border-radius: var(--radius-md);
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.12);
          color: var(--color-text-muted);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .btn-icon:hover {
          background: var(--color-gold-glow);
          color: var(--color-gold);
          border-color: var(--color-gold-border);
        }

        .mobile-user-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--space-3) var(--space-5);
          border-top: 1px solid rgba(255, 255, 255, 0.08);
        }

        @media (max-width: 768px) {
          .header-inner {
            padding: var(--space-3) var(--space-4);
          }
          .header-title {
            font-size: var(--text-base);
          }
          .header-logo {
            width: 32px;
            height: 32px;
          }
        }
      `}</style>
    </header>
  );
};

export default React.memo(Header);
