import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../components/Toast';
import { Modal } from '../components/Modal';
import { CreateAccountModal, type CreateAccountPayload } from '../components/CreateAccountModal';
import { badgeStyle, btnStyle, colors } from '../styles/theme';
import * as usersApi from '../api/users';
import type { UserRole } from '../types';
import { ApiError } from '../api/client';
import { mergeAccounts, type AccountRow } from '../utils/mergeAccounts';
import { updateAccount } from '../utils/accountActions';

type DeleteTarget = { kind: 'user' | 'allowedEmail'; id: number; label: string };

function toDeleteTarget(account: AccountRow): DeleteTarget {
  return account.source.kind === 'user'
    ? { kind: 'user', id: account.source.user.id, label: account.label }
    : { kind: 'allowedEmail', id: account.source.allowedEmail.id, label: account.label };
}

export function UsersPage() {
  const { isAdmin } = useAuth();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [createError, setCreateError] = useState('');

  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { users } = await usersApi.getUsers();
      return users;
    },
  });

  const { data: allowedEmails, isLoading: emailsLoading } = useQuery({
    queryKey: ['allowed-emails'],
    queryFn: async () => {
      const { emails } = await usersApi.getAllowedEmails();
      return emails;
    },
  });

  const { data: roles = [] } = useQuery({
    queryKey: ['roles'],
    queryFn: async () => {
      const { roles } = await usersApi.getRoles();
      return roles;
    },
    staleTime: 5 * 60 * 1000,
  });
  const roleLabels = useMemo(
    () => Object.fromEntries(roles.map((r) => [r.name, r.label])) as Record<UserRole, string>,
    [roles],
  );

  const invalidateAccounts = () => {
    queryClient.invalidateQueries({ queryKey: ['users'] });
    queryClient.invalidateQueries({ queryKey: ['allowed-emails'] });
  };

  const setRoleMutation = useMutation({
    mutationFn: (account: AccountRow) => updateAccount(account, { role: account.role }),
    onSuccess: () => {
      invalidateAccounts();
      showToast('Rol actualizado', 'success');
    },
    onError: (err: Error) => showToast(err.message, 'error'),
  });

  const setActiveMutation = useMutation({
    mutationFn: (account: AccountRow) => updateAccount(account, { isActive: account.isActive }),
    onSuccess: () => {
      invalidateAccounts();
      showToast('Estado actualizado', 'success');
    },
    onError: (err: Error) => showToast(err.message, 'error'),
  });

  const createMutation = useMutation({
    mutationFn: (payload: CreateAccountPayload) =>
      payload.type === 'password'
        ? usersApi.createUser({ username: payload.username, password: payload.password, name: payload.name, role: payload.role })
        : usersApi.createAllowedEmail(payload.email, payload.role),
    onSuccess: (_result, payload) => {
      invalidateAccounts();
      showToast(
        payload.type === 'password' ? 'Usuario creado (inactivo). Actívalo para que pueda acceder.' : 'Correo añadido',
        'success',
      );
      setShowCreate(false);
      setCreateError('');
    },
    onError: (err: ApiError) => {
      const msgs = err.details ? Object.entries(err.details).map(([k, v]) => `${k}: ${v.join(', ')}`).join('; ') : null;
      setCreateError(msgs || err.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (target: DeleteTarget) =>
      target.kind === 'user' ? usersApi.deleteUser(target.id) : usersApi.deleteAllowedEmail(target.id),
    onSuccess: () => {
      invalidateAccounts();
      showToast('Cuenta eliminada', 'success');
      setDeleteTarget(null);
    },
    onError: (err: Error) => showToast(err.message, 'error'),
  });

  const accounts = useMemo(
    () => (users && allowedEmails ? mergeAccounts(users, allowedEmails) : []),
    [users, allowedEmails],
  );

  if (!isAdmin) {
    return (
      <div style={{ padding: '2rem', color: colors.textMuted, textAlign: 'center' }}>
        No tienes permisos para ver esta página.
      </div>
    );
  }

  const loading = usersLoading || emailsLoading;

  return (
    <div className="users-page" style={{ padding: '1.5rem', color: colors.text }}>
      <div className="users-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ margin: 0, fontSize: 22 }}>Gestión de Usuarios</h2>
        <button className="users-new-btn" type="button" onClick={() => setShowCreate(true)} style={btnStyle('primary')}>+ Nuevo usuario</button>
      </div>

      {loading && <div style={{ color: colors.textMuted, marginBottom: '1rem' }}>Cargando usuarios...</div>}

      {!loading && (
        <div className="users-table-wrapper" style={{ overflowX: 'auto', background: colors.bgCard, borderRadius: 12, border: `1px solid ${colors.border}` }}>
          <table className="users-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr className="users-row" style={{ background: 'var(--bg-table-head)' }}>
                <th className="users-cell" style={{ padding: '12px 16px', textAlign: 'left', color: colors.textMuted, fontWeight: 600 }}>Nombre</th>
                <th className="users-cell" style={{ padding: '12px 16px', textAlign: 'left', color: colors.textMuted, fontWeight: 600 }}>Usuario / Email</th>
                <th className="users-cell" style={{ padding: '12px 16px', textAlign: 'left', color: colors.textMuted, fontWeight: 600 }}>Tipo de acceso</th>
                <th className="users-cell" style={{ padding: '12px 16px', textAlign: 'left', color: colors.textMuted, fontWeight: 600 }}>Rol</th>
                <th className="users-cell" style={{ padding: '12px 16px', textAlign: 'left', color: colors.textMuted, fontWeight: 600 }}>Estado</th>
                <th className="users-cell" style={{ padding: '12px 16px', textAlign: 'left', color: colors.textMuted, fontWeight: 600 }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map((account) => (
                <tr key={account.key} className="users-row" style={{ borderTop: `1px solid ${colors.border}` }}>
                  <td className="users-cell" data-label="Nombre" style={{ padding: '12px 16px' }}>
                    {account.name || <em style={{ color: colors.textMuted }}>Pendiente de primer acceso</em>}
                  </td>
                  <td className="users-cell" data-label="Usuario / Email" style={{ padding: '12px 16px', color: colors.textMuted }}>{account.label}</td>
                  <td className="users-cell" data-label="Tipo de acceso" style={{ padding: '12px 16px' }}>
                    <span style={badgeStyle(account.loginType === 'microsoft' ? 'info' : 'ghost')}>
                      {account.loginType === 'microsoft' ? 'Microsoft' : 'Contraseña'}
                    </span>
                  </td>
                  <td className="users-cell" data-label="Rol" style={{ padding: '12px 16px' }}>
                    <select
                      value={account.role}
                      onChange={(e) => setRoleMutation.mutate({ ...account, role: e.target.value as UserRole })}
                      disabled={setRoleMutation.isPending}
                      style={{ padding: '6px 10px', borderRadius: 6, background: 'var(--bg-input-dark)', color: colors.text, border: `1px solid ${colors.border}` }}
                    >
                      {roles.map((role) => (
                        <option key={role.name} value={role.name}>{role.label}</option>
                      ))}
                    </select>
                  </td>
                  <td className="users-cell" data-label="Estado" style={{ padding: '12px 16px' }}>
                    <span style={badgeStyle(account.isActive ? 'Reposición' : 'Finalizado')}>
                      {account.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="users-cell" data-label="Acciones" style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        onClick={() => setActiveMutation.mutate({ ...account, isActive: !account.isActive })}
                        disabled={setActiveMutation.isPending}
                        style={btnStyle(account.isActive ? 'danger' : 'success')}
                      >
                        {account.isActive ? 'Desactivar' : 'Activar'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(toDeleteTarget(account))}
                        disabled={deleteMutation.isPending}
                        style={btnStyle('danger')}
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {accounts.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ padding: '12px 16px', textAlign: 'center', color: colors.textMuted }}>
                    No hay usuarios.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <CreateAccountModal
        open={showCreate}
        onClose={() => { setShowCreate(false); setCreateError(''); }}
        onSubmit={(payload) => createMutation.mutate(payload)}
        pending={createMutation.isPending}
        error={createError}
        roles={roles.map((r) => r.name)}
        roleLabels={roleLabels}
      />

      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Confirmar eliminación">
        <div style={{ textAlign: 'center', padding: '0.5rem 0' }}>
          <p style={{ fontSize: 14, color: 'var(--text-light)', marginBottom: '1.25rem' }}>
            ¿Eliminar la cuenta <strong>{deleteTarget?.label}</strong>? Esta acción no se puede deshacer.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button style={btnStyle('ghost')} onClick={() => setDeleteTarget(null)}>Cancelar</button>
            <button
              style={btnStyle('danger')}
              disabled={deleteMutation.isPending}
              onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget)}
            >
              {deleteMutation.isPending ? 'Eliminando...' : 'Eliminar'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
