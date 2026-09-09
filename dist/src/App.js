import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import Sidebar from "./components/Sidebar.js";
import Header from "./components/Header.js";
import Dashboard from "./pages/Dashboard.js";
import CargarDataset from "./pages/CargarDataset.js";
import Reportes from "./pages/Reportes.js";
import Historial from "./pages/Historial.js";
import Usuarios from "./pages/Usuarios.js";
import Pacientes from "./pages/Pacientes.js";
import Configuracion from "./pages/Configuracion.js";
import Login from "./pages/Login.js";
import { getToken } from "./api.js";
function AppLayout() {
    const location = useLocation();
    const loggedIn = Boolean(getToken());
    if (location.pathname === "/login") {
        return loggedIn ? _jsx(Navigate, { to: "/", replace: true }) : _jsx(Login, {});
    }
    if (!loggedIn) {
        return _jsx(Navigate, { to: "/login", replace: true });
    }
    return (_jsxs("div", { className: "app", children: [_jsx(Sidebar, {}), _jsxs("main", { className: "main-content", children: [_jsx(Header, {}), _jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(Dashboard, {}) }), _jsx(Route, { path: "/inicio", element: _jsx(Dashboard, {}) }), _jsx(Route, { path: "/importar-datos", element: _jsx(CargarDataset, {}) }), _jsx(Route, { path: "/pacientes", element: _jsx(Pacientes, {}) }), _jsx(Route, { path: "/reportes", element: _jsx(Reportes, {}) }), _jsx(Route, { path: "/historial", element: _jsx(Historial, {}) }), _jsx(Route, { path: "/usuarios", element: _jsx(Usuarios, {}) }), _jsx(Route, { path: "/configuracion", element: _jsx(Configuracion, {}) }), _jsx(Route, { path: "*", element: _jsx(Navigate, { to: "/", replace: true }) })] })] })] }));
}
export default function App() {
    return (_jsx(BrowserRouter, { children: _jsx(AppLayout, {}) }));
}
