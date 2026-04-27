import { useQuery } from '@tanstack/react-query';
import { getAdminDashboard } from '../../lib/api/admin';
import '../common.css';

export function AdminDashboardPage() {
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

  return (
    <div className="container">
      <h1>Admin Dashboard</h1>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '2rem',
        marginTop: '2rem',
      }}>
        <div style={{ background: '#fff', padding: '2rem', borderRadius: '4px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3>Total Complaints</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: '1rem 0 0 0', color: '#0066cc' }}>
            {d.totalComplaints}
          </p>
        </div>

        <div style={{ background: '#fff', padding: '2rem', borderRadius: '4px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3>Pending</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: '1rem 0 0 0', color: '#f39c12' }}>
            {d.pendingComplaints}
          </p>
        </div>

        <div style={{ background: '#fff', padding: '2rem', borderRadius: '4px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3>Resolved</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: '1rem 0 0 0', color: '#27ae60' }}>
            {d.resolvedComplaints}
          </p>
        </div>

        <div style={{ background: '#fff', padding: '2rem', borderRadius: '4px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3>Avg Resolution</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: '1rem 0 0 0', color: '#8e44ad' }}>
            {d.averageResolutionTime}
          </p>
          <p style={{ color: '#666', margin: '0.5rem 0 0 0' }}>Days</p>
        </div>

        <div style={{ background: '#fff', padding: '2rem', borderRadius: '4px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3>Inventory Items</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: '1rem 0 0 0', color: '#16a085' }}>
            {d.totalInventory}
          </p>
        </div>

        <div style={{ background: '#fff', padding: '2rem', borderRadius: '4px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3>Vehicles</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: '1rem 0 0 0', color: '#c0392b' }}>
            {d.totalVehicles}
          </p>
        </div>

        <div style={{ background: '#fff', padding: '2rem', borderRadius: '4px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3>Pending POs</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: '1rem 0 0 0', color: '#d35400' }}>
            {d.pendingPOs}
          </p>
        </div>
      </div>
    </div>
  );
}
