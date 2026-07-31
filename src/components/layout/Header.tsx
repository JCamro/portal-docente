import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import logoTaller from '../../assets/logo-taller.png';

interface HeaderProps {
  title: string;
  onMenuClick?: () => void;
}

const MenuIcon: React.FC<{ size?: number }> = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

const ChevronDownIcon: React.FC<{ size?: number }> = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

function getInitials(nombre?: string, apellido?: string): string {
  const n = (nombre ?? '').charAt(0);
  const a = (apellido ?? '').charAt(0);
  return (n + a).toUpperCase() || '?';
}

const Header: React.FC<HeaderProps> = ({ title, onMenuClick }) => {
  const navigate = useNavigate();
  const profesor = useAuthStore((s) => s.profesor);
  const cicloActivo = useAuthStore((s) => s.cicloActivo);
  const ciclos = useAuthStore((s) => s.ciclos);
  const setCicloActivo = useAuthStore((s) => s.setCicloActivo);

  const [showCycleDropdown, setShowCycleDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const initials = getInitials(profesor?.nombre, profesor?.apellido);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowCycleDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCycleSelect = (ciclo: typeof cicloActivo) => {
    if (!ciclo) return;
    setCicloActivo(ciclo);
    setShowCycleDropdown(false);
    navigate('/dashboard', { replace: true });
  };

  return (
    <header className="header-dark">
      <div className="header-inner">
        {/* Menu + Brand */}
        <div className="header-left">
          <button className="mobile-menu-btn" onClick={onMenuClick} aria-label="Menú">
            <MenuIcon />
          </button>
          <div className="header-brand">
            <img src={logoTaller} alt="Elguera" className="header-logo" />
            <span className="header-title">{title}</span>
          </div>
        </div>

        {/* Desktop: cycle + user */}
        <div className="header-right hide-mobile">
          <div className="cycle-selector" ref={dropdownRef}>
            <button
              className="cycle-btn"
              onClick={() => setShowCycleDropdown(!showCycleDropdown)}
            >
              <span className="cycle-name">
                {cicloActivo?.nombre ?? 'Seleccionar ciclo'}
              </span>
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

          <div className="header-user">
            <div className="user-avatar">{initials}</div>
            <span className="user-name-text">
              {profesor?.nombre}
            </span>
          </div>
        </div>

        {/* Mobile: user avatar only */}
        <div className="header-right-mobile hide-desktop">
          <div className="user-avatar user-avatar-sm">{initials}</div>
        </div>
      </div>

      {/* Mobile: cycle selector bar */}
      <div className="mobile-cycle-bar hide-desktop">
        <span className="user-ciclo">{profesor?.nombre} {profesor?.apellido}</span>
        <span className="user-ciclo-sep">·</span>
        <span className="user-ciclo">{cicloActivo?.nombre}</span>
      </div>

      <style>{`
        .header-dark {
          background: linear-gradient(180deg, #0d0d0d 0%, #141414 100%);
          border-bottom: 1px solid rgba(212, 175, 55, 0.25);
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .header-inner {
          max-width: 1200px;
          margin: 0 auto;
          padding: 10px var(--space-5);
          display: flex;
          align-items: center;
          justify-content: space-between;
          min-height: 56px;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: var(--space-3);
        }

        .header-brand {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .header-logo {
          width: 34px;
          height: 34px;
          object-fit: contain;
          border-radius: 8px;
          box-shadow: 0 0 12px rgba(212, 175, 55, 0.2);
        }

        .header-title {
          font-family: var(--font-heading);
          font-size: var(--text-lg);
          font-weight: 700;
          color: var(--color-gold);
          letter-spacing: 0.02em;
        }

        .header-right {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .header-right-mobile {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .mobile-menu-btn {
          padding: 8px;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.10);
          border-radius: 10px;
          color: rgba(255, 255, 255, 0.7);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 150ms, color 150ms;
        }

        .mobile-menu-btn:hover {
          background: rgba(255, 255, 255, 0.12);
          color: var(--color-gold);
        }

        /* Cycle Selector */
        .cycle-selector {
          position: relative;
        }

        .cycle-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          background: rgba(212, 175, 55, 0.10);
          border: 1px solid rgba(212, 175, 55, 0.20);
          border-radius: 20px;
          color: var(--color-gold);
          cursor: pointer;
          font-size: var(--text-xs);
          font-weight: 600;
          font-family: var(--font-body);
          transition: background 150ms, border-color 150ms;
        }

        .cycle-btn:hover {
          background: rgba(212, 175, 55, 0.18);
          border-color: rgba(212, 175, 55, 0.35);
        }

        .cycle-name {
          max-width: 130px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .cycle-dropdown {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          background: #1a1a2e;
          border: 1px solid rgba(212, 175, 55, 0.25);
          border-radius: 12px;
          overflow: hidden;
          min-width: 200px;
          z-index: 200;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
        }

        .cycle-option {
          width: 100%;
          padding: 10px 16px;
          background: none;
          border: none;
          color: rgba(255, 255, 255, 0.75);
          font-size: var(--text-sm);
          font-family: var(--font-body);
          text-align: left;
          cursor: pointer;
          transition: background 120ms, color 120ms;
        }

        .cycle-option:hover {
          background: rgba(255, 255, 255, 0.06);
          color: #fff;
        }

        .cycle-option.active {
          background: rgba(212, 175, 55, 0.12);
          color: var(--color-gold);
          font-weight: 600;
        }

        /* User area */
        .header-user {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .user-avatar {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--color-gold) 0%, #b8960f 100%);
          color: #1a1a2e;
          font-size: var(--text-xs);
          font-weight: 700;
          font-family: var(--font-body);
          display: flex;
          align-items: center;
          justify-content: center;
          letter-spacing: 0.05em;
          flex-shrink: 0;
        }

        .user-avatar-sm {
          width: 30px;
          height: 30px;
          font-size: 11px;
        }

        .user-name-text {
          font-family: var(--font-body);
          font-size: var(--text-sm);
          font-weight: 600;
          color: rgba(255, 255, 255, 0.85);
          max-width: 100px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        /* Mobile cycle bar */
        .mobile-cycle-bar {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 8px var(--space-4);
          border-top: 1px solid rgba(255, 255, 255, 0.06);
          background: rgba(0, 0, 0, 0.15);
        }

        .user-ciclo {
          font-family: var(--font-body);
          font-size: var(--text-xs);
          color: rgba(255, 255, 255, 0.55);
          font-weight: 500;
        }

        .user-ciclo-sep {
          color: rgba(255, 255, 255, 0.2);
          font-size: var(--text-xs);
        }

        @media (max-width: 768px) {
          .header-inner {
            padding: 8px var(--space-4);
            min-height: 50px;
          }
          .header-title {
            font-size: var(--text-base);
          }
          .header-logo {
            width: 28px;
            height: 28px;
          }
          .header-brand {
            gap: 8px;
          }
        }
      `}</style>
    </header>
  );
};

export default React.memo(Header);
