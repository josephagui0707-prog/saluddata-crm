import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { api } from '../api.js';
function Historial() {
    const [datasets, setDatasets] = useState([]);
    const [error, setError] = useState('');
    useEffect(() => { api.get('/datasets').then(setDatasets).catch(e => setError(e.message)); }, []);
    const fmt = n => new Intl.NumberFormat('es-PE').format(Number(n || 0));
    return _jsxs("div", { className: "dashboard", children: [_jsx("div", { className: "welcome", children: _jsxs("div", { children: [_jsx("h2", { children: "Historial de datasets" }), _jsx("p", { children: "Consulta los archivos importados y su estado." })] }) }), error && _jsx("div", { className: "error-box", children: error }), _jsx("div", { className: "report-table", children: _jsxs("table", { children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "Archivo" }), _jsx("th", { children: "Fecha" }), _jsx("th", { children: "Registros" }), _jsx("th", { children: "Usuario" }), _jsx("th", { children: "Estado" })] }) }), _jsx("tbody", { children: datasets.length ? datasets.map(d => _jsxs("tr", { children: [_jsx("td", { children: d.original_name }), _jsx("td", { children: new Date(d.uploaded_at).toLocaleString('es-PE') }), _jsx("td", { children: fmt(d.rows_imported) }), _jsx("td", { children: d.uploaded_by_name || '—' }), _jsx("td", { children: _jsx("span", { className: `status ${d.status === 'procesado' ? 'success' : ''}`, children: d.status }) })] }, d.id)) : _jsx("tr", { children: _jsx("td", { colSpan: "5", className: "table-empty", children: "No hay datasets registrados." }) }) })] }) })] });
}
export default Historial;
