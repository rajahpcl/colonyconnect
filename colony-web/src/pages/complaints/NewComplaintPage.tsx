import { useMutation, useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import {
  createComplaint,
  listComplaintCategories,
  listComplaintSubCategories,
} from '../../lib/api/complaints';
import './complaints.css';

type NewComplaintForm = {
  categoryId: string;
  subcategoryId: string;
  compDetails: string;
  uploadFile?: FileList;
  uploadFile1?: FileList;
};

export function NewComplaintPage() {
  const navigate = useNavigate();
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [fileError, setFileError] = useState('');

  const { register, handleSubmit, watch, formState: { errors } } = useForm<NewComplaintForm>({
    mode: 'onBlur',
  });

  const categoryId = watch('categoryId');

  const { data: categories = [] } = useQuery({
    queryKey: ['complaint-categories'],
    queryFn: listComplaintCategories,
  });

  const { mutate: createMutation, isPending } = useMutation({
    mutationFn: async (data: NewComplaintForm) => {
      const files = document.querySelectorAll<HTMLInputElement>('input[name="uploadFile"]');
      const fileCount = Array.from(files).reduce((count, input) => {
        return count + (input.files?.length || 0);
      }, 0);

      if (fileCount > 2) {
        setFileError('Maximum 2 files allowed');
        throw new Error('Too many files');
      }

      const formData = new FormData();
      formData.append('categoryId', data.categoryId);
      formData.append('subcategoryId', data.subcategoryId);
      formData.append('compDetails', data.compDetails);

      if (data.uploadFile?.[0]) {
        formData.append('uploadFile', data.uploadFile[0]);
      }
      if (data.uploadFile1?.[0]) {
        formData.append('uploadFile1', data.uploadFile1[0]);
      }

      return createComplaint(formData);
    },
    onSuccess: () => {
      navigate('/app/complaints/my');
    },
    onError: (error) => {
      console.error('Error creating complaint:', error);
    },
  });

  useEffect(() => {
    if (categoryId) {
      listComplaintSubCategories(categoryId)
        .then(setSubcategories)
        .catch(() => setSubcategories([]));
    } else {
      setSubcategories([]);
    }
  }, [categoryId]);

  const onSubmit = (data: NewComplaintForm) => {
    setFileError('');
    createMutation(data);
  };

  return (
    <div className="complaints-container">
      <div className="complaints-header">
        <h1>New Complaint</h1>
        <p>Submit a new maintenance request</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="complaint-form">
        <div className="form-group">
          <label htmlFor="categoryId">
            Complaint Type <span className="required">*</span>
          </label>
          <select
            id="categoryId"
            {...register('categoryId', { required: 'Select complaint type' })}
            className="form-control"
          >
            <option value="">Select Complaint Type</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          {errors.categoryId && <span className="error-text">{errors.categoryId.message}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="subcategoryId">
            Sub-Category <span className="required">*</span>
          </label>
          <select
            id="subcategoryId"
            {...register('subcategoryId', { required: 'Select sub-category' })}
            className="form-control"
          >
            <option value="">Select Sub-Category</option>
            {subcategories.map((subcat) => (
              <option key={subcat.id} value={subcat.id}>
                {subcat.name}
              </option>
            ))}
          </select>
          {errors.subcategoryId && <span className="error-text">{errors.subcategoryId.message}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="compDetails">
            Complaint Details <span className="required">*</span>
          </label>
          <textarea
            id="compDetails"
            {...register('compDetails', {
              required: 'Enter complaint details',
              minLength: { value: 10, message: 'Minimum 10 characters' },
            })}
            className="form-control"
            rows={5}
            placeholder="Describe your complaint in detail..."
          />
          {errors.compDetails && <span className="error-text">{errors.compDetails.message}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="uploadFile">Upload File (Optional)</label>
          <input
            id="uploadFile"
            type="file"
            {...register('uploadFile')}
            className="form-control"
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
          />
          <small>Supported: PDF, JPG, PNG, DOC, DOCX (Max 2 files)</small>
        </div>

        <div className="form-group">
          <label htmlFor="uploadFile1">Upload File 2 (Optional)</label>
          <input
            id="uploadFile1"
            type="file"
            {...register('uploadFile1')}
            className="form-control"
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
          />
        </div>

        {fileError && <div className="error-message">{fileError}</div>}

        <div className="form-actions">
          <button type="button" onClick={() => navigate(-1)} className="btn btn-secondary">
            Cancel
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="btn btn-primary"
          >
            {isPending ? 'Submitting...' : 'Submit Complaint'}
          </button>
        </div>
      </form>
    </div>
  );
}
