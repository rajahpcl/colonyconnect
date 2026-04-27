import { useMutation, useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { listAdminComplaints, updateComplaintStatus } from '../../lib/api/admin';
import '../common.css';

export function AdminComplaintListPage() {
  const [filter, setFilter] = useState('');
  const [selectedComplaint, setSelectedComplaint] = useState<any>(null);
  const [remark, setRemark] = useState('');

  const { data: complaints = [], isLoading, refetch } = useQuery({
    queryKey: ['admin-complaints', filter],
    queryFn: () => listAdminComplaints({ status: filter || undefined }),
  });

  const { mutate: updateStatus, isPending } = useMutation({
    mutationFn: (data: { id: number; status: string; remark: string }) =>
      updateComplaintStatus(data.id, data.status, data.remark),
    onSuccess: () => {
      setSelectedComplaint(null);
      setRemark('');
      refetch();
    },
  });

  return (
    <div className="container">
      <div className="header">
        <h1>Complaint Management</h1>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="form-control"
          style={{ maxWidth: '200px' }}
        >
          <option value="">All Status</option>
          <option value="submitted">Submitted</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Flat No.</th>
                <th>Type</th>
                <th>Status</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {complaints.map((complaint: any) => (
                <tr key={complaint.id}>
                  <td>#{complaint.id}</td>
                  <td>{complaint.flatNo}</td>
                  <td>{complaint.categoryName}</td>
                  <td>
                    <span className={`status-badge status-${complaint.status?.toLowerCase()}`}>
                      {complaint.status}
                    </span>
                  </td>
                  <td>{new Date(complaint.submitDate).toLocaleDateString()}</td>
                  <td>
                    <button
                      onClick={() => setSelectedComplaint(complaint)}
                      className="btn-link"
                      style={{ fontSize: '0.9rem' }}
                    >
                      Update
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedComplaint && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: '#fff',
          padding: '2rem',
          borderRadius: '4px',
          boxShadow: '0 5px 20px rgba(0,0,0,0.3)',
          zIndex: 1000,
          minWidth: '400px',
        }}>
          <h3>Update Complaint Status</h3>
          <div style={{ marginBottom: '1rem' }}>
            <label>Status</label>
            <select className="form-control" defaultValue={selectedComplaint.status}>
              <option value="submitted">Submitted</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label>Remark</label>
            <textarea
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              className="form-control"
              rows={3}
            />
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              onClick={() => setSelectedComplaint(null)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              onClick={() => updateStatus({
                id: selectedComplaint.id,
                status: selectedComplaint.status,
                remark,
              })}
              disabled={isPending}
              className="btn btn-primary"
            >
              {isPending ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      )}
      {selectedComplaint && (
        <div
          onClick={() => setSelectedComplaint(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(0,0,0,0.3)',
            zIndex: 999,
          }}
        />
      )}
    </div>
  );
}
