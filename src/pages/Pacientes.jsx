import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  FaUserInjured, 
  FaCalendarCheck, 
  FaPercentage, 
  FaSearch, 
  FaEye, 
  FaTimes, 
  FaChevronLeft, 
  FaChevronRight,
  FaShieldAlt,
  FaMapMarkerAlt,
  FaChartPie,
  FaVenusMars,
  FaHashtag
} from 'react-icons/fa';
import { 
  Chart as ChartJS, 
  ArcElement, 
  Tooltip, 
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import { api } from '../api';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

function Pacientes() {
  const [search, setSearch] = useState('');
  const [patients, setPatients] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState('');
  const limit = 12;

  const load = async (p = page, q = search) => { 
    try { 
      const r = await api.get(`/patients?page=${p}&limit=${limit}&search=${encodeURIComponent(q)}`);
      setPatients(r.data);
      setTotal(r.total); 
    } catch(e) {
      setError(e.message);
    } 
  };

  useEffect(() => { load(1, ''); }, []);

  const submit = (e) => {
    e.preventDefault();
    setPage(1);
    load(1, search);
  };

  const detail = async (id) => {
    try {
      setSelected(await api.get(`/patients/${id}`));
    } catch(e) {
      setError(e.message);
    }
  };

  const fmt = n => new Intl.NumberFormat('es-PE').format(Number(n || 0));

  // DATOS PARA GRÁFICO 1: Cobertura de Seguro
  const segurosSI = patients.filter(p => p.seguro === 'SI').length;
  const segurosNO = patients.filter(p => p.seguro === 'NO' || !p.seguro).length;

  const insuranceChartData = {
    labels: ['Con Seguro', 'Sin Seguro'],
    datasets: [{
      data: [segurosSI, segurosNO],
      backgroundColor: ['#0f4c5c', '#ef4444'], // Azul institucional vs Rojo alerta
      borderWidth: 0,
    }]
  };

  const insuranceChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 10 }, usePointStyle: true } }
    },
    cutout: '65%'
  };

  // DATOS PARA GRÁFICO 2: Comparativa por Género
  const mascCount = patients.filter(p => p.sexo === 'MASCULINO').length;
  const femCount = patients.filter(p => p.sexo === 'FEMENINO').length;

  const genderChartData = {
    labels: ['Masculino', 'Femenino'],
    datasets: [{
      label: 'Pacientes',
      data: [mascCount, femCount],
      backgroundColor: ['#0ea5e9', '#14b8a6'],
      borderRadius: 4
    }]
  };

  const genderChartOptions = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false }, ticks: { precision: 0, font: { size: 10 } } },
      y: { grid: { display: false }, ticks: { font: { size: 10 } } }
    }
  };

  // KPIs
  const totalCitasPagina = patients.reduce((acc, p) => acc + (p.total_citas || 0), 0);
  const totalAtendidasPagina = patients.reduce((acc, p) => acc + (p.atendidas || 0), 0);
  const tasaAtencion = totalCitasPagina > 0 ? ((totalAtendidasPagina / totalCitasPagina) * 100).toFixed(1) : 0;
  const promedioEdad = patients.length > 0 ? (patients.reduce((acc, p) => acc + (p.edad || 0), 0) / patients.length).toFixed(0) : 0;

  return (
    <div className="page" style={{ padding: '24px', backgroundColor: '#f0f7f7', minHeight: '100vh', width: '100%', boxSizing: 'border-box' }}>
      
      {/* Encabezado */}
      <div className="page-header" style={{ marginBottom: '20px' }}>
        <div>
          <h1 style={{ color: '#0f4c5c', margin: 0, fontSize: '26px' }}>Directorio de Pacientes</h1>
          <p style={{ color: '#5a738e', margin: '4px 0 0 0', fontSize: '14px' }}>
            Panel analítico de identificadores anónimos e historial de atenciones.
          </p>
        </div>
      </div>

      {error && <div style={{ padding: '12px', background: '#fee2e2', color: '#b91c1c', borderRadius: '8px', marginBottom: '20px' }}>{error}</div>}

      {/* SECCIÓN SUPERIOR DE METRICAS Y GRÁFICOS ANALÍTICOS (ALINEADOS EN ALTURA) */}
      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr 1fr', gap: '16px', marginBottom: '24px', alignItems: 'stretch' }}>
        
        {/* RESUMEN METRICAS (KPIs) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', justifyContent: 'space-between' }}>
          <div style={{ background: '#ffffff', padding: '16px', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)', borderLeft: '4px solid #0f4c5c', display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
            <div style={{ width: '38px', height: '38px', backgroundColor: '#e6f7f5', color: '#0f4c5c', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FaUserInjured />
            </div>
            <div>
              <span style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', fontWeight: 'bold' }}>Total Registrados</span>
              <strong style={{ fontSize: '18px', color: '#0f4c5c', display: 'block' }}>{fmt(total)}</strong>
            </div>
          </div>

          <div style={{ background: '#ffffff', padding: '16px', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)', borderLeft: '4px solid #0ea5e9', display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
            <div style={{ width: '38px', height: '38px', backgroundColor: '#e0f2fe', color: '#0ea5e9', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FaPercentage />
            </div>
            <div>
              <span style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', fontWeight: 'bold' }}>Efectividad Atenciones</span>
              <strong style={{ fontSize: '18px', color: '#0f4c5c', display: 'block' }}>{tasaAtencion}%</strong>
            </div>
          </div>

          <div style={{ background: '#ffffff', padding: '16px', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)', borderLeft: '4px solid #14b8a6', display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
            <div style={{ width: '38px', height: '38px', backgroundColor: '#e6f7f5', color: '#14b8a6', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FaHashtag />
            </div>
            <div>
              <span style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', fontWeight: 'bold' }}>Prom. Edad (Muestra)</span>
              <strong style={{ fontSize: '18px', color: '#0f4c5c', display: 'block' }}>{promedioEdad} años</strong>
            </div>
          </div>
        </div>

        {/* GRÁFICO 1: COBERTURA DE SEGURO */}
        <div style={{ background: '#ffffff', padding: '18px', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <h4 style={{ fontSize: '13px', color: '#0f4c5c', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <FaChartPie style={{ color: '#14b8a6' }} /> Distribución de Seguro
          </h4>
          <div style={{ height: '170px', position: 'relative' }}>
            <Doughnut data={insuranceChartData} options={insuranceChartOptions} />
          </div>
        </div>

        {/* GRÁFICO 2: COMPARATIVO POR GÉNERO */}
        <div style={{ background: '#ffffff', padding: '18px', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <h4 style={{ fontSize: '13px', color: '#0f4c5c', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <FaVenusMars style={{ color: '#0ea5e9' }} /> Comparativa por Género
          </h4>
          <div style={{ height: '170px', position: 'relative' }}>
            <Bar data={genderChartData} options={genderChartOptions} />
          </div>
        </div>

      </div>
      {/* CONTENEDOR DE LA TABLA PRINCIPAL */}
      <div style={{ background: '#ffffff', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
        
        {/* BUSCADOR */}
        <form onSubmit={submit} style={{ display: 'flex', gap: '12px', marginBottom: '20px', maxWidth: '450px' }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <FaSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '13px' }} />
            <input 
              placeholder="Buscar por ID de paciente..." 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              style={{
                width: '100%',
                padding: '10px 12px 10px 36px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '13px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>
          <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#0f4c5c', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}>
            Buscar
          </button>
        </form>

        {/* TABLA DE PACIENTES */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#0f4c5c', background: '#f8fafc' }}>
                <th style={{ padding: '12px' }}>ID Paciente</th>
                <th style={{ padding: '12px' }}>Sexo</th>
                <th style={{ padding: '12px' }}>Edad</th>
                <th style={{ padding: '12px' }}>Seguro</th>
                <th style={{ padding: '12px' }}>Distrito</th>
                <th style={{ padding: '12px' }}>Total Citas</th>
                <th style={{ padding: '12px' }}>Atendidas</th>
                <th style={{ padding: '12px', textAlign: 'center' }}>Acción</th>
              </tr>
            </thead>
            <tbody>
              {patients.map(p => {
                const tieneSeguro = p.seguro === 'SI';
                return (
                  <tr key={p.patient_id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px', fontWeight: 'bold', color: '#0f4c5c' }}>#{p.patient_id}</td>
                    <td style={{ padding: '12px', color: '#475569' }}>{p.sexo || '—'}</td>
                    <td style={{ padding: '12px', color: '#475569' }}>{p.edad ?? '—'} yrs</td>
                    
                    {/* COLUMNA SEGURO HIGHLIGHTED (VERDE SI / ROJO NO) */}
                    <td style={{ padding: '12px' }}>
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 'bold',
                        backgroundColor: tieneSeguro ? '#e6f7f5' : '#fee2e2',
                        color: tieneSeguro ? '#0f4c5c' : '#b91c1c',
                        border: tieneSeguro ? '1px solid #14b8a6' : '1px solid #f87171',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        <FaShieldAlt style={{ fontSize: '10px' }} /> {tieneSeguro ? 'SI' : 'NO'}
                      </span>
                    </td>

                    <td style={{ padding: '12px', color: '#475569' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <FaMapMarkerAlt style={{ color: '#14b8a6', fontSize: '11px' }} />
                        {p.distrito || '—'}
                      </span>
                    </td>
                    <td style={{ padding: '12px', fontWeight: 'bold', color: '#334155' }}>{fmt(p.total_citas)}</td>
                    <td style={{ padding: '12px', fontWeight: 'bold', color: '#16a34a' }}>{fmt(p.atendidas)}</td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <button 
                        onClick={() => detail(p.patient_id)}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: '#e6f7f5',
                          color: '#0f4c5c',
                          border: '1px solid #14b8a6',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <FaEye /> Ver
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* PAGINACIÓN */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
          <span style={{ fontSize: '13px', color: '#64748b' }}>
            Mostrando página <strong>{page}</strong> de <strong>{Math.ceil(total / limit) || 1}</strong>
          </span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              disabled={page <= 1} 
              onClick={() => { const n = page - 1; setPage(n); load(n); }}
              style={{
                padding: '6px 12px',
                background: page <= 1 ? '#f1f5f9' : '#fff',
                color: page <= 1 ? '#94a3b8' : '#0f4c5c',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                cursor: page <= 1 ? 'not-allowed' : 'pointer',
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <FaChevronLeft style={{ fontSize: '10px' }} /> Anterior
            </button>
            <button 
              disabled={page * limit >= total} 
              onClick={() => { const n = page + 1; setPage(n); load(n); }}
              style={{
                padding: '6px 12px',
                background: page * limit >= total ? '#f1f5f9' : '#fff',
                color: page * limit >= total ? '#94a3b8' : '#0f4c5c',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                cursor: page * limit >= total ? 'not-allowed' : 'pointer',
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              Siguiente <FaChevronRight style={{ fontSize: '10px' }} />
            </button>
          </div>
        </div>

      </div>

      {/* MODAL HISTORIAL CENTRADO GLOBAL */}
      {selected && createPortal(
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(3px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 999999,
          padding: '20px',
          boxSizing: 'border-box'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '12px',
            width: '100%',
            maxWidth: '800px',
            maxHeight: '85vh',
            overflowY: 'auto',
            padding: '24px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            boxSizing: 'border-box'
          }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
              <div>
                <h2 style={{ margin: 0, color: '#0f4c5c', fontSize: '20px' }}>Historial del Paciente #{selected.patient.patient_id}</h2>
                <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>Detalle cronológico de citas registradas</p>
              </div>
              <button 
                onClick={() => setSelected(null)}
                style={{ background: 'transparent', border: 'none', fontSize: '18px', color: '#64748b', cursor: 'pointer', padding: '4px' }}
              >
                <FaTimes />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', background: '#f8fafc', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '12px' }}>
              <div><span style={{ color: '#64748b' }}>Sexo:</span> <strong style={{ color: '#0f4c5c' }}>{selected.patient.sexo || '—'}</strong></div>
              <div><span style={{ color: '#64748b' }}>Edad:</span> <strong style={{ color: '#0f4c5c' }}>{selected.patient.edad ?? '—'} años</strong></div>
              <div><span style={{ color: '#64748b' }}>Total Citas:</span> <strong style={{ color: '#0f4c5c' }}>{fmt(selected.patient.total_citas)}</strong></div>
              <div><span style={{ color: '#64748b' }}>Atendidas:</span> <strong style={{ color: '#16a34a' }}>{fmt(selected.patient.atendidas)}</strong></div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#0f4c5c', color: '#ffffff' }}>
                    <th style={{ padding: '8px 10px' }}>Fecha</th>
                    <th style={{ padding: '8px 10px' }}>Especialidad</th>
                    <th style={{ padding: '8px 10px' }}>Modalidad</th>
                    <th style={{ padding: '8px 10px' }}>Atendido</th>
                    <th style={{ padding: '8px 10px' }}>Monto</th>
                  </tr>
                </thead>
                <tbody>
                  {selected.appointments.map((a, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #f1f5f9', backgroundColor: i % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                      <td style={{ padding: '8px 10px', color: '#475569' }}>
                        {a.fecha_cita ? new Date(a.fecha_cita).toLocaleDateString('es-PE', { timeZone: 'UTC' }) : '—'}
                      </td>
                      <td style={{ padding: '8px 10px', fontWeight: 'bold', color: '#334155' }}>{a.especialidad}</td>
                      <td style={{ padding: '8px 10px', color: '#475569' }}>{a.modalidad}</td>
                      <td style={{ padding: '8px 10px' }}>
                        <span style={{
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontSize: '10px',
                          fontWeight: 'bold',
                          backgroundColor: a.atendido === 'SI' ? '#dcfce7' : '#fee2e2',
                          color: a.atendido === 'SI' ? '#15803d' : '#b91c1c'
                        }}>
                          {a.atendido}
                        </span>
                      </td>
                      <td style={{ padding: '8px 10px', fontWeight: 'bold', color: '#0f4c5c' }}>S/ {a.monto}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        </div>,
        document.body
      )}

    </div>
  );
}

export default Pacientes;