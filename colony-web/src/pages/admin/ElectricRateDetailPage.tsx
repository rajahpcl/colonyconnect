import { useMutation, useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { listElectricRatesDetail, createRateDetail } from '../../lib/api/rates';
import '../common.css';

type RateForm = {
  tariffCategory: string;
  fixedCharges: number;
  energyCharges: number;
  wheelingCharges: number;
  raCharges: number;
  facRate: number;
};

export function ElectricRateDetailPage() {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<RateForm>();
  const { data: rates = [], refetch, isLoading } = useQuery({
    queryKey: ['rates-detail'],
    queryFn: () => listElectricRatesDetail(),
  });

  const { mutate: submit, isPending } = useMutation({
    mutationFn: (data: RateForm) => createRateDetail({
      ...data,
      status: 1,
    }),
    onSuccess: () => {
      reset();
      refetch();
    },
  });

  return (
    <div className="container">
      <h1>Electric Rate Master</h1>

      <div style={{ background: '#fff', padding: '2rem', marginBottom: '2rem', borderRadius: '4px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <h3>Add New Rate</h3>
        <form onSubmit={handleSubmit((data) => submit(data))}>
          <div style={{ marginBottom: '1rem' }}>
            <label>Tariff Category</label>
            <input
              {...register('tariffCategory', { required: 'Required' })}
              className="form-control"
              placeholder="e.g., Residential, Commercial, Industrial"
            />
            {errors.tariffCategory && <span className="error">{errors.tariffCategory.message}</span>}
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label>Fixed Charges (₹)</label>
            <input
              type="number"
              step="0.01"
              {...register('fixedCharges', { required: 'Required', min: 0 })}
              className="form-control"
            />
            {errors.fixedCharges && <span className="error">{errors.fixedCharges.message}</span>}
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label>Energy Charges (₹/Unit)</label>
            <input
              type="number"
              step="0.01"
              {...register('energyCharges', { required: 'Required', min: 0 })}
              className="form-control"
            />
            {errors.energyCharges && <span className="error">{errors.energyCharges.message}</span>}
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label>Wheeling Charges (₹/Unit)</label>
            <input
              type="number"
              step="0.01"
              {...register('wheelingCharges', { required: 'Required', min: 0 })}
              className="form-control"
            />
            {errors.wheelingCharges && <span className="error">{errors.wheelingCharges.message}</span>}
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label>RA Charges (₹/Unit)</label>
            <input
              type="number"
              step="0.01"
              {...register('raCharges', { required: 'Required', min: 0 })}
              className="form-control"
              title="Reactive Ampere charges"
            />
            {errors.raCharges && <span className="error">{errors.raCharges.message}</span>}
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label>FAC Rate (₹/Unit)</label>
            <input
              type="number"
              step="0.01"
              {...register('facRate', { required: 'Required', min: 0 })}
              className="form-control"
              title="Frequency and Angle Correction rate"
            />
            {errors.facRate && <span className="error">{errors.facRate.message}</span>}
          </div>

          <button type="submit" disabled={isPending} className="btn btn-primary">
            {isPending ? 'Saving...' : 'Save Rate'}
          </button>
        </form>
      </div>

      <h3>Rate Master List</h3>
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Tariff Category</th>
                <th>Fixed (₹)</th>
                <th>Energy (₹/Unit)</th>
                <th>Wheeling (₹/Unit)</th>
                <th>RA (₹/Unit)</th>
                <th>FAC (₹/Unit)</th>
                <th>Effective Date</th>
              </tr>
            </thead>
            <tbody>
              {rates.map((rate: any) => (
                <tr key={rate.id}>
                  <td><strong>{rate.tariffCategory}</strong></td>
                  <td>{rate.fixedCharges.toFixed(2)}</td>
                  <td>{rate.energyCharges.toFixed(2)}</td>
                  <td>{rate.wheelingCharges.toFixed(2)}</td>
                  <td>{rate.raCharges.toFixed(2)}</td>
                  <td>{rate.facRate.toFixed(2)}</td>
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
