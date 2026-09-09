import React, { useState } from 'react';
import { getCurrentUser } from '../api';
import { 
  FaBell, 
  FaUser, 
  FaCog, 
  FaSignOutAlt, 
  FaChevronDown,
  FaCheckCircle 
} from 'react-icons/fa';

function Header() {
  // LÓGICA ORIGINAL INTACTA
  const user = getCurrentUser() || { name: 'Usuario', role: '' };
  const initials = user.name ? user.name.split(' ').slice(0, 2).map(p => p[0]).join('').toUpperCase() : 'US';

  // Estados locales independientes para la interactividad visual
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="header">
      {/* Sección Izquierda: Título y estado */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <h1>SaludData CRM</h1>
          <span style={{ 
            fontSize: '11px', 
            background: '#e6f7f5', 
            color: '#0f4c5c', 
            padding: '2px 8px', 
            borderRadius: '12px', 
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <FaCheckCircle style={{ fontSize: '9px', color: '#10b981' }} /> En línea
          </span>
        </div>
        <p>Gestión y análisis de datos del Hospital María Auxiliadora</p>
      </div>

      {/* Sección Derecha: Notificaciones y Usuario */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        
        {/* Campana de Notificaciones (Simulada) */}
        <div style={{ position: 'relative' }}>
          <button 
            type="button"
            onClick={() => { setShowNotifications(!showNotifications); setShowUserMenu(false); }}
            style={{ 
              background: 'transparent', 
              border: 'none', 
              cursor: 'pointer', 
              position: 'relative',
              padding: '6px',
              color: '#5a738e',
              fontSize: '16px',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <FaBell />
            <span style={{
              position: 'absolute',
              top: '4px',
              right: '4px',
              width: '7px',
              height: '7px',
              backgroundColor: '#ef4444',
              borderRadius: '50%',
              border: '2px solid #fff'
            }} />
          </button>

          {/* Menú Flotante de Notificaciones */}
          {showNotifications && (
            <div style={{
              position: 'absolute',
              right: 0,
              top: '38px',
              width: '240px',
              backgroundColor: '#fff',
              boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              zIndex: 100,
              padding: '12px'
            }}>
              <p style={{ margin: 0, fontWeight: 'bold', fontSize: '12px', color: '#0f4c5c', borderBottom: '1px solid #f1f5f9', paddingBottom: '6px' }}>
                Notificaciones
              </p>
              <div style={{ padding: '8px 0', fontSize: '12px', color: '#475569' }}>
                <p style={{ margin: 0, fontWeight: '500' }}>Dataset hospitalario cargado</p>
                <small style={{ color: '#94a3b8' }}>Supabase sincronizado</small>
              </div>
            </div>
          )}
        </div>

        {/* Separador sutil */}
        <div style={{ height: '20px', width: '1px', backgroundColor: '#e2e8f0' }} />

        {/* Lógica e Información de Usuario Original + Menú Desplegable */}
        <div style={{ position: 'relative' }}>
          <div 
            className="user-info"
            onClick={() => { setShowUserMenu(!showUserMenu); setShowNotifications(false); }}
            style={{ cursor: 'pointer', userSelect: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <div>
              <strong>{user.name}</strong>
              <p>{user.role}</p>
            </div>
            
            <div className="user-avatar">
              {initials || 'US'}
            </div>

            <FaChevronDown style={{ fontSize: '10px', color: '#94a3b8', marginLeft: '2px' }} />
          </div>

          {/* Menú Flotante del Usuario */}
          {showUserMenu && (
            <div style={{
              position: 'absolute',
              right: 0,
              top: '48px',
              width: '160px',
              backgroundColor: '#fff',
              boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              zIndex: 100,
              overflow: 'hidden'
            }}>
              <div 
                style={{ padding: '8px 12px', fontSize: '12px', color: '#334155', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
                onClick={() => setShowUserMenu(false)}
              >
                <FaUser style={{ color: '#64748b' }} /> Mi Perfil
              </div>
              <div 
                style={{ padding: '8px 12px', fontSize: '12px', color: '#334155', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
                onClick={() => setShowUserMenu(false)}
              >
                <FaCog style={{ color: '#64748b' }} /> Ajustes
              </div>
              <div style={{ borderTop: '1px solid #f1f5f9' }} />
              <div 
                style={{ padding: '8px 12px', fontSize: '12px', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: '500' }}
                onClick={() => {
                  setShowUserMenu(false);
                  // Aquí puedes colocar tu lógica de logout si la tienes, o mantenerla en el Sidebar
                }}
              >
                <FaSignOutAlt /> Salir
              </div>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}

export default Header;
