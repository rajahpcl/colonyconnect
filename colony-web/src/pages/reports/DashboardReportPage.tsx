import { useQuery } from '@tanstack/react-query';
import { getAdminDashboard } from '../../lib/api/admin';
import '../common.css';

export function DashboardReportPage() {
  const { data: dashboard } = useQuery({
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

  const stats = [
    { label: 'Total Complaints', value: d.totalComplaints, color: '#0066cc' },
    { label: 'Pending', value: d.pendingComplaints, color: '#f39c12' },
    { label: 'Resolved', value: d.resolvedComplaints, color: '#27ae60' },
    { label: 'Avg Resolution (days)', value: d.averageResolutionTime, color: '#8e44ad' },
    { label: 'Inventory Items', value: d.totalInventory, color: '#16a085' },
    { label: 'Vehicles', value: d.totalVehicles, color: '#c0392b' },
    { label: 'Pending POs', value: d.pendingPOs, color: '#d35400' },
  ];

  return (
    <div className="container">
      <h1>Dashboard Report</h1>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '2rem',
        marginTop: '2rem',
      }}>
        {stats.map((stat) => (
          <div
            key={stat.label}
            style={{
              background: '#fff',
              padding: '2rem',
              borderRadius: '4px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              borderTop: `4px solid ${stat.color}`,
            }}
          >
            <p style={{ color: '#666', margin: '0 0 1rem 0', fontSize: '0.9rem', fontWeight: '500', textTransform: 'uppercase' }}>
              {stat.label}
            </p>
            <p style={{ margin: 0, fontSize: '2.5rem', fontWeight: 'bold', color: stat.color }}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
