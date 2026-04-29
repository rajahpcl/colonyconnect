import { useMutation, useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { createVehicle, getVehicle, updateVehicle } from '../../lib/api/vehicles';
import '../common.css';

type VehicleForm = {
  registrationNo: string;
  vehicleType: '2-Wheeler' | '4-Wheeler';
  make: string;
  model: string;
  empNo: string;
  color: string;
};

export function VehicleFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { register, handleSubmit, formState: { errors } } = useForm<VehicleForm>();

  const { data: _vehicle } = useQuery({
    queryKey: ['vehicle', id],
    queryFn: () => getVehicle(parseInt(id!)),
    enabled: !!id,
  });

  const { mutate: save, isPending } = useMutation({
    mutationFn: (data: VehicleForm) =>
      id ? updateVehicle(parseInt(id), data) : createVehicle(data),
    onSuccess: () => navigate('/app/resident/vehicles'),
  });

  return (
    <div className="container" style={{ maxWidth: '600px' }}>
      <h1>{id ? 'Edit' : 'Add'} Vehicle</h1>
      <form onSubmit={handleSubmit((data) => save(data))}>
        <div style={{ marginBottom: '1rem' }}>
          <label>Registration No.</label>
          <input {...register('registrationNo', { required: true })} className="form-control" />
          {errors.registrationNo && <span className="error">Required</span>}
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label>Vehicle Type</label>
          <select {...register('vehicleType', { required: true })} className="form-control">
            <option value="">Select Type</option>
            <option value="2-Wheeler">2-Wheeler</option>
            <option value="4-Wheeler">4-Wheeler</option>
          </select>
          {errors.vehicleType && <span className="error">Required</span>}
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label>Make (Brand)</label>
          <input {...register('make', { required: true })} className="form-control" />
          {errors.make && <span className="error">Required</span>}
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label>Model</label>
          <input {...register('model', { required: true })} className="form-control" />
          {errors.model && <span className="error">Required</span>}
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label>Employee No.</label>
          <input {...register('empNo', { required: true })} className="form-control" />
          {errors.empNo && <span className="error">Required</span>}
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label>Color</label>
          <input {...register('color')} className="form-control" />
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button type="button" onClick={() => navigate(-1)} className="btn btn-secondary">
            Cancel
          </button>
          <button type="submit" disabled={isPending} className="btn btn-primary">
            {isPending ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  );
}
