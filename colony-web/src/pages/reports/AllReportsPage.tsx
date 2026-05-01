import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { getComplaintReport, getOccupancyReport, getReportVehicles, getMatrixReport, getPoQuantityReport } from '../../lib/api/reports';
import '../common.css';

export function AllReportsPage() {
  const [reportType, setReportType] = useState('complaints');
  
  const { data: complaints = [], isLoading: complaintsLoading } = useQuery({
    queryKey: ['report-complaints'],
    queryFn: () => getComplaintReport(),
    enabled: reportType === 'complaints'
  });
  
  const { data: _occupancy = [], isLoading: occupancyLoading } = useQuery({
    queryKey: ['report-occupancy'],
    queryFn: () => getOccupancyReport(),
    enabled: reportType === 'occupancy'
  });
  
  const { data: _vehicles = [], isLoading: vehiclesLoading } = useQuery({
    queryKey: ['report-vehicles'],
    queryFn: () => getReportVehicles(),
    enabled: reportType === 'vehicle'
  });
  
  const { data: _matrix = [], isLoading: matrixLoading } = useQuery({
    queryKey: ['report-matrix'],
    queryFn: () => getMatrixReport(),
    enabled: reportType === 'matrix'
  });

  const { data: _poQty = [], isLoading: poQtyLoading } = useQuery({
    queryKey: ['report-po-qty'],
    queryFn: () => getPoQuantityReport(),
    enabled: reportType === 'po-qty'
  });

  const isLoading = complaintsLoading || occupancyLoading || vehiclesLoading || matrixLoading || poQtyLoading;

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
        return (
          <div>
            <h3>Occupancy Report</h3>
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Emp No</th>
                    <th>Name</th>
                    <th>Designation</th>
                    <th>Location</th>
                    <th>Building</th>
                    <th>Flat No</th>
                    <th>Area</th>
                    <th>Grade</th>
                    <th>Email</th>
                    <th>Contact No</th>
                  </tr>
                </thead>
                <tbody>
                  {_occupancy.map((item: any, index: number) => (
                    <tr key={index}>
                      <td>{item.empNo}</td>
                      <td>{item.empName}</td>
                      <td>{item.designation}</td>
                      <td>{item.location}</td>
                      <td>{item.building}</td>
                      <td>{item.flatNo}</td>
                      <td>{item.area}</td>
                      <td>{item.grade}</td>
                      <td>{item.email}</td>
                      <td>{item.contactNo}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      case 'vehicle':
        return (
          <div>
            <h3>Vehicle Report</h3>
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Emp No</th>
                    <th>Name</th>
                    <th>Building</th>
                    <th>Flat</th>
                    <th>Make</th>
                    <th>Model</th>
                    <th>Registration No</th>
                    <th>Color</th>
                    <th>Vehicle Type</th>
                  </tr>
                </thead>
                <tbody>
                  {_vehicles.map((item: any, index: number) => (
                    <tr key={index}>
                      <td>{item.empNo}</td>
                      <td>{item.empName}</td>
                      <td>{item.building}</td>
                      <td>{item.flatNo}</td>
                      <td>{item.make}</td>
                      <td>{item.model}</td>
                      <td>{item.registrationNo}</td>
                      <td>{item.color}</td>
                      <td>{item.vehicleType}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      case 'matrix':
        return (
          <div>
            <h3>Matrix Report - PO Items vs Complaints</h3>
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>PO Name</th>
                    <th>Count</th>
                    <th>Total Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {_matrix.map((item: any, index: number) => (
                    <tr key={index}>
                      <td>{item.poName}</td>
                      <td>{item.count}</td>
                      <td>{item.totalAmount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      case 'po-qty':
        return (
          <div>
            <h3>PO Items vs Total Quantity</h3>
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>PO Name</th>
                    <th>PO</th>
                    <th>Quantity</th>
                    <th>Rate</th>
                    <th>Total</th>
                    <th>Req ID</th>
                  </tr>
                </thead>
                <tbody>
                  {_poQty.map((item: any, index: number) => (
                    <tr key={index}>
                      <td>{item.poName}</td>
                      <td>{item.po}</td>
                      <td>{item.quantity}</td>
                      <td>{item.rate}</td>
                      <td>{item.total}</td>
                      <td>{item.reqId}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
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
