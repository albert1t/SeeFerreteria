import { useState } from 'react';
import { Modal } from './Modal';
import { btnStyle, colors } from '../styles/theme';
import type { UserRole } from '../types';

type AccessType = 'password' | 'microsoft';

export interface CreateAccountPayload {
  type: AccessType;
  username: string;
  password: string;
  name: string;
  email: string;
  role: UserRole;
}

interface CreateAccountModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateAccountPayload) => void;
  pending: boolean;
  error: string;
  roles: UserRole[];
  roleLabels: Record<UserRole, string>;
}

const fieldLabelStyle = { color: colors.textMuted, fontSize: 12, display: 'block', marginBottom: 4 } as const;
const fieldInputStyle = {
  width: '100%', padding: '8px 12px', borderRadius: 6, background: 'var(--bg-input-dark)',
  color: colors.text, border: `1px solid ${colors.border}`, boxSizing: 'border-box',
} as const;

export function CreateAccountModal({ open, onClose, onSubmit, pending, error, roles, roleLabels }: CreateAccountModalProps) {
  const [type, setType] = useState<AccessType>('password');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('compras');

  function reset() {
    setType('password');
    setUsername('');
    setPassword('');
    setName('');
    setEmail('');
    setRole('compras');
  }

  function handleClose() {
    reset();
    onClose();
  }

  const canCreate = type === 'password' ? !!username && !!name && password.length >= 6 : !!email;

  return (
    <Modal open={open} onClose={handleClose} title="Crear usuario">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, minWidth: 320 }}>
        <div>
          <label style={{ ...fieldLabelStyle, marginBottom: 6 }}>Tipo de acceso</label>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" style={type === 'password' ? btnStyle('primary') : btnStyle('ghost')} onClick={() => setType('password')}>
              Contraseña
            </button>
            <button type="button" style={type === 'microsoft' ? btnStyle('primary') : btnStyle('ghost')} onClick={() => setType('microsoft')}>
              Microsoft
            </button>
          </div>
        </div>

        {type === 'password' ? (
          <>
            <div style={{ fontSize: 13, color: 'var(--warning-text-soft)', background: 'var(--bg-danger-soft)', border: '1px solid var(--border-danger)', borderRadius: 8, padding: '0.6rem 0.75rem' }}>
              El usuario se creará <strong>desactivado</strong> y sin acceso. Para que pueda entrar, un administrador debe <strong>activarlo</strong>.
            </div>
            <div>
              <label style={fieldLabelStyle}>Usuario</label>
              <input value={username} onChange={(e) => setUsername(e.target.value)} style={fieldInputStyle} />
            </div>
            <div>
              <label style={fieldLabelStyle}>Nombre</label>
              <input value={name} onChange={(e) => setName(e.target.value)} style={fieldInputStyle} />
            </div>
            <div>
              <label style={fieldLabelStyle}>Contraseña (mín. 6 caracteres)</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={fieldInputStyle} />
            </div>
          </>
        ) : (
          <div>
            <label style={fieldLabelStyle}>Email</label>
            <p style={{ color: colors.textMuted, fontSize: 12, margin: '0 0 6px' }}>
              Se añade a la whitelist de login con Microsoft; la cuenta se crea sola al iniciar sesión por primera vez.
            </p>
            <input type="email" placeholder="correo@empresa.com" value={email} onChange={(e) => setEmail(e.target.value)} style={fieldInputStyle} />
          </div>
        )}

        <div>
          <label style={fieldLabelStyle}>Rol</label>
          <select value={role} onChange={(e) => setRole(e.target.value as UserRole)} style={fieldInputStyle}>
            {roles.map((r) => (
              <option key={r} value={r}>{roleLabels[r]}</option>
            ))}
          </select>
        </div>
        {error && <div style={{ color: 'var(--danger-text)', fontSize: 13, textAlign: 'center' }}>{error}</div>}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
          <button style={btnStyle('ghost')} onClick={handleClose}>Cancelar</button>
          <button
            style={btnStyle('primary')}
            disabled={!canCreate || pending}
            onClick={() => onSubmit({ type, username, password, name, email, role })}
          >
            {pending ? 'Creando...' : 'Crear'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
