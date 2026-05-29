import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import { getUserName, getUserRole, clearSession } from '../services/auth.service';
import { confirmDialog } from '../utils/alert.utils';
import 'bootstrap-icons/font/bootstrap-icons.css';

const NAV_ITEMS = [
  { path: '/dashboard', icon: 'bi-house-door',   label: 'Inicio'    },
  { path: '/pacientes', icon: 'bi-people',        label: 'Pacientes' },
  { path: '/agenda',    icon: 'bi-calendar3',     label: 'Agenda'    },
  { path: '/consulta',  icon: 'bi-heart-pulse',   label: 'Consultas' },
  { path: '/usuarios',  icon: 'bi-person-badge',  label: 'Personal'  },
];

const Layout = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef   = useRef(null);

  // Memoizado: localStorage no cambia durante la sesión
  const userName = useMemo(() => getUserName(), []);
  const userRole = useMemo(() => getUserRole(), []);
  const initials = useMemo(() =>
    userName.split(' ').map(w => w[0]?.toUpperCase() ?? '').slice(0, 2).join(''),
    [userName],
  );

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = async () => {
    setMenuOpen(false);
    const confirmed = await confirmDialog('¿Cerrar sesión?', '¿Estás seguro que deseas salir del sistema?', 'Sí, salir');
    if (!confirmed) return;
    clearSession();
    navigate('/');
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-surface">

      {/* ── SIDEBAR ─────────────────────────────────────────────────────────── */}
      <aside className="flex flex-col w-[60px] bg-white border-r border-slate-100
                        shadow-card flex-shrink-0 z-20">
        {/* Logo */}
        <button
          onClick={() => navigate('/dashboard')}
          aria-label="Ir al inicio"
          className="h-14 flex items-center justify-center text-primary-600 font-black
                     text-lg tracking-tight hover:bg-primary-50 transition-colors
                     border-b border-slate-100"
        >
          DC.
        </button>

        {/* Nav */}
        <nav className="flex-1 flex flex-col items-center gap-1.5 py-3" aria-label="Navegación principal">
          {NAV_ITEMS.map(({ path, icon, label }) => {
            const isActive = location.pathname === path ||
              (path !== '/dashboard' && location.pathname.startsWith(path));
            return (
              <button
                key={path}
                onClick={() => navigate(path)}
                title={label}
                aria-label={label}
                aria-current={isActive ? 'page' : undefined}
                className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg
                            transition-all duration-150 focus-visible:outline-2
                            focus-visible:outline-primary-500
                            ${isActive
                              ? 'bg-primary-600 text-white shadow-md shadow-primary-200/50'
                              : 'text-slate-400 hover:bg-slate-100 hover:text-slate-700'
                            }`}
              >
                <i className={`bi ${icon}`} />
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="pb-4 flex justify-center">
          <button
            title="Configuración"
            aria-label="Configuración"
            className="w-10 h-10 rounded-xl flex items-center justify-center text-lg
                       text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <i className="bi bi-gear" />
          </button>
        </div>
      </aside>

      {/* ── MAIN ────────────────────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col overflow-hidden">

        {/* HEADER */}
        <header className="h-14 bg-white border-b border-slate-100 flex items-center
                           justify-between px-5 flex-shrink-0 shadow-sm z-10">
          <div className="flex items-center gap-2">
            <span className="font-bold text-primary-700 tracking-tight">DentalCare</span>
            <span className="text-slate-300 text-sm font-normal">ERP</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Campana */}
            <button
              aria-label="Notificaciones"
              className="w-8 h-8 rounded-lg text-slate-400 hover:bg-slate-100
                         hover:text-slate-600 flex items-center justify-center transition-colors"
            >
              <i className="bi bi-bell text-sm" />
            </button>

            {/* Avatar con dropdown */}
            <div ref={menuRef} className="relative">
              <button
                onClick={() => setMenuOpen(p => !p)}
                aria-expanded={menuOpen}
                aria-haspopup="menu"
                aria-label="Menú de cuenta"
                className="w-8 h-8 rounded-full bg-primary-600 text-white text-xs font-bold
                           flex items-center justify-center hover:bg-primary-700
                           transition-colors select-none ring-2 ring-white"
              >
                {initials}
              </button>

              {menuOpen && (
                <div
                  role="menu"
                  className="absolute top-[calc(100%+8px)] right-0 w-56 bg-white
                             rounded-2xl shadow-xl shadow-slate-200/70 border border-slate-100
                             overflow-hidden z-50 animate-fade-in"
                >
                  {/* Info del usuario */}
                  <div className="px-4 py-3 bg-slate-50/80 border-b border-slate-100
                                  flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary-600 text-white text-xs
                                    font-bold flex items-center justify-center flex-shrink-0">
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">{userName}</p>
                      <p className="text-xs text-slate-500 truncate">{userRole}</p>
                    </div>
                  </div>

                  {/* Cerrar sesión */}
                  <button
                    role="menuitem"
                    onClick={handleLogout}
                    className="w-full px-4 py-3 flex items-center gap-3 text-sm font-medium
                               text-red-600 hover:bg-red-50 transition-colors text-left"
                  >
                    <i className="bi bi-box-arrow-right" />
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Contenido de la ruta activa */}
        <div className="flex-1 overflow-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
