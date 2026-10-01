import { useQuery } from '@tanstack/react-query';
import { listInventory, type InventoryItem } from '../../lib/api/inventory';
import { listVehicles, type Vehicle } from '../../lib/api/vehicles';
import { listReadings, type ElectricReading } from '../../lib/api/readings';
import { listPO, type PO } from '../../lib/api/po';
import '../common.css';

export function ReportsPage() {
  const { data: inventory = [] } = useQuery<InventoryItem[]>({
    queryKey: ['inventory-report'],
    queryFn: () => listInventory(),
  });

  const { data: vehicles = [] } = useQuery<Vehicle[]>({
    queryKey: ['vehicles-report'],
    queryFn: () => listVehicles(),
  });

  const { data: readings = [] } = useQuery<ElectricReading[]>({
    queryKey: ['readings-report'],
    queryFn: () => listReadings(),
  });

  const { data: pos = [] } = useQuery<PO[]>({
    queryKey: ['po-report'],
    queryFn: () => listPO(),
  });

  const lowStockItems = inventory.filter((i) => i.quantity < 10);
  const totalReadings = readings.reduce((sum, r) => sum + (r.amount || 0), 0);
  const pendingPOs = pos.filter((p) => p.status === 'pending').length;

  return (
    <div className="container">
      <div className="header">
        <div>
          <h1>Facility Analytics & Operations Reports</h1>
          <p style={{ color: '#64748b', margin: '0.25rem 0 0 0', fontSize: '0.9rem' }}>
            High-level overview of colony assets, vehicle registry, utilities billing, and procurement orders
          </p>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.25rem',
          marginTop: '1rem',
          marginBottom: '2rem',
        }}
      >
        <div
          style={{
            background: '#ffffff',
            padding: '1.25rem',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            borderTop: '4px solid #0066cc',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '0.95rem', color: '#475569' }}>Inventory Summary</h3>
            <i className="fa fa-cubes" aria-hidden="true" style={{ color: '#0066cc', fontSize: '1.2rem' }} />
          </div>
          <p style={{ fontSize: '2.1rem', fontWeight: 700, margin: '0.75rem 0 0 0', color: '#0066cc', lineHeight: 1.1 }}>
            {inventory.length}
          </p>
          <p style={{ color: '#64748b', margin: '0.35rem 0 0 0', fontSize: '0.8rem' }}>Total Stocked Items</p>
          <p style={{ color: lowStockItems.length > 0 ? '#dc2626' : '#16a34a', marginTop: '0.75rem', fontSize: '0.82rem', fontWeight: 600 }}>
            {lowStockItems.length} items low stock (&lt; 10 units)
          </p>
        </div>

        <div
          style={{
            background: '#ffffff',
            padding: '1.25rem',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            borderTop: '4px solid #16a34a',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '0.95rem', color: '#475569' }}>Vehicles Registered</h3>
            <i className="fa fa-car" aria-hidden="true" style={{ color: '#16a34a', fontSize: '1.2rem' }} />
          </div>
          <p style={{ fontSize: '2.1rem', fontWeight: 700, margin: '0.75rem 0 0 0', color: '#16a34a', lineHeight: 1.1 }}>
            {vehicles.length}
          </p>
          <p style={{ color: '#64748b', margin: '0.35rem 0 0 0', fontSize: '0.8rem' }}>Active Resident Stickers</p>
        </div>

        <div
          style={{
            background: '#ffffff',
            padding: '1.25rem',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            borderTop: '4px solid #d97706',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '0.95rem', color: '#475569' }}>Electric Recovery</h3>
            <i className="fa fa-bolt" aria-hidden="true" style={{ color: '#d97706', fontSize: '1.2rem' }} />
          </div>
          <p style={{ fontSize: '2.1rem', fontWeight: 700, margin: '0.75rem 0 0 0', color: '#d97706', lineHeight: 1.1 }}>
            ₹{totalReadings.toFixed(2)}
          </p>
          <p style={{ color: '#64748b', margin: '0.35rem 0 0 0', fontSize: '0.8rem' }}>Total Consumption Amount</p>
        </div>

        <div
          style={{
            background: '#ffffff',
            padding: '1.25rem',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            borderTop: '4px solid #7c3aed',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '0.95rem', color: '#475569' }}>Purchase Orders</h3>
            <i className="fa fa-file-text-o" aria-hidden="true" style={{ color: '#7c3aed', fontSize: '1.2rem' }} />
          </div>
          <p style={{ fontSize: '2.1rem', fontWeight: 700, margin: '0.75rem 0 0 0', color: '#7c3aed', lineHeight: 1.1 }}>
            {pendingPOs}
          </p>
          <p style={{ color: '#64748b', margin: '0.35rem 0 0 0', fontSize: '0.8rem' }}>Pending PO Approvals</p>
        </div>
      </div>

      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem' }}>
        <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', color: '#0f172a' }}>Low Stock Inventory Alert</h3>
        {lowStockItems.length > 0 ? (
          <div className="table-responsive" style={{ margin: 0 }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Item Code</th>
                  <th>Item Name</th>
                  <th>Current Quantity</th>
                </tr>
              </thead>
              <tbody>
                {lowStockItems.slice(0, 10).map((item) => (
                  <tr key={item.id}>
                    <td><strong>{item.itemCode}</strong></td>
                    <td>{item.itemName}</td>
                    <td style={{ color: '#dc2626', fontWeight: 700 }}>{item.quantity} units</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={{ color: '#16a34a', margin: 0, fontSize: '0.9rem' }}>
            <i className="fa fa-check-circle" aria-hidden="true" style={{ marginRight: '6px' }} />
            All inventory levels are currently healthy and above threshold.
          </p>
        )}
      </div>
    </div>
  );
}
