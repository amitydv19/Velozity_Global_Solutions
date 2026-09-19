import { useAuth } from '../context/AuthContext';
import type { UserRole } from '../types';

export function useRoleAccess() {
  const { user } = useAuth();

  const hasRole = (...roles: UserRole[]) => (user ? roles.includes(user.role) : false);

  return {
    user,
    isAdmin: user?.role === 'ADMIN',
    isPm: user?.role === 'PROJECT_MANAGER',
    isDeveloper: user?.role === 'DEVELOPER',
    hasRole,
  };
}
