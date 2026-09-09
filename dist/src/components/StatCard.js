import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
function StatCard({ icon, title, value, description }) {
    return (_jsxs("div", { className: "stat-card", children: [_jsx("div", { className: "stat-top", children: _jsx("div", { className: "stat-icon", children: icon }) }), _jsx("div", { className: "stat-title", children: title }), _jsx("div", { className: "stat-value", children: value }), _jsx("small", { children: description })] }));
}
export default StatCard;
