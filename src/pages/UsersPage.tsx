import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../components/Toast';
import { Modal } from '../components/Modal';
import { badgeStyle, btnStyle, colors } from '../styles/theme';
import * as usersApi from '../api/users';
import type { User, UserRole, Permissions } from '../types';

const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Administrador',
  operario: 'Operario',
  user: 'Usuario',
  viewer: 'Solo lectura',
};

const DEFAULT_PERMISSIONS: Record<UserRole, Permissions> = {
  admin: {
    admin: true,
    pedidos: { create: true, view: true, edit: true, delete: true },
    recambios: { create: true, view: true, edit: true, delete: true },
  },
  operario: {
    admin: false,
    pedidos: { create: true, view: true, edit: true, delete: false },
    recambios: { create: false, view: true, edit: false, delete: false },
  },
  user: {
    admin: false,
    pedidos: { create: true, view: true, edit: true, delete: false },
    recambios: { create: false, view: true, edit: false, delete: false },
  },
  viewer: {
    admin: false,
    pedidos: { create: false, view: true, edit: false, delete: false },
    recambios: { create: false, view: true, edit: false, delete: false },
  },
};

function PermissionsEditor({
  permissions,
  onChange,
}: {
  permissions: Permissions;
  onChange: (p: Permissions) => void;
}) {
  const toggle = (resource: 'pedidos' | 'recambios', action: keyof Permissions['pedidos']) => {
    onChange({
      ...permissions,
      [resource]: {
        ...permissions[resource],
        [action]: !permissions[resource][action],
      },
    });
  };

  return (
    <div style={{ fontSize: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
        <input
          type="checkbox"
          checked={permissions.admin}
          onChange={(e) => onChange({ ...permissions, admin: e.target.checked })}
        />
        Admin total
      </label>
      {!permissions.admin && (
        <>
          {(['pedidos', 'recambios'] as const).map((resource) => (
            <div key={resource} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <span style={{ width: 80, color: colors.textMuted, textTransform: 'capitalize' }}>{resource}</span>
              {(['create', 'view', 'edit', 'delete'] as const).map((action) => (
                <label key={action} style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={permissions[resource][action]}
                    onChange={() => toggle(resource, action)}
                  />
                  <span style={{ textTransform: 'capitalize' }}>{action}</span>
                </label>
              ))}
            </div>
          ))}
        </>
      )}
    </div>
  );
}

export function UsersPage() {
  const { isAdmin } = useAuth();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editingPermissions, setEditingPermissions] = useState<Permissions | null>(null);
  const [newEmail, setNewEmail] = useState('');
  const [newEmailRole, setNewEmailRole] = useState<UserRole>('user');
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({ username: '', password: '', name: '', role: 'user' as UserRole });

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

  const updateMutation = useMutation({
    mutationFn: ({ id, role, permissions }: { id: number; role: UserRole; permissions?: Permissions }) =>
      usersApi.updateUserRoleAndPermissions(id, role, permissions),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      showToast('Usuario actualizado', 'success');
      setEditingUser(null);
      setEditingPermissions(null);
    },
    onError: (err: Error) => showToast(err.message, 'error'),
  });

  const createMutation = useMutation({
    mutationFn: (data: { username: string; password: string; name: string; role: UserRole }) =>
      usersApi.createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      showToast('Usuario creado', 'success');
      setShowCreate(false);
      setCreateForm({ username: '', password: '', name: '', role: 'user' });
    },
    onError: (err: Error) => showToast(err.message, 'error'),
  });

  const activeMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: number; isActive: boolean }) => usersApi.updateUserActive(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      showToast('Estado actualizado', 'success');
    },
    onError: (err: Error) => showToast(err.message, 'error'),
  });

  const createEmailMutation = useMutation({
    mutationFn: ({ email, role }: { email: string; role: UserRole }) => usersApi.createAllowedEmail(email, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allowed-emails'] });
      showToast('Correo añadido', 'success');
      setNewEmail('');
    },
    onError: (err: Error) => showToast(err.message, 'error'),
  });

  const updateEmailMutation = useMutation({
    mutationFn: ({ id, role, isActive }: { id: number; role: UserRole; isActive: boolean }) =>
      usersApi.updateAllowedEmail(id, role, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allowed-emails'] });
      showToast('Correo actualizado', 'success');
    },
    onError: (err: Error) => showToast(err.message, 'error'),
  });

  const deleteUserMutation = useMutation({
    mutationFn: (id: number) => usersApi.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      showToast('Usuario eliminado', 'success');
      setDeletingUser(null);
    },
    onError: (err: Error) => showToast(err.message, 'error'),
  });

  const deleteEmailMutation = useMutation({
    mutationFn: (id: number) => usersApi.deleteAllowedEmail(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allowed-emails'] });
      showToast('Correo eliminado', 'success');
    },
    onError: (err: Error) => showToast(err.message, 'error'),
  });

  if (!isAdmin) {
    return (
      <div style={{ padding: '2rem', color: colors.textMuted, textAlign: 'center' }}>
        No tienes permisos para ver esta página.
      </div>
    );
  }

  return (
    <div style={{ padding: '1.5rem', color: colors.text }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ margin: 0, fontSize: 22 }}>Gestión de Usuarios</h2>
        <button type="button" onClick={() => setShowCreate(true)} style={btnStyle('primary')}>+ Nuevo usuario</button>
      </div>

      {usersLoading && <div style={{ color: colors.textMuted, marginBottom: '1rem' }}>Cargando usuarios...</div>}

      {users && (
        <div style={{ overflowX: 'auto', background: colors.bgCard, borderRadius: 12, border: `1px solid ${colors.border}`, marginBottom: '2rem' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ background: 'rgba(0,0,0,0.2)' }}>
                <th style={{ padding: '12px 16px', textAlign: 'left', color: colors.textMuted, fontWeight: 600 }}>Nombre</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', color: colors.textMuted, fontWeight: 600 }}>Usuario / Email</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', color: colors.textMuted, fontWeight: 600 }}>Rol</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', color: colors.textMuted, fontWeight: 600 }}>Estado</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', color: colors.textMuted, fontWeight: 600 }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} style={{ borderTop: `1px solid ${colors.border}` }}>
                  <td style={{ padding: '12px 16px' }}>{user.name}</td>
                  <td style={{ padding: '12px 16px', color: colors.textMuted }}>{user.username}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={badgeStyle(user.role === 'admin' ? 'Solicitud Express' : 'info')}>
                      {ROLE_LABELS[user.role]}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={badgeStyle(user.isActive ? 'Reposición' : 'Finalizado')}>
                      {user.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingUser(user);
                          setEditingPermissions(user.permissions);
                        }}
                        style={btnStyle('ghost')}
                      >
                        Editar permisos
                      </button>
                      <button
                        type="button"
                        onClick={() => activeMutation.mutate({ id: user.id, isActive: !user.isActive })}
                        disabled={activeMutation.isPending}
                        style={btnStyle(user.isActive ? 'danger' : 'success')}
                      >
                        {user.isActive ? 'Desactivar' : 'Activar'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingUser(user)}
                        disabled={deleteUserMutation.isPending}
                        style={btnStyle('danger')}
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Crear usuario">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, minWidth: 320 }}>
          <div>
            <label style={{ color: colors.textMuted, fontSize: 12, display: 'block', marginBottom: 4 }}>Usuario</label>
            <input value={createForm.username} onChange={(e) => setCreateForm({ ...createForm, username: e.target.value })}
              style={{ width: '100%', padding: '8px 12px', borderRadius: 6, background: 'rgba(0,0,0,0.25)', color: colors.text, border: `1px solid ${colors.border}`, boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ color: colors.textMuted, fontSize: 12, display: 'block', marginBottom: 4 }}>Nombre</label>
            <input value={createForm.name} onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
              style={{ width: '100%', padding: '8px 12px', borderRadius: 6, background: 'rgba(0,0,0,0.25)', color: colors.text, border: `1px solid ${colors.border}`, boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ color: colors.textMuted, fontSize: 12, display: 'block', marginBottom: 4 }}>Contraseña</label>
            <input type="password" value={createForm.password} onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
              style={{ width: '100%', padding: '8px 12px', borderRadius: 6, background: 'rgba(0,0,0,0.25)', color: colors.text, border: `1px solid ${colors.border}`, boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ color: colors.textMuted, fontSize: 12, display: 'block', marginBottom: 4 }}>Rol</label>
            <select value={createForm.role} onChange={(e) => setCreateForm({ ...createForm, role: e.target.value as UserRole })}
              style={{ width: '100%', padding: '8px 12px', borderRadius: 6, background: 'rgba(0,0,0,0.25)', color: colors.text, border: `1px solid ${colors.border}` }}>
              <option value="admin">Administrador</option>
              <option value="operario">Operario</option>
              <option value="user">Usuario</option>
              <option value="viewer">Solo lectura</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
            <button style={btnStyle('ghost')} onClick={() => setShowCreate(false)}>Cancelar</button>
            <button style={btnStyle('primary')} disabled={!createForm.username || !createForm.password || !createForm.name || createMutation.isPending}
              onClick={() => createMutation.mutate(createForm)}>
              {createMutation.isPending ? 'Creando...' : 'Crear'}
            </button>
          </div>
        </div>
      </Modal>

      <Modal open={!!deletingUser} onClose={() => setDeletingUser(null)} title="Confirmar eliminación">
        <div style={{ textAlign: 'center', padding: '0.5rem 0' }}>
          <p style={{ fontSize: 14, color: '#c8ddf0', marginBottom: '1.25rem' }}>
            ¿Eliminar el usuario <strong>{deletingUser?.name}</strong> ({deletingUser?.username})? Esta acción no se puede deshacer.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button style={btnStyle('ghost')} onClick={() => setDeletingUser(null)}>Cancelar</button>
            <button
              style={btnStyle('danger')}
              disabled={deleteUserMutation.isPending}
              onClick={() => deletingUser && deleteUserMutation.mutate(deletingUser.id)}
            >
              {deleteUserMutation.isPending ? 'Eliminando...' : 'Eliminar'}
            </button>
          </div>
        </div>
      </Modal>

      {editingUser && editingPermissions && (
        <div style={{ background: colors.bgCard, borderRadius: 12, border: `1px solid ${colors.border}`, padding: '1.5rem', marginBottom: '2rem' }}>
          <h3 style={{ margin: '0 0 1rem' }}>Editar: {editingUser.name}</h3>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ color: colors.textMuted, fontSize: 12, display: 'block', marginBottom: 6 }}>Rol base</label>
            <select
              value={editingUser.role}
              onChange={(e) => {
                const role = e.target.value as UserRole;
                const newPerms = DEFAULT_PERMISSIONS[role];
                setEditingUser({ ...editingUser, role });
                setEditingPermissions(newPerms);
              }}
              style={{ padding: '8px 12px', borderRadius: 6, background: 'rgba(0,0,0,0.25)', color: colors.text, border: `1px solid ${colors.border}` }}
            >
              <option value="admin">Administrador</option>
              <option value="operario">Operario</option>
              <option value="user">Usuario</option>
              <option value="viewer">Solo lectura</option>
            </select>
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ color: colors.textMuted, fontSize: 12, display: 'block', marginBottom: 6 }}>Permisos</label>
            <PermissionsEditor permissions={editingPermissions} onChange={setEditingPermissions} />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              onClick={() => updateMutation.mutate({ id: editingUser.id, role: editingUser.role, permissions: editingPermissions })}
              disabled={updateMutation.isPending}
              style={btnStyle('primary')}
            >
              Guardar
            </button>
            <button
              type="button"
              onClick={() => { setEditingUser(null); setEditingPermissions(null); }}
              style={btnStyle('ghost')}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      <h3 style={{ margin: '0 0 1rem', fontSize: 18 }}>Correos autorizados para Microsoft login</h3>
      <p style={{ color: colors.textMuted, fontSize: 13, marginBottom: '1rem' }}>
        Solo los correos de esta lista pueden iniciar sesión con Microsoft. Se les asigna el rol y permisos configurados al crear su cuenta.
      </p>

      <div style={{ display: 'flex', gap: 8, marginBottom: '1rem', flexWrap: 'wrap' }}>
        <input
          type="email"
          placeholder="correo@empresa.com"
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
          style={{ padding: '8px 12px', borderRadius: 6, background: 'rgba(0,0,0,0.25)', color: colors.text, border: `1px solid ${colors.border}`, minWidth: 250 }}
        />
        <select
          value={newEmailRole}
          onChange={(e) => setNewEmailRole(e.target.value as UserRole)}
          style={{ padding: '8px 12px', borderRadius: 6, background: 'rgba(0,0,0,0.25)', color: colors.text, border: `1px solid ${colors.border}` }}
        >
          <option value="admin">Administrador</option>
          <option value="operario">Operario</option>
          <option value="user">Usuario</option>
          <option value="viewer">Solo lectura</option>
        </select>
        <button
          type="button"
          onClick={() => createEmailMutation.mutate({ email: newEmail, role: newEmailRole })}
          disabled={!newEmail || createEmailMutation.isPending}
          style={btnStyle('primary')}
        >
          Añadir correo
        </button>
      </div>

      {emailsLoading && <div style={{ color: colors.textMuted }}>Cargando correos...</div>}

      {allowedEmails && (
        <div style={{ overflowX: 'auto', background: colors.bgCard, borderRadius: 12, border: `1px solid ${colors.border}` }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ background: 'rgba(0,0,0,0.2)' }}>
                <th style={{ padding: '12px 16px', textAlign: 'left', color: colors.textMuted, fontWeight: 600 }}>Email</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', color: colors.textMuted, fontWeight: 600 }}>Rol asignado</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', color: colors.textMuted, fontWeight: 600 }}>Estado</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', color: colors.textMuted, fontWeight: 600 }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {allowedEmails.map((email) => (
                <tr key={email.id} style={{ borderTop: `1px solid ${colors.border}` }}>
                  <td style={{ padding: '12px 16px' }}>{email.email}</td>
                  <td style={{ padding: '12px 16px' }}>{ROLE_LABELS[email.role]}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={badgeStyle(email.isActive ? 'Reposición' : 'Finalizado')}>
                      {email.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        onClick={() => updateEmailMutation.mutate({ id: email.id, role: email.role, isActive: !email.isActive })}
                        disabled={updateEmailMutation.isPending}
                        style={btnStyle(email.isActive ? 'danger' : 'success')}
                      >
                        {email.isActive ? 'Desactivar' : 'Activar'}
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteEmailMutation.mutate(email.id)}
                        disabled={deleteEmailMutation.isPending}
                        style={btnStyle('danger')}
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
