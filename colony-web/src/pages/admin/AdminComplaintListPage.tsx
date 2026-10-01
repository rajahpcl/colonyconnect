import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { listAdminComplaints } from '../../lib/api/admin';
import { apiRequest } from '../../lib/api/client';
import '../common.css';

type ComplexOption = { complexCode: string; complexName: string };
type StatusOption = { id: number; name: string };
type AdminComplaintItem = {
  id: number;
  complexCode: string;
  flatNo: string;
  categoryName: string;
  subcategoryName?: string;
  compDetails: string;
  statusName: string;
  vendorName?: string;
  submitDate: string;
};

export function AdminComplaintListPage() {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [selectedComplexes, setSelectedComplexes] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [isVendor, setIsVendor] = useState('All');

  const [complexes, setComplexes] = useState<ComplexOption[]>([]);
  const [statuses, setStatuses] = useState<StatusOption[]>([]);

  useEffect(() => {
    apiRequest<ComplexOption[]>('/api/v1/housing/complexes').then(setComplexes).catch(() => {});
    apiRequest<StatusOption[]>('/api/v1/complaints/statuses').then(setStatuses).catch(() => {});
  }, []);

  const { data: complaints = [], isLoading, refetch } = useQuery<AdminComplaintItem[]>({
    queryKey: ['admin-complaints', fromDate, toDate, selectedComplexes, selectedStatuses, isVendor],
    queryFn: () => listAdminComplaints({
      fromDate,
      toDate,
      complexCodes: selectedComplexes.join(','),
      statuses: selectedStatuses.join(','),
      isVendor
    }),
  });

  const handleComplexChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = Array.from(e.target.selectedOptions, (option) => option.value);
    setSelectedComplexes(value);
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = Array.from(e.target.selectedOptions, (option) => option.value);
    setSelectedStatuses(value);
  };
  return (
    <div className="content-stack">
      <div className="section-header">
        <div>
          <span className="section-header__eyebrow">Administration</span>
          <h1>Colony Maintenance Requests</h1>
          <p>Search, filter, and track complaint statuses across all colony sectors</p>
        </div>
        <div className="section-header__stats">
          <span>{complaints.length} requests matching filters</span>
          <span>Role: Complex Administrator</span>
        </div>
      </div>

      <div className="editor-card">
        <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.05rem', color: '#0f172a' }}>Filter Criteria</h3>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1rem',
            alignItems: 'end',
          }}
        >
          <div className="form-field">
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>From Date:</label>
            <input
              type="date"
              className="text-input"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              style={{ minHeight: '44px' }}
            />
          </div>
          <div className="form-field">
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>To Date:</label>
            <input
              type="date"
              className="text-input"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              style={{ minHeight: '44px' }}
            />
          </div>
          <div className="form-field">
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Colony Complex:</label>
            <select
              multiple
              className="text-input"
              value={selectedComplexes}
              onChange={handleComplexChange}
              style={{ minHeight: '100px', fontSize: '0.85rem' }}
            >
              {complexes.map((c) => (
                <option key={c.complexCode} value={c.complexCode}>
                  {c.complexName}
                </option>
              ))}
            </select>
          </div>
          <div className="form-field">
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Status:</label>
            <select
              multiple
              className="text-input"
              value={selectedStatuses}
              onChange={handleStatusChange}
              style={{ minHeight: '100px', fontSize: '0.85rem' }}
            >
              {statuses.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-field">
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Assigned to Vendor:</label>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', minHeight: '44px' }}>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', cursor: 'pointer', fontSize: '0.9rem' }}>
                <input type="radio" value="All" checked={isVendor === 'All'} onChange={(e) => setIsVendor(e.target.value)} /> All
              </label>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', cursor: 'pointer', fontSize: '0.9rem' }}>
                <input type="radio" value="Yes" checked={isVendor === 'Yes'} onChange={(e) => setIsVendor(e.target.value)} /> Yes
              </label>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', cursor: 'pointer', fontSize: '0.9rem' }}>
                <input type="radio" value="No" checked={isVendor === 'No'} onChange={(e) => setIsVendor(e.target.value)} /> No
              </label>
            </div>
          </div>
          <div className="form-field">
            <button
              className="primary-button"
              onClick={() => refetch()}
              style={{ minHeight: '44px', width: '100%', justifyContent: 'center' }}
            >
              <i className="fa fa-filter" aria-hidden="true" style={{ marginRight: '6px' }} />
              Apply Filters
            </button>
          </div>
        </div>
      </div>

      <div className="table-card">
        <div className="table-card__toolbar">
          <div>
            <span className="editor-card__eyebrow">Database Records</span>
            <h2>Filtered Complaints List</h2>
          </div>
        </div>

        {isLoading ? (
          <p style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Loading complaints from database...</p>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Complaint ID</th>
                  <th>Complex</th>
                  <th>Flat no.</th>
                  <th>Type & Subcategory</th>
                  <th>Complaint Details</th>
                  <th>Status</th>
                  <th>Vendor</th>
                  <th>Date Logged</th>
                </tr>
              </thead>
              <tbody>
                {complaints.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <strong style={{ color: '#004085' }}>#{c.id}</strong>
                    </td>
                    <td>{c.complexCode}</td>
                    <td>{c.flatNo}</td>
                    <td>
                      <strong>{c.categoryName}</strong>
                      {c.subcategoryName ? (
                        <span style={{ color: '#64748b', fontSize: '0.8rem', display: 'block' }}>
                          › {c.subcategoryName}
                        </span>
                      ) : null}
                    </td>
                    <td style={{ maxWidth: '280px', wordBreak: 'break-word' }}>{c.compDetails}</td>
                    <td>
                      <span className="status-badge status-active" style={{ background: '#e0f2fe', color: '#0284c7' }}>
                        {c.statusName || 'Submitted'}
                      </span>
                    </td>
                    <td>{c.vendorName || <span style={{ color: '#94a3b8' }}>Unassigned</span>}</td>
                    <td>{c.submitDate}</td>
                  </tr>
                ))}
                {complaints.length === 0 && (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                      <i className="fa fa-inbox" aria-hidden="true" style={{ fontSize: '2rem', marginBottom: '8px', display: 'block', color: '#cbd5e1' }} />
                      No complaints found matching the selected filter criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
