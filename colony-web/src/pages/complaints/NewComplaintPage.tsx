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

  const onSubmit = (data: NewComplaintForm, status: number) => {
    setFileError('');
    const formData = new FormData();
    formData.append('subcategoryId', data.subcategoryId);
    formData.append('compDetails', data.compDetails);
    formData.append('status', status.toString());
    if (data.uploadFile && data.uploadFile[0]) {
      formData.append('uploadFile', data.uploadFile[0]);
    }
    if (data.uploadFile1 && data.uploadFile1[0]) {
      formData.append('uploadFile1', data.uploadFile1[0]);
    }
    formData.append('empNo', user?.empNo || '');
    createMutation(formData);
  };

  if (user && !user.flatNo) {
    return null; // Return nothing while navigating away
  }

  const compDetailsValue = watch('compDetails') || '';

  return (
    <div className="complaints-container">
      {/* Header */}
      <div className="complaints-header">
        <div>
          <h1>Register New Request</h1>
          <p>Submit a maintenance, electrical, or plumbing service request for your colony quarter.</p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/app/complaints/my')}
          className="btn btn-secondary"
        >
          <i className="fa fa-arrow-left" aria-hidden="true" style={{ marginRight: '6px' }} />
          My Requests
        </button>
      </div>

      {/* Resident Info Card */}
      <div className="user-details-banner">
        <div className="user-detail-item">
          <i className="fa fa-user-circle-o" aria-hidden="true" style={{ color: '#004085', fontSize: '1.2rem' }} />
          <div>
            <span className="label">Employee: </span>
            <span className="value">{user?.name} ({user?.empNo})</span>
          </div>
        </div>
        <div className="user-detail-item">
          <i className="fa fa-building-o" aria-hidden="true" style={{ color: '#059669', fontSize: '1.2rem' }} />
          <div>
            <span className="label">Colony: </span>
            <span className="value">{user?.complexName || user?.complexCode}</span>
          </div>
        </div>
        <div className="user-detail-item">
          <i className="fa fa-home" aria-hidden="true" style={{ color: '#d97706', fontSize: '1.2rem' }} />
          <div>
            <span className="label">Flat No: </span>
            <span className="value">{user?.flatNo}</span>
          </div>
        </div>
      </div>

      {/* Complaint Form */}
      <form className="complaint-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="categoryId">
              Complaint Type <span className="required">*</span>
            </label>
            <select
              id="categoryId"
              {...register('categoryId', { required: 'Please select a complaint type' })}
              className="form-control"
            >
              <option value="">Select Category (Electrical, Civil, Plumbing...)</option>
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
              {...register('subcategoryId', { required: 'Please select a sub-category' })}
              className="form-control"
              disabled={!categoryId || subcategories.length === 0}
            >
              <option value="">{categoryId ? 'Select Specific Issue' : 'Select Category First'}</option>
              {subcategories.map((subcat) => (
                <option key={subcat.id} value={subcat.id}>
                  {subcat.name}
                </option>
              ))}
            </select>
            {errors.subcategoryId && <span className="error-text">{errors.subcategoryId.message}</span>}
          </div>

          <div className="form-group" style={{ maxWidth: '200px' }}>
            <label>Subcategory ID:</label>
            <input
              type="text"
              className="form-control"
              value={subcategoryId || '—'}
              disabled
              style={{ background: '#f8fafc', color: '#64748b' }}
            />
          </div>
        </div>

        <div className="form-group">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
            <label htmlFor="compDetails" style={{ margin: 0 }}>
              Complaint Description <span className="required">*</span>
            </label>
            <span style={{ fontSize: '0.78rem', color: compDetailsValue.length > 180 ? '#dc2626' : '#64748b' }}>
              {compDetailsValue.length}/200 characters
            </span>
          </div>
          <textarea
            id="compDetails"
            {...register('compDetails', {
              required: 'Please describe your complaint',
              maxLength: { value: 200, message: 'Maximum 200 characters allowed' },
            })}
            className="form-control"
            rows={4}
            placeholder="Please detail the location, issue severity, and convenient inspection timings..."
          />
          {errors.compDetails && <span className="error-text">{errors.compDetails.message}</span>}
        </div>

        {/* Attachment Upload Card */}
        <div
          style={{
            background: '#f8fafc',
            border: '1px dashed #cbd5e1',
            borderRadius: '10px',
            padding: '1.25rem',
            marginBottom: '1.5rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.75rem' }}>
            <i className="fa fa-paperclip" aria-hidden="true" style={{ color: '#004085', fontSize: '1.1rem' }} />
            <strong style={{ fontSize: '0.92rem', color: '#1e293b' }}>Supporting Photos / Documents (Optional)</strong>
          </div>
          <p style={{ margin: '0 0 1rem 0', fontSize: '0.82rem', color: '#64748b' }}>
            Attach clear photos of the issue to speed up technician diagnosis. Max 2 files (PDF, JPG, PNG, BMP).
          </p>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="uploadFile" style={{ fontSize: '0.85rem' }}>Primary Attachment:</label>
              <input
                id="uploadFile"
                type="file"
                {...register('uploadFile')}
                className="form-control"
                accept=".pdf,.jpg,.jpeg,.png,.bmp"
              />
            </div>
            <div className="form-group">
              <label htmlFor="uploadFile1" style={{ fontSize: '0.85rem' }}>Secondary Attachment:</label>
              <input
                id="uploadFile1"
                type="file"
                {...register('uploadFile1')}
                className="form-control"
                accept=".pdf,.jpg,.jpeg,.png,.bmp"
              />
            </div>
          </div>
        </div>

        {fileError && <div className="error-message">{fileError}</div>}

        {/* Form Actions */}
        <div className="form-actions-row">
          <button
            type="button"
            onClick={() => {
              setValue('compDetails', '');
              setValue('categoryId', '');
              setValue('subcategoryId', '');
            }}
            className="btn btn-secondary"
          >
            <i className="fa fa-refresh" aria-hidden="true" style={{ marginRight: '6px' }} />
            Reset Form
          </button>

          <div className="right-actions">
            <button
              type="button"
              onClick={() => navigate('/app/complaints/my')}
              className="btn btn-secondary mr-2"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit((data) => onSubmit(data, 10))}
              disabled={isPending}
              className="btn btn-secondary mr-2"
            >
              Save
            </button>
            <button
              type="button"
              onClick={handleSubmit((data) => onSubmit(data, 20))}
              disabled={isPending}
              className="btn btn-primary"
            >
              <i className="fa fa-paper-plane" aria-hidden="true" style={{ marginRight: '6px' }} />
              {isPending ? 'Submitting…' : 'Submit'}
            </button>
        </div>
        </div>
      </form>
    </div>
  );
}
