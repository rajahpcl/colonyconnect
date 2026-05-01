import { useQuery } from '@tanstack/react-query';
import { getReportVehicles } from '../../lib/api/reports';
import '../common.css';

export function VehicleReportPage() {
  const { data: vehicles = [], isLoading } = useQuery({
    queryKey: ['report-vehicles'],
    queryFn: () => getReportVehicles(),
  });

  return (
    <div className="container">
      <h1>Vehicle Report</h1>
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <div className="table-responsive" style={{ marginTop: '2rem' }}>
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
              {vehicles.map((item: any, index: number) => (
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
      )}
    </div>
  );
}
