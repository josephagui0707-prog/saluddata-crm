import { useEffect, useState } from 'react';
import { api, getCurrentUser } from '../api';

function Usuarios() {
  const current = getCurrentUser();
  const [usuarios,setUsuarios]=useState([]);
  const [mostrarModal,setMostrarModal]=useState(false);
  const [error,setError]=useState('');
  const [form,setForm]=useState({name:'',username:'',email:'',password:'',role:'Analista'});

  const cargar=()=>api.get('/users').then(setUsuarios).catch(e=>setError(e.message));
  useEffect(()=>{ if(current?.role==='Administrador') cargar(); },[]);

  const crear=async(e)=>{
    e.preventDefault(); setError('');
    try{ await api.post('/users',form); setForm({name:'',username:'',email:'',password:'',role:'Analista'}); setMostrarModal(false); cargar(); }
    catch(err){ setError(err.message); }
  };

  const toggle=async(u)=>{ try{ await api.patch(`/users/${u.id}/status`,{active:!u.active}); cargar(); }catch(err){setError(err.message)} };

  if(current?.role!=='Administrador') return <div className="page"><div className="empty-state"><h2>Acceso restringido</h2><p>Solo el administrador puede gestionar usuarios.</p></div></div>;

  return <div className="page">
    <div className="page-header"><div><h1>Usuarios</h1><p>Crea cuentas y asigna un rol manualmente.</p></div><button className="primary-button" onClick={()=>setMostrarModal(true)}>+ Nuevo usuario</button></div>
    {error&&<div className="error-box">{error}</div>}
    <div className="table-card"><table><thead><tr><th>Nombre</th><th>Usuario</th><th>Correo</th><th>Rol</th><th>Estado</th><th>Acción</th></tr></thead><tbody>
      {usuarios.map(u=><tr key={u.id}><td>{u.name}</td><td>{u.username}</td><td>{u.email}</td><td>{u.role}</td><td><span className={u.active?'status-active':'status-inactive'}>{u.active?'Activo':'Inactivo'}</span></td><td><button className="view-button" onClick={()=>toggle(u)} disabled={u.id===current.id}>{u.active?'Desactivar':'Activar'}</button></td></tr>)}
      {!usuarios.length&&<tr><td colSpan="6" className="table-empty">No hay usuarios registrados.</td></tr>}
    </tbody></table></div>

    {mostrarModal&&<div className="modal-overlay" onClick={()=>setMostrarModal(false)}><div className="modal-card" onClick={e=>e.stopPropagation()}><div className="modal-header"><div><h2>Nuevo usuario</h2><p>El código de verificación se enviará al correo de esta cuenta.</p></div><button className="modal-close" onClick={()=>setMostrarModal(false)}>×</button></div>
      <form onSubmit={crear}>
        <div className="form-group"><label>Nombre completo</label><input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required /></div>
        <div className="form-group"><label>Usuario</label><input value={form.username} onChange={e=>setForm({...form,username:e.target.value})} required /></div>
        <div className="form-group"><label>Correo</label><input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required /></div>
        <div className="form-group"><label>Contraseña temporal</label><input type="password" minLength="8" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} required /></div>
        <div className="form-group"><label>Rol</label><select value={form.role} onChange={e=>setForm({...form,role:e.target.value})}><option>Analista</option><option>Administrador</option></select></div>
        <div className="modal-actions"><button type="button" className="secondary-button" onClick={()=>setMostrarModal(false)}>Cancelar</button><button className="primary-button">Crear usuario</button></div>
      </form>
    </div></div>}
  </div>;
}
export default Usuarios;
