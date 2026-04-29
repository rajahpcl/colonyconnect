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
    v.registrationNo?.toLowerCase().includes(search.toLowerCase()) ||
    v.empNo?.toLowerCase().includes(search.toLowerCase())
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
                <th>Registration No.</th>
                <th>Type</th>
                <th>Make</th>
                <th>Model</th>
                <th>Employee No.</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((vehicle: any) => (
                <tr key={vehicle.id}>
                  <td><strong>{vehicle.registrationNo}</strong></td>
                  <td>{vehicle.vehicleType}</td>
                  <td>{vehicle.make}</td>
                  <td>{vehicle.model}</td>
                  <td>{vehicle.empNo}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
