import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { api } from '../api.js';
function Pacientes() {
    const [search, setSearch] = useState('');
    const [patients, setPatients] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [selected, setSelected] = useState(null);
    const [error, setError] = useState('');
    const limit = 25;
    const load = async (p = page, q = search) => { try {
        const r = await api.get(`/patients?page=${p}&limit=${limit}&search=${encodeURIComponent(q)}`);
        setPatients(r.data);
        setTotal(r.total);
    }
    catch (e) {
        setError(e.message);
    } };
    useEffect(() => { load(1, ''); }, []);
    const submit = (e) => { e.preventDefault(); setPage(1); load(1, search); };
    const detail = async (id) => { try {
        setSelected(await api.get(`/patients/${id}`));
    }
    catch (e) {
        setError(e.message);
    } };
    const fmt = n => new Intl.NumberFormat('es-PE').format(Number(n || 0));
    return _jsxs("div", { className: "page", children: [_jsx("div", { className: "page-header", children: _jsxs("div", { children: [_jsx("h1", { children: "Pacientes" }), _jsx("p", { children: "CRM b\u00E1sico construido a partir de los identificadores an\u00F3nimos del dataset." })] }) }), error && _jsx("div", { className: "error-box", children: error }), _jsxs("form", { className: "search-bar", onSubmit: submit, children: [_jsx("input", { placeholder: "Buscar por ID de paciente", value: search, onChange: e => setSearch(e.target.value) }), _jsx("button", { className: "primary-button", children: "Buscar" })] }), _jsxs("div", { className: "table-card", children: [_jsxs("div", { className: "table-summary", children: [fmt(total), " pacientes \u00FAnicos"] }), _jsxs("table", { children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "ID" }), _jsx("th", { children: "Sexo" }), _jsx("th", { children: "Edad" }), _jsx("th", { children: "Seguro" }), _jsx("th", { children: "Distrito" }), _jsx("th", { children: "Citas" }), _jsx("th", { children: "Atendidas" }), _jsx("th", {})] }) }), _jsx("tbody", { children: patients.map(p => _jsxs("tr", { children: [_jsx("td", { children: p.patient_id }), _jsx("td", { children: p.sexo || '—' }), _jsx("td", { children: p.edad ?? '—' }), _jsx("td", { children: p.seguro || '—' }), _jsx("td", { children: p.distrito || '—' }), _jsx("td", { children: fmt(p.total_citas) }), _jsx("td", { children: fmt(p.atendidas) }), _jsx("td", { children: _jsx("button", { className: "view-button", onClick: () => detail(p.patient_id), children: "Ver historial" }) })] }, p.patient_id)) })] }), _jsxs("div", { className: "pagination", children: [_jsx("button", { disabled: page <= 1, onClick: () => { const n = page - 1; setPage(n); load(n); }, children: "Anterior" }), _jsxs("span", { children: ["P\u00E1gina ", page] }), _jsx("button", { disabled: page * limit >= total, onClick: () => { const n = page + 1; setPage(n); load(n); }, children: "Siguiente" })] })] }), selected && _jsx("div", { className: "modal-overlay", onClick: () => setSelected(null), children: _jsxs("div", { className: "modal-card modal-wide", onClick: e => e.stopPropagation(), children: [_jsxs("div", { className: "modal-header", children: [_jsxs("div", { children: [_jsxs("h2", { children: ["Paciente #", selected.patient.patient_id] }), _jsx("p", { children: "Historial de citas registradas" })] }), _jsx("button", { className: "modal-close", onClick: () => setSelected(null), children: "\u00D7" })] }), _jsxs("div", { className: "patient-summary", children: [_jsxs("span", { children: ["Sexo: ", _jsx("strong", { children: selected.patient.sexo || '—' })] }), _jsxs("span", { children: ["Edad: ", _jsx("strong", { children: selected.patient.edad ?? '—' })] }), _jsxs("span", { children: ["Total citas: ", _jsx("strong", { children: fmt(selected.patient.total_citas) })] }), _jsxs("span", { children: ["Atendidas: ", _jsx("strong", { children: fmt(selected.patient.atendidas) })] })] }), _jsx("div", { className: "preview-table", children: _jsxs("table", { children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "Fecha" }), _jsx("th", { children: "Especialidad" }), _jsx("th", { children: "Modalidad" }), _jsx("th", { children: "Atendido" }), _jsx("th", { children: "Monto" })] }) }), _jsx("tbody", { children: selected.appointments.map((a, i) => _jsxs("tr", { children: [_jsx("td", { children: a.fecha_cita ? new Date(a.fecha_cita).toLocaleDateString('es-PE', { timeZone: 'UTC' }) : '—' }), _jsx("td", { children: a.especialidad }), _jsx("td", { children: a.modalidad }), _jsx("td", { children: a.atendido }), _jsxs("td", { children: ["S/ ", a.monto] })] }, i)) })] }) })] }) })] });
}
export default Pacientes;
