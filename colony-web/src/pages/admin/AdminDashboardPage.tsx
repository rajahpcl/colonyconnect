import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { getAdminDashboard } from '../../lib/api/admin';
import '../common.css';

export function AdminDashboardPage() {
  const { data: dashboard, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: () => getAdminDashboard(),
  });

  const d = dashboard || {
    totalComplaints: 0,
    pendingComplaints: 0,
    resolvedComplaints: 0,
    averageResolutionTime: 0,
    totalInventory: 0,
    totalVehicles: 0,
    pendingPOs: 0,
  };

  const kpis = [
    {
      title: 'Total Complaints',
      value: d.totalComplaints,
      unit: 'Registered in colony',
      icon: 'fa-ticket',
      color: '#0284c7',
      bg: '#e0f2fe',
      link: '/app/admin/complaints',
    },
    {
      title: 'Pending Action',
      value: d.pendingComplaints,
      unit: 'Requires technician',
      icon: 'fa-clock-o',
      color: '#d97706',
      bg: '#fef3c7',
      link: '/app/admin/complaints',
    },
    {
      title: 'Resolved Requests',
      value: d.resolvedComplaints,
      unit: 'Closed successfully',
      icon: 'fa-check-circle',
      color: '#059669',
      bg: '#d1fae5',
      link: '/app/admin/complaints',
    },
    {
      title: 'Avg. Resolution Time',
      value: `${d.averageResolutionTime}d`,
      unit: 'SLA target: < 3 days',
      icon: 'fa-hourglass-half',
      color: '#7c3aed',
      bg: '#ede9fe',
    },
    {
      title: 'Inventory Items',
      value: d.totalInventory,
      unit: 'Stocked materials',
      icon: 'fa-cubes',
      color: '#0d9488',
      bg: '#ccfbf1',
      link: '/app/inventory',
    },
    {
      title: 'Registered Vehicles',
      value: d.totalVehicles,
      unit: 'Resident & staff cars',
      icon: 'fa-car',
      color: '#e11d48',
      bg: '#ffe4e6',
      link: '/app/vehicles/list',
    },
    {
      title: 'Pending POs',
      value: d.pendingPOs,
      unit: 'Awaiting approvals',
      icon: 'fa-file-text-o',
      color: '#ea580c',
      bg: '#ffedd5',
      link: '/app/po/list',
    },
  ];

  return (
    <div className="container">
      {/* Header */}
      <div className="header">
        <div>
          <h1>Admin Operations Dashboard</h1>
          <p style={{ color: '#64748b', margin: '0.25rem 0 0 0', fontSize: '0.9rem' }}>
            Real-time colony maintenance tracking, facility health, and asset metrics
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <Link to="/app/reports/all" className="btn btn-secondary">
            <i className="fa fa-bar-chart" aria-hidden="true" style={{ marginRight: '6px' }} />
            View Reports
          </Link>
          <Link to="/app/admin/complaints" className="btn btn-primary">
            <i className="fa fa-list" aria-hidden="true" style={{ marginRight: '6px' }} />
            Manage Complaints
          </Link>
        </div>
      </div>

      {isLoading ? (
        <p style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Loading dashboard metrics...</p>
      ) : (
        <>
          {/* KPI Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '1.25rem',
              marginTop: '1.5rem',
              marginBottom: '2rem',
            }}
          >
            {kpis.map((kpi) => (
              <div
                key={kpi.title}
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '1.25rem',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  borderTop: `4px solid ${kpi.color}`,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#475569' }}>{kpi.title}</span>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '8px',
                      background: kpi.bg,
                      color: kpi.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1rem',
                    }}
                  >
                    <i className={`fa ${kpi.icon}`} aria-hidden="true" />
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '2.1rem', fontWeight: 700, color: '#0f172a', lineHeight: 1.1 }}>
                    {kpi.value}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.35rem' }}>
                    {kpi.unit}
                  </div>
                </div>

                {kpi.link && (
                  <Link
                    to={kpi.link}
                    style={{
                      marginTop: '1rem',
                      paddingTop: '0.5rem',
                      borderTop: '1px solid #f1f5f9',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      color: kpi.color,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <span>View details</span>
                    <i className="fa fa-arrow-right" aria-hidden="true" style={{ fontSize: '0.7rem' }} />
                  </Link>
                )}
              </div>
            ))}
          </div>

          {/* Admin Quick Task Shortcuts */}
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '1.25rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            }}
          >
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', color: '#0f172a' }}>
              Common Administrative Tasks
            </h3>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '0.75rem',
              }}
            >
              <Link to="/app/admin/assign-flats" className="btn btn-secondary" style={{ justifyContent: 'flex-start' }}>
                <i className="fa fa-home" aria-hidden="true" style={{ marginRight: '8px', color: '#0284c7' }} />
                Assign Resident Flats
              </Link>
              <Link to="/app/admin/electric-reading" className="btn btn-secondary" style={{ justifyContent: 'flex-start' }}>
                <i className="fa fa-bolt" aria-hidden="true" style={{ marginRight: '8px', color: '#d97706' }} />
                Record Electricity
              </Link>
              <Link to="/app/admin/roles" className="btn btn-secondary" style={{ justifyContent: 'flex-start' }}>
                <i className="fa fa-users" aria-hidden="true" style={{ marginRight: '8px', color: '#7c3aed' }} />
                Manage Admin Roles
              </Link>
              <Link to="/app/masters/vendors" className="btn btn-secondary" style={{ justifyContent: 'flex-start' }}>
                <i className="fa fa-building" aria-hidden="true" style={{ marginRight: '8px', color: '#059669' }} />
                Vendor Directory
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
