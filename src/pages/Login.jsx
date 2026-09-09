import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaHeartbeat, FaEnvelope, FaLock, FaUser } from "react-icons/fa";
import { api, saveSession } from "../api";

function Login() {
  const navigate = useNavigate();
  const [step, setStep] = useState('credentials');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [devCode, setDevCode] = useState('');
  const [loading, setLoading] = useState(false);

  const [registerForm, setRegisterForm] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const resetFeedback = () => {
    setError('');
    setMessage('');
    setDevCode('');
  };

  const submitCredentials = async (e) => {
    e.preventDefault();
    resetFeedback();
    setLoading(true);
    try {
      const data = await api.post('/auth/login', { username, password });
      setMessage(data.message);
      setDevCode(data.devCode || '');
      setStep('code');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const submitRegister = async (e) => {
    e.preventDefault();
    resetFeedback();

    if (registerForm.password !== registerForm.confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);
    try {
      const data = await api.post('/auth/register', {
        name: registerForm.name,
        username: registerForm.username,
        email: registerForm.email,
        password: registerForm.password,
      });
      setUsername(data.username || registerForm.username);
      setPassword('');
      setMessage(data.message);
      setDevCode(data.devCode || '');
      setCode('');
      setStep('code');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const submitCode = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await api.post('/auth/verify-code', { username, code });
      saveSession(data.token, data.user);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const showLogin = () => {
    resetFeedback();
    setCode('');
    setStep('credentials');
  };

  const showRegister = () => {
    resetFeedback();
    setCode('');
    setStep('register');
  };

  const title = step === 'credentials' ? 'Iniciar sesión' : step === 'register' ? 'Crear cuenta' : 'Verificar acceso';
  const subtitle = step === 'credentials'
    ? 'Ingresa tus credenciales de SaludData.'
    : step === 'register'
      ? 'Regístrate con tu correo. Los códigos de acceso llegarán a esa dirección.'
      : 'Ingresa el código de 6 dígitos enviado a tu correo.';

  return (
    <div className="login-page">
      <section className="login-info">
        <div className="login-brand">
          <div className="login-logo"><FaHeartbeat /></div>
          <div><h1>SaludData</h1><span>CRM hospitalario</span></div>
        </div>
        <div className="login-description">
          <h2>Datos de salud convertidos en decisiones.</h2>
          <p>Importa el dataset, consulta pacientes y revisa reportes desde un solo sistema.</p>
        </div>
        <div className="login-features">
          <span>✓ Supabase PostgreSQL</span>
          <span>✓ Dashboard automático</span>
          <span>✓ Registro de usuarios</span>
          <span>✓ Verificación por correo</span>
        </div>
      </section>

      <div className="login-container">
        <div className={`login-card ${step === 'register' ? 'register-card' : ''}`}>
          <div className="mobile-logo"><FaHeartbeat /></div>
          <h2>{title}</h2>
          <p className="login-subtitle">{subtitle}</p>

          {step === 'credentials' && (
            <form onSubmit={submitCredentials}>
              <div className="input-group">
                <label>Usuario</label>
                <div className="input-wrapper"><FaUser /><input value={username} onChange={e=>setUsername(e.target.value)} placeholder="admin" autoComplete="username" required /></div>
              </div>
              <div className="input-group">
                <label>Contraseña</label>
                <div className="input-wrapper"><FaLock /><input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" autoComplete="current-password" required /></div>
              </div>
              {error && <p className="login-error">{error}</p>}
              <button className="login-button" disabled={loading}>{loading ? 'Validando...' : 'Continuar'}</button>
              <div className="auth-switch">¿No tienes una cuenta? <button type="button" onClick={showRegister}>Regístrate</button></div>
            </form>
          )}

          {step === 'register' && (
            <form onSubmit={submitRegister}>
              <div className="input-group compact-group">
                <label>Nombre completo</label>
                <div className="input-wrapper"><FaUser /><input value={registerForm.name} onChange={e=>setRegisterForm({...registerForm,name:e.target.value})} placeholder="Tu nombre" autoComplete="name" required /></div>
              </div>
              <div className="input-group compact-group">
                <label>Usuario</label>
                <div className="input-wrapper"><FaUser /><input value={registerForm.username} onChange={e=>setRegisterForm({...registerForm,username:e.target.value})} placeholder="usuario" autoComplete="username" minLength={3} required /></div>
              </div>
              <div className="input-group compact-group">
                <label>Correo electrónico</label>
                <div className="input-wrapper"><FaEnvelope /><input type="email" value={registerForm.email} onChange={e=>setRegisterForm({...registerForm,email:e.target.value})} placeholder="nombre@gmail.com" autoComplete="email" required /></div>
              </div>
              <div className="register-password-grid">
                <div className="input-group compact-group">
                  <label>Contraseña</label>
                  <div className="input-wrapper"><FaLock /><input type="password" value={registerForm.password} onChange={e=>setRegisterForm({...registerForm,password:e.target.value})} placeholder="Mín. 8 caracteres" autoComplete="new-password" minLength={8} required /></div>
                </div>
                <div className="input-group compact-group">
                  <label>Confirmar</label>
                  <div className="input-wrapper"><FaLock /><input type="password" value={registerForm.confirmPassword} onChange={e=>setRegisterForm({...registerForm,confirmPassword:e.target.value})} placeholder="Repite contraseña" autoComplete="new-password" minLength={8} required /></div>
                </div>
              </div>
              <p className="register-note">La cuenta se creará con rol <strong>Analista</strong>. El administrador puede cambiarla desde Usuarios.</p>
              {error && <p className="login-error">{error}</p>}
              <button className="login-button" disabled={loading}>{loading ? 'Creando cuenta...' : 'Crear cuenta y verificar correo'}</button>
              <div className="auth-switch">¿Ya tienes una cuenta? <button type="button" onClick={showLogin}>Inicia sesión</button></div>
            </form>
          )}

          {step === 'code' && (
            <form onSubmit={submitCode}>
              <div className="input-group"><label>Código de verificación</label><div className="input-wrapper"><FaEnvelope /><input value={code} maxLength={6} inputMode="numeric" onChange={e=>setCode(e.target.value.replace(/\D/g,''))} placeholder="000000" autoComplete="one-time-code" required /></div></div>
              {message && <p className="login-success">{message}</p>}
              {devCode && <p className="dev-code">Modo desarrollo: código <strong>{devCode}</strong></p>}
              {error && <p className="login-error">{error}</p>}
              <button className="login-button" disabled={loading}>{loading ? 'Verificando...' : 'Verificar e ingresar'}</button>
              <button type="button" className="link-button" onClick={showLogin}>Volver al inicio de sesión</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default Login;
