import { useMutation, useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { listElectricRates, createElectricRate } from '../../lib/api/admin';
import '../common.css';

type RateForm = {
  rateId: number;
  rate: number;
  unit: string;
};

export function ElectricRatePage() {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<RateForm>();
  const { data: rates = [], refetch, isLoading } = useQuery({
    queryKey: ['electric-rates'],
    queryFn: () => listElectricRates(),
  });

  const { mutate: submit, isPending } = useMutation({
    mutationFn: (data: RateForm) => createElectricRate(data),
    onSuccess: () => {
      reset();
      refetch();
    },
  });

  return (
    <div className="container">
      <div className="header">
        <h1>Electric Rates</h1>
      </div>

      <div style={{ background: '#fff', padding: '2rem', marginBottom: '2rem', borderRadius: '4px' }}>
        <h3>Add New Rate</h3>
        <form onSubmit={handleSubmit((data) => submit(data))}>
          <div style={{ marginBottom: '1rem' }}>
            <label>Rate ID</label>
            <input
              type="number"
              {...register('rateId', { required: true })}
              className="form-control"
            />
            {errors.rateId && <span className="error">Required</span>}
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label>Rate (₹ per unit)</label>
            <input
              type="number"
              step="0.01"
              {...register('rate', { required: true })}
              className="form-control"
            />
            {errors.rate && <span className="error">Required</span>}
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label>Unit</label>
            <input
              {...register('unit', { required: true })}
              className="form-control"
              placeholder="e.g., kWh"
            />
            {errors.unit && <span className="error">Required</span>}
          </div>
          <button type="submit" disabled={isPending} className="btn btn-primary">
            {isPending ? 'Adding...' : 'Add Rate'}
          </button>
        </form>
      </div>

      <h3>Existing Rates</h3>
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Rate ID</th>
                <th>Rate (₹)</th>
                <th>Unit</th>
                <th>Effective Date</th>
              </tr>
            </thead>
            <tbody>
              {rates.map((rate: any) => (
                <tr key={rate.id}>
                  <td>{rate.rateId}</td>
                  <td style={{ fontWeight: 'bold', color: '#0066cc' }}>{rate.rate}</td>
                  <td>{rate.unit}</td>
                  <td>{rate.effectiveDate ? new Date(rate.effectiveDate).toLocaleDateString() : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
