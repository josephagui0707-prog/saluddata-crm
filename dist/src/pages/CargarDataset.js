import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { FaCloudUploadAlt, FaFileCsv, FaCheckCircle, FaTimesCircle, FaDatabase } from "react-icons/fa";
import { api } from "../api.js";
function CargarDataset() {
    const [archivo, setArchivo] = useState(null);
    const [estado, setEstado] = useState('');
    const [datos, setDatos] = useState([]);
    const [mensaje, setMensaje] = useState('');
    const seleccionarArchivo = (e) => {
        const file = e.target.files[0];
        if (!file)
            return;
        setArchivo(file);
        setDatos([]);
        setMensaje('');
        setEstado(file.name.toLowerCase().endsWith('.csv') ? 'valido' : 'invalido');
    };
    const procesarDataset = async () => {
        if (!archivo || estado !== 'valido')
            return;
        setEstado('procesando');
        setMensaje('Importando registros a Supabase. El archivo completo puede tardar algunos minutos...');
        try {
            const result = await api.upload('/datasets/upload', archivo);
            const preview = await api.get(`/datasets/${result.datasetId}/preview?limit=10`);
            setDatos(preview);
            setMensaje(`${result.message} ${new Intl.NumberFormat('es-PE').format(result.rowsImported)} registros importados.`);
            setEstado('procesado');
        }
        catch (err) {
            setMensaje(err.message);
            setEstado('error');
        }
    };
    return (_jsxs("div", { className: "dashboard", children: [_jsx("div", { className: "welcome", children: _jsxs("div", { children: [_jsx("h2", { children: "Cargar Dataset" }), _jsx("p", { children: "Importa el CSV del Hospital Mar\u00EDa Auxiliadora y genera los reportes autom\u00E1ticamente." })] }) }), _jsxs("div", { className: "dataset-upload-card", children: [_jsx("div", { className: "upload-large-icon", children: _jsx(FaCloudUploadAlt, {}) }), _jsx("h3", { children: "Carga tu dataset" }), _jsx("p", { children: "Selecciona el archivo CSV desde tu computadora." }), _jsx("span", { className: "file-types", children: "Formato permitido: CSV separado por punto y coma (;)" }), _jsxs("label", { className: "select-file-button", children: ["Seleccionar archivo", _jsx("input", { type: "file", accept: ".csv,text/csv", onChange: seleccionarArchivo, hidden: true })] }), archivo && _jsxs("div", { className: "file-preview", children: [_jsx("div", { className: "file-icon", children: _jsx(FaFileCsv, {}) }), _jsxs("div", { className: "file-info", children: [_jsx("strong", { children: archivo.name }), _jsxs("span", { children: [(archivo.size / 1024 / 1024).toFixed(2), " MB"] })] }), estado === 'valido' && _jsxs("div", { className: "validation valid", children: [_jsx(FaCheckCircle, {}), "Archivo v\u00E1lido"] }), estado === 'invalido' && _jsxs("div", { className: "validation invalid", children: [_jsx(FaTimesCircle, {}), "Formato inv\u00E1lido"] })] }), estado === 'procesando' && _jsxs("div", { className: "processing", children: [_jsx("div", { className: "spinner" }), _jsx("span", { children: mensaje })] }), estado === 'procesado' && _jsxs("div", { className: "processed-message", children: [_jsx(FaCheckCircle, {}), _jsxs("div", { children: [_jsx("strong", { children: "Dataset procesado correctamente" }), _jsx("p", { children: mensaje })] })] }), estado === 'error' && _jsx("div", { className: "error-box", children: mensaje }), _jsxs("button", { className: "process-dataset-button", onClick: procesarDataset, disabled: !archivo || estado === 'invalido' || estado === 'procesando', children: [_jsx(FaDatabase, {}), "Procesar dataset"] })] }), datos.length > 0 && _jsxs("div", { className: "preview-card", children: [_jsxs("div", { className: "preview-header", children: [_jsxs("div", { children: [_jsx("h3", { children: "Vista previa de los datos" }), _jsx("p", { children: "Primeros registros guardados en Supabase" })] }), _jsxs("span", { className: "records-badge", children: [datos.length, " registros mostrados"] })] }), _jsx("div", { className: "preview-table", children: _jsxs("table", { children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "ID paciente" }), _jsx("th", { children: "Especialidad" }), _jsx("th", { children: "Sexo" }), _jsx("th", { children: "Edad" }), _jsx("th", { children: "Seguro" }), _jsx("th", { children: "Atendido" }), _jsx("th", { children: "Monto" })] }) }), _jsx("tbody", { children: datos.map((dato, index) => _jsxs("tr", { children: [_jsx("td", { children: dato.ID }), _jsx("td", { children: dato.ESPECIALIDAD }), _jsx("td", { children: dato.SEXO }), _jsx("td", { children: dato.EDAD }), _jsx("td", { children: _jsx("span", { className: dato.SEGURO === 'SI' ? 'badge-si' : 'badge-no', children: dato.SEGURO }) }), _jsx("td", { children: _jsx("span", { className: dato.ATENDIDO === 'SI' ? 'badge-si' : 'badge-no', children: dato.ATENDIDO }) }), _jsxs("td", { children: ["S/ ", dato.MONTO] })] }, index)) })] }) })] })] }));
}
export default CargarDataset;
