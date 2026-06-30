import { useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { PublicClientApplication, type AuthenticationResult } from '@azure/msal-browser';
import { useAuth } from '../hooks/useAuth';
import { btnStyle } from '../styles/theme';
import { ApiError } from '../api/client';

const msalScopes = ['openid', 'profile', 'email'];

export function LoginPage() {
  const { user, isLoading, login, register, loginMicrosoft } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const clientId = import.meta.env.VITE_AZURE_AD_CLIENT_ID;
  const tenantId = import.meta.env.VITE_AZURE_AD_TENANT_ID;
  const redirectUri = import.meta.env.VITE_MSAL_REDIRECT_URI || window.location.origin;
  const msalEnabled = Boolean(clientId && tenantId);

  const msalClient = useMemo(() => {
    if (!msalEnabled) return null;
    return new PublicClientApplication({
      auth: {
        clientId,
        authority: `https://login.microsoftonline.com/${tenantId}`,
        redirectUri,
      },
      cache: {
        cacheLocation: 'sessionStorage',
      },
    });
  }, [clientId, tenantId, msalEnabled, redirectUri]);

  if (!isLoading && user) return <Navigate to="/" replace />;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      if (mode === 'register') {
        if (!name.trim()) {
          throw new Error('El nombre es obligatorio');
        }
        if (password !== confirmPassword) {
          throw new Error('Las contraseñas no coinciden');
        }
        await register(username, name, password);
      } else {
        await login(username, password);
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : String(err || 'Error en la acción'));
      setSubmitting(false);
    }
  }

  async function handleMicrosoftSignIn() {
    if (!msalClient) return;
    setSubmitting(true);
    setError('');

    try {
      const response: AuthenticationResult = await msalClient.loginPopup({ scopes: msalScopes });
      const idToken = response.idToken;
      if (!idToken) {
        throw new Error('No se obtuvo token de Microsoft');
      }
      await loginMicrosoft(idToken);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : String(err || 'Error al iniciar con Microsoft'));
      setSubmitting(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '9px 12px', background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(77,184,255,0.25)', borderRadius: 8, color: '#e8eef6', fontSize: 14, boxSizing: 'border-box',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 12, color: '#7aade0', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4, display: 'block',
  };

  return (

    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #060e1a 0%, #0d1b2e 50%, #0a2240 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{ width: '100%', maxWidth: 420, padding: '0 1rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ fontSize: 50 }}><img src="/src/assets/logoCMH_transparent1.png" width={150} height={85} alt="Logo" /></div>
          <h1 style={{ color: '#4db8ff', fontWeight: 800, fontSize: 28, margin: 0, letterSpacing: '0.05em' }}>FERRETERÍA</h1>
          <p style={{ color: '#4a7aaa', fontSize: 14, margin: '6px 0 0' }}>Sistema de Gestión de Recambios</p>
        </div>
        <div style={{
          background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(77,184,255,0.2)',
          borderRadius: 16, padding: '2rem', boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
        }}>
          <button
            type="button"
            onClick={handleMicrosoftSignIn}
            style={{ ...btnStyle('ghost'), width: '100%', justifyContent: 'center', marginBottom: '1rem', padding: '12px', fontSize: 15 }}
            disabled={!msalEnabled || submitting || isLoading}
          >
            {submitting ? 'Accediendo...' : 'Iniciar con Microsoft'}
          </button>
          {!msalEnabled && (
            <div style={{ color: '#9bb2d3', fontSize: 13, marginBottom: '1rem', textAlign: 'center' }}>
              MSAL no está configurado. Añade VITE_AZURE_AD_CLIENT_ID y VITE_AZURE_AD_TENANT_ID si quieres iniciar con Microsoft.
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={labelStyle}>Usuario</label>
              <input style={inputStyle} value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Introduce tu usuario" autoFocus />
            </div>
            {mode === 'register' && (
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={labelStyle}>Nombre</label>
                <input style={inputStyle} value={name} onChange={(e) => setName(e.target.value)} placeholder="Tu nombre completo" />
              </div>
            )}
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={labelStyle}>Contraseña</label>
              <input style={inputStyle} type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
            </div>
            {mode === 'register' && (
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={labelStyle}>Confirmar contraseña</label>
                <input style={inputStyle} type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" />
              </div>
            )}
            {error && <div style={{ color: '#ff6b6b', fontSize: 13, marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}
            <button
              type="submit"
              style={{ ...btnStyle('primary'), width: '100%', justifyContent: 'center', padding: '12px', fontSize: 15 }}
              disabled={submitting || isLoading}
            >
              {mode === 'register' ? (submitting ? 'Registrando...' : 'Registrarse') : (submitting ? 'Accediendo...' : 'Acceder')}
            </button>
          </form>
          <div style={{ marginTop: '1rem', textAlign: 'center', color: '#9bb2d3', fontSize: 13 }}>
            {mode === 'register' ? (
              <span>
                ¿Ya tienes cuenta?{' '}
                <button type="button" style={{ color: '#4db8ff', background: 'transparent', border: 'none', cursor: 'pointer' }} onClick={() => setMode('login')}>
                  Inicia sesión
                </button>
              </span>
            ) : (
              <span>
                ¿No tienes cuenta?{' '}
                <button type="button" style={{ color: '#4db8ff', background: 'transparent', border: 'none', cursor: 'pointer' }} onClick={() => setMode('register')}>
                  Regístrate
                </button>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
