import { useMutation, useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { listIFMSMaster, createIFMSMaster, deleteIFMSMaster } from '../../lib/api/admin-extended';
import '../common.css';

type MasterForm = {
  bvgTeamMemberId: string;
  email: string;
  phoneNo: string;
};

export function IFMSMasterPage() {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<MasterForm>();
  const { data: masters = [], refetch, isLoading } = useQuery({
    queryKey: ['ifms-master'],
    queryFn: () => listIFMSMaster(),
  });

  const { mutate: submit, isPending } = useMutation({
    mutationFn: (data: MasterForm) =>
      createIFMSMaster({
        ...data,
        status: 10,
      }),
    onSuccess: () => {
      reset();
      refetch();
    },
  });

  const { mutate: remove, isPending: isDeleting } = useMutation({
    mutationFn: (id: number) => deleteIFMSMaster(id),
    onSuccess: () => refetch(),
  });

  return (
    <div className="container">
      <div className="header">
        <h1>IFMS Master</h1>
      </div>

      <div style={{ background: '#fff', padding: '2rem', marginBottom: '2rem', borderRadius: '4px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <h3>Add IFMS Team Member</h3>
        <form onSubmit={handleSubmit((data) => submit(data))}>
          <div style={{ marginBottom: '1rem' }}>
            <label>Team Member ID</label>
            <input
              {...register('bvgTeamMemberId', {
                required: 'Team Member ID required',
                pattern: {
                  value: /^[A-Z0-9]+$/,
                  message: 'Only uppercase letters and numbers',
                },
              })}
              className="form-control"
              placeholder="e.g., IFMS001"
            />
            {errors.bvgTeamMemberId && <span className="error">{errors.bvgTeamMemberId.message}</span>}
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label>Email</label>
            <input
              type="email"
              {...register('email', {
                required: 'Email required',
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: 'Invalid email',
                },
              })}
              className="form-control"
            />
            {errors.email && <span className="error">{errors.email.message}</span>}
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label>Phone No.</label>
            <input
              {...register('phoneNo', {
                required: 'Phone required',
                pattern: {
                  value: /^[0-9]{10}$/,
                  message: '10 digit number',
                },
              })}
              className="form-control"
            />
            {errors.phoneNo && <span className="error">{errors.phoneNo.message}</span>}
          </div>

          <button type="submit" disabled={isPending} className="btn btn-primary">
            {isPending ? 'Adding...' : 'Add Member'}
          </button>
        </form>
      </div>

      <h3>IFMS Team Members</h3>
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Team Member ID</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {masters.map((master: any) => (
                <tr key={master.id}>
                  <td>
                    <strong>{master.bvgTeamMemberId}</strong>
                  </td>
                  <td>{master.email}</td>
                  <td>{master.phoneNo}</td>
                  <td>
                    <span className={`status-badge status-${master.status === 10 ? 'active' : 'inactive'}`}>
                      {master.status === 10 ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={() => {
                        if (window.confirm('Delete this member?')) {
                          remove(master.id);
                        }
                      }}
                      disabled={isDeleting}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#e74c3c',
                        cursor: 'pointer',
                        textDecoration: 'underline',
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
