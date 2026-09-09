import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { api, getCurrentUser } from '../api.js';
function Usuarios() {
    const current = getCurrentUser();
    const [usuarios, setUsuarios] = useState([]);
    const [mostrarModal, setMostrarModal] = useState(false);
    const [error, setError] = useState('');
    const [form, setForm] = useState({ name: '', username: '', email: '', password: '', role: 'Analista' });
    const cargar = () => api.get('/users').then(setUsuarios).catch(e => setError(e.message));
    useEffect(() => { if (current?.role === 'Administrador')
        cargar(); }, []);
    const crear = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await api.post('/users', form);
            setForm({ name: '', username: '', email: '', password: '', role: 'Analista' });
            setMostrarModal(false);
            cargar();
        }
        catch (err) {
            setError(err.message);
        }
    };
    const toggle = async (u) => { try {
        await api.patch(`/users/${u.id}/status`, { active: !u.active });
        cargar();
    }
    catch (err) {
        setError(err.message);
    } };
    if (current?.role !== 'Administrador')
        return _jsx("div", { className: "page", children: _jsxs("div", { className: "empty-state", children: [_jsx("h2", { children: "Acceso restringido" }), _jsx("p", { children: "Solo el administrador puede gestionar usuarios." })] }) });
    return _jsxs("div", { className: "page", children: [_jsxs("div", { className: "page-header", children: [_jsxs("div", { children: [_jsx("h1", { children: "Usuarios" }), _jsx("p", { children: "Crea cuentas y asigna un rol manualmente." })] }), _jsx("button", { className: "primary-button", onClick: () => setMostrarModal(true), children: "+ Nuevo usuario" })] }), error && _jsx("div", { className: "error-box", children: error }), _jsx("div", { className: "table-card", children: _jsxs("table", { children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "Nombre" }), _jsx("th", { children: "Usuario" }), _jsx("th", { children: "Correo" }), _jsx("th", { children: "Rol" }), _jsx("th", { children: "Estado" }), _jsx("th", { children: "Acci\u00F3n" })] }) }), _jsxs("tbody", { children: [usuarios.map(u => _jsxs("tr", { children: [_jsx("td", { children: u.name }), _jsx("td", { children: u.username }), _jsx("td", { children: u.email }), _jsx("td", { children: u.role }), _jsx("td", { children: _jsx("span", { className: u.active ? 'status-active' : 'status-inactive', children: u.active ? 'Activo' : 'Inactivo' }) }), _jsx("td", { children: _jsx("button", { className: "view-button", onClick: () => toggle(u), disabled: u.id === current.id, children: u.active ? 'Desactivar' : 'Activar' }) })] }, u.id)), !usuarios.length && _jsx("tr", { children: _jsx("td", { colSpan: "6", className: "table-empty", children: "No hay usuarios registrados." }) })] })] }) }), mostrarModal && _jsx("div", { className: "modal-overlay", onClick: () => setMostrarModal(false), children: _jsxs("div", { className: "modal-card", onClick: e => e.stopPropagation(), children: [_jsxs("div", { className: "modal-header", children: [_jsxs("div", { children: [_jsx("h2", { children: "Nuevo usuario" }), _jsx("p", { children: "El c\u00F3digo de verificaci\u00F3n se enviar\u00E1 al correo de esta cuenta." })] }), _jsx("button", { className: "modal-close", onClick: () => setMostrarModal(false), children: "\u00D7" })] }), _jsxs("form", { onSubmit: crear, children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Nombre completo" }), _jsx("input", { value: form.name, onChange: e => setForm({ ...form, name: e.target.value }), required: true })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Usuario" }), _jsx("input", { value: form.username, onChange: e => setForm({ ...form, username: e.target.value }), required: true })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Correo" }), _jsx("input", { type: "email", value: form.email, onChange: e => setForm({ ...form, email: e.target.value }), required: true })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Contrase\u00F1a temporal" }), _jsx("input", { type: "password", minLength: "8", value: form.password, onChange: e => setForm({ ...form, password: e.target.value }), required: true })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Rol" }), _jsxs("select", { value: form.role, onChange: e => setForm({ ...form, role: e.target.value }), children: [_jsx("option", { children: "Analista" }), _jsx("option", { children: "Administrador" })] })] }), _jsxs("div", { className: "modal-actions", children: [_jsx("button", { type: "button", className: "secondary-button", onClick: () => setMostrarModal(false), children: "Cancelar" }), _jsx("button", { className: "primary-button", children: "Crear usuario" })] })] })] }) })] });
}
export default Usuarios;
