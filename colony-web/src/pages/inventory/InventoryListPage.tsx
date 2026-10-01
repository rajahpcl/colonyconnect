import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { listInventory, type InventoryItem } from '../../lib/api/inventory';
import '../common.css';

export function InventoryListPage() {
  const [search, setSearch] = useState('');
  const { data: items = [], isLoading } = useQuery<InventoryItem[]>({
    queryKey: ['inventory'],
    queryFn: () => listInventory(),
  });

  const filtered = items.filter((i) =>
    i.itemName?.toLowerCase().includes(search.toLowerCase()) ||
    i.itemCode?.toLowerCase().includes(search.toLowerCase()) ||
    i.location?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container">
      <div className="header">
        <div>
          <h1>Colony Maintenance Supplies</h1>
          <p style={{ color: '#64748b', margin: '0.25rem 0 0 0', fontSize: '0.9rem' }}>
            Track plumbing, electrical fittings, carpentry hardware, and facility stock levels
          </p>
        </div>
        <div style={{ width: '100%', maxWidth: '320px', position: 'relative' }}>
          <input
            type="text"
            placeholder="Search code, item name, or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-control"
            style={{ paddingLeft: '2.5rem' }}
          />
          <i
            className="fa fa-search"
            aria-hidden="true"
            style={{
              position: 'absolute',
              left: '1rem',
              top: '50%',
              transform: 'translateY(-50)',
              color: '#94a3b8',
            }}
          />
        </div>
      </div>

      {isLoading ? (
        <p style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>Loading inventory items...</p>
      ) : (
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Item Code</th>
                <th>Item Description</th>
                <th>Stock Quantity</th>
                <th>Unit</th>
                <th>Storage Location</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id ?? item.itemCode}>
                  <td>
                    <span
                      style={{
                        fontFamily: 'monospace',
                        fontWeight: 700,
                        color: '#004085',
                        background: '#f8fafc',
                        border: '1px solid #cbd5e1',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '0.88rem',
                      }}
                    >
                      {item.itemCode}
                    </span>
                  </td>
                  <td><strong>{item.itemName}</strong></td>
                  <td>
                    <span
                      style={{
                        fontWeight: 700,
                        color: item.quantity < 10 ? '#dc2626' : '#16a34a',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      {item.quantity < 10 && <i className="fa fa-exclamation-triangle" aria-hidden="true" style={{ fontSize: '0.8rem' }} />}
                      {item.quantity}
                    </span>
                  </td>
                  <td>{item.unit}</td>
                  <td>
                    <i className="fa fa-map-marker" aria-hidden="true" style={{ marginRight: '6px', color: '#64748b' }} />
                    {item.location}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                    No inventory materials matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
