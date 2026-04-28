import { useMutation, useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { listAdminComplaints, updateComplaintStatus } from '../../lib/api/admin';
import { apiRequest } from '../../lib/api/client';
import '../common.css';

export function AdminComplaintListPage() {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [selectedComplexes, setSelectedComplexes] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [isVendor, setIsVendor] = useState('All');

  const [complexes, setComplexes] = useState<any[]>([]);
  const [statuses, setStatuses] = useState<any[]>([]);

  useEffect(() => {
    apiRequest<any[]>('/api/v1/housing/complexes').then(setComplexes).catch(() => {});
    apiRequest<any[]>('/api/v1/complaints/statuses').then(setStatuses).catch(() => {});
  }, []);

  const { data: complaints = [], isLoading, refetch } = useQuery({
    queryKey: ['admin-complaints', fromDate, toDate, selectedComplexes, selectedStatuses, isVendor],
    queryFn: () => listAdminComplaints({
      fromDate,
      toDate,
      complexCodes: selectedComplexes.join(','),
      statuses: selectedStatuses.join(','),
      isVendor
    }),
  });

  const handleComplexChange = (e: any) => {
    const value = Array.from(e.target.selectedOptions, (option: any) => option.value);
    setSelectedComplexes(value);
  };

  const handleStatusChange = (e: any) => {
    const value = Array.from(e.target.selectedOptions, (option: any) => option.value);
    setSelectedStatuses(value);
  };

  return (
    <div className="content-stack" style={{ padding: '20px' }}>
      <div className="section-header">
        <div>
          <h1>Complaint List</h1>
          <p>Admin view for filtering and updating complaints</p>
        </div>
      </div>

      <div className="editor-card" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
        <div className="form-field">
          <label>From Date:</label>
          <input type="date" className="text-input" value={fromDate} onChange={e => setFromDate(e.target.value)} />
        </div>
        <div className="form-field">
          <label>To Date:</label>
          <input type="date" className="text-input" value={toDate} onChange={e => setToDate(e.target.value)} />
        </div>
        <div className="form-field">
          <label>Colony:</label>
          <select multiple className="text-input" value={selectedComplexes} onChange={handleComplexChange} style={{ height: '100px' }}>
            {complexes.map(c => <option key={c.complexCode} value={c.complexCode}>{c.complexName}</option>)}
          </select>
        </div>
        <div className="form-field">
          <label>Status:</label>
          <select multiple className="text-input" value={selectedStatuses} onChange={handleStatusChange} style={{ height: '100px' }}>
            {statuses.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div className="form-field">
          <label>Assign to Vendor:</label>
          <div>
            <label style={{ marginRight: '10px' }}><input type="radio" value="All" checked={isVendor === 'All'} onChange={e => setIsVendor(e.target.value)} /> All</label>
            <label style={{ marginRight: '10px' }}><input type="radio" value="Yes" checked={isVendor === 'Yes'} onChange={e => setIsVendor(e.target.value)} /> Yes</label>
            <label><input type="radio" value="No" checked={isVendor === 'No'} onChange={e => setIsVendor(e.target.value)} /> No</label>
          </div>
        </div>
        <div className="form-field" style={{ justifyContent: 'flex-end' }}>
          <button className="primary-button" onClick={() => refetch()}>Search</button>
        </div>
      </div>

      <div className="table-card">
        {isLoading ? (
          <p>Loading complaints...</p>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Complaint ID</th>
                  <th>Complex</th>
                  <th>Flat no.</th>
                  <th>Complaint Type</th>
                  <th>Complaint Details</th>
                  <th>Status</th>
                  <th>Vendor</th>
                  <th>Entry in System</th>
                </tr>
              </thead>
              <tbody>
                {complaints.map((c: any) => (
                  <tr key={c.id}>
                    <td><a href={`#${c.id}`}>{c.id}</a></td>
                    <td>{c.complexCode}</td>
                    <td>{c.flatNo}</td>
                    <td>{c.categoryName} {c.subcategoryName ? `> ${c.subcategoryName}` : ''}</td>
                    <td>{c.compDetails}</td>
                    <td>{c.statusName}</td>
                    <td>{c.vendorName}</td>
                    <td>{c.submitDate}</td>
                  </tr>
                ))}
                {complaints.length === 0 && (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '20px' }}>No complaints found.</td>
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
