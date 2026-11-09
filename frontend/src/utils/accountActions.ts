import * as usersApi from '../api/users';
import type { UserRole } from '../types';
import type { AccountRow } from './mergeAccounts';

type AccountPatch = { role: UserRole } | { isActive: boolean };

// Un User tiene endpoints separados para rol y estado; un AllowedEmail comparte uno solo
// (role+isActive juntos), así que necesita el valor actual del campo que no cambia.
export function updateAccount(account: AccountRow, patch: AccountPatch) {
  if (account.source.kind === 'allowedEmail') {
    const role = 'role' in patch ? patch.role : account.role;
    const isActive = 'isActive' in patch ? patch.isActive : account.isActive;
    return usersApi.updateAllowedEmail(account.source.allowedEmail.id, role, isActive);
  }
  return 'role' in patch
    ? usersApi.updateUserRole(account.source.user.id, patch.role)
    : usersApi.updateUserActive(account.source.user.id, patch.isActive);
}
