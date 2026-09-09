import React, { useState } from 'react';

function Configuracion() {
  const [activeTab, setActiveTab] = useState('general');
  const [sessionTimeout, setSessionTimeout] = useState('15');
  const [notifications, setNotifications] = useState({ email: true, sysAlerts: true });
  const [savedMessage, setSavedMessage] = useState(false);

  const handleSave = () => {
    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 3000);
  };

  return (
    <div className="page" style={{ padding: '24px', backgroundColor: '#f0f7f7', minHeight: '100vh' }}>
      
      {/* Encabezado */}
      <div className="page-header" style={{ marginBottom: '24px' }}>
        <div>
          <h1 style={{ color: '#0f4c5c', margin: 0, fontSize: '28px' }}>Configuración</h1>
          <p style={{ color: '#5a738e', marginTop: '4px' }}>Preferencias del sistema y gestión del CRM</p>
        </div>
      </div>

      {/* Menú de Pestañas */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', borderBottom: '2px solid #e0ecee', paddingBottom: '8px' }}>
        {[
          { id: 'general', label: 'General y Preferencias' },
          { id: 'seguridad', label: 'Seguridad y Accesos' },
          { id: 'sistema', label: 'Información Técnica' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              background: activeTab === tab.id ? '#0f4c5c' : 'transparent',
              color: activeTab === tab.id ? '#ffffff' : '#5a738e',
              border: 'none',
              padding: '10px 18px',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Contenido interactivo según la pestaña */}
      {activeTab === 'general' && (
        <div className="config-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          
          <div className="config-card" style={{ background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
            <h2 style={{ color: '#0f4c5c', fontSize: '18px', marginTop: 0 }}>Parámetros de Sesión</h2>
            
            <div style={{ margin: '16px 0' }}>
              <label style={{ display: 'block', fontSize: '14px', color: '#5a738e', marginBottom: '6px' }}>Cierre automático por inactividad</label>
              <select 
                value={sessionTimeout} 
                onChange={(e) => setSessionTimeout(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d0dfe2' }}
              >
                <option value="15">15 minutos (Recomendado)</option>
                <option value="30">30 minutos</option>
                <option value="60">1 hora</option>
              </select>
            </div>
          </div>

          <div className="config-card" style={{ background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
            <h2 style={{ color: '#0f4c5c', fontSize: '18px', marginTop: 0 }}>Notificaciones de Pacientes</h2>
            
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '12px 0', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={notifications.email} 
                onChange={(e) => setNotifications({...notifications, email: e.target.checked})}
              />
              <span style={{ fontSize: '14px', color: '#2b3a4a' }}>Alertas por correo electrónico</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '12px 0', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={notifications.sysAlerts} 
                onChange={(e) => setNotifications({...notifications, sysAlerts: e.target.checked})}
              />
              <span style={{ fontSize: '14px', color: '#2b3a4a' }}>Notificaciones internas de nuevos registros</span>
            </label>
          </div>

        </div>
      )}

      {activeTab === 'seguridad' && (
        <div className="config-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          
          <div className="config-card" style={{ background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
            <h2 style={{ color: '#0f4c5c', fontSize: '18px', marginTop: 0 }}>Autenticación en Dos Pasos (2FA)</h2>
            <p style={{ fontSize: '13px', color: '#5a738e' }}>Protección reforzada mediante código de correo obligatorio para roles médicos/administrativos.</p>
            <div style={{ marginTop: '15px' }}>
              <span style={{ padding: '6px 12px', background: '#e6f7f5', color: '#0f4c5c', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>
                ● ACTIVO
              </span>
            </div>
          </div>

          <div className="config-card" style={{ background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
            <h2 style={{ color: '#0f4c5c', fontSize: '18px', marginTop: 0 }}>Gestión de Accesos</h2>
            <button 
              onClick={() => alert("Simulación: Se ha enviado un correo para restablecer la contraseña.")}
              style={{ padding: '10px 16px', background: 'transparent', border: '1px solid #0f4c5c', color: '#0f4c5c', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              Cambiar Contraseña
            </button>
          </div>

        </div>
      )}

      {activeTab === 'sistema' && (
        <div className="config-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          
          <div className="config-card" style={{ background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
            <h2 style={{ color: '#0f4c5c', fontSize: '18px', marginTop: 0 }}>Información del sistema</h2>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f0f0f0' }}><span>Nombre</span><strong>SaludData CRM</strong></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f0f0f0' }}><span>Sector</span><strong>Salud (Hospital María Auxiliadora)</strong></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0' }}><span>Versión</span><strong>2.0.0</strong></div>
          </div>

          <div className="config-card" style={{ background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
            <h2 style={{ color: '#0f4c5c', fontSize: '18px', marginTop: 0 }}>Tecnologías</h2>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f0f0f0' }}><span>Frontend</span><strong>React + Vite</strong></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f0f0f0' }}><span>Backend</span><strong>Python + FastAPI</strong></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f0f0f0' }}><span>Base de datos</span><strong>Supabase (PostgreSQL)</strong></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0' }}><span>Seguridad</span><strong>Token firmado + correo</strong></div>
          </div>

        </div>
      )}

      {/* Botón de guardar simulado */}
      <div style={{ marginTop: '30px', display: 'flex', alignItems: 'center', gap: '15px' }}>
        <button 
          onClick={handleSave}
          style={{ background: '#0f4c5c', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          Guardar Cambios
        </button>
        {savedMessage && <span style={{ color: '#2e7d32', fontWeight: 'bold' }}>✓ Cambios simulados correctamente</span>}
      </div>

    </div>
  );
}

export default Configuracion;
