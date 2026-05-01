import { useQuery } from '@tanstack/react-query';
import { getPoQuantityReport } from '../../lib/api/reports';
import '../common.css';

export function PoQtyReportPage() {
  const { data: poQty = [], isLoading } = useQuery({
    queryKey: ['report-po-qty'],
    queryFn: () => getPoQuantityReport(),
  });

  return (
    <div className="container">
      <h1>PO Items vs Total Quantity</h1>
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <div className="table-responsive" style={{ marginTop: '2rem' }}>
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
              {poQty.map((item: any, index: number) => (
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
      )}
    </div>
  );
}
