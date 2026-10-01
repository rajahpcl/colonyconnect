import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { listVehicles, type Vehicle } from '../../lib/api/vehicles';
import '../common.css';

export function VehicleListPage() {
  const [search, setSearch] = useState('');
  const { data: vehicles = [], isLoading } = useQuery<Vehicle[]>({
    queryKey: ['vehicles'],
    queryFn: () => listVehicles(),
  });

  const filtered = vehicles.filter((v) =>
    v.registrationNo?.toLowerCase().includes(search.toLowerCase()) ||
    v.empNo?.toLowerCase().includes(search.toLowerCase()) ||
    v.make?.toLowerCase().includes(search.toLowerCase()) ||
    v.model?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container">
      <div className="header">
        <div>
          <h1>Colony Vehicle Registry</h1>
          <p style={{ color: '#64748b', margin: '0.25rem 0 0 0', fontSize: '0.9rem' }}>
            Authorized resident and staff vehicle passes, parking allocations, and gate security records
          </p>
        </div>
        <div style={{ width: '100%', maxWidth: '320px', position: 'relative' }}>
          <input
            type="text"
            placeholder="Search registration or emp no..."
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
              transform: 'translateY(-50%)',
              color: '#94a3b8',
            }}
          />
        </div>
      </div>

      {isLoading ? (
        <p style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>Loading vehicle records...</p>
      ) : (
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Registration No.</th>
                <th>Type</th>
                <th>Make & Model</th>
                <th>Employee No.</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((vehicle) => (
                <tr key={vehicle.id}>
                  <td>
                    <span
                      style={{
                        display: 'inline-block',
                        fontFamily: 'monospace',
                        fontWeight: 700,
                        background: '#f8fafc',
                        border: '1px solid #cbd5e1',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '0.92rem',
                        color: '#004085',
                      }}
                    >
                      {vehicle.registrationNo}
                    </span>
                  </td>
                  <td>
                    <span className="status-badge status-active" style={{ background: '#f1f5f9', color: '#334155' }}>
                      {vehicle.vehicleType}
                    </span>
                  </td>
                  <td>
                    <strong>{vehicle.make}</strong> {vehicle.model}
                  </td>
                  <td>
                    <i className="fa fa-user-o" aria-hidden="true" style={{ marginRight: '6px', color: '#64748b' }} />
                    {vehicle.empNo}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                    No vehicle records found matching your search.
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
