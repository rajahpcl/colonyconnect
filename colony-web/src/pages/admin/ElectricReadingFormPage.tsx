import { useQuery, useMutation } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  getComplexList,
  getBuildingsByComplex,
  getFlatsByComplexBuilding,
  getEmployeeByFlatComplex,
  submitElectricReading,
} from '../../lib/api/admin-extended';
import { getElectricRates } from '../../lib/api/readings';
import '../common.css';

type ReadingForm = {
  complexCode: string;
  building: string;
  flatNo: string;
  reading: number;
  readingDate: string;
  rateId: number;
};

export function ElectricReadingFormPage() {
  const { register, handleSubmit, watch, formState: { errors }, setValue } = useForm<ReadingForm>();
  const complexCode = watch('complexCode');
  const building = watch('building');
  const flatNo = watch('flatNo');
  const reading = watch('reading');
  const rateId = watch('rateId');

  const [employee, setEmployee] = useState<any>(null);
  const [buildings, setBuildings] = useState<any[]>([]);
  const [flats, setFlats] = useState<any[]>([]);
  const [amount, setAmount] = useState(0);

  const { data: complexes = [] } = useQuery({
    queryKey: ['complex-list'],
    queryFn: () => getComplexList(),
  });

  const { data: rates = [] } = useQuery({
    queryKey: ['rates'],
    queryFn: () => getElectricRates(),
  });

  const { mutate: submit, isPending } = useMutation({
    mutationFn: (data: ReadingForm) =>
      submitElectricReading({
        ...data,
        empNo: employee?.empNo,
        amount,
      }),
    onSuccess: () => {
      alert('Reading submitted successfully');
      setValue('reading', 0);
    },
  });

  useEffect(() => {
    if (complexCode) {
      getBuildingsByComplex(complexCode).then(setBuildings);
    }
  }, [complexCode]);

  useEffect(() => {
    if (complexCode && building) {
      getFlatsByComplexBuilding(complexCode, building).then(setFlats);
    }
  }, [complexCode, building]);

  useEffect(() => {
    if (flatNo && complexCode) {
      getEmployeeByFlatComplex(flatNo, complexCode).then(setEmployee);
    }
  }, [flatNo, complexCode]);

  useEffect(() => {
    if (reading && rateId) {
      const rate = rates.find((r: any) => r.id === rateId);
      if (rate) {
        setAmount(parseFloat((reading * rate.rate).toFixed(2)));
      }
    }
  }, [reading, rateId, rates]);

  return (
    <div className="container" style={{ maxWidth: '700px' }}>
      <h1>Electric Reading</h1>

      <div style={{ background: '#fff', padding: '2rem', borderRadius: '4px', marginTop: '2rem' }}>
        <form onSubmit={handleSubmit((data) => submit(data))}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label>Complex Code</label>
            <select {...register('complexCode', { required: true })} className="form-control">
              <option value="">Select Complex</option>
              {complexes.map((c: any) => (
                <option key={c.code} value={c.code}>
                  {c.name}
                </option>
              ))}
            </select>
            {errors.complexCode && <span className="error">Required</span>}
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label>Building</label>
            <select {...register('building', { required: true })} className="form-control">
              <option value="">Select Building</option>
              {buildings.map((b: any) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
            {errors.building && <span className="error">Required</span>}
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label>Flat No.</label>
            <select {...register('flatNo', { required: true })} className="form-control">
              <option value="">Select Flat</option>
              {flats.map((f: any) => (
                <option key={f.flatNo} value={f.flatNo}>
                  {f.flatNo}
                </option>
              ))}
            </select>
            {errors.flatNo && <span className="error">Required</span>}
          </div>

          {employee && (
            <div style={{ marginBottom: '1.5rem', padding: '1rem', background: '#f9f9f9', borderRadius: '4px' }}>
              <strong>Employee:</strong> {employee.empName} ({employee.empNo})
            </div>
          )}

          <div style={{ marginBottom: '1.5rem' }}>
            <label>Reading Date</label>
            <input
              type="date"
              {...register('readingDate', { required: true })}
              className="form-control"
            />
            {errors.readingDate && <span className="error">Required</span>}
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label>Reading (Units)</label>
            <input
              type="number"
              step="0.01"
              {...register('reading', { required: true, min: 0 })}
              className="form-control"
            />
            {errors.reading && <span className="error">Required, min 0</span>}
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label>Rate</label>
            <select {...register('rateId', { required: true })} className="form-control">
              <option value="">Select Rate</option>
              {rates.map((r: any) => (
                <option key={r.id} value={r.id}>
                  ₹{r.rate} per {r.unit}
                </option>
              ))}
            </select>
            {errors.rateId && <span className="error">Required</span>}
          </div>

          {amount > 0 && (
            <div style={{
              marginBottom: '1.5rem',
              padding: '1rem',
              background: '#e8f5e9',
              borderRadius: '4px',
              borderLeft: '4px solid #4caf50',
            }}>
              <strong>Calculated Amount:</strong> ₹{amount.toFixed(2)}
            </div>
          )}

          <button type="submit" disabled={isPending} className="btn btn-primary" style={{ width: '100%' }}>
            {isPending ? 'Submitting...' : 'Submit Reading'}
          </button>
        </form>
      </div>
    </div>
  );
}
