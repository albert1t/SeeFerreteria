import type { AllowedEmail, User, UserRole } from '../types';

export type LoginType = 'password' | 'microsoft';

export type AccountSource = { kind: 'user'; user: User } | { kind: 'allowedEmail'; allowedEmail: AllowedEmail };

export interface AccountRow {
  key: string;
  label: string;
  name: string;
  role: UserRole;
  loginType: LoginType;
  isActive: boolean;
  source: AccountSource;
}

// Builds the single "Usuarios" table from Users + AllowedEmails without duplicating a person who
// appears in both: the first Microsoft login creates a real User but never removes the matching
// AllowedEmails row, so that row is hidden here once a User has materialized for the same email.
export function mergeAccounts(users: User[], allowedEmails: AllowedEmail[]): AccountRow[] {
  const materializedEmails = new Set(users.map((user) => user.username.toLowerCase()));
  const allowedEmailSet = new Set(allowedEmails.map((allowedEmail) => allowedEmail.email.toLowerCase()));

  const userRows: AccountRow[] = users.map((user) => ({
    key: `user-${user.id}`,
    label: user.username,
    name: user.name,
    role: user.role,
    loginType: allowedEmailSet.has(user.username.toLowerCase()) && isLikelyEmail(user.username) ? 'microsoft' : 'password',
    isActive: user.isActive,
    source: { kind: 'user', user },
  }));

  const pendingFirstLoginRows: AccountRow[] = allowedEmails
    .filter((allowedEmail) => !materializedEmails.has(allowedEmail.email.toLowerCase()))
    .map((allowedEmail) => ({
      key: `allowed-${allowedEmail.id}`,
      label: allowedEmail.email,
      name: '',
      role: allowedEmail.role,
      loginType: 'microsoft' as const,
      isActive: allowedEmail.isActive,
      source: { kind: 'allowedEmail', allowedEmail },
    }));

  return [...userRows, ...pendingFirstLoginRows].sort((a, b) => a.label.localeCompare(b.label));
}

function isLikelyEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}
