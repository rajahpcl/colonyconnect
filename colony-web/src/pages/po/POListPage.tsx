import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { listPO, type PO } from '../../lib/api/po';
import '../common.css';

export function POListPage() {
  const [filter, setFilter] = useState('');
  const { data: pos = [], isLoading } = useQuery<PO[]>({
    queryKey: ['po'],
    queryFn: () => listPO(),
  });

  const filtered = pos.filter((p) =>
    !filter || p.status === filter ||
    p.poNumber?.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="container">
      <div className="header">
        <div>
          <h1>Purchase Orders & Invoices</h1>
          <p style={{ color: '#64748b', margin: '0.25rem 0 0 0', fontSize: '0.9rem' }}>
            Authorized material procurement orders, contract approvals, and invoice records
          </p>
        </div>
        <div style={{ width: '100%', maxWidth: '240px' }}>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="form-control"
            aria-label="Filter POs by status"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending Approval</option>
            <option value="approved">Approved</option>
            <option value="completed">Completed / Settled</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <p style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>Loading purchase orders...</p>
      ) : (
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>PO Number</th>
                <th>Order Amount</th>
                <th>Status</th>
                <th>Creation Date</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((po) => (
                <tr key={po.id}>
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
                      {po.poNumber}
                    </span>
                  </td>
                  <td>
                    <strong style={{ color: '#0f172a' }}>
                      ₹{po.amount?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </strong>
                  </td>
                  <td>
                    <span
                      className={`status-badge status-${po.status?.toLowerCase() === 'approved' ? 'active' : 'inactive'}`}
                      style={{
                        background:
                          po.status?.toLowerCase() === 'approved'
                            ? '#dcfce7'
                            : po.status?.toLowerCase() === 'pending'
                            ? '#fef3c7'
                            : '#f1f5f9',
                        color:
                          po.status?.toLowerCase() === 'approved'
                            ? '#15803d'
                            : po.status?.toLowerCase() === 'pending'
                            ? '#b45309'
                            : '#475569',
                      }}
                    >
                      {po.status}
                    </span>
                  </td>
                  <td>
                    <i className="fa fa-calendar-o" aria-hidden="true" style={{ marginRight: '6px', color: '#64748b' }} />
                    {po.createdDate ? new Date(po.createdDate).toLocaleDateString() : '—'}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                    No purchase orders found matching selected filter.
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
