import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { listReadings } from '../../lib/api/readings';
import '../common.css';

export function ReadingsPage() {
  const [search, setSearch] = useState('');
  const { data: readings = [], isLoading } = useQuery({
    queryKey: ['readings'],
    queryFn: () => listReadings(),
  });

  const filtered = readings.filter((r: any) =>
    r.flatNo?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container">
      <div className="header">
        <h1>Electric Readings</h1>
        <input
          type="text"
          placeholder="Search flat..."
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
                <th>Flat No.</th>
                <th>Reading</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((reading: any) => (
                <tr key={reading.id}>
                  <td><strong>{reading.flatNo}</strong></td>
                  <td>{reading.reading}</td>
                  <td>{new Date(reading.readingDate).toLocaleDateString()}</td>
                  <td>₹{reading.amount?.toFixed(2)}</td>
                  <td>{reading.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
