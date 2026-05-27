import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import Swal from 'sweetalert2';
import 'bootstrap-icons/font/bootstrap-icons.css';

/**  Esta Pantalla es el contenedor principal de toda la aplicacion, contiene el sidebar, header y el espacio para mostrar cada pantalla segun la ruta seleccionada en el sidebar. Es el componente que se renderiza en App.jsx dentro de la ruta "/dashboard/*" y a su vez inyecta las rutas hijas (Dashboard, Pacientes, Agenda, etc) dentro del <Outlet /> del main.
*/
const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Dropdown del perfil abierto/cerrado
  const [menuOpen, setMenuOpen]   = useState(false);
  const menuRef                   = useRef(null);

  // Leemos los datos del usuario que guardo Login.jsx en localStorage al autenticarse
  const userName     = localStorage.getItem('userName')  || 'Usuario';
  const userRole     = localStorage.getItem('userRole')  || '';
  // Generamos las iniciales a partir del nombre completo (ej. "Juan Perez" -> "JP")
  const initials     = userName
    .split(' ')
    .map(w => w.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');

  // Cierra el dropdown si el usuario hace clic fuera de el
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setMenuOpen(false);
    const result = await Swal.fire({
      icon:              'question',
      title:             'Cerrar sesion',
      text:              'Estas seguro que deseas salir del sistema?',
      showCancelButton:  true,
      confirmButtonText: 'Si, salir',
      cancelButtonText:  'Cancelar',
      confirmButtonColor: '#dc3545',
      cancelButtonColor:  '#6c757d',
    });
    if (!result.isConfirmed) return;
    // Limpiamos todo el storage al cerrar sesion
    localStorage.clear();
    navigate('/');
  };

  return (
    <div className="app-container" style={{ display: 'flex', height: '100vh', width: '100vw' }}>

      {/* SIDEBAR */}
      <aside className="app-sidebar">
        <div className="sidebar-logo" onClick={() => navigate('/dashboard')} style={{ cursor: 'pointer' }}>
          DC.
        </div>

        <div className="sidebar-menu">
          <i className={`bi bi-house-door ${location.pathname === '/dashboard' ? 'active' : ''}`}
             onClick={() => navigate('/dashboard')} title="Inicio"></i>

          <i className={`bi bi-people ${location.pathname === '/pacientes' ? 'active' : ''}`}
             onClick={() => navigate('/pacientes')} title="Pacientes"></i>

          <i className={`bi bi-calendar3 ${location.pathname === '/agenda' ? 'active' : ''}`}
             onClick={() => navigate('/agenda')} title="Agenda"></i>

          <i className={`bi bi-person-badge ${location.pathname === '/usuarios' ? 'active' : ''}`}
             onClick={() => navigate('/usuarios')} title="Personal de Clinica"></i>

          <i className={`bi bi-tooth ${location.pathname === '/odontograma' ? 'active' : ''}`}
             onClick={() => navigate('/odontograma')} title="Odontograma"></i>
        </div>

        {/* Solo configuracion en el footer, el logout se movio al header */}
        <div className="sidebar-footer" style={{ marginTop: 'auto', paddingBottom: '20px' }}>
          <i className="bi bi-gear" title="Configuracion"></i>
        </div>
      </aside>

      <main className="app-content" style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* HEADER */}
        <header className="app-header">
          <div className="header-left">
            <h4 className="m-0 fw-bold text-primary">DentalCare ERP</h4>
          </div>

          <div className="header-right d-flex align-items-center gap-3">
            {/* Campana de notificaciones */}
            <i className="bi bi-bell text-muted" style={{ cursor: 'pointer' }}></i>

            {/* Avatar con dropdown de perfil y logout */}
            <div ref={menuRef} style={{ position: 'relative' }}>
              {/* Boton avatar: muestra iniciales del usuario logueado */}
              <div
                className="doctor-avatar"
                onClick={() => setMenuOpen(prev => !prev)}
                style={{ cursor: 'pointer', userSelect: 'none' }}
                title="Mi cuenta"
              >
                {initials}
              </div>

              {/* Dropdown: visible solo cuando menuOpen es true */}
              {menuOpen && (
                <div style={{
                  position:        'absolute',
                  top:             'calc(100% + 10px)',
                  right:           0,
                  minWidth:        '220px',
                  backgroundColor: '#fff',
                  borderRadius:    '12px',
                  boxShadow:       '0 8px 24px rgba(0,0,0,0.12)',
                  border:          '1px solid #e9ecef',
                  zIndex:          1000,
                  overflow:        'hidden',
                }}>

                  {/* Seccion de informacion del usuario */}
                  <div style={{ padding: '16px', borderBottom: '1px solid #f1f3f5', backgroundColor: '#f8fafc' }}>
                    <div className="d-flex align-items-center gap-2">
                      {/* Avatar pequeno dentro del dropdown */}
                      <div style={{
                        width: '38px', height: '38px', borderRadius: '50%',
                        backgroundColor: 'var(--primary, #0d6efd)',
                        color: '#fff', display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                        fontWeight: 700, fontSize: '0.85rem', flexShrink: 0,
                      }}>
                        {initials}
                      </div>
                      <div style={{ overflow: 'hidden' }}>
                        {/* Nombre completo del usuario */}
                        <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#212529',
                                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {userName}
                        </div>
                        {/* Rol del usuario */}
                        <div style={{ fontSize: '0.75rem', color: '#6c757d' }}>
                          {userRole}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Opcion: cerrar sesion */}
                  <div
                    onClick={handleLogout}
                    style={{
                      padding: '12px 16px', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: '10px',
                      color: '#dc3545', fontSize: '0.88rem', fontWeight: 500,
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#fff5f5'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <i className="bi bi-box-arrow-right"></i>
                    Cerrar sesion
                  </div>

                </div>
              )}
            </div>
          </div>
        </header>

        {/* Contenido de cada pantalla inyectado por React Router */}
        <div style={{ flexGrow: 1, overflow: 'auto' }}>
          <Outlet />
        </div>

      </main>
    </div>
  );
};

export default Layout;