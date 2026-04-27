import { NavLink } from 'react-router-dom';
import { hasAnyRole } from '../../lib/auth/permissions';
import type { SessionUser } from '../../lib/auth/types';

type NavItem = {
  label: string;
  to: string;
  allowedRoles: string[];
};

type NavSection = {
  title: string;
  items: NavItem[];
};

const navSections: NavSection[] = [
  {
    title: 'Home',
    items: [
      { label: 'Home', to: '/app/home', allowedRoles: ['RESIDENT', 'FAMILY_MEMBER', 'ADMIN', 'COMPLEX_ADMIN', 'SYSTEM_ADMIN', 'IFMS', 'SECURITY'] },
    ],
  },
  {
    title: 'IFMS Tasks',
    items: [
      { label: 'My Pending Task', to: '/app/ifms/pending', allowedRoles: ['IFMS', 'ADMIN', 'COMPLEX_ADMIN', 'SYSTEM_ADMIN'] },
      { label: 'Request List', to: '/app/ifms/requests', allowedRoles: ['IFMS', 'ADMIN', 'COMPLEX_ADMIN', 'SYSTEM_ADMIN'] },
      { label: 'Raise Proxy Request', to: '/app/ifms/proxy', allowedRoles: ['IFMS', 'ADMIN', 'COMPLEX_ADMIN', 'SYSTEM_ADMIN'] },
    ],
  },
  {
    title: 'Complaints',
    items: [
      { label: 'New Complaint', to: '/app/complaints/new', allowedRoles: ['RESIDENT', 'FAMILY_MEMBER', 'ADMIN', 'COMPLEX_ADMIN', 'SYSTEM_ADMIN'] },
      { label: 'My Complaints', to: '/app/complaints/my', allowedRoles: ['RESIDENT', 'FAMILY_MEMBER', 'ADMIN', 'COMPLEX_ADMIN', 'SYSTEM_ADMIN'] },
    ],
  },
  {
    title: 'Admin',
    items: [
      { label: 'Dashboard', to: '/app/admin/dashboard', allowedRoles: ['ADMIN', 'COMPLEX_ADMIN', 'SYSTEM_ADMIN'] },
      { label: 'Complaint List', to: '/app/admin/complaints', allowedRoles: ['ADMIN', 'COMPLEX_ADMIN', 'SYSTEM_ADMIN'] },
      { label: 'Electric Rate', to: '/app/admin/electric-rates', allowedRoles: ['ADMIN', 'COMPLEX_ADMIN', 'SYSTEM_ADMIN'] },
      { label: 'Electric Reading', to: '/app/admin/electric-reading', allowedRoles: ['ADMIN', 'COMPLEX_ADMIN', 'SYSTEM_ADMIN'] },
      { label: 'Admin Roles', to: '/app/admin/roles', allowedRoles: ['ADMIN', 'COMPLEX_ADMIN', 'SYSTEM_ADMIN'] },
      { label: 'IFMS Master', to: '/app/admin/ifms-master', allowedRoles: ['ADMIN', 'COMPLEX_ADMIN', 'SYSTEM_ADMIN'] },
      { label: 'Assign Flats', to: '/app/admin/assign-flats', allowedRoles: ['ADMIN', 'COMPLEX_ADMIN', 'SYSTEM_ADMIN'] },
    ],
  },
  {
    title: 'Masters',
    items: [
      { label: 'Vendor Master', to: '/app/masters/vendors', allowedRoles: ['ADMIN', 'COMPLEX_ADMIN', 'SYSTEM_ADMIN'] },
      { label: 'Vendor Mapping', to: '/app/masters/vendor-mappings', allowedRoles: ['ADMIN', 'COMPLEX_ADMIN', 'SYSTEM_ADMIN'] },
      { label: 'Complaint Categories', to: '/app/masters/complaint-categories', allowedRoles: ['ADMIN', 'COMPLEX_ADMIN', 'SYSTEM_ADMIN'] },
      { label: 'Complaint SubCategories', to: '/app/masters/complaint-subcategories', allowedRoles: ['ADMIN', 'COMPLEX_ADMIN', 'SYSTEM_ADMIN'] },
      { label: 'PO Master', to: '/app/masters/po-items', allowedRoles: ['ADMIN', 'COMPLEX_ADMIN', 'SYSTEM_ADMIN'] },
      { label: 'IFMS Members', to: '/app/masters/ifms-members', allowedRoles: ['ADMIN', 'COMPLEX_ADMIN', 'SYSTEM_ADMIN'] },
      { label: 'Statuses', to: '/app/masters/statuses', allowedRoles: ['ADMIN', 'COMPLEX_ADMIN', 'SYSTEM_ADMIN'] },
    ],
  },
  {
    title: 'Operations',
    items: [
      { label: 'Inventory', to: '/app/inventory/list', allowedRoles: ['ADMIN', 'COMPLEX_ADMIN', 'SYSTEM_ADMIN'] },
      { label: 'Vehicles', to: '/app/vehicles/list', allowedRoles: ['ADMIN', 'COMPLEX_ADMIN', 'SYSTEM_ADMIN'] },
      { label: 'Electric Readings', to: '/app/readings/electric', allowedRoles: ['ADMIN', 'COMPLEX_ADMIN', 'SYSTEM_ADMIN'] },
      { label: 'Purchase Orders', to: '/app/po/list', allowedRoles: ['ADMIN', 'COMPLEX_ADMIN', 'SYSTEM_ADMIN'] },
    ],
  },
  {
    title: 'Reports',
    items: [
      { label: 'Dashboard Report', to: '/app/reports/dashboard', allowedRoles: ['ADMIN', 'COMPLEX_ADMIN', 'SYSTEM_ADMIN'] },
      { label: 'All Reports', to: '/app/reports/all', allowedRoles: ['ADMIN', 'COMPLEX_ADMIN', 'SYSTEM_ADMIN'] },
      { label: 'Analytics', to: '/app/reports', allowedRoles: ['ADMIN', 'COMPLEX_ADMIN', 'SYSTEM_ADMIN'] },
    ],
  },
  {
    title: 'Security',
    items: [
      { label: 'Security Home', to: '/app/security/home', allowedRoles: ['SECURITY'] },
    ],
  },
];

type RoleBasedNavProps = {
  user: SessionUser;
};

export function RoleBasedNav({ user }: RoleBasedNavProps) {
  return (
    <nav className="nav-groups" aria-label="Primary navigation">
      {navSections.map((section) => {
        const visibleItems = section.items.filter((item) => hasAnyRole(user, item.allowedRoles));

        if (visibleItems.length === 0) {
          return null;
        }

        return (
          <div className="nav-group" key={section.title}>
            <p className="nav-group__title">{section.title}</p>
            <div className="nav-group__links">
              {visibleItems.map((item) => (
                <NavLink
                  key={item.to}
                  className={({ isActive }) => `nav-link${isActive ? ' nav-link--active' : ''}`}
                  to={item.to}
                >
                  {item.label}
                </NavLink>
              ))}
            </div>
          </div>
        );
      })}
    </nav>
  );
}
