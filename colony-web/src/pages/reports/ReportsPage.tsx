import { useQuery } from '@tanstack/react-query';
import { listInventory } from '../../lib/api/inventory';
import { listVehicles } from '../../lib/api/vehicles';
import { listReadings } from '../../lib/api/readings';
import { listPO } from '../../lib/api/po';
import '../common.css';

export function ReportsPage() {
  const { data: inventory = [] } = useQuery({
    queryKey: ['inventory-report'],
    queryFn: () => listInventory(),
  });

  const { data: vehicles = [] } = useQuery({
    queryKey: ['vehicles-report'],
    queryFn: () => listVehicles(),
  });

  const { data: readings = [] } = useQuery({
    queryKey: ['readings-report'],
    queryFn: () => listReadings(),
  });

  const { data: pos = [] } = useQuery({
    queryKey: ['po-report'],
    queryFn: () => listPO(),
  });

  const lowStockItems = inventory.filter((i: any) => i.quantity < 10);
  const totalReadings = readings.reduce((sum: number, r: any) => sum + (r.amount || 0), 0);
  const pendingPOs = pos.filter((p: any) => p.status === 'pending').length;

  return (
    <div className="container">
      <h1>Reports & Analytics</h1>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '2rem',
        marginTop: '2rem',
      }}>
        <div style={{ background: '#fff', padding: '2rem', borderRadius: '4px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3>Inventory Summary</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: '1rem 0 0 0', color: '#0066cc' }}>
            {inventory.length}
          </p>
          <p style={{ color: '#666', margin: '0.5rem 0 0 0' }}>Total Items</p>
          <p style={{ color: '#e74c3c', marginTop: '1rem' }}>
            {lowStockItems.length} items low stock
          </p>
        </div>

        <div style={{ background: '#fff', padding: '2rem', borderRadius: '4px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3>Vehicles</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: '1rem 0 0 0', color: '#27ae60' }}>
            {vehicles.length}
          </p>
          <p style={{ color: '#666', margin: '0.5rem 0 0 0' }}>Registered</p>
        </div>

        <div style={{ background: '#fff', padding: '2rem', borderRadius: '4px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3>Electric Readings</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: '1rem 0 0 0', color: '#f39c12' }}>
            ₹{totalReadings.toFixed(2)}
          </p>
          <p style={{ color: '#666', margin: '0.5rem 0 0 0' }}>Total Amount</p>
        </div>

        <div style={{ background: '#fff', padding: '2rem', borderRadius: '4px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3>Purchase Orders</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: '1rem 0 0 0', color: '#8e44ad' }}>
            {pendingPOs}
          </p>
          <p style={{ color: '#666', margin: '0.5rem 0 0 0' }}>Pending Approval</p>
        </div>
      </div>

      <div style={{ marginTop: '3rem' }}>
        <h2>Low Stock Items</h2>
        {lowStockItems.length > 0 ? (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Name</th>
                  <th>Quantity</th>
                </tr>
              </thead>
              <tbody>
                {lowStockItems.slice(0, 5).map((item: any) => (
                  <tr key={item.id}>
                    <td>{item.itemCode}</td>
                    <td>{item.itemName}</td>
                    <td style={{ color: '#e74c3c', fontWeight: 'bold' }}>{item.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>All inventory levels healthy</p>
        )}
      </div>
    </div>
  );
}
