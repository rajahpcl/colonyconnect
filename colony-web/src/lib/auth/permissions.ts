import type { SessionUser } from './types';

export function hasAnyRole(user: Pick<SessionUser, 'role' | 'roles'> | null | undefined, allowedRoles?: string[]) {
  if (!allowedRoles || allowedRoles.length === 0) {
    return true;
  }

  if (!user) {
    return false;
  }

  const availableRoles = new Set([user.role, ...user.roles].filter(Boolean));
  return allowedRoles.some((role) => availableRoles.has(role));
}
