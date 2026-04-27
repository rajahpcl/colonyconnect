import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { listMyComplaints } from '../../lib/api/complaints';
import './complaints.css';

export function MyComplaintsPage() {
  const navigate = useNavigate();
  const [searchFilter, setSearchFilter] = useState('');

  const { data: complaints = [], isLoading, error } = useQuery({
    queryKey: ['my-complaints'],
    queryFn: () => listMyComplaints(),
  });

  const filteredComplaints = complaints.filter(
    (complaint) =>
      complaint.id.toString().includes(searchFilter) ||
      complaint.flatNo?.includes(searchFilter) ||
      complaint.categoryName?.toLowerCase().includes(searchFilter.toLowerCase()) ||
      complaint.statusName?.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const handleNewComplaint = () => {
    navigate('/app/complaints/new');
  };

  const handleView = (id: string | number) => {
    navigate(`/app/complaints/${id}`);
  };

  if (isLoading) {
    return <div className="complaints-container"><p>Loading complaints...</p></div>;
  }

  if (error) {
    return (
      <div className="complaints-container">
        <div className="error-message">Failed to load complaints</div>
      </div>
    );
  }

  return (
    <div className="complaints-container">
      <div className="complaints-header">
        <div>
          <h1>My Complaints</h1>
          <p>Track and manage your submitted complaints</p>
        </div>
        <button onClick={handleNewComplaint} className="btn btn-primary">
          + New Complaint
        </button>
      </div>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search by ID, Flat No., Category or Status..."
          value={searchFilter}
          onChange={(e) => setSearchFilter(e.target.value)}
          className="form-control"
        />
      </div>

      {filteredComplaints.length === 0 ? (
        <div className="empty-state">
          <p>No complaints found</p>
          <button onClick={handleNewComplaint} className="btn btn-primary">
            Submit Your First Complaint
          </button>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="complaints-table">
            <thead>
              <tr>
                <th>Complaint ID</th>
                <th>Flat No.</th>
                <th>Type</th>
                <th>Sub-Category</th>
                <th>Status</th>
                <th>Submitted Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredComplaints.map((complaint) => (
                <tr key={complaint.id}>
                  <td>{complaint.id}</td>
                  <td>{complaint.flatNo}</td>
                  <td>{complaint.categoryName}</td>
                  <td>{complaint.subcategoryName}</td>
                  <td>
                    <span className={`status-badge status-${complaint.status?.toLowerCase()}`}>
                      {complaint.statusName}
                    </span>
                  </td>
                  <td>{new Date(complaint.submitDate).toLocaleDateString()}</td>
                  <td>
                    <button
                      onClick={() => handleView(complaint.id)}
                      className="btn-link"
                    >
                      {complaint.status === '10' ? 'Edit' : 'View'}
                    </button>
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
