import { Link } from 'react-router-dom';
import { hasAnyRole } from '../lib/auth/permissions';
import { useAuthStore } from '../lib/auth/authStore';

const dashboardLinks = [
  {
    label: 'Inventory',
    description: 'Manage colony inventory and assets.',
    to: '/app/inventory',
    allowedRoles: ['ADMIN', 'COMPLEX_ADMIN', 'SYSTEM_ADMIN'],
    icon: 'fa-ship',
  },
  {
    label: 'Electricity Reading',
    description: 'Record and monitor electricity consumption.',
    to: '/app/admin/electric-reading',
    allowedRoles: ['ADMIN', 'COMPLEX_ADMIN', 'SYSTEM_ADMIN', 'SECURITY'],
    icon: 'fa-table',
  },
  {
    label: 'My Complaints',
    description: 'Resident-facing complaints and status tracking.',
    to: '/app/complaints/my',
    allowedRoles: ['RESIDENT', 'FAMILY_MEMBER', 'ADMIN'],
    icon: 'fa-pencil-square-o',
  },
  {
    label: 'Vendor Master',
    description: 'Review active vendor rows and category alignment.',
    to: '/app/masters/vendors',
    allowedRoles: ['ADMIN', 'COMPLEX_ADMIN', 'SYSTEM_ADMIN'],
    icon: 'fa-building',
  },
  {
    label: 'Complaint Categories',
    description: 'Manage complaint categories and mappings.',
    to: '/app/masters/complaint-categories',
    allowedRoles: ['ADMIN', 'COMPLEX_ADMIN', 'SYSTEM_ADMIN'],
    icon: 'fa-tags',
  },
  {
    label: 'IFMS Queue',
    description: 'Pending complaint workspace scaffold.',
    to: '/app/ifms/pending',
    allowedRoles: ['IFMS', 'ADMIN', 'COMPLEX_ADMIN', 'SYSTEM_ADMIN'],
    icon: 'fa-tasks',
  },
];

export function DashboardPage() {
  const user = useAuthStore((state) => state.user);

  if (!user) {
    return null;
  }

  const visibleLinks = dashboardLinks.filter((link) => hasAnyRole(user, link.allowedRoles));

  return (
    <div className="colony-dashboard container">
      <br />
      <div className="row justify-content-center">
        {visibleLinks.map((link, index) => (
          <div key={link.to} className="col-sm-3 col-md-3 col-lg-3">
            <Link
              className="colony-block"
              to={link.to}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <h2 className="colony-block__title">
                <i className={`fa ${link.icon}`} />&nbsp;&nbsp;{link.label}
              </h2>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
