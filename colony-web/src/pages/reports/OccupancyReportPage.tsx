import { useQuery } from '@tanstack/react-query';
import { getOccupancyReport } from '../../lib/api/reports';
import '../common.css';

export function OccupancyReportPage() {
  const { data: occupancy = [], isLoading } = useQuery({
    queryKey: ['report-occupancy'],
    queryFn: () => getOccupancyReport(),
  });

  return (
    <div className="container">
      <h1>Occupancy Report</h1>
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <div className="table-responsive" style={{ marginTop: '2rem' }}>
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
              {occupancy.map((item: any, index: number) => (
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
      )}
    </div>
  );
}
