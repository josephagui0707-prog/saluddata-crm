import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { getCurrentUser } from '../api.js';
function Header() {
    const user = getCurrentUser() || { name: 'Usuario', role: '' };
    const initials = user.name.split(' ').slice(0, 2).map(p => p[0]).join('').toUpperCase();
    return (_jsxs("header", { className: "header", children: [_jsxs("div", { children: [_jsx("h1", { children: "SaludData CRM" }), _jsx("p", { children: "Gesti\u00F3n y an\u00E1lisis de datos del Hospital Mar\u00EDa Auxiliadora" })] }), _jsxs("div", { className: "user-info", children: [_jsxs("div", { children: [_jsx("strong", { children: user.name }), _jsx("p", { children: user.role })] }), _jsx("div", { className: "user-avatar", children: initials || 'US' })] })] }));
}
export default Header;
