import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PublicClientApplication } from '@azure/msal-browser';
import { useAuth } from '../hooks/useAuth';
import { btnStyle } from '../styles/theme';
import { ApiError } from '../api/client';

const msalScopes = ['openid', 'profile', 'email'];

export function LoginPage() {
  const { user, isLoading, login, loginMicrosoft } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
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

  useEffect(() => {
    if (!msalClient) return;
    let ignore = false;
    setSubmitting(true);
    setError('');
    msalClient
      .initialize()
      .then(() => msalClient.handleRedirectPromise())
      .then((response) => {
        if (ignore) return;
        const idToken = response?.idToken;
        if (idToken) {
          return loginMicrosoft(idToken).then(() => navigate('/', { replace: true }));
        }
      })
      .catch((err) => {
        if (ignore) return;
        setError(err instanceof ApiError ? err.message : String(err || 'Error al iniciar con Microsoft'));
      })
      .finally(() => {
        if (!ignore) setSubmitting(false);
      });
    return () => { ignore = true; };
  }, [msalClient, loginMicrosoft, navigate]);

  useEffect(() => {
    if (user && !isLoading) {
      navigate('/', { replace: true });
    }
  }, [user, isLoading, navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      await login(username, password);
      navigate('/', { replace: true });
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
      await msalClient.initialize();
      await msalClient.loginRedirect({ scopes: msalScopes });
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
          <div style={{ fontSize: 50 }}><img src="https://ferreteriastorageacc.blob.core.windows.net/simpleblob/assets/logoCMH_transparent1.png" width={150} height={85} alt="Logo" /></div>
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
          {submitting && (
            <div style={{ color: '#4db8ff', fontSize: 13, marginBottom: '1rem', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <span className="spinner" style={{ width: 14, height: 14, border: '2px solid rgba(77,184,255,0.3)', borderTop: '2px solid #4db8ff', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
              Conectando con el servidor, puede tardar unos segundos...
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={labelStyle}>Usuario</label>
              <input style={inputStyle} value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Introduce tu usuario" autoFocus />
            </div>
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={labelStyle}>Contraseña</label>
              <input style={inputStyle} type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
            </div>
            {error && <div style={{ color: '#ff6b6b', fontSize: 13, marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}
            <button
              type="submit"
              style={{ ...btnStyle('primary'), width: '100%', justifyContent: 'center', padding: '12px', fontSize: 15 }}
              disabled={submitting || isLoading}
            >
              {submitting ? 'Accediendo...' : 'Acceder'}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}
