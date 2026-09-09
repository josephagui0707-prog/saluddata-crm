import { createElement as h, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaHeartbeat, FaEnvelope, FaLock, FaUser } from "react-icons/fa";
import { api, saveSession } from "../api.js";

function Field({ label, icon, inputProps, compact = false }) {
  return h("div", { className: `input-group${compact ? ' compact-group' : ''}` },
    h("label", null, label),
    h("div", { className: "input-wrapper" }, icon, h("input", inputProps))
  );
}

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
  const [registerForm, setRegisterForm] = useState({ name:'', username:'', email:'', password:'', confirmPassword:'' });

  const resetFeedback = () => { setError(''); setMessage(''); setDevCode(''); };

  const submitCredentials = async (e) => {
    e.preventDefault(); resetFeedback(); setLoading(true);
    try {
      const data = await api.post('/auth/login', { username, password });
      setMessage(data.message); setDevCode(data.devCode || ''); setStep('code');
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const submitRegister = async (e) => {
    e.preventDefault(); resetFeedback();
    if (registerForm.password !== registerForm.confirmPassword) { setError('Las contraseñas no coinciden.'); return; }
    setLoading(true);
    try {
      const data = await api.post('/auth/register', {
        name: registerForm.name,
        username: registerForm.username,
        email: registerForm.email,
        password: registerForm.password,
      });
      setUsername(data.username || registerForm.username);
      setPassword(''); setMessage(data.message); setDevCode(data.devCode || ''); setCode(''); setStep('code');
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const submitCode = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const data = await api.post('/auth/verify-code', { username, code });
      saveSession(data.token, data.user); navigate('/');
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const showLogin = () => { resetFeedback(); setCode(''); setStep('credentials'); };
  const showRegister = () => { resetFeedback(); setCode(''); setStep('register'); };

  const title = step === 'credentials' ? 'Iniciar sesión' : step === 'register' ? 'Crear cuenta' : 'Verificar acceso';
  const subtitle = step === 'credentials' ? 'Ingresa tus credenciales de SaludData.' : step === 'register' ? 'Regístrate con tu correo. Los códigos de acceso llegarán a esa dirección.' : 'Ingresa el código de 6 dígitos enviado a tu correo.';

  let formContent;
  if (step === 'credentials') {
    formContent = h("form", { onSubmit: submitCredentials },
      h(Field, { label:'Usuario', icon:h(FaUser), inputProps:{ value:username, onChange:e=>setUsername(e.target.value), placeholder:'admin', autoComplete:'username', required:true } }),
      h(Field, { label:'Contraseña', icon:h(FaLock), inputProps:{ type:'password', value:password, onChange:e=>setPassword(e.target.value), placeholder:'••••••••', autoComplete:'current-password', required:true } }),
      error ? h("p", { className:"login-error" }, error) : null,
      h("button", { className:"login-button", disabled:loading }, loading ? 'Validando...' : 'Continuar'),
      h("div", { className:"auth-switch" }, '¿No tienes una cuenta? ', h("button", { type:'button', onClick:showRegister }, 'Regístrate'))
    );
  } else if (step === 'register') {
    formContent = h("form", { onSubmit: submitRegister },
      h(Field, { compact:true, label:'Nombre completo', icon:h(FaUser), inputProps:{ value:registerForm.name, onChange:e=>setRegisterForm({...registerForm,name:e.target.value}), placeholder:'Tu nombre', autoComplete:'name', required:true } }),
      h(Field, { compact:true, label:'Usuario', icon:h(FaUser), inputProps:{ value:registerForm.username, onChange:e=>setRegisterForm({...registerForm,username:e.target.value}), placeholder:'usuario', autoComplete:'username', minLength:3, required:true } }),
      h(Field, { compact:true, label:'Correo electrónico', icon:h(FaEnvelope), inputProps:{ type:'email', value:registerForm.email, onChange:e=>setRegisterForm({...registerForm,email:e.target.value}), placeholder:'nombre@gmail.com', autoComplete:'email', required:true } }),
      h("div", { className:"register-password-grid" },
        h(Field, { compact:true, label:'Contraseña', icon:h(FaLock), inputProps:{ type:'password', value:registerForm.password, onChange:e=>setRegisterForm({...registerForm,password:e.target.value}), placeholder:'Mín. 8 caracteres', autoComplete:'new-password', minLength:8, required:true } }),
        h(Field, { compact:true, label:'Confirmar', icon:h(FaLock), inputProps:{ type:'password', value:registerForm.confirmPassword, onChange:e=>setRegisterForm({...registerForm,confirmPassword:e.target.value}), placeholder:'Repite contraseña', autoComplete:'new-password', minLength:8, required:true } })
      ),
      h("p", { className:"register-note" }, 'La cuenta se creará con rol ', h("strong", null, 'Analista'), '. El administrador puede cambiarla desde Usuarios.'),
      error ? h("p", { className:"login-error" }, error) : null,
      h("button", { className:"login-button", disabled:loading }, loading ? 'Creando cuenta...' : 'Crear cuenta y verificar correo'),
      h("div", { className:"auth-switch" }, '¿Ya tienes una cuenta? ', h("button", { type:'button', onClick:showLogin }, 'Inicia sesión'))
    );
  } else {
    formContent = h("form", { onSubmit: submitCode },
      h(Field, { label:'Código de verificación', icon:h(FaEnvelope), inputProps:{ value:code, maxLength:6, inputMode:'numeric', onChange:e=>setCode(e.target.value.replace(/\D/g,'')), placeholder:'000000', autoComplete:'one-time-code', required:true } }),
      message ? h("p", { className:"login-success" }, message) : null,
      devCode ? h("p", { className:"dev-code" }, 'Modo desarrollo: código ', h("strong", null, devCode)) : null,
      error ? h("p", { className:"login-error" }, error) : null,
      h("button", { className:"login-button", disabled:loading }, loading ? 'Verificando...' : 'Verificar e ingresar'),
      h("button", { type:'button', className:'link-button', onClick:showLogin }, 'Volver al inicio de sesión')
    );
  }

  return h("div", { className:"login-page" },
    h("section", { className:"login-info" },
      h("div", { className:"login-brand" }, h("div", { className:"login-logo" }, h(FaHeartbeat)), h("div", null, h("h1", null, 'SaludData'), h("span", null, 'CRM hospitalario'))),
      h("div", { className:"login-description" }, h("h2", null, 'Datos de salud convertidos en decisiones.'), h("p", null, 'Importa el dataset, consulta pacientes y revisa reportes desde un solo sistema.')),
      h("div", { className:"login-features" }, h("span", null, '✓ Supabase local'), h("span", null, '✓ Dashboard automático'), h("span", null, '✓ Registro de usuarios'), h("span", null, '✓ Verificación por correo'))
    ),
    h("div", { className:"login-container" },
      h("div", { className:`login-card ${step === 'register' ? 'register-card' : ''}` },
        h("div", { className:"mobile-logo" }, h(FaHeartbeat)),
        h("h2", null, title),
        h("p", { className:"login-subtitle" }, subtitle),
        formContent
      )
    )
  );
}

export default Login;
