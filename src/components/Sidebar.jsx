import { NavLink, useNavigate } from "react-router-dom";
import { FaHeartbeat, FaHome, FaDatabase, FaChartBar, FaHistory, FaUsers, FaUserInjured, FaCog, FaSignOutAlt } from "react-icons/fa";
import { clearSession } from "../api";

function Sidebar() {
  const navigate = useNavigate();
  const logout = () => {
    clearSession();
    navigate('/login');
  };

  const itemClass = ({ isActive }) => `menu-item ${isActive ? "active" : ""}`;

  return (
    <aside className="sidebar">
      <div className="logo">
        <div className="logo-icon"><FaHeartbeat /></div>
        <div><h2>SaludData</h2><span>CRM hospitalario</span></div>
      </div>

      <nav className="menu">
        <NavLink to="/" className={itemClass}><FaHome /><span>Inicio</span></NavLink>
        <NavLink to="/importar-datos" className={itemClass}><FaDatabase /><span>Importar datos</span></NavLink>
        <NavLink to="/pacientes" className={itemClass}><FaUserInjured /><span>Pacientes</span></NavLink>
        <NavLink to="/reportes" className={itemClass}><FaChartBar /><span>Reportes</span></NavLink>
        <NavLink to="/historial" className={itemClass}><FaHistory /><span>Historial</span></NavLink>
        <NavLink to="/usuarios" className={itemClass}><FaUsers /><span>Usuarios</span></NavLink>
        <NavLink to="/configuracion" className={itemClass}><FaCog /><span>Configuración</span></NavLink>
      </nav>

      <button type="button" className="menu-item logout logout-button" onClick={logout}>
        <FaSignOutAlt /><span>Cerrar sesión</span>
      </button>
    </aside>
  );
}

export default Sidebar;
