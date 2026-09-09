import { useEffect, useState, useRef } from 'react';
import { 
  FaUsers, 
  FaCheckCircle, 
  FaMoneyBillWave, 
  FaHospital, 
  FaDownload, 
  FaFilePdf, 
  FaChartBar, 
  FaChartPie 
} from 'react-icons/fa';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  ArcElement, 
  Tooltip, 
  Legend 
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import html2pdf from 'html2pdf.js';
import { api, getCurrentUser } from '../api';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

function Reportes() {
  const [summary, setSummary] = useState(null);
  const [rows, setRows] = useState([]);
  const [error, setError] = useState('');
  const [loadingPdf, setLoadingPdf] = useState(false);
  
  const reportRef = useRef(null);
  const user = getCurrentUser() || { name: 'Analista de Datos' };

  useEffect(() => {
    api.get('/dashboard/overview')
      .then(overview => { setSummary(overview.summary); setRows(overview.specialtyReport || []); })
      .catch(e => setError(e.message));
  }, []);

  const fmt = n => new Intl.NumberFormat('es-PE').format(Number(n || 0));
  const money = n => new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(Number(n || 0));

  // Datos para Gráficos
  const barChartData = {
    labels: rows.slice(0, 8).map(r => r.especialidad),
    datasets: [
      {
        label: 'Atendidos',
        data: rows.slice(0, 8).map(r => r.atendidos),
        backgroundColor: '#14b8a6',
        borderRadius: 4
      },
      {
        label: 'No Atendidos',
        data: rows.slice(0, 8).map(r => r.no_atendidos),
        backgroundColor: '#ef4444',
        borderRadius: 4
      }
    ]
  };

  const doughnutChartData = {
    labels: rows.slice(0, 5).map(r => r.especialidad),
    datasets: [{
      data: rows.slice(0, 5).map(r => r.monto_promedio),
      backgroundColor: ['#0f4c5c', '#0ea5e9', '#14b8a6', '#f59e0b', '#8b5cf6'],
      borderWidth: 0,
    }]
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: { boxWidth: 10, usePointStyle: true } }
    },
    scales: {
      x: { ticks: { font: { size: 10 }, maxRotation: 0, minRotation: 0 }, grid: { display: false } },
      y: { grid: { color: '#f1f5f9' } }
    }
  };

  const doughnutChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: { boxWidth: 10, usePointStyle: true } }
    },
    cutout: '65%'
  };

  // Exportación a PDF ajustando el viewport temporalmente
  const exportarPDF = () => {
    setLoadingPdf(true);
    const element = reportRef.current;
    
    const opt = {
      margin: [10, 10, 10, 10],
      filename: `Reporte_Ejecutivo_Hospital_MA_${new Date().toISOString().split('T')[0]}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };

    html2pdf().set(opt).from(element).save().then(() => {
      setLoadingPdf(false);
    }).catch(err => {
      setError("Error al exportar PDF: " + err.message);
      setLoadingPdf(false);
    });
  };

  const fechaActual = new Date().toLocaleDateString('es-PE', { 
    year: 'numeric', month: 'long', day: 'numeric' 
  });

  return (
    <div className="dashboard" style={{ padding: '24px', backgroundColor: '#f0f7f7', minHeight: '100vh', width: '100%' }}>
      
      {/* BARRA SUPERIOR DE LA APLICACIÓN */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', width: '100%' }}>
        <div>
          <h1 style={{ color: '#0f4c5c', margin: 0, fontSize: '26px' }}>Gestión de Reportes</h1>
          <p style={{ color: '#5a738e', margin: '4px 0 0 0', fontSize: '14px' }}>Panel interactivo y métricas globales del hospital</p>
        </div>
        
        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            onClick={() => api.download('/reports/specialties.csv', 'reporte_especialidades.csv').catch(e => setError(e.message))}
            style={{ padding: '10px 18px', background: '#fff', border: '1px solid #d0dfe2', color: '#0f4c5c', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}
          >
            <FaDownload /> CSV
          </button>
          
          <button 
            onClick={exportarPDF}
            disabled={loadingPdf}
            style={{ padding: '10px 18px', background: '#0f4c5c', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}
          >
            <FaFilePdf /> {loadingPdf ? 'Generando PDF...' : 'Exportar PDF'}
          </button>
        </div>
      </div>

      {error && <div style={{ padding: '12px', background: '#fee2e2', color: '#b91c1c', borderRadius: '8px', marginBottom: '20px' }}>{error}</div>}

      {/* CONTENEDOR PRINCIPAL FLUIDO (100% ANCHO DE PANTALLA EN PC) */}
      <div 
        ref={reportRef} 
        style={{ 
          width: '100%', 
          background: '#ffffff', 
          padding: '28px',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
          boxSizing: 'border-box'
        }}
      >
        
        {/* MEMBRETE INSTITUCIONAL */}
        <div style={{ borderBottom: '2px solid #0f4c5c', paddingBottom: '16px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2 style={{ color: '#0f4c5c', margin: 0, fontSize: '22px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Hospital María Auxiliadora
            </h2>
            <p style={{ color: '#14b8a6', margin: '4px 0 0 0', fontWeight: 'bold', fontSize: '13px' }}>
              SaludData CRM — Reporte Estadístico Institucional
            </p>
          </div>
          
          <div style={{ textAlign: 'right', fontSize: '12px', color: '#64748b' }}>
            <p style={{ margin: 0 }}><strong>Fecha de emisión:</strong> {fechaActual}</p>
            <p style={{ margin: '3px 0 0 0' }}><strong>Generado por:</strong> {user.name}</p>
          </div>
        </div>

        {/* METRICAS TARJETAS AMPLIAS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '28px' }}>
          <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', borderLeft: '4px solid #0ea5e9' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <FaUsers style={{ color: '#0ea5e9', fontSize: '18px' }} />
              <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 'bold' }}>Pacientes Únicos</span>
            </div>
            <strong style={{ fontSize: '22px', color: '#0f4c5c', display: 'block', marginTop: '6px' }}>{fmt(summary?.patients)}</strong>
          </div>

          <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', borderLeft: '4px solid #10b981' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <FaCheckCircle style={{ color: '#10b981', fontSize: '18px' }} />
              <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 'bold' }}>Atendidos</span>
            </div>
            <strong style={{ fontSize: '22px', color: '#0f4c5c', display: 'block', marginTop: '6px' }}>{fmt(summary?.attended)}</strong>
          </div>

          <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', borderLeft: '4px solid #f59e0b' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <FaMoneyBillWave style={{ color: '#f59e0b', fontSize: '18px' }} />
              <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 'bold' }}>Monto Promedio</span>
            </div>
            <strong style={{ fontSize: '22px', color: '#0f4c5c', display: 'block', marginTop: '6px' }}>{money(summary?.avgAmount)}</strong>
          </div>

          <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', borderLeft: '4px solid #8b5cf6' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <FaHospital style={{ color: '#8b5cf6', fontSize: '18px' }} />
              <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 'bold' }}>Especialidades</span>
            </div>
            <strong style={{ fontSize: '22px', color: '#0f4c5c', display: 'block', marginTop: '6px' }}>{fmt(summary?.specialties)}</strong>
          </div>
        </div>

        {/* SECCIÓN DE GRÁFICOS PANTALLA ANCHA */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '24px', marginBottom: '32px' }}>
          
          <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', padding: '20px' }}>
            <h3 style={{ fontSize: '15px', color: '#0f4c5c', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FaChartBar style={{ color: '#14b8a6' }} /> Atenciones por Especialidad
            </h3>
            <div style={{ height: '260px' }}>
              <Bar data={barChartData} options={barChartOptions} />
            </div>
          </div>

          <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', padding: '20px' }}>
            <h3 style={{ fontSize: '15px', color: '#0f4c5c', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FaChartPie style={{ color: '#0ea5e9' }} /> Distribución de Ingresos
            </h3>
            <div style={{ height: '260px' }}>
              <Doughnut data={doughnutChartData} options={doughnutChartOptions} />
            </div>
          </div>

        </div>

        {/* TABLA DE RESUMEN ANCHA */}
        <div>
          <h3 style={{ color: '#0f4c5c', margin: '0 0 16px 0', fontSize: '16px' }}>
            Detalle Consolidado por Especialidad
          </h3>
          
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#0f4c5c', color: '#ffffff' }}>
                  <th style={{ padding: '10px 12px' }}>Especialidad</th>
                  <th style={{ padding: '10px 12px' }}>Total Citas</th>
                  <th style={{ padding: '10px 12px' }}>Atendidos</th>
                  <th style={{ padding: '10px 12px' }}>No Atendidos</th>
                  <th style={{ padding: '10px 12px' }}>Monto Promedio</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, index) => (
                  <tr key={r.especialidad} style={{ backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '10px 12px', fontWeight: 'bold', color: '#334155' }}>{r.especialidad}</td>
                    <td style={{ padding: '10px 12px', color: '#475569' }}>{fmt(r.total)}</td>
                    <td style={{ padding: '10px 12px', color: '#16a34a', fontWeight: 'bold' }}>{fmt(r.atendidos)}</td>
                    <td style={{ padding: '10px 12px', color: '#dc2626' }}>{fmt(r.no_atendidos)}</td>
                    <td style={{ padding: '10px 12px', fontWeight: 'bold', color: '#0f4c5c' }}>{money(r.monto_promedio)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* PIE DE PÁGINA */}
        <div style={{ marginTop: '32px', paddingTop: '12px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#94a3b8' }}>
          <span>SaludData CRM — Hospital María Auxiliadora</span>
          <span>Documento del Sistema</span>
        </div>

      </div>

    </div>
  );
}

export default Reportes;
