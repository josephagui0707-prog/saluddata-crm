import { useEffect, useMemo, useState } from "react";
import { 
  FaUsers, FaUserCheck, FaCalendarCheck, FaMoneyBillWave, 
  FaHospital, FaChartBar, FaClock, FaMapMarkerAlt, FaVenusMars 
} from "react-icons/fa";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend } from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";
import { api } from "../api";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [specialties, setSpecialties] = useState([]);
  const [modality, setModality] = useState([]);
  const [gender, setGender] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [ages, setAges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const overview = await api.get('/dashboard/overview');
        setSummary(overview.summary); setSpecialties(overview.specialties || []);
        setModality(overview.modality || []);
        setGender(overview.gender || []); setDistricts(overview.districts || []); setAges(overview.ages || []);
      } catch (err) { setError(err.message); }
      finally { setLoading(false); }
    })();
  }, []);

  // Datos provenientes de API
  const specialtyData = useMemo(() => ({
    labels: specialties.map(x => x.label),
    datasets: [{ label: 'Citas', data: specialties.map(x => x.value), backgroundColor: '#14b8a6', borderRadius: 7 }],
  }), [specialties]);

  const modalityData = useMemo(() => ({
    labels: modality.map(x => x.label),
    datasets: [{ data: modality.map(x => x.value), backgroundColor: ['#0ea5e9','#14b8a6','#94a3b8'], borderWidth: 0 }],
  }), [modality]);

  const genderData = {
    labels: gender.map(x => x.label),
    datasets: [{ data: gender.map(x => x.value), backgroundColor: ['#ec4899', '#3b82f6', '#94a3b8'], borderWidth: 0 }]
  };

  const districtData = {
    labels: districts.map(x => x.label),
    datasets: [{ label: 'Citas', data: districts.map(x => x.value), backgroundColor: '#0f4c5c', borderRadius: 5 }]
  };

  const ageRangeData = {
    labels: ages.map(x => x.label),
    datasets: [{ label: 'Citas', data: ages.map(x => x.value), backgroundColor: '#0ea5e9', borderRadius: 5 }]
  };

  // Mapa de siglas para especialidades médicas
  const SPECIALTY_ABBR = {
    'CARDIOLOGIA': 'CARDIO',
    'GASTROENTEROLOGIA': 'GASTRO',
    'UROLOGIA': 'UROLOG',
    'ENDOCRINOLOGIA': 'ENDOCRI',
    'OFTALMOLOGIA': 'OFTALMO',
    'NEUROLOGIA': 'NEUROL',
    'MEDICINA GENERAL': 'MED.GEN',
    'MEDICINA FISICA Y REHABILITACION': 'FIS.REHAB',
    'PSIQUIATRIA': 'PSIQ',
    'INFECTOLOGIA': 'INFECT',
    'PEDIATRIA': 'PEDIAT',
    'GINECOLOGIA': 'GINECO',
    'OBSTETRICIA': 'OBSTET',
    'TRAUMATOLOGIA': 'TRAUMA',
    'DERMATOLOGIA': 'DERMAT',
    'OTORRINOLARINGOLOGIA': 'ORL',
    'NEUMOLOGIA': 'NEUMO',
    'REUMATOLOGIA': 'REUMAT',
    'ONCOLOGIA': 'ONCOL',
    'NEFROLOGIA': 'NEFROL',
    'HEMATOLOGIA': 'HEMAT',
    'CIRUGIA GENERAL': 'CIR.GEN',
    'GERIATRIA': 'GERIAT',
    'NUTRICION': 'NUTRIC',
  };

  const getAbbr = (label) => {
    const upper = (label || '').toUpperCase().trim();
    return SPECIALTY_ABBR[upper] || upper.slice(0, 7);
  };

  const barOptions = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true },
      x: {
        ticks: {
          callback: function(value) {
            const label = this.getLabelForValue(value);
            return getAbbr(label);
          },
          maxRotation: 0,
          minRotation: 0,
        }
      }
    }
  };
  // Opciones para gráficos de barra horizontales (sin callback de siglas en eje Y)
  const barOptionsHorizontal = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: { x: { beginAtZero: true } }
  };

  const doughnutOptions = { responsive: true, plugins: { legend: { position: 'bottom' } } };

  const fmt = (n) => new Intl.NumberFormat('es-PE').format(Number(n || 0));
  const money = (n) => new Intl.NumberFormat('es-PE', { style:'currency', currency:'PEN', maximumFractionDigits:0 }).format(Number(n || 0));
  const date = (v) => v ? new Date(v).toLocaleDateString('es-PE', { timeZone:'UTC' }) : '—';

  if (loading) return <div className="dashboard"><div className="empty-state">Cargando dashboard...</div></div>;
  if (error) return <div className="dashboard"><div className="error-box">{error}</div></div>;
  if (!summary?.datasetId) return <div className="dashboard"><div className="empty-state"><h2>No hay un dataset cargado</h2><p>Ve a “Importar datos” y carga el CSV del Hospital María Auxiliadora.</p></div></div>;

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div><h1>Dashboard</h1><p>Resumen analítico del dataset hospitalario cargado en Supabase</p></div>
        <div className="dashboard-status"><span></span>Dataset activo</div>
      </div>

      {/* Tarjetas Superiores de Métricas */}
      <div className="stats-grid">
        <div className="stat-card"><div className="stat-icon blue"><FaCalendarCheck /></div><div><span>Total Registros</span><h2>{fmt(summary.totalRecords)}</h2><small>Citas analizadas</small></div></div>
        <div className="stat-card"><div className="stat-icon green"><FaUserCheck /></div><div><span>Atenciones Realizadas</span><h2>{fmt(summary.attended)}</h2><small>{summary.totalRecords ? ((summary.attended/summary.totalRecords)*100).toFixed(1) : 0}% efectivas</small></div></div>
        
        {/* Métrica calculada: Tiempo Medio de Espera (DIA_CITA - DIA_SOLICITUD) */}
        <div className="stat-card">
          <div className="stat-icon cyan"><FaClock /></div>
          <div><span>Días de Espera Promedio</span><h2>{summary.avgWaitDays} días</h2><small>Entre solicitud y cita</small></div>
        </div>

        <div className="stat-card"><div className="stat-icon money"><FaMoneyBillWave /></div><div><span>Monto Total</span><h2>{money(summary.totalAmount)}</h2><small>Promedio {money(summary.avgAmount)}</small></div></div>
      </div>

      {/* Gráficos Principales: Especialidad y Modalidad */}
      <div className="charts-grid">
        <div className="chart-card large">
          <div className="chart-title"><div><h3>Citas por especialidad (ESPECIALIDAD)</h3><p>Top 10 especialidades con más demanda</p></div><FaChartBar /></div>
          <Bar data={specialtyData} options={barOptions} />
        </div>
        <div className="chart-card">
          <div className="chart-title"><div><h3>Modalidad (PRESENCIAL)</h3><p>Presencial vs Remoto</p></div><FaUsers /></div>
          <Doughnut data={modalityData} options={doughnutOptions} />
        </div>
      </div>

      {/* NUEVO BLOQUE: Análisis Demográfico (EDAD + SEXO) */}
      <div className="charts-grid" style={{ marginTop: '20px' }}>
        <div className="chart-card large">
          <div className="chart-title"><div><h3>Distribución por Rango de Edad (EDAD)</h3><p>Volumen de citas por grupo etario</p></div><FaUsers /></div>
          <Bar data={ageRangeData} options={barOptions} />
        </div>

        <div className="chart-card">
          <div className="chart-title"><div><h3>Distribución por Sexo (SEXO)</h3><p>Porcentaje de atenciones</p></div><FaVenusMars /></div>
          <Doughnut data={genderData} options={doughnutOptions} />
        </div>
      </div>

      {/* NUEVO BLOQUE: Procedencia Geográfica y Info del Dataset */}
      <div className="charts-grid" style={{ marginTop: '20px' }}>
        <div className="chart-card large">
          <div className="chart-title"><div><h3>Top Distritos de Procedencia (DISTRITO)</h3><p>Ubicación de origen de los pacientes</p></div><FaMapMarkerAlt /></div>
          <Bar data={districtData} options={{ ...barOptionsHorizontal, indexAxis: 'y' }} />
        </div>

        <div className="chart-card information-card">
          <div className="chart-title"><div><h3>Información del dataset</h3><p>Datos activos en Supabase</p></div><FaHospital /></div>
          <div className="dataset-info">
            <div><span>Archivo</span><strong>{summary.fileName}</strong></div>
            <div><span>Fecha de corte</span><strong>{date(summary.cutoffDate)}</strong></div>
            <div><span>Rango de citas</span><strong>{date(summary.minAppointmentDate)} - {date(summary.maxAppointmentDate)}</strong></div>
            <div><span>Especialidades</span><strong>{fmt(summary.specialties)}</strong></div>
            <div><span>Departamento</span><strong>{summary.department || '—'}</strong></div>
            <div><span>Distrito</span><strong>{summary.district || '—'}</strong></div>
            <div><span>Modalidad principal</span><strong>{summary.mainModality || '—'}</strong></div>
          </div>
        </div>
      </div>

    </div>
  );
}

export default Dashboard;
