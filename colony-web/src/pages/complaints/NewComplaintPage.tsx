import { useMutation, useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../lib/auth/authStore';
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
  const user = useAuthStore((state) => state.user);
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [fileError, setFileError] = useState('');

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<NewComplaintForm>({
    mode: 'onBlur',
  });

  const categoryId = watch('categoryId');
  const subcategoryId = watch('subcategoryId');

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
      // Backend automatically adds empNo, flatNo, complexCode from server-side context

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
    if (user && !user.flatNo) {
      alert('Your flat information is not available.');
      navigate(-1);
    }
  }, [user, navigate]);

  useEffect(() => {
    if (categoryId) {
      listComplaintSubCategories(categoryId)
        .then((data) => {
          setSubcategories(data);
          if (data && data.length > 0) {
            setValue('subcategoryId', data[0].id.toString());
          } else {
            setValue('subcategoryId', '');
          }
        })
        .catch(() => {
          setSubcategories([]);
          setValue('subcategoryId', '');
        });
    } else {
      setSubcategories([]);
      setValue('subcategoryId', '');
    }
  }, [categoryId, setValue]);

  const onSubmit = (data: NewComplaintForm) => {
    setFileError('');
    createMutation(data);
  };

  if (user && !user.flatNo) {
    return null; // Return nothing while navigating away
  }

  return (
    <div className="complaints-container">
      <div className="complaints-header">
        <h1>Complaint</h1>
      </div>

      <div className="user-details-banner">
        <div className="user-detail-item">
          <span className="label">Employee : </span>
          <span className="value"><strong>{user?.name} ({user?.empNo})</strong></span>
        </div>
        <div className="user-detail-item">
          <span className="label">Colony : </span>
          <span className="value">{user?.complexName || user?.complexCode}</span>
        </div>
        <div className="user-detail-item">
          <span className="label">Flat No: </span>
          <span className="value">{user?.flatNo}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="complaint-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="categoryId">Complaint Type:</label>
            <select
              id="categoryId"
              {...register('categoryId', { required: 'Select complaint type' })}
              className="form-control"
            >
              <option value="">Select Complaint</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            {errors.categoryId && <span className="error-text">{errors.categoryId.message}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="subcategoryId">Sub-Category:</label>
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
            <label>Complaint Id:</label>
            <input type="text" className="form-control" value={subcategoryId || ''} disabled />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group full-width">
            <label htmlFor="compDetails">Complaint Details (Max 200 characters):</label>
            <textarea
              id="compDetails"
              {...register('compDetails', {
                required: 'Enter complaint details',
                maxLength: { value: 200, message: 'Maximum 200 characters allowed' }
              })}
              className="form-control"
              rows={3}
            />
            {errors.compDetails && <span className="error-text">{errors.compDetails.message}</span>}
          </div>

          <div className="form-group">
            <label>Status :</label>
          </div>

          <div className="form-group">
            <label htmlFor="uploadFile">Upload file:</label>
            <input
              id="uploadFile"
              type="file"
              {...register('uploadFile')}
              className="form-control"
              accept=".pdf,.jpg,.jpeg,.png,.bmp"
            />
            <small>Maximum 2 files (PDF, JPG, PNG, BMP)</small>
            
            <input
              id="uploadFile1"
              type="file"
              {...register('uploadFile1')}
              className="form-control mt-2"
              accept=".pdf,.jpg,.jpeg,.png,.bmp"
            />
          </div>
        </div>

        {fileError && <div className="error-message">{fileError}</div>}

        <div className="form-actions-row">
          <button type="button" onClick={() => { /* reset logic */ }} className="btn btn-danger">
            Reset
          </button>
          <div className="right-actions">
            <button type="button" className="btn btn-secondary mr-2">
              Save
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="btn btn-primary"
            >
              Submit
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
