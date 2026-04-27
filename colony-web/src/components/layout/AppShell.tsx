import { useState, useEffect, useRef } from 'react';
import { Outlet, useNavigate, NavLink, useLocation } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { logout } from '../../lib/api/auth';
import { useAuthStore } from '../../lib/auth/authStore';
import { hasAnyRole } from '../../lib/auth/permissions';

type NavItem = {
  label: string;
  icon: string;
  to: string;
  allowedRoles: string[];
  children?: NavItem[];
};

const navItems: NavItem[] = [
  { label: 'Home', icon: 'fa-home', to: '/app/home', allowedRoles: ['RESIDENT', 'FAMILY_MEMBER', 'ADMIN', 'COMPLEX_ADMIN', 'SYSTEM_ADMIN', 'IFMS', 'SECURITY'] },
  {
    label: 'Complaints', icon: 'fa-pencil-square-o', to: '#', allowedRoles: ['RESIDENT', 'FAMILY_MEMBER', 'ADMIN', 'COMPLEX_ADMIN', 'SYSTEM_ADMIN'],
    children: [
      { label: 'New Complaint', icon: '', to: '/app/complaints/new', allowedRoles: ['RESIDENT', 'FAMILY_MEMBER', 'ADMIN', 'COMPLEX_ADMIN', 'SYSTEM_ADMIN'] },
      { label: 'My Request', icon: '', to: '/app/complaints/my', allowedRoles: ['RESIDENT', 'FAMILY_MEMBER', 'ADMIN', 'COMPLEX_ADMIN', 'SYSTEM_ADMIN'] },
    ],
  },
  {
    label: 'IFMS Task', icon: 'fa-tasks', to: '#', allowedRoles: ['IFMS', 'ADMIN', 'COMPLEX_ADMIN', 'SYSTEM_ADMIN'],
    children: [
      { label: 'My Pending Task', icon: '', to: '/app/ifms/pending', allowedRoles: ['IFMS', 'ADMIN', 'COMPLEX_ADMIN', 'SYSTEM_ADMIN'] },
      { label: 'Request List', icon: '', to: '/app/ifms/requests', allowedRoles: ['IFMS', 'ADMIN', 'COMPLEX_ADMIN', 'SYSTEM_ADMIN'] },
      { label: 'Raise Proxy Request', icon: '', to: '/app/ifms/proxy', allowedRoles: ['IFMS', 'ADMIN', 'COMPLEX_ADMIN', 'SYSTEM_ADMIN'] },
    ],
  },
  {
    label: 'Admin', icon: 'fa-user', to: '#', allowedRoles: ['ADMIN', 'COMPLEX_ADMIN', 'SYSTEM_ADMIN'],
    children: [
      { label: 'Complaint List', icon: '', to: '/app/admin/dashboard', allowedRoles: ['ADMIN', 'COMPLEX_ADMIN', 'SYSTEM_ADMIN'] },
      { label: 'Electric Rate', icon: '', to: '/app/admin/electric-rate', allowedRoles: ['ADMIN', 'COMPLEX_ADMIN', 'SYSTEM_ADMIN'] },
      { label: 'Electric Reading', icon: '', to: '/app/admin/electric-reading', allowedRoles: ['ADMIN', 'COMPLEX_ADMIN', 'SYSTEM_ADMIN'] },
      { label: 'Admin Roles', icon: '', to: '/app/admin/roles', allowedRoles: ['ADMIN', 'COMPLEX_ADMIN', 'SYSTEM_ADMIN'] },
      { label: 'IFMS Master', icon: '', to: '/app/masters/ifms-members', allowedRoles: ['ADMIN', 'COMPLEX_ADMIN', 'SYSTEM_ADMIN'] },
      { label: 'Assign Flats', icon: '', to: '/app/admin/assign-flats', allowedRoles: ['ADMIN', 'COMPLEX_ADMIN', 'SYSTEM_ADMIN'] },
    ],
  },
  {
    label: 'Masters', icon: 'fa-user-secret', to: '#', allowedRoles: ['ADMIN', 'COMPLEX_ADMIN', 'SYSTEM_ADMIN'],
    children: [
      { label: 'Vendor Master', icon: '', to: '/app/masters/vendors', allowedRoles: ['ADMIN', 'COMPLEX_ADMIN', 'SYSTEM_ADMIN'] },
      { label: 'Colony Vendor Mapping', icon: '', to: '/app/masters/vendor-mappings', allowedRoles: ['ADMIN', 'COMPLEX_ADMIN', 'SYSTEM_ADMIN'] },
      { label: 'Complaint Categories', icon: '', to: '/app/masters/complaint-categories', allowedRoles: ['ADMIN', 'COMPLEX_ADMIN', 'SYSTEM_ADMIN'] },
      { label: 'Complaint Subcategories', icon: '', to: '/app/masters/complaint-subcategories', allowedRoles: ['ADMIN', 'COMPLEX_ADMIN', 'SYSTEM_ADMIN'] },
      { label: 'PO Master', icon: '', to: '/app/masters/po-items', allowedRoles: ['ADMIN', 'COMPLEX_ADMIN', 'SYSTEM_ADMIN'] },
      { label: 'Status Master', icon: '', to: '/app/masters/statuses', allowedRoles: ['ADMIN', 'COMPLEX_ADMIN', 'SYSTEM_ADMIN'] },
    ],
  },
  {
    label: 'Report', icon: 'fa-id-card-o', to: '#', allowedRoles: ['ADMIN', 'COMPLEX_ADMIN', 'SYSTEM_ADMIN'],
    children: [
      { label: 'Dashboard', icon: '', to: '/app/admin/dashboard', allowedRoles: ['ADMIN', 'COMPLEX_ADMIN', 'SYSTEM_ADMIN'] },
      { label: 'Report', icon: '', to: '/app/reports/main', allowedRoles: ['ADMIN', 'COMPLEX_ADMIN', 'SYSTEM_ADMIN'] },
      { label: 'Occupancy Report', icon: '', to: '/app/reports/occupancy', allowedRoles: ['ADMIN', 'COMPLEX_ADMIN', 'SYSTEM_ADMIN'] },
      { label: 'Vehicle Report', icon: '', to: '/app/reports/vehicle', allowedRoles: ['ADMIN', 'COMPLEX_ADMIN', 'SYSTEM_ADMIN'] },
      { label: 'Matrix Report', icon: '', to: '/app/reports/matrix', allowedRoles: ['ADMIN', 'COMPLEX_ADMIN', 'SYSTEM_ADMIN'] },
      { label: 'PO Items vs Qty', icon: '', to: '/app/reports/po-qty', allowedRoles: ['ADMIN', 'COMPLEX_ADMIN', 'SYSTEM_ADMIN'] },
    ],
  },
  {
    label: 'Resident Dashboard', icon: 'fa-dashboard', to: '#', allowedRoles: ['RESIDENT', 'ADMIN', 'COMPLEX_ADMIN', 'SYSTEM_ADMIN'],
    children: [
      { label: 'Vehicle Info', icon: '', to: '/app/resident/vehicle', allowedRoles: ['RESIDENT', 'ADMIN', 'COMPLEX_ADMIN', 'SYSTEM_ADMIN'] },
      { label: 'Electric Reading', icon: '', to: '/app/resident/electric', allowedRoles: ['RESIDENT', 'ADMIN', 'COMPLEX_ADMIN', 'SYSTEM_ADMIN'] },
      { label: 'Family Login Access', icon: '', to: '/app/resident/family-login', allowedRoles: ['RESIDENT', 'ADMIN', 'COMPLEX_ADMIN', 'SYSTEM_ADMIN'] },
      { label: 'Approved Make List', icon: '', to: '/app/resident/approved-make', allowedRoles: ['RESIDENT', 'ADMIN', 'COMPLEX_ADMIN', 'SYSTEM_ADMIN'] },
      { label: 'Contact Details', icon: '', to: '/app/resident/contacts', allowedRoles: ['RESIDENT', 'ADMIN', 'COMPLEX_ADMIN', 'SYSTEM_ADMIN'] },
    ],
  },
  { label: 'Security Desk', icon: 'fa-lock', to: '/app/security/home', allowedRoles: ['SECURITY'] },
];

/* ---------- session countdown timer (30 min default) ---------- */
function useSessionTimer(durationMinutes = 30) {
  const [remaining, setRemaining] = useState(durationMinutes * 60);

  useEffect(() => {
    const id = setInterval(() => {
      setRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export function AppShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const clearSession = useAuthStore((state) => state.clearSession);
  const sessionTime = useSessionTimer();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const logoutMutation = useMutation({
    mutationFn: logout,
    onSettled: () => {
      clearSession();
      navigate('/login', { replace: true });
    },
  });

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setOpenDropdown(null);
  }, [location.pathname]);

  if (!user) {
    return null;
  }

  const visibleItems = navItems.filter((item) => hasAnyRole(user, item.allowedRoles));

  function handleDropdownEnter(label: string) {
    if (dropdownTimerRef.current) clearTimeout(dropdownTimerRef.current);
    setOpenDropdown(label);
  }

  function handleDropdownLeave() {
    dropdownTimerRef.current = setTimeout(() => {
      setOpenDropdown(null);
    }, 150);
  }

  return (
    <div className="colony-shell">
      {/* ---- HEADER (matches old JSP layout) ---- */}
      <header className="colony-header">
        <div className="colony-header__inner">
          {/* Left: Large HPCL Logo */}
          <div className="colony-header__logo-area" id="big_logo">
            <img
              src="/new_logo_light.svg"
              alt="HPCL - Hindustan Petroleum Corporation Limited"
              className="colony-header__logo-svg"
            />
          </div>

          {/* Right: Title row + Nav bar */}
          <div className="colony-header__right">
            {/* Top row: App title + user info */}
            <div className="colony-header__title-row">
              <div className="colony-header__small-logo" id="small_logo">
                <img src="/hp.png" alt="HPCL" className="colony-header__hp-img" />
              </div>
              <h3 className="colony-header__app-title">Colony Maintenance</h3>
              <div className="colony-header__user-info">
                <span className="colony-header__user-name">
                  <i className="colony-icon colony-icon--user" />
                  &nbsp;{user.name}
                </span>
              </div>
              <div className="colony-header__session-badge">
                Session: <strong>{sessionTime}</strong>
              </div>
            </div>

            {/* Bottom row: Navigation bar */}
            <nav className={`colony-navbar ${mobileMenuOpen ? 'colony-navbar--open' : ''}`} aria-label="Main navigation">
              {/* Mobile hamburger */}
              <button
                className="colony-navbar__hamburger"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                type="button"
                aria-label="Toggle menu"
              >
                <span className={`hamburger-line ${mobileMenuOpen ? 'open' : ''}`} />
                <span className={`hamburger-line ${mobileMenuOpen ? 'open' : ''}`} />
                <span className={`hamburger-line ${mobileMenuOpen ? 'open' : ''}`} />
              </button>

              {/* Avatar + name in nav */}
              <div className="colony-navbar__avatar">
                <img src="/user.png" alt="" className="colony-navbar__avatar-img" onError={(e) => { (e.target as HTMLImageElement).src = '/hpcl_logo.png'; }} />
                <span className="colony-navbar__avatar-name">{user.name}</span>
              </div>

              {/* Nav items */}
              <ul className="colony-navbar__items">
                {visibleItems.map((item) => {
                  if (item.children) {
                    const visibleChildren = item.children.filter((child) => hasAnyRole(user, child.allowedRoles));
                    if (visibleChildren.length === 0) return null;
                    const isOpen = openDropdown === item.label;
                    return (
                      <li
                        className="colony-nav-dropdown"
                        key={item.label}
                        onMouseEnter={() => handleDropdownEnter(item.label)}
                        onMouseLeave={handleDropdownLeave}
                      >
                        <button
                          className={`colony-nav-link colony-nav-link--dropdown ${isOpen ? 'colony-nav-link--open' : ''}`}
                          type="button"
                          onClick={() => setOpenDropdown(isOpen ? null : item.label)}
                        >
                          {item.label}
                        </button>
                        <div className={`colony-dropdown-menu ${isOpen ? 'colony-dropdown-menu--visible' : ''}`}>
                          {visibleChildren.map((child) => (
                            <NavLink
                              key={child.to}
                              className={({ isActive }) => `colony-dropdown-item${isActive ? ' colony-dropdown-item--active' : ''}`}
                              to={child.to}
                            >
                              {child.label}
                            </NavLink>
                          ))}
                        </div>
                      </li>
                    );
                  }

                  return (
                    <li key={item.to}>
                      <NavLink
                        className={({ isActive }) => `colony-nav-link${isActive ? ' colony-nav-link--active' : ''}`}
                        to={item.to}
                      >
                        {item.label}
                      </NavLink>
                    </li>
                  );
                })}

                {/* Logout */}
                <li>
                  <button
                    className="colony-nav-link colony-nav-link--logout"
                    onClick={() => logoutMutation.mutate()}
                    disabled={logoutMutation.isPending}
                    type="button"
                  >
                    {logoutMutation.isPending ? 'Signing out…' : 'Logout'}
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </header>

      {/* ---- Accent bar (orange shimmer) ---- */}
      <div className="colony-accent-bar" />

      {/* ---- MAIN CONTENT ---- */}
      <main className="colony-main">
        <Outlet />
      </main>

      {/* ---- FOOTER ---- */}
      <footer className="colony-footer">
        <div className="colony-footer__inner">
          <p><b>© All Rights Reserved</b> Hindustan Petroleum Corporation Limited</p>
          <span className="colony-footer__version">ColonyConnect v2.0</span>
        </div>
      </footer>
    </div>
  );
}
