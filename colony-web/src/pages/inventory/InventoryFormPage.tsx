import { useMutation, useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { createInventory, getInventory, updateInventory } from '../../lib/api/inventory';
import '../common.css';

type InventoryForm = {
  itemCode: string;
  itemName: string;
  categoryId: number;
  quantity: number;
  unit: string;
  location: string;
};

export function InventoryFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { register, handleSubmit, formState: { errors } } = useForm<InventoryForm>();

  const { data: _item } = useQuery({
    queryKey: ['inventory', id],
    queryFn: () => getInventory(parseInt(id!)),
    enabled: !!id,
  });

  const { mutate: save, isPending } = useMutation({
    mutationFn: (data: InventoryForm) =>
      id ? updateInventory(parseInt(id), data) : createInventory(data),
    onSuccess: () => navigate('/app/inventory/list'),
  });

  return (
    <div className="container" style={{ maxWidth: '600px' }}>
      <h1>{id ? 'Edit' : 'Add'} Inventory Item</h1>
      <form onSubmit={handleSubmit((data) => save(data))}>
        <div style={{ marginBottom: '1rem' }}>
          <label>Item Code</label>
          <input {...register('itemCode', { required: true })} className="form-control" />
          {errors.itemCode && <span className="error">Required</span>}
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label>Item Name</label>
          <input {...register('itemName', { required: true })} className="form-control" />
          {errors.itemName && <span className="error">Required</span>}
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label>Category ID</label>
          <input type="number" {...register('categoryId', { required: true })} className="form-control" />
          {errors.categoryId && <span className="error">Required</span>}
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label>Quantity</label>
          <input type="number" {...register('quantity', { required: true })} className="form-control" />
          {errors.quantity && <span className="error">Required</span>}
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label>Unit</label>
          <input {...register('unit', { required: true })} className="form-control" />
          {errors.unit && <span className="error">Required</span>}
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label>Location</label>
          <input {...register('location', { required: true })} className="form-control" />
          {errors.location && <span className="error">Required</span>}
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
