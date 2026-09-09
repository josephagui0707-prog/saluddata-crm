import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from "react";
import { FaUsers, FaUserCheck, FaCalendarCheck, FaMoneyBillWave, FaVideo, FaHospital, FaChartBar } from "react-icons/fa";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend } from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";
import { api } from "../api.js";
ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);
function Dashboard() {
    const [summary, setSummary] = useState(null);
    const [specialties, setSpecialties] = useState([]);
    const [modality, setModality] = useState([]);
    const [attendance, setAttendance] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    useEffect(() => {
        (async () => {
            try {
                const overview = await api.get('/dashboard/overview');
                setSummary(overview.summary);
                setSpecialties(overview.specialties || []);
                setModality(overview.modality || []);
                setAttendance(overview.attendance || []);
            }
            catch (err) {
                setError(err.message);
            }
            finally {
                setLoading(false);
            }
        })();
    }, []);
    const specialtyData = useMemo(() => ({
        labels: specialties.map(x => x.label),
        datasets: [{ label: 'Citas', data: specialties.map(x => x.value), backgroundColor: '#14b8a6', borderRadius: 7 }],
    }), [specialties]);
    const modalityData = useMemo(() => ({
        labels: modality.map(x => x.label),
        datasets: [{ data: modality.map(x => x.value), backgroundColor: ['#0ea5e9', '#14b8a6', '#94a3b8'], borderWidth: 0 }],
    }), [modality]);
    const attendanceData = useMemo(() => ({
        labels: attendance.map(x => x.label),
        datasets: [{ data: attendance.map(x => x.value), backgroundColor: ['#22c55e', '#f97316'], borderWidth: 0 }],
    }), [attendance]);
    const barOptions = { responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } };
    const doughnutOptions = { responsive: true, plugins: { legend: { position: 'bottom' } } };
    const fmt = (n) => new Intl.NumberFormat('es-PE').format(Number(n || 0));
    const money = (n) => new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN', maximumFractionDigits: 0 }).format(Number(n || 0));
    const date = (v) => v ? new Date(v).toLocaleDateString('es-PE', { timeZone: 'UTC' }) : '—';
    if (loading)
        return _jsx("div", { className: "dashboard", children: _jsx("div", { className: "empty-state", children: "Cargando dashboard..." }) });
    if (error)
        return _jsx("div", { className: "dashboard", children: _jsx("div", { className: "error-box", children: error }) });
    if (!summary?.datasetId)
        return _jsx("div", { className: "dashboard", children: _jsxs("div", { className: "empty-state", children: [_jsx("h2", { children: "No hay un dataset cargado" }), _jsx("p", { children: "Ve a \u201CImportar datos\u201D y carga el CSV del Hospital Mar\u00EDa Auxiliadora." })] }) });
    return (_jsxs("div", { className: "dashboard", children: [_jsxs("div", { className: "dashboard-header", children: [_jsxs("div", { children: [_jsx("h1", { children: "Dashboard" }), _jsx("p", { children: "Resumen autom\u00E1tico del dataset hospitalario cargado en Supabase" })] }), _jsxs("div", { className: "dashboard-status", children: [_jsx("span", {}), "Dataset activo"] })] }), _jsxs("div", { className: "stats-grid", children: [_jsxs("div", { className: "stat-card", children: [_jsx("div", { className: "stat-icon blue", children: _jsx(FaCalendarCheck, {}) }), _jsxs("div", { children: [_jsx("span", { children: "Total de registros" }), _jsx("h2", { children: fmt(summary.totalRecords) }), _jsx("small", { children: "Citas analizadas" })] })] }), _jsxs("div", { className: "stat-card", children: [_jsx("div", { className: "stat-icon green", children: _jsx(FaUserCheck, {}) }), _jsxs("div", { children: [_jsx("span", { children: "Atenciones realizadas" }), _jsx("h2", { children: fmt(summary.attended) }), _jsxs("small", { children: [summary.totalRecords ? ((summary.attended / summary.totalRecords) * 100).toFixed(1) : 0, "% del total"] })] })] }), _jsxs("div", { className: "stat-card", children: [_jsx("div", { className: "stat-icon cyan", children: _jsx(FaUsers, {}) }), _jsxs("div", { children: [_jsx("span", { children: "Pacientes \u00FAnicos" }), _jsx("h2", { children: fmt(summary.patients) }), _jsx("small", { children: "Identificados por ID anonimizado" })] })] }), _jsxs("div", { className: "stat-card", children: [_jsx("div", { className: "stat-icon money", children: _jsx(FaMoneyBillWave, {}) }), _jsxs("div", { children: [_jsx("span", { children: "Monto total" }), _jsx("h2", { children: money(summary.totalAmount) }), _jsxs("small", { children: ["Promedio ", money(summary.avgAmount)] })] })] })] }), _jsxs("div", { className: "charts-grid", children: [_jsxs("div", { className: "chart-card large", children: [_jsxs("div", { className: "chart-title", children: [_jsxs("div", { children: [_jsx("h3", { children: "Citas por especialidad" }), _jsx("p", { children: "Top 10 de especialidades con m\u00E1s registros" })] }), _jsx(FaChartBar, {})] }), _jsx(Bar, { data: specialtyData, options: barOptions })] }), _jsxs("div", { className: "chart-card", children: [_jsxs("div", { className: "chart-title", children: [_jsxs("div", { children: [_jsx("h3", { children: "Modalidad" }), _jsx("p", { children: "Tipo de atenci\u00F3n" })] }), _jsx(FaVideo, {})] }), _jsx(Doughnut, { data: modalityData, options: doughnutOptions })] })] }), _jsxs("div", { className: "charts-grid", children: [_jsxs("div", { className: "chart-card", children: [_jsxs("div", { className: "chart-title", children: [_jsxs("div", { children: [_jsx("h3", { children: "Estado de atenci\u00F3n" }), _jsx("p", { children: "Citas atendidas y no atendidas" })] }), _jsx(FaUserCheck, {})] }), _jsx(Doughnut, { data: attendanceData, options: doughnutOptions })] }), _jsxs("div", { className: "chart-card information-card", children: [_jsxs("div", { className: "chart-title", children: [_jsxs("div", { children: [_jsx("h3", { children: "Informaci\u00F3n del dataset" }), _jsx("p", { children: "Datos actualmente activos" })] }), _jsx(FaHospital, {})] }), _jsxs("div", { className: "dataset-info", children: [_jsxs("div", { children: [_jsx("span", { children: "Archivo" }), _jsx("strong", { children: summary.fileName })] }), _jsxs("div", { children: [_jsx("span", { children: "Fecha de corte" }), _jsx("strong", { children: date(summary.cutoffDate) })] }), _jsxs("div", { children: [_jsx("span", { children: "Rango de citas" }), _jsxs("strong", { children: [date(summary.minAppointmentDate), " - ", date(summary.maxAppointmentDate)] })] }), _jsxs("div", { children: [_jsx("span", { children: "Especialidades" }), _jsx("strong", { children: fmt(summary.specialties) })] }), _jsxs("div", { children: [_jsx("span", { children: "Departamento" }), _jsx("strong", { children: summary.department || '—' })] }), _jsxs("div", { children: [_jsx("span", { children: "Distrito" }), _jsx("strong", { children: summary.district || '—' })] }), _jsxs("div", { children: [_jsx("span", { children: "Modalidad principal" }), _jsx("strong", { children: summary.mainModality || '—' })] })] })] })] })] }));
}
export default Dashboard;
