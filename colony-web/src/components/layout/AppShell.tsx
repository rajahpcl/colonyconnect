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
      { label: 'Complaint List', icon: '', to: '/app/admin/complaints', allowedRoles: ['ADMIN', 'COMPLEX_ADMIN', 'SYSTEM_ADMIN'] },
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
  const [mobileExpanded, setMobileExpanded] = useState<Record<string, boolean>>({});
  const dropdownTimerRef = useRef<number | null>(null);

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

  // Lock background scroll when mobile menu is open & handle Esc key
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') setMobileMenuOpen(false);
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      document.body.style.overflow = '';
    }
  }, [mobileMenuOpen]);

  if (!user) {
    return null;
  }

  const visibleItems = navItems.filter((item) => hasAnyRole(user, item.allowedRoles));

  function handleDropdownEnter(label: string) {
    if (dropdownTimerRef.current !== null) {
      window.clearTimeout(dropdownTimerRef.current);
    }
    setOpenDropdown(label);
  }

  function handleDropdownLeave() {
    dropdownTimerRef.current = window.setTimeout(() => {
      setOpenDropdown(null);
    }, 150);
  }

  function toggleMobileSubmenu(label: string) {
    setMobileExpanded((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  }

  return (
    <div className="colony-shell">
      {/* ---- TOP APP HEADER ---- */}
      <header className="colony-header">
        <div className="colony-header__inner">
          {/* Brand */}
          <NavLink to="/app/home" className="colony-header__brand" aria-label="ColonyConnect Home">
            <img
              src={`${import.meta.env.BASE_URL}new_logo_light.svg`}
              alt="HPCL Logo"
              className="colony-header__brand-logo"
              onError={(e) => {
                (e.target as HTMLImageElement).src = `${import.meta.env.BASE_URL}hp.png`;
              }}
            />
            <div className="colony-header__titles">
              <span className="colony-header__app-title">ColonyConnect</span>
              <span className="colony-header__app-subtitle">Hindustan Petroleum Corporation Limited</span>
            </div>
          </NavLink>

          {/* Actions & User Profile */}
          <div className="colony-header__actions">
            {/* Session countdown */}
            <div className="colony-session-pill" title="Active session time remaining">
              <i className="fa fa-clock-o" aria-hidden="true" />
              <span>Session: <strong>{sessionTime}</strong></span>
            </div>

            {/* Desktop User Profile chip */}
            <div className="colony-user-chip">
              <img
                src={`${import.meta.env.BASE_URL}user.png`}
                alt=""
                className="colony-user-chip__avatar"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `${import.meta.env.BASE_URL}hpcl_logo.png`;
                }}
              />
              <div className="colony-user-chip__meta">
                <span className="colony-user-chip__name">{user.name}</span>
                <span className="colony-user-chip__role">
                  {user.role} {user.flatNo ? `• Flat ${user.flatNo}` : ''}
                </span>
              </div>
            </div>

            {/* Desktop Logout Button */}
            <button
              className="colony-btn-logout-desktop"
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
              type="button"
              title="Sign out of ColonyConnect"
            >
              <i className="fa fa-sign-out" aria-hidden="true" />
              <span>{logoutMutation.isPending ? 'Signing out…' : 'Logout'}</span>
            </button>

            {/* Mobile Hamburger Button */}
            <button
              className={`colony-hamburger-btn ${mobileMenuOpen ? 'colony-hamburger-btn--open' : ''}`}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              type="button"
              aria-label={mobileMenuOpen ? 'Close navigation' : 'Open navigation'}
              aria-expanded={mobileMenuOpen}
            >
              <span className="hamburger-bar" />
              <span className="hamburger-bar" />
              <span className="hamburger-bar" />
            </button>
          </div>
        </div>

        {/* ---- DESKTOP PRIMARY NAVIGATION BAR ---- */}
        <nav className="colony-desktop-navbar" aria-label="Primary Desktop Navigation">
          <div className="colony-desktop-navbar__inner">
            <ul className="colony-desktop-navbar__list">
              {visibleItems.map((item) => {
                if (item.children) {
                  const visibleChildren = item.children.filter((child) => hasAnyRole(user, child.allowedRoles));
                  if (visibleChildren.length === 0) return null;
                  const isOpen = openDropdown === item.label;

                  return (
                    <li
                      className="colony-nav-item"
                      key={item.label}
                      onMouseEnter={() => handleDropdownEnter(item.label)}
                      onMouseLeave={handleDropdownLeave}
                    >
                      <button
                        className={`colony-nav-link colony-nav-link--dropdown ${isOpen ? 'colony-nav-link--open' : ''}`}
                        type="button"
                        onClick={() => setOpenDropdown(isOpen ? null : item.label)}
                        aria-expanded={isOpen}
                      >
                        {item.icon && <i className={`fa ${item.icon}`} aria-hidden="true" />}
                        <span>{item.label}</span>
                      </button>
                      <div className={`colony-dropdown-menu ${isOpen ? 'colony-dropdown-menu--visible' : ''}`}>
                        {visibleChildren.map((child) => (
                          <NavLink
                            key={child.to}
                            className={({ isActive }) =>
                              `colony-dropdown-item${isActive ? ' colony-dropdown-item--active' : ''}`
                            }
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
                  <li className="colony-nav-item" key={item.to}>
                    <NavLink
                      className={({ isActive }) =>
                        `colony-nav-link${isActive ? ' colony-nav-link--active' : ''}`
                      }
                      to={item.to}
                    >
                      {item.icon && <i className={`fa ${item.icon}`} aria-hidden="true" />}
                      <span>{item.label}</span>
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </div>
        </nav>
      </header>

      {/* ---- MOBILE NAVIGATION DRAWER (Slide-Out Sheet) ---- */}
      {mobileMenuOpen && (
        <div
          className="colony-drawer-backdrop"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {mobileMenuOpen && (
        <aside className="colony-drawer" aria-label="Mobile Navigation Menu">
          {/* Drawer Header with User Card */}
          <div className="colony-drawer__header">
            <div className="colony-drawer__user">
              <img
                src={`${import.meta.env.BASE_URL}user.png`}
                alt=""
                className="colony-drawer__avatar"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `${import.meta.env.BASE_URL}hpcl_logo.png`;
                }}
              />
              <div className="colony-drawer__user-info">
                <h4>{user.name}</h4>
                <p>Emp #{user.empNo} • {user.role}</p>
                {user.complexName && <p style={{ color: '#38bdf8' }}>{user.complexName}</p>}
              </div>
            </div>
            <button
              className="colony-drawer__close"
              onClick={() => setMobileMenuOpen(false)}
              type="button"
              aria-label="Close menu"
            >
              ✕
            </button>
          </div>

          {/* Drawer Links */}
          <nav className="colony-drawer__nav">
            {visibleItems.map((item) => {
              if (item.children) {
                const visibleChildren = item.children.filter((child) => hasAnyRole(user, child.allowedRoles));
                if (visibleChildren.length === 0) return null;
                const isExpanded = mobileExpanded[item.label] ?? false;

                return (
                  <div key={item.label} style={{ marginBottom: '4px' }}>
                    <button
                      className={`colony-drawer__link ${isExpanded ? 'colony-drawer__link--open' : ''}`}
                      onClick={() => toggleMobileSubmenu(item.label)}
                      type="button"
                      aria-expanded={isExpanded}
                    >
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                        {item.icon && <i className={`fa ${item.icon}`} aria-hidden="true" />}
                        {item.label}
                      </span>
                      <span className="colony-drawer__accordion-icon">▼</span>
                    </button>
                    {isExpanded && (
                      <div className="colony-drawer__sublist">
                        {visibleChildren.map((child) => (
                          <NavLink
                            key={child.to}
                            to={child.to}
                            className={({ isActive }) =>
                              `colony-drawer__sublink${isActive ? ' colony-drawer__sublink--active' : ''}`
                            }
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            {child.label}
                          </NavLink>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `colony-drawer__link${isActive ? ' colony-drawer__link--active' : ''}`
                  }
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                    {item.icon && <i className={`fa ${item.icon}`} aria-hidden="true" />}
                    {item.label}
                  </span>
                </NavLink>
              );
            })}
          </nav>

          {/* Drawer Footer */}
          <div className="colony-drawer__footer">
            <div className="colony-drawer__session-info">
              <i className="fa fa-clock-o" aria-hidden="true" /> Session active: <strong>{sessionTime}</strong>
            </div>
            <button
              className="colony-drawer__logout"
              onClick={() => {
                setMobileMenuOpen(false);
                logoutMutation.mutate();
              }}
              disabled={logoutMutation.isPending}
              type="button"
            >
              <i className="fa fa-sign-out" aria-hidden="true" />
              <span>{logoutMutation.isPending ? 'Signing out…' : 'Sign out'}</span>
            </button>
          </div>
        </aside>
      )}

      {/* ---- Accent bar (HPCL tri-color shimmer) ---- */}
      <div className="colony-accent-bar" />

      {/* ---- MAIN CONTENT ---- */}
      <main className="colony-main">
        <Outlet />
      </main>

      {/* ---- FOOTER ---- */}
      <footer className="colony-footer">
        <div className="colony-footer__inner">
          <p>© {new Date().getFullYear()} Hindustan Petroleum Corporation Limited. All Rights Reserved.</p>
          <span className="colony-footer__version">ColonyConnect Enterprise v2.0</span>
        </div>
      </footer>
    </div>
  );
}
