import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { listMyComplaints } from '../../lib/api/complaints';
import './complaints.css';

export function MyComplaintsPage() {
  const navigate = useNavigate();
  const [searchFilter, setSearchFilter] = useState('');

  const { data: complaints = [], isLoading, error, refetch } = useQuery({
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
    console.error('Failed to load complaints', error);
    const message = (error as any)?.message ?? JSON.stringify(error);
    return (
      <div className="complaints-container">
        <div className="error-message">
          <p style={{ margin: 0, fontWeight: 600 }}>Failed to load complaints</p>
          <p style={{ margin: '0.25rem 0 0 0' }}>{message}</p>
          <button className="btn" style={{ marginTop: '0.75rem' }} onClick={() => refetch()}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="complaints-container">
      <div className="complaints-header">
        <div>
          <h1>My Requests & Complaints</h1>
          <p>Track real-time resolution status and updates for your residential quarter.</p>
        </div>
        <button onClick={handleNewComplaint} className="btn btn-primary">
          <i className="fa fa-plus-circle" aria-hidden="true" style={{ marginRight: '6px' }} />
          New Complaint
        </button>
      </div>

      {/* Search Bar */}
      <div className="search-bar" style={{ position: 'relative', marginBottom: '1.5rem' }}>
        <input
          type="text"
          placeholder="Search by ID, Category, Sub-Category, Flat or Status..."
          value={searchFilter}
          onChange={(e) => setSearchFilter(e.target.value)}
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

      {filteredComplaints.length === 0 ? (
        <div className="empty-state">
          <i className="fa fa-folder-open-o" aria-hidden="true" style={{ fontSize: '2.5rem', color: '#94a3b8', marginBottom: '0.75rem' }} />
          <p style={{ fontWeight: 600, color: '#334155', fontSize: '1.1rem' }}>No complaints found</p>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
            {searchFilter ? 'Try clearing your search query' : 'Have a maintenance issue in your flat? Submit a request.'}
          </p>
          <button onClick={handleNewComplaint} className="btn btn-primary">
            Submit Your First Request
          </button>
        </div>
      ) : (
        <>
          {/* Mobile Card List (< 768px) */}
          <div className="complaints-mobile-list">
            {filteredComplaints.map((complaint) => (
              <div
                key={complaint.id}
                className="complaint-card"
                onClick={() => handleView(complaint.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleView(complaint.id);
                }}
              >
                <div className="complaint-card__header">
                  <span className="complaint-card__id">
                    <i className="fa fa-ticket" aria-hidden="true" style={{ marginRight: '4px' }} />
                    #{complaint.id}
                  </span>
                  <span className={`status-badge status-${complaint.status?.toLowerCase()}`}>
                    {complaint.statusName || 'Registered'}
                  </span>
                </div>

                <div className="complaint-card__body">
                  <h4>{complaint.categoryName}</h4>
                  <p>{complaint.subcategoryName || 'General Maintenance'}</p>
                  {complaint.flatNo && (
                    <p style={{ marginTop: '4px', fontSize: '0.8rem', color: '#004085' }}>
                      <i className="fa fa-home" aria-hidden="true" style={{ marginRight: '4px' }} />
                      Flat: {complaint.flatNo}
                    </p>
                  )}
                </div>

                <div className="complaint-card__footer">
                  <span>
                    <i className="fa fa-calendar-o" aria-hidden="true" style={{ marginRight: '4px' }} />
                    {new Date(complaint.submitDate).toLocaleDateString()}
                  </span>
                  <span className="complaint-card__view-btn">
                    {complaint.status === '10' ? 'Edit Request →' : 'View Details →'}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table (>= 768px) */}
          <div className="complaints-desktop-table table-responsive">
            <table className="complaints-table">
              <thead>
                <tr>
                  <th>Complaint Id</th>
                  <th>Flat No.</th>
                  <th>Complaint Type</th>
                  <th>Sub Category Type</th>
                  <th>Status</th>
                  <th>Submit Date</th>
                  <th>Edit/View</th>
                </tr>
              </thead>
              <tbody>
                {filteredComplaints.map((complaint) => (
                  <tr key={complaint.id}>
                    <td>
                      <strong>#{complaint.id}</strong>
                    </td>
                    <td>{complaint.flatNo}</td>
                    <td>{complaint.categoryName}</td>
                    <td>{complaint.subcategoryName}</td>
                    <td>
                      <span className={`status-badge status-${complaint.status?.toLowerCase()}`}>
                        {complaint.status === '10' ? 'Saved' : complaint.statusName}
                      </span>
                    </td>
                    <td>{new Date(complaint.submitDate).toLocaleDateString()}</td>
                    <td>
                      <button
                        onClick={() => handleView(complaint.id)}
                        className="btn-link"
                        style={{ minHeight: '36px', padding: '4px 8px' }}
                      >
                        {complaint.status === '10' ? 'Edit' : 'View'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
