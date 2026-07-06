import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../components/Toast';
import { badgeStyle, btnStyle, colors } from '../styles/theme';
import * as usersApi from '../api/users';
import type { User } from '../types';

export function UsersPage() {
  const { isAdmin } = useAuth();
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { users } = await usersApi.getUsers();
      return users;
    },
  });

  const roleMutation = useMutation({
    mutationFn: ({ id, role }: { id: number; role: User['role'] }) => usersApi.updateUserRole(id, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      showToast('Rol actualizado', 'success');
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

  if (!isAdmin) {
    return (
      <div style={{ padding: '2rem', color: colors.textMuted, textAlign: 'center' }}>
        No tienes permisos para ver esta página.
      </div>
    );
  }

  return (
    <div style={{ padding: '1.5rem', color: colors.text }}>
      <h2 style={{ margin: '0 0 1.5rem', fontSize: 22 }}>Gestión de Usuarios</h2>

      {isLoading && <div style={{ color: colors.textMuted }}>Cargando usuarios...</div>}
      {error && <div style={{ color: '#ff6b6b' }}>Error al cargar usuarios</div>}

      {data && (
        <div style={{ overflowX: 'auto', background: colors.bgCard, borderRadius: 12, border: `1px solid ${colors.border}` }}>
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
              {data.map((user) => (
                <tr key={user.id} style={{ borderTop: `1px solid ${colors.border}` }}>
                  <td style={{ padding: '12px 16px' }}>{user.name}</td>
                  <td style={{ padding: '12px 16px', color: colors.textMuted }}>{user.username}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={badgeStyle(user.role === 'admin' ? 'Solicitud Express' : 'info')}>
                      {user.role === 'admin' ? 'Administrador' : 'Usuario'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={badgeStyle(user.isActive ? 'Reposición' : 'Finalizado')}>
                      {user.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <select
                        value={user.role}
                        onChange={(e) => roleMutation.mutate({ id: user.id, role: e.target.value as User['role'] })}
                        disabled={roleMutation.isPending}
                        style={{
                          padding: '6px 10px',
                          borderRadius: 6,
                          background: 'rgba(0,0,0,0.25)',
                          color: colors.text,
                          border: `1px solid ${colors.border}`,
                        }}
                      >
                        <option value="user">Usuario</option>
                        <option value="admin">Administrador</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => activeMutation.mutate({ id: user.id, isActive: !user.isActive })}
                        disabled={activeMutation.isPending}
                        style={btnStyle(user.isActive ? 'danger' : 'success')}
                      >
                        {user.isActive ? 'Desactivar' : 'Activar'}
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
