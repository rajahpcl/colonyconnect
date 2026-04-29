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
      { label: 'Colony Vendor Mapping', to: '/app/masters/vendor-mappings', allowedRoles: ['ADMIN', 'COMPLEX_ADMIN', 'SYSTEM_ADMIN'] },
      { label: 'Add Complaint Category', to: '/app/masters/complaint-categories', allowedRoles: ['ADMIN', 'COMPLEX_ADMIN', 'SYSTEM_ADMIN'] },
      { label: 'Add Complaint SubCategory', to: '/app/masters/complaint-subcategories', allowedRoles: ['ADMIN', 'COMPLEX_ADMIN', 'SYSTEM_ADMIN'] },
      { label: 'PO Master', to: '/app/masters/po-items', allowedRoles: ['ADMIN', 'COMPLEX_ADMIN', 'SYSTEM_ADMIN'] },
      { label: 'IFMS Members', to: '/app/masters/ifms-members', allowedRoles: ['ADMIN', 'COMPLEX_ADMIN', 'SYSTEM_ADMIN'] },
      { label: 'Statuses', to: '/app/masters/statuses', allowedRoles: ['ADMIN', 'COMPLEX_ADMIN', 'SYSTEM_ADMIN'] },
    ],
  },
  {
    title: 'Resident Dashboard',
    items: [
      { label: 'Vehicle Info', to: '/app/vehicles/list', allowedRoles: ['RESIDENT', 'FAMILY_MEMBER', 'COMPLEX_ADMIN', 'ADMIN', 'SYSTEM_ADMIN'] },
      { label: 'Electric Reading', to: '/app/readings/electric', allowedRoles: ['RESIDENT', 'FAMILY_MEMBER', 'COMPLEX_ADMIN', 'ADMIN', 'SYSTEM_ADMIN'] },
      { label: 'Inventory Acknowledgement', to: '/app/resident/inventory-ack', allowedRoles: ['RESIDENT', 'FAMILY_MEMBER', 'COMPLEX_ADMIN', 'ADMIN', 'SYSTEM_ADMIN'] },
      { label: 'Inventory HR', to: '/app/resident/inventory-hr', allowedRoles: ['RESIDENT', 'FAMILY_MEMBER', 'COMPLEX_ADMIN', 'ADMIN', 'SYSTEM_ADMIN'] },
      { label: 'Inventory Report', to: '/app/resident/inventory-report', allowedRoles: ['RESIDENT', 'FAMILY_MEMBER', 'COMPLEX_ADMIN', 'ADMIN', 'SYSTEM_ADMIN'] },
      { label: 'Family Login Access', to: '/app/resident/family-login', allowedRoles: ['RESIDENT', 'COMPLEX_ADMIN', 'ADMIN', 'SYSTEM_ADMIN'] },
      { label: 'Approved Make List', to: '/app/resident/approved-makes', allowedRoles: ['RESIDENT', 'COMPLEX_ADMIN', 'ADMIN', 'SYSTEM_ADMIN'] },
      { label: 'Contact Details', to: '/app/resident/contact-details', allowedRoles: ['RESIDENT', 'COMPLEX_ADMIN', 'ADMIN', 'SYSTEM_ADMIN'] },
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
    title: 'Report',
    items: [
      { label: 'Dashboard', to: '/app/reports/dashboard', allowedRoles: ['ADMIN', 'COMPLEX_ADMIN', 'SYSTEM_ADMIN'] },
      { label: 'Report', to: '/app/reports/all', allowedRoles: ['ADMIN', 'COMPLEX_ADMIN', 'SYSTEM_ADMIN'] },
      { label: 'Occupancy Report', to: '/app/reports/occupancy', allowedRoles: ['ADMIN', 'COMPLEX_ADMIN', 'SYSTEM_ADMIN'] },
      { label: 'Vehicle Report', to: '/app/reports/vehicles', allowedRoles: ['ADMIN', 'COMPLEX_ADMIN', 'SYSTEM_ADMIN'] },
      { label: 'Matrix Report PO Items v/s Complaints', to: '/app/reports/matrix-po-complaints', allowedRoles: ['ADMIN', 'COMPLEX_ADMIN', 'SYSTEM_ADMIN'] },
      { label: 'PO Items v/s Total Qty', to: '/app/reports/po-qty', allowedRoles: ['ADMIN', 'COMPLEX_ADMIN', 'SYSTEM_ADMIN'] },
    ],
  },
  {
    title: 'Security Tasks',
    items: [
      { label: 'Security Home', to: '/app/security/home', allowedRoles: ['SECURITY'] },
      { label: 'Inventory Check', to: '/app/security/inventory', allowedRoles: ['SECURITY'] },
      { label: 'Electric Readings', to: '/app/security/electric', allowedRoles: ['SECURITY'] },
    ],
  },
  {
    title: 'Vendor Portal',
    items: [
      { label: 'Assigned Complaints', to: '/app/vendor/complaints', allowedRoles: ['VENDOR'] },
      { label: 'PO Tasks', to: '/app/vendor/po', allowedRoles: ['VENDOR'] },
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
