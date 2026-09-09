import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  FaDatabase, 
  FaFileCsv, 
  FaEye, 
  FaSearch, 
  FaCheckCircle, 
  FaClock, 
  FaUser, 
  FaTimes, 
  FaTable 
} from 'react-icons/fa';
import { api } from '../api';

// Columnas opcionales del modal — ID siempre visible, estas se activan con botones
const PREVIEW_COLUMNS = [
  { key: 'ESPECIALIDAD', label: 'Especialidad' },
  { key: 'SEXO',         label: 'Sexo' },
  { key: 'EDAD',         label: 'Edad' },
  { key: 'SEGURO',       label: 'Seguro' },
  { key: 'ATENDIDO',     label: 'Atendido' },
  { key: 'MONTO',        label: 'Monto' },
];

function Historial() {
  const [datasets, setDatasets] = useState([]);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Estado para la Vista Previa Modal
  const [selectedDataset, setSelectedDataset] = useState(null);
  const [previewData, setPreviewData] = useState([]);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [visibleCols, setVisibleCols] = useState([]);

  const toggleCol = (key) => {
    setVisibleCols(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  useEffect(() => { 
    api.get('/datasets')
      .then(setDatasets)
      .catch(e => setError(e.message)); 
  }, []);

  const fmt = n => new Intl.NumberFormat('es-PE').format(Number(n || 0));

  // Cargar vista previa del archivo seleccionado
  const handleOpenPreview = async (dataset) => {
    setSelectedDataset(dataset);
    setVisibleCols([]); // Solo ID visible por defecto
    setLoadingPreview(true);
    try {
      const data = await api.get(`/datasets/${dataset.id}/preview?limit=10`);
      setPreviewData(data);
    } catch (e) {
      setError('No se pudo cargar la vista previa: ' + e.message);
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleCloseModal = () => {
    setSelectedDataset(null);
    setPreviewData([]);
  };

  // Cálculo de KPIs
  const totalRegistros = datasets.reduce((acc, curr) => acc + Number(curr.rows_imported || 0), 0);
  const ultimoDataset = datasets.length ? datasets[0] : null;

  // Filtrado dinámico
  const datasetsFiltrados = datasets.filter(d => 
    d.original_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (d.uploaded_by_name && d.uploaded_by_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="dashboard" style={{ padding: '24px', backgroundColor: '#f0f7f7', minHeight: '100vh', width: '100%' }}>
      
      {/* Encabezado */}
      <div className="welcome" style={{ marginBottom: '24px' }}>
        <div>
          <h1 style={{ color: '#0f4c5c', margin: 0, fontSize: '26px' }}>Historial de Datasets</h1>
          <p style={{ color: '#5a738e', margin: '4px 0 0 0', fontSize: '14px' }}>
            Registro detallado de archivos procesados e importados en la base de datos Supabase.
          </p>
        </div>
      </div>

      {error && <div style={{ padding: '12px', background: '#fee2e2', color: '#b91c1c', borderRadius: '8px', marginBottom: '20px' }}>{error}</div>}

      {/* TARJETAS DE RESUMEN KPI (Llenan el espacio superior) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        
        <div style={{ background: '#ffffff', padding: '18px', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)', borderLeft: '4px solid #0f4c5c', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '42px', height: '42px', backgroundColor: '#e6f7f5', color: '#0f4c5c', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
            <FaDatabase />
          </div>
          <div>
            <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 'bold' }}>Total Archivos</span>
            <strong style={{ fontSize: '20px', color: '#0f4c5c', display: 'block' }}>{datasets.length}</strong>
          </div>
        </div>

        <div style={{ background: '#ffffff', padding: '18px', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)', borderLeft: '4px solid #14b8a6', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '42px', height: '42px', backgroundColor: '#e6f7f5', color: '#14b8a6', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
            <FaTable />
          </div>
          <div>
            <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 'bold' }}>Registros Acumulados</span>
            <strong style={{ fontSize: '20px', color: '#0f4c5c', display: 'block' }}>{fmt(totalRegistros)}</strong>
          </div>
        </div>

        <div style={{ background: '#ffffff', padding: '18px', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)', borderLeft: '4px solid #0ea5e9', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '42px', height: '42px', backgroundColor: '#e0f2fe', color: '#0ea5e9', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
            <FaClock />
          </div>
          <div>
            <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 'bold' }}>Última Actualización</span>
            <strong style={{ fontSize: '13px', color: '#0f4c5c', display: 'block', marginTop: '2px' }}>
              {ultimoDataset ? new Date(ultimoDataset.uploaded_at).toLocaleDateString('es-PE') : 'Sin registros'}
            </strong>
          </div>
        </div>

      </div>

      {/* CONTENEDOR PRINCIPAL */}
      <div style={{ background: '#ffffff', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
        
        {/* BARRA DE BÚSQUEDA */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', gap: '16px', flexWrap: 'wrap' }}>
          <h3 style={{ margin: 0, color: '#0f4c5c', fontSize: '18px' }}>Cargas Realizadas</h3>
          
          <div style={{ position: 'relative', width: '280px' }}>
            <FaSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '13px' }} />
            <input 
              type="text" 
              placeholder="Buscar archivo o usuario..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px 8px 34px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                fontSize: '13px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>
        </div>

        {/* TABLA DE HISTORIAL */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#0f4c5c', background: '#f8fafc' }}>
                <th style={{ padding: '12px' }}>Archivo</th>
                <th style={{ padding: '12px' }}>Fecha</th>
                <th style={{ padding: '12px' }}>Registros</th>
                <th style={{ padding: '12px' }}>Usuario</th>
                <th style={{ padding: '12px' }}>Estado</th>
                <th style={{ padding: '12px', textAlign: 'center' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {datasetsFiltrados.length ? datasetsFiltrados.map(d => (
                <tr key={d.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px', fontWeight: 'bold', color: '#334155', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FaFileCsv style={{ color: '#0ea5e9', fontSize: '16px' }} />
                    {d.original_name}
                  </td>
                  <td style={{ padding: '12px', color: '#64748b' }}>
                    {new Date(d.uploaded_at).toLocaleString('es-PE')}
                  </td>
                  <td style={{ padding: '12px', fontWeight: 'bold', color: '#0f4c5c' }}>
                    {fmt(d.rows_imported)}
                  </td>
                  <td style={{ padding: '12px', color: '#475569' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <FaUser style={{ fontSize: '11px', color: '#94a3b8' }} />
                      {d.uploaded_by_name || '—'}
                    </span>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <span style={{
                      padding: '3px 10px',
                      borderRadius: '12px',
                      fontSize: '11px',
                      fontWeight: 'bold',
                      backgroundColor: d.status === 'procesado' ? '#dcfce7' : '#fee2e2',
                      color: d.status === 'procesado' ? '#15803d' : '#b91c1c',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <FaCheckCircle style={{ fontSize: '10px' }} />
                      {d.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    <button 
                      onClick={() => handleOpenPreview(d)}
                      style={{
                        padding: '6px 12px',
                        background: '#e6f7f5',
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
                      <FaEye /> Vista Previa
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '32px', color: '#94a3b8' }}>
                    No se encontraron datasets registrados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* MODAL VISTA PREVIA DE REGISTROS CON CREATEPORTAL */}
      {selectedDataset && createPortal(
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
          zIndex: 99999, // Supera al menú lateral y al encabezado
          padding: '20px',
          boxSizing: 'border-box'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '12px',
            width: '100%',
            maxWidth: '850px',
            maxHeight: '85vh',
            overflowY: 'auto',
            padding: '24px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            boxSizing: 'border-box'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
              <div>
                <h3 style={{ margin: 0, color: '#0f4c5c', fontSize: '18px' }}>Vista Previa del Dataset</h3>
                <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>
                  {selectedDataset.original_name} — Muestra de primeros 10 registros
                </p>
              </div>
              <button 
                onClick={handleCloseModal}
                style={{ background: 'transparent', border: 'none', fontSize: '18px', color: '#64748b', cursor: 'pointer', padding: '4px' }}
              >
                <FaTimes />
              </button>
            </div>

            {/* Botones toggle de columnas */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
              {PREVIEW_COLUMNS.map(col => {
                const active = visibleCols.includes(col.key);
                return (
                  <button
                    key={col.key}
                    onClick={() => toggleCol(col.key)}
                    style={{
                      padding: '5px 14px',
                      borderRadius: '20px',
                      border: `1px solid ${active ? '#14b8a6' : '#cbd5e1'}`,
                      background: active ? '#14b8a6' : '#f8fafc',
                      color: active ? '#ffffff' : '#475569',
                      fontSize: '12px',
                      fontWeight: active ? 'bold' : 'normal',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {col.label}
                  </button>
                );
              })}
            </div>

            {loadingPreview ? (
              <p style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>Cargando registros desde la base de datos...</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', color: '#0f4c5c', borderBottom: '2px solid #e2e8f0' }}>
                      <th style={{ padding: '10px 8px' }}>ID</th>
                      {PREVIEW_COLUMNS.filter(col => visibleCols.includes(col.key)).map(col => (
                        <th key={col.key} style={{ padding: '10px 8px' }}>{col.label}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.map((row, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9', backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                        <td style={{ padding: '8px', fontWeight: 'bold', color: '#334155' }}>{row.ID}</td>
                        {PREVIEW_COLUMNS.filter(col => visibleCols.includes(col.key)).map(col => (
                          <td key={col.key} style={{ padding: '8px', color: col.key === 'MONTO' ? '#0f4c5c' : '#475569', fontWeight: col.key === 'MONTO' ? 'bold' : 'normal' }}>
                            {col.key === 'MONTO' ? `S/ ${row[col.key]}` : row[col.key]}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>,
        document.body // Inyecta el modal directamente en el <body>
      )}

    </div>
  );
}

export default Historial;
