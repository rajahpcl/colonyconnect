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
    title: 'Resident',
    items: [
      { label: 'My Complaints', to: '/app/complaints/my', allowedRoles: ['RESIDENT', 'FAMILY_MEMBER', 'ADMIN'] },
      { label: 'Resident Home', to: '/app/home', allowedRoles: ['RESIDENT', 'FAMILY_MEMBER', 'ADMIN', 'COMPLEX_ADMIN'] },
    ],
  },
  {
    title: 'Operations',
    items: [
      { label: 'Admin Dashboard', to: '/app/admin/dashboard', allowedRoles: ['ADMIN', 'COMPLEX_ADMIN', 'SYSTEM_ADMIN'] },
      { label: 'IFMS Queue', to: '/app/ifms/pending', allowedRoles: ['IFMS', 'ADMIN', 'COMPLEX_ADMIN', 'SYSTEM_ADMIN'] },
      { label: 'Security Desk', to: '/app/security/home', allowedRoles: ['SECURITY'] },
    ],
  },
  {
    title: 'Masters',
    items: [
      { label: 'Vendors', to: '/app/masters/vendors', allowedRoles: ['ADMIN', 'COMPLEX_ADMIN', 'SYSTEM_ADMIN'] },
      { label: 'Vendor Mapping', to: '/app/masters/vendor-mappings', allowedRoles: ['ADMIN', 'COMPLEX_ADMIN', 'SYSTEM_ADMIN'] },
      { label: 'Complaint Categories', to: '/app/masters/complaint-categories', allowedRoles: ['ADMIN', 'COMPLEX_ADMIN', 'SYSTEM_ADMIN'] },
      { label: 'Complaint Subcategories', to: '/app/masters/complaint-subcategories', allowedRoles: ['ADMIN', 'COMPLEX_ADMIN', 'SYSTEM_ADMIN'] },
      { label: 'PO Items', to: '/app/masters/po-items', allowedRoles: ['ADMIN', 'COMPLEX_ADMIN', 'SYSTEM_ADMIN'] },
      { label: 'IFMS Members', to: '/app/masters/ifms-members', allowedRoles: ['ADMIN', 'COMPLEX_ADMIN', 'SYSTEM_ADMIN'] },
      { label: 'Statuses', to: '/app/masters/statuses', allowedRoles: ['ADMIN', 'COMPLEX_ADMIN', 'SYSTEM_ADMIN'] },
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
