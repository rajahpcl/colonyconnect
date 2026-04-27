import { useMutation, useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { createVehicle, getVehicle, updateVehicle } from '../../lib/api/vehicles';
import '../common.css';

type VehicleForm = {
  vehicleNo: string;
  type: string;
  owner: string;
  flatNo: string;
  status: 'active' | 'inactive';
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
    onSuccess: () => navigate('/app/vehicles/list'),
  });

  return (
    <div className="container" style={{ maxWidth: '600px' }}>
      <h1>{id ? 'Edit' : 'Add'} Vehicle</h1>
      <form onSubmit={handleSubmit((data) => save(data))}>
        <div style={{ marginBottom: '1rem' }}>
          <label>Vehicle No.</label>
          <input {...register('vehicleNo', { required: true })} className="form-control" />
          {errors.vehicleNo && <span className="error">Required</span>}
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label>Type</label>
          <input {...register('type', { required: true })} className="form-control" placeholder="e.g., Car, Bike" />
          {errors.type && <span className="error">Required</span>}
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label>Owner</label>
          <input {...register('owner', { required: true })} className="form-control" />
          {errors.owner && <span className="error">Required</span>}
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label>Flat No.</label>
          <input {...register('flatNo', { required: true })} className="form-control" />
          {errors.flatNo && <span className="error">Required</span>}
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label>Status</label>
          <select {...register('status', { required: true })} className="form-control">
            <option value="">Select Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          {errors.status && <span className="error">Required</span>}
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
