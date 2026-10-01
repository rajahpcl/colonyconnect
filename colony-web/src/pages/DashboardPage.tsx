import { Link } from 'react-router-dom';
import { hasAnyRole } from '../lib/auth/permissions';
import { useAuthStore } from '../lib/auth/authStore';

const dashboardLinks = [
  {
    label: 'New Complaint',
    description: 'Report a maintenance, electrical, or plumbing issue in your flat.',
    to: '/app/complaints/new',
    allowedRoles: ['RESIDENT', 'FAMILY_MEMBER', 'ADMIN', 'COMPLEX_ADMIN', 'SYSTEM_ADMIN'],
    icon: 'fa-plus-circle',
    colorClass: 'icon-blue',
  },
  {
    label: 'My Complaints',
    description: 'Track real-time status and technician updates on your requests.',
    to: '/app/complaints/my',
    allowedRoles: ['RESIDENT', 'FAMILY_MEMBER', 'ADMIN', 'COMPLEX_ADMIN', 'SYSTEM_ADMIN'],
    icon: 'fa-list-alt',
    colorClass: 'icon-emerald',
  },
  {
    label: 'Electricity Reading',
    description: 'Record monthly meter readings and monitor unit consumption.',
    to: '/app/admin/electric-reading',
    allowedRoles: ['ADMIN', 'COMPLEX_ADMIN', 'SYSTEM_ADMIN', 'SECURITY'],
    icon: 'fa-bolt',
    colorClass: 'icon-amber',
  },
  {
    label: 'Vehicle Directory',
    description: 'Manage registered resident vehicles and parking allocations.',
    to: '/app/vehicles/list',
    allowedRoles: ['RESIDENT', 'ADMIN', 'COMPLEX_ADMIN', 'SYSTEM_ADMIN'],
    icon: 'fa-car',
    colorClass: 'icon-violet',
  },
  {
    label: 'Inventory & Assets',
    description: 'Manage colony equipment, fixtures, and maintenance supplies.',
    to: '/app/inventory',
    allowedRoles: ['ADMIN', 'COMPLEX_ADMIN', 'SYSTEM_ADMIN'],
    icon: 'fa-cubes',
    colorClass: 'icon-indigo',
  },
  {
    label: 'IFMS Task Queue',
    description: 'Review pending vendor work orders and assign supervisor tasks.',
    to: '/app/ifms/pending',
    allowedRoles: ['IFMS', 'ADMIN', 'COMPLEX_ADMIN', 'SYSTEM_ADMIN'],
    icon: 'fa-tasks',
    colorClass: 'icon-rose',
  },
  {
    label: 'Vendor Master',
    description: 'Manage approved vendors, contracts, and category mappings.',
    to: '/app/masters/vendors',
    allowedRoles: ['ADMIN', 'COMPLEX_ADMIN', 'SYSTEM_ADMIN'],
    icon: 'fa-building',
    colorClass: 'icon-blue',
  },
  {
    label: 'Complaint Categories',
    description: 'Configure complaint classifications, sub-types, and SLAs.',
    to: '/app/masters/complaint-categories',
    allowedRoles: ['ADMIN', 'COMPLEX_ADMIN', 'SYSTEM_ADMIN'],
    icon: 'fa-tags',
    colorClass: 'icon-emerald',
  },
  {
    label: 'Reports & Analytics',
    description: 'Analyze occupancy trends, maintenance metrics, and PO summaries.',
    to: '/app/admin/dashboard',
    allowedRoles: ['ADMIN', 'COMPLEX_ADMIN', 'SYSTEM_ADMIN'],
    icon: 'fa-line-chart',
    colorClass: 'icon-amber',
  },
  {
    label: 'Security Desk',
    description: 'Visitor logs, security desk checks, and gate monitoring.',
    to: '/app/security/home',
    allowedRoles: ['SECURITY'],
    icon: 'fa-shield',
    colorClass: 'icon-violet',
  },
];

export function DashboardPage() {
  const user = useAuthStore((state) => state.user);

  if (!user) {
    return null;
  }

  const visibleLinks = dashboardLinks.filter((link) => hasAnyRole(user, link.allowedRoles));

  return (
    <div className="container">
      {/* Hero Welcome Banner */}
      <section className="dashboard-hero" aria-labelledby="dashboard-heading">
        <div className="dashboard-hero__header">
          <div className="dashboard-hero__greeting">
            <h1 id="dashboard-heading">Welcome back, {user.name}</h1>
            <p>ColonyConnect Resident & Facility Management Workspace</p>
          </div>
          <div className="dashboard-hero__badges">
            <span className="dashboard-badge">
              <i className="fa fa-id-badge" aria-hidden="true" />
              <span>Emp #{user.empNo}</span>
            </span>
            {user.complexName && (
              <span className="dashboard-badge">
                <i className="fa fa-building-o" aria-hidden="true" />
                <span>{user.complexName}</span>
              </span>
            )}
            {user.flatNo && (
              <span className="dashboard-badge">
                <i className="fa fa-home" aria-hidden="true" />
                <span>Flat {user.flatNo}</span>
              </span>
            )}
            <span className="dashboard-badge">
              <i className="fa fa-shield" aria-hidden="true" />
              <span>{user.role}</span>
            </span>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section aria-label="Available Services">
        <div className="quick-action-grid">
          {visibleLinks.map((link) => (
            <Link key={link.to} className="quick-action-card" to={link.to}>
              <div className={`quick-action-card__icon-wrap ${link.colorClass}`}>
                <i className={`fa ${link.icon}`} aria-hidden="true" />
              </div>
              <h2 className="quick-action-card__title">{link.label}</h2>
              <p className="quick-action-card__desc">{link.description}</p>
              <span className="quick-action-card__action">
                <span>Access Service</span>
                <i className="fa fa-arrow-right" aria-hidden="true" />
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
