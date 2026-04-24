import type { ReactNode } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../lib/auth/authStore';
import { hasAnyRole } from '../../lib/auth/permissions';

type ProtectedRouteProps = {
  allowedRoles?: string[];
  children?: ReactNode;
};

export function ProtectedRoute({ allowedRoles, children }: ProtectedRouteProps) {
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const isBootstrapping = useAuthStore((state) => state.isBootstrapping);

  if (isBootstrapping) {
    return (
      <div className="status-panel">
        <span className="status-panel__eyebrow">Restoring session</span>
        <h2>Checking the saved session before we open the shell.</h2>
      </div>
    );
  }

  if (!user) {
    return <Navigate replace state={{ from: location.pathname }} to="/login" />;
  }

  if (!hasAnyRole(user, allowedRoles)) {
    return <Navigate replace to="/unauthorized" />;
  }

  return <>{children ?? <Outlet />}</>;
}
