import { useQuery } from '@tanstack/react-query';
import { getMatrixReport } from '../../lib/api/reports';
import '../common.css';

export function MatrixReportPage() {
  const { data: matrix = [], isLoading } = useQuery({
    queryKey: ['report-matrix'],
    queryFn: () => getMatrixReport(),
  });

  return (
    <div className="container">
      <h1>Matrix Report - PO Items vs Complaints</h1>
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <div className="table-responsive" style={{ marginTop: '2rem' }}>
          <table className="table">
            <thead>
              <tr>
                <th>PO Name</th>
                <th>Count</th>
                <th>Total Amount</th>
              </tr>
            </thead>
            <tbody>
              {matrix.map((item: any, index: number) => (
                <tr key={index}>
                  <td>{item.poName}</td>
                  <td>{item.count}</td>
                  <td>{item.totalAmount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
