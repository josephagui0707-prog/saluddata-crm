import { useState } from "react";
import { 
  FaCloudUploadAlt, 
  FaFileCsv, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaDatabase, 
  FaSpinner, 
  FaTable 
} from "react-icons/fa";
import { api } from "../api";

function CargarDataset() {
  const [archivo, setArchivo] = useState(null);
  const [estado, setEstado] = useState('');
  const [datos, setDatos] = useState([]);
  const [mensaje, setMensaje] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  // Lógica original de archivo
  const handleFileSelect = (file) => {
    if (!file) return;
    setArchivo(file); setDatos([]); setMensaje('');
    setEstado(file.name.toLowerCase().endsWith('.csv') ? 'valido' : 'invalido');
  };

  const seleccionarArchivo = (e) => {
    handleFileSelect(e.target.files[0]);
  };

  // Eventos para Soporte Drag and Drop
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  // Lógica original intacta de backend
  const procesarDataset = async () => {
    if (!archivo || estado !== 'valido') return;
    setEstado('procesando'); 
    setMensaje('Importando registros a Supabase. El archivo completo puede tardar algunos minutos...');
    try {
      const result = await api.upload('/datasets/upload', archivo);
      const preview = await api.get(`/datasets/${result.datasetId}/preview?limit=10`);
      setDatos(preview);
      setMensaje(`${result.message} ${new Intl.NumberFormat('es-PE').format(result.rowsImported)} registros importados.`);
      setEstado('procesado');
    } catch (err) {
      setMensaje(err.message); 
      setEstado('error');
    }
  };

  return (
    <div className="dashboard" style={{ padding: '24px', backgroundColor: '#f0f7f7', minHeight: '100vh' }}>
      
      {/* Encabezado */}
      <div className="welcome" style={{ marginBottom: '24px' }}>
        <div>
          <h2 style={{ color: '#0f4c5c', margin: 0, fontSize: '26px' }}>Cargar Dataset</h2>
          <p style={{ color: '#5a738e', marginTop: '4px' }}>
            Importa el CSV del Hospital María Auxiliadora y genera los reportes automáticamente.
          </p>
        </div>
      </div>

      {/* Tarjeta / Zona Drag and Drop */}
      <div 
        className="dataset-upload-card"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={{
          background: '#ffffff',
          borderRadius: '12px',
          padding: '36px 24px',
          textAlign: 'center',
          border: isDragging ? '2px dashed #14b8a6' : '2px dashed #d0dfe2',
          backgroundColor: isDragging ? '#e6f7f5' : '#ffffff',
          transition: 'all 0.2s ease',
          boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
          maxWidth: '800px',
          margin: '0 auto 24px auto'
        }}
      >
        <div className="upload-large-icon" style={{ fontSize: '48px', color: isDragging ? '#14b8a6' : '#0f4c5c', marginBottom: '12px' }}>
          <FaCloudUploadAlt />
        </div>
        
        <h3 style={{ margin: '0 0 6px 0', color: '#0f4c5c', fontSize: '20px' }}>Carga tu dataset</h3>
        <p style={{ margin: '0 0 12px 0', color: '#5a738e', fontSize: '14px' }}>
          Arrastra y suelta tu archivo CSV aquí, o haz clic para seleccionarlo.
        </p>
        
        <span className="file-types" style={{ display: 'inline-block', fontSize: '12px', color: '#94a3b8', backgroundColor: '#f8fafc', padding: '4px 12px', borderRadius: '20px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
          Formato permitido: CSV separado por punto y coma (;)
        </span>

        <div>
          <label className="select-file-button" style={{
            background: '#0f4c5c',
            color: '#ffffff',
            padding: '10px 22px',
            borderRadius: '8px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'inline-block',
            transition: 'background 0.2s'
          }}>
            Seleccionar archivo
            <input type="file" accept=".csv,text/csv" onChange={seleccionarArchivo} hidden />
          </label>
        </div>

        {/* Vista Previa del Archivo Seleccionado */}
        {archivo && (
          <div className="file-preview" style={{
            display: 'flex',
            alignItems: 'center',
            justify: 'space-between',
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '12px 16px',
            marginTop: '24px',
            textAlign: 'left'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div className="file-icon" style={{ fontSize: '24px', color: '#0ea5e9' }}>
                <FaFileCsv />
              </div>
              <div className="file-info">
                <strong style={{ display: 'block', color: '#1e293b', fontSize: '14px' }}>{archivo.name}</strong>
                <span style={{ fontSize: '12px', color: '#64748b' }}>{(archivo.size/1024/1024).toFixed(2)} MB</span>
              </div>
            </div>

            {estado==='valido' && (
              <div className="validation valid" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10b981', fontWeight: '600', fontSize: '13px' }}>
                <FaCheckCircle /> Archivo válido
              </div>
            )}
            {estado==='invalido' && (
              <div className="validation invalid" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#ef4444', fontWeight: '600', fontSize: '13px' }}>
                <FaTimesCircle /> Formato inválido
              </div>
            )}
          </div>
        )}

        {/* Mensaje de procesamiento */}
        {estado==='procesando' && (
          <div className="processing" style={{ marginTop: '20px', padding: '12px', background: '#e0f2fe', borderRadius: '8px', color: '#0369a1', display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center' }}>
            <FaSpinner className="spinner" style={{ animation: 'spin 1s linear infinite' }} />
            <span style={{ fontSize: '13px', fontWeight: '500' }}>{mensaje}</span>
          </div>
        )}

        {/* Procesado con éxito */}
        {estado==='procesado' && (
          <div className="processed-message" style={{ marginTop: '20px', padding: '14px', background: '#dcfce7', borderRadius: '8px', color: '#15803d', display: 'flex', alignItems: 'center', gap: '12px', textAlign: 'left' }}>
            <FaCheckCircle style={{ fontSize: '20px', flexShrink: 0 }} />
            <div>
              <strong style={{ display: 'block', fontSize: '14px' }}>Dataset procesado correctamente</strong>
              <p style={{ margin: 0, fontSize: '13px' }}>{mensaje}</p>
            </div>
          </div>
        )}

        {/* Error */}
        {estado==='error' && (
          <div className="error-box" style={{ marginTop: '20px', padding: '12px', background: '#fee2e2', borderRadius: '8px', color: '#b91c1c', fontSize: '13px', fontWeight: '500' }}>
            {mensaje}
          </div>
        )}

        {/* Botón de envío */}
        <div style={{ marginTop: '24px' }}>
          <button 
            className="process-dataset-button" 
            onClick={procesarDataset} 
            disabled={!archivo || estado==='invalido' || estado==='procesando'}
            style={{
              width: '100%',
              background: (!archivo || estado==='invalido' || estado==='procesando') ? '#cbd5e1' : '#14b8a6',
              color: '#ffffff',
              border: 'none',
              padding: '12px',
              borderRadius: '8px',
              fontSize: '15px',
              fontWeight: 'bold',
              cursor: (!archivo || estado==='invalido' || estado==='procesando') ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.2s'
            }}
          >
            <FaDatabase /> Procesar dataset
          </button>
        </div>
      </div>

      {/* Tabla de Vista Previa */}
      {datos.length > 0 && (
        <div className="preview-card" style={{ background: '#ffffff', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
          <div className="preview-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ margin: 0, color: '#0f4c5c', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FaTable style={{ color: '#14b8a6' }} /> Vista previa de los datos
              </h3>
              <p style={{ margin: '4px 0 0 0', color: '#5a738e', fontSize: '13px' }}>
                Primeros registros guardados en Supabase
              </p>
            </div>
            <span className="records-badge" style={{ background: '#e6f7f5', color: '#0f4c5c', padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}>
              {datos.length} registros mostrados
            </span>
          </div>

          <div className="preview-table" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#0f4c5c' }}>
                  <th style={{ padding: '10px' }}>ID paciente</th>
                  <th style={{ padding: '10px' }}>Especialidad</th>
                  <th style={{ padding: '10px' }}>Sexo</th>
                  <th style={{ padding: '10px' }}>Edad</th>
                  <th style={{ padding: '10px' }}>Seguro</th>
                  <th style={{ padding: '10px' }}>Atendido</th>
                  <th style={{ padding: '10px' }}>Monto</th>
                </tr>
              </thead>
              <tbody>
                {datos.map((dato, index) => (
                  <tr key={index} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '10px', fontWeight: '600', color: '#334155' }}>{dato.ID}</td>
                    <td style={{ padding: '10px', color: '#475569' }}>{dato.ESPECIALIDAD}</td>
                    <td style={{ padding: '10px', color: '#475569' }}>{dato.SEXO}</td>
                    <td style={{ padding: '10px', color: '#475569' }}>{dato.EDAD}</td>
                    <td style={{ padding: '10px' }}>
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: 'bold',
                        backgroundColor: dato.SEGURO === 'SI' ? '#dcfce7' : '#fee2e2',
                        color: dato.SEGURO === 'SI' ? '#15803d' : '#b91c1c'
                      }}>
                        {dato.SEGURO}
                      </span>
                    </td>
                    <td style={{ padding: '10px' }}>
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: 'bold',
                        backgroundColor: dato.ATENDIDO === 'SI' ? '#dcfce7' : '#fee2e2',
                        color: dato.ATENDIDO === 'SI' ? '#15803d' : '#b91c1c'
                      }}>
                        {dato.ATENDIDO}
                      </span>
                    </td>
                    <td style={{ padding: '10px', fontWeight: '600', color: '#0f4c5c' }}>S/ {dato.MONTO}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}

export default CargarDataset;
