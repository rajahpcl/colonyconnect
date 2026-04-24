import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { logout } from '../../lib/api/auth';
import { useAuthStore } from '../../lib/auth/authStore';
import { RoleBasedNav } from './RoleBasedNav';

function formatSectionTitle(pathname: string) {
  const segment = pathname.split('/').filter(Boolean).slice(-1)[0] ?? 'home';
  return segment
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (match) => match.toUpperCase());
}

export function AppShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const clearSession = useAuthStore((state) => state.clearSession);

  const logoutMutation = useMutation({
    mutationFn: logout,
    onSettled: () => {
      clearSession();
      navigate('/login', { replace: true });
    },
  });

  const heading = formatSectionTitle(location.pathname);

  if (!user) {
    return null;
  }

  return (
    <div className="app-shell">
      <aside className="app-shell__sidebar">
        <div className="brand-panel">
          <p className="brand-panel__eyebrow">ColonyConnect</p>
          <h1>Operations shell for colony residents, IFMS, and admins.</h1>
          <p className="brand-panel__caption">
            Phase 1 brings the secure shell and master-data workspace into the new stack.
          </p>
        </div>

        <div className="profile-card">
          <span className="profile-card__label">Signed in</span>
          <strong>{user.name}</strong>
          <span>{user.empNo}</span>
          <span>{user.roles.join(' • ')}</span>
        </div>

        <RoleBasedNav user={user} />
      </aside>

      <div className="app-shell__main">
        <header className="top-bar">
          <div>
            <p className="top-bar__eyebrow">Session route</p>
            <h2>{heading}</h2>
          </div>

          <button
            className="ghost-button"
            onClick={() => logoutMutation.mutate()}
            disabled={logoutMutation.isPending}
            type="button"
          >
            {logoutMutation.isPending ? 'Signing out...' : 'Sign out'}
          </button>
        </header>

        <main className="app-shell__content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
