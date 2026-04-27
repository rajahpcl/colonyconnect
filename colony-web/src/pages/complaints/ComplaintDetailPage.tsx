import { useMutation, useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import {
  getComplaint,
  updateComplaint,
} from '../../lib/api/complaints';
import './complaints.css';

type ComplaintEditForm = {
  compDetails: string;
  subcategoryId: string;
  uploadFile?: FileList;
  uploadFile1?: FileList;
};

export function ComplaintDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [fileError, setFileError] = useState('');

  const { register, handleSubmit, formState: { errors }, setValue } = useForm<ComplaintEditForm>({
    mode: 'onBlur',
  });

  const { data: complaint, isLoading } = useQuery({
    queryKey: ['complaint', id],
    queryFn: () => getComplaint(id!),
    enabled: !!id,
  });

  const { mutate: updateMutation, isPending } = useMutation({
    mutationFn: async (data: ComplaintEditForm) => {
      const formData = new FormData();
      formData.append('compDetails', data.compDetails);
      formData.append('subcategoryId', data.subcategoryId);

      if (data.uploadFile?.[0]) {
        formData.append('uploadFile', data.uploadFile[0]);
      }
      if (data.uploadFile1?.[0]) {
        formData.append('uploadFile1', data.uploadFile1[0]);
      }

      return updateComplaint(id!, formData);
    },
    onSuccess: () => {
      navigate('/app/complaints/my');
    },
  });

  useEffect(() => {
    if (complaint) {
      setValue('compDetails', complaint.compDetails);
      setValue('subcategoryId', complaint.subcategoryId.toString());
    }
  }, [complaint, setValue]);

  const onSubmit = (data: ComplaintEditForm) => {
    setFileError('');
    updateMutation(data);
  };

  if (isLoading) {
    return <div className="complaints-container"><p>Loading...</p></div>;
  }

  if (!complaint) {
    return <div className="complaints-container"><p>Complaint not found</p></div>;
  }

  const isEditable = complaint.status === '10';

  return (
    <div className="complaints-container">
      <div className="complaints-header">
        <div>
          <h1>Complaint #{complaint.id}</h1>
          <p>
            Submitted on {new Date(complaint.submitDate).toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="complaint-detail">
        <div className="detail-section">
          <h3>Details</h3>
          <div className="detail-grid">
            <div className="detail-item">
              <label>Flat Number</label>
              <p>{complaint.flatNo}</p>
            </div>
            <div className="detail-item">
              <label>Category</label>
              <p>{complaint.categoryName}</p>
            </div>
            <div className="detail-item">
              <label>Sub-Category</label>
              <p>{complaint.subcategoryName}</p>
            </div>
            <div className="detail-item">
              <label>Status</label>
              <p>
                <span className={`status-badge status-${complaint.status?.toLowerCase()}`}>
                  {complaint.statusName}
                </span>
              </p>
            </div>
            {complaint.vendorName && (
              <div className="detail-item">
                <label>Assigned Vendor</label>
                <p>{complaint.vendorName}</p>
              </div>
            )}
            {complaint.updateDate && (
              <div className="detail-item">
                <label>Last Updated</label>
                <p>{new Date(complaint.updateDate).toLocaleDateString()}</p>
              </div>
            )}
          </div>
        </div>

        {isEditable ? (
          <form onSubmit={handleSubmit(onSubmit)} className="complaint-form">
            <div className="form-group">
              <label htmlFor="compDetails">
                Complaint Details <span className="required">*</span>
              </label>
              <textarea
                id="compDetails"
                {...register('compDetails', {
                  required: 'Enter complaint details',
                })}
                className="form-control"
                rows={5}
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
                {isPending ? 'Updating...' : 'Update Complaint'}
              </button>
            </div>
          </form>
        ) : (
          <div className="detail-section">
            <h3>Description</h3>
            <p className="complaint-text">{complaint.compDetails}</p>
            <div className="form-actions">
              <button onClick={() => navigate('/app/complaints/my')} className="btn btn-secondary">
                Back to List
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
