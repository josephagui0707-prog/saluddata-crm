import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { NavLink, useNavigate } from "react-router-dom";
import { FaHeartbeat, FaHome, FaDatabase, FaChartBar, FaHistory, FaUsers, FaUserInjured, FaCog, FaSignOutAlt } from "react-icons/fa";
import { clearSession } from "../api.js";
function Sidebar() {
    const navigate = useNavigate();
    const logout = () => {
        clearSession();
        navigate('/login');
    };
    const itemClass = ({ isActive }) => `menu-item ${isActive ? "active" : ""}`;
    return (_jsxs("aside", { className: "sidebar", children: [_jsxs("div", { className: "logo", children: [_jsx("div", { className: "logo-icon", children: _jsx(FaHeartbeat, {}) }), _jsxs("div", { children: [_jsx("h2", { children: "SaludData" }), _jsx("span", { children: "CRM hospitalario" })] })] }), _jsxs("nav", { className: "menu", children: [_jsxs(NavLink, { to: "/", className: itemClass, children: [_jsx(FaHome, {}), _jsx("span", { children: "Inicio" })] }), _jsxs(NavLink, { to: "/importar-datos", className: itemClass, children: [_jsx(FaDatabase, {}), _jsx("span", { children: "Importar datos" })] }), _jsxs(NavLink, { to: "/pacientes", className: itemClass, children: [_jsx(FaUserInjured, {}), _jsx("span", { children: "Pacientes" })] }), _jsxs(NavLink, { to: "/reportes", className: itemClass, children: [_jsx(FaChartBar, {}), _jsx("span", { children: "Reportes" })] }), _jsxs(NavLink, { to: "/historial", className: itemClass, children: [_jsx(FaHistory, {}), _jsx("span", { children: "Historial" })] }), _jsxs(NavLink, { to: "/usuarios", className: itemClass, children: [_jsx(FaUsers, {}), _jsx("span", { children: "Usuarios" })] }), _jsxs(NavLink, { to: "/configuracion", className: itemClass, children: [_jsx(FaCog, {}), _jsx("span", { children: "Configuraci\u00F3n" })] })] }), _jsxs("button", { type: "button", className: "menu-item logout logout-button", onClick: logout, children: [_jsx(FaSignOutAlt, {}), _jsx("span", { children: "Cerrar sesi\u00F3n" })] })] }));
}
export default Sidebar;
