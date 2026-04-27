import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { listPO } from '../../lib/api/po';
import '../common.css';

export function POListPage() {
  const [filter, setFilter] = useState('');
  const { data: pos = [], isLoading } = useQuery({
    queryKey: ['po'],
    queryFn: () => listPO(),
  });

  const filtered = pos.filter((p: any) =>
    !filter || p.status === filter ||
    p.poNumber?.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="container">
      <div className="header">
        <h1>Purchase Orders</h1>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="form-control"
          style={{ maxWidth: '200px' }}
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {isLoading ? <p>Loading...</p> : (
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>PO Number</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((po: any) => (
                <tr key={po.id}>
                  <td><strong>{po.poNumber}</strong></td>
                  <td>₹{po.amount?.toFixed(2)}</td>
                  <td>
                    <span className={`status-badge status-${po.status?.toLowerCase()}`}>
                      {po.status}
                    </span>
                  </td>
                  <td>{new Date(po.createdDate).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
