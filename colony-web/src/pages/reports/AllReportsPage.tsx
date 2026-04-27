import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { listAdminComplaints } from '../../lib/api/admin';
import '../common.css';

export function AllReportsPage() {
  const [reportType, setReportType] = useState('complaints');
  const { data: complaints = [], isLoading } = useQuery({
    queryKey: ['report-complaints', reportType],
    queryFn: () => listAdminComplaints(),
  });

  const getReportContent = () => {
    switch (reportType) {
      case 'complaints':
        return (
          <div>
            <h3>Complaint Report</h3>
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Flat No.</th>
                    <th>Category</th>
                    <th>Status</th>
                    <th>Submit Date</th>
                  </tr>
                </thead>
                <tbody>
                  {complaints.map((c: any) => (
                    <tr key={c.id}>
                      <td>#{c.id}</td>
                      <td>{c.flatNo}</td>
                      <td>{c.categoryName}</td>
                      <td>
                        <span className={`status-badge status-${c.status?.toLowerCase()}`}>
                          {c.statusName}
                        </span>
                      </td>
                      <td>{new Date(c.submitDate).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      case 'occupancy':
        return <div><h3>Occupancy Report</h3><p>Shows flat occupancy status</p></div>;
      case 'vehicle':
        return <div><h3>Vehicle Report</h3><p>Shows all registered vehicles</p></div>;
      case 'matrix':
        return <div><h3>Matrix Report</h3><p>PO Items vs Complaints correlation</p></div>;
      case 'po-qty':
        return <div><h3>PO Items vs Total Qty</h3><p>Purchase order quantity analysis</p></div>;
      default:
        return null;
    }
  };

  return (
    <div className="container">
      <h1>Reports</h1>
      <div style={{ marginTop: '2rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setReportType('complaints')}
            className={reportType === 'complaints' ? 'btn btn-primary' : 'btn btn-secondary'}
          >
            Complaints
          </button>
          <button
            onClick={() => setReportType('occupancy')}
            className={reportType === 'occupancy' ? 'btn btn-primary' : 'btn btn-secondary'}
          >
            Occupancy
          </button>
          <button
            onClick={() => setReportType('vehicle')}
            className={reportType === 'vehicle' ? 'btn btn-primary' : 'btn btn-secondary'}
          >
            Vehicle
          </button>
          <button
            onClick={() => setReportType('matrix')}
            className={reportType === 'matrix' ? 'btn btn-primary' : 'btn btn-secondary'}
          >
            Matrix
          </button>
          <button
            onClick={() => setReportType('po-qty')}
            className={reportType === 'po-qty' ? 'btn btn-primary' : 'btn btn-secondary'}
          >
            PO Items Qty
          </button>
        </div>
      </div>

      {isLoading ? <p>Loading...</p> : getReportContent()}
    </div>
  );
}
