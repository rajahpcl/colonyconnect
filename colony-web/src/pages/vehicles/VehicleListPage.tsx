import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { listVehicles } from '../../lib/api/vehicles';
import '../common.css';

export function VehicleListPage() {
  const [search, setSearch] = useState('');
  const { data: vehicles = [], isLoading } = useQuery({
    queryKey: ['vehicles'],
    queryFn: () => listVehicles(),
  });

  const filtered = vehicles.filter((v: any) =>
    v.vehicleNo?.toLowerCase().includes(search.toLowerCase()) ||
    v.owner?.toLowerCase().includes(search.toLowerCase()) ||
    v.flatNo?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container">
      <div className="header">
        <h1>Vehicles</h1>
        <input
          type="text"
          placeholder="Search vehicle or owner..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="form-control"
          style={{ maxWidth: '300px' }}
        />
      </div>

      {isLoading ? <p>Loading...</p> : (
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Vehicle No.</th>
                <th>Type</th>
                <th>Owner</th>
                <th>Flat No.</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((vehicle: any) => (
                <tr key={vehicle.id}>
                  <td><strong>{vehicle.vehicleNo}</strong></td>
                  <td>{vehicle.type}</td>
                  <td>{vehicle.owner}</td>
                  <td>{vehicle.flatNo}</td>
                  <td>
                    <span className={`status-badge status-${vehicle.status}`}>
                      {vehicle.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
