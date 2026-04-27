import { useMutation, useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { createProxyRequest, listProxyRequests } from '../../lib/api/ifms';
import '../common.css';

type ProxyForm = {
  representBy: string;
  fromDate: string;
  toDate: string;
};

export function ProxyRequestPage() {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ProxyForm>();
  const { data: requests = [], refetch } = useQuery({
    queryKey: ['proxy-requests'],
    queryFn: () => listProxyRequests(),
  });

  const { mutate: submit, isPending } = useMutation({
    mutationFn: (data: ProxyForm) =>
      createProxyRequest({ ...data, requestedBy: '', status: 'pending' }),
    onSuccess: () => {
      reset();
      refetch();
    },
  });

  return (
    <div className="container">
      <h1>Raise Proxy Request</h1>

      <div style={{ background: '#fff', padding: '2rem', marginBottom: '2rem', borderRadius: '4px' }}>
        <h3>New Proxy Request</h3>
        <form onSubmit={handleSubmit((data) => submit(data))}>
          <div style={{ marginBottom: '1rem' }}>
            <label>Represent By (Employee Name)</label>
            <input
              {...register('representBy', { required: true })}
              className="form-control"
            />
            {errors.representBy && <span className="error">Required</span>}
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label>From Date</label>
            <input
              type="date"
              {...register('fromDate', { required: true })}
              className="form-control"
            />
            {errors.fromDate && <span className="error">Required</span>}
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label>To Date</label>
            <input
              type="date"
              {...register('toDate', { required: true })}
              className="form-control"
            />
            {errors.toDate && <span className="error">Required</span>}
          </div>
          <button type="submit" disabled={isPending} className="btn btn-primary">
            {isPending ? 'Submitting...' : 'Submit'}
          </button>
        </form>
      </div>

      <h3>My Proxy Requests</h3>
      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th>Represent By</th>
              <th>From Date</th>
              <th>To Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((req: any) => (
              <tr key={req.id}>
                <td>{req.representBy}</td>
                <td>{new Date(req.fromDate).toLocaleDateString()}</td>
                <td>{new Date(req.toDate).toLocaleDateString()}</td>
                <td>
                  <span className={`status-badge status-${req.status?.toLowerCase()}`}>
                    {req.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
