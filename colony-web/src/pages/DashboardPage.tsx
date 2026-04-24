import { Link } from 'react-router-dom';
import { hasAnyRole } from '../lib/auth/permissions';
import { useAuthStore } from '../lib/auth/authStore';

const dashboardLinks = [
  {
    label: 'Open vendor master',
    description: 'Review active vendor rows and category alignment.',
    to: '/app/masters/vendors',
    allowedRoles: ['ADMIN', 'COMPLEX_ADMIN', 'SYSTEM_ADMIN'],
  },
  {
    label: 'Review vendor routing',
    description: 'Check specific vs ALL-building assignments before complaint workflow starts.',
    to: '/app/masters/vendor-mappings',
    allowedRoles: ['ADMIN', 'COMPLEX_ADMIN', 'SYSTEM_ADMIN'],
  },
  {
    label: 'Open IFMS queue',
    description: 'Jump to the pending complaint workspace scaffold.',
    to: '/app/ifms/pending',
    allowedRoles: ['IFMS', 'ADMIN', 'COMPLEX_ADMIN', 'SYSTEM_ADMIN'],
  },
  {
    label: 'My complaints',
    description: 'Resident-facing placeholder while complaint MVP is staged next.',
    to: '/app/complaints/my',
    allowedRoles: ['RESIDENT', 'FAMILY_MEMBER', 'ADMIN'],
  },
];

export function DashboardPage() {
  const user = useAuthStore((state) => state.user);

  if (!user) {
    return null;
  }

  const visibleLinks = dashboardLinks.filter((link) => hasAnyRole(user, link.allowedRoles));

  return (
    <section className="content-stack">
      <div className="hero-panel">
        <div>
          <p className="hero-panel__eyebrow">Phase 1 workspace</p>
          <h1>Welcome back, {user.name}.</h1>
          <p>
            The new shell is now ready to carry auth, navigation, and master-data maintenance while the
            complaint workflow modules are staged in later phases.
          </p>
        </div>

        <div className="hero-panel__chips">
          <span>{user.empNo}</span>
          <span>{user.complexCode || 'Global access'}</span>
          <span>{user.roles.join(' • ')}</span>
        </div>
      </div>

      <div className="card-grid">
        {visibleLinks.map((link) => (
          <Link className="feature-card" key={link.to} to={link.to}>
            <strong>{link.label}</strong>
            <p>{link.description}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
