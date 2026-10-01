import { useMutation, useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import {
  listIFMSMaster,
  createIFMSMaster,
  deleteIFMSMaster,
  type IFMSMaster,
} from '../../lib/api/admin-extended';
import '../common.css';

type MasterForm = {
  bvgTeamMemberId: string;
  email: string;
  phoneNo: string;
};

export function IFMSMasterPage() {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<MasterForm>();
  const { data: masters = [], refetch, isLoading } = useQuery<IFMSMaster[]>({
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
        <div>
          <h1>IFMS Team Roster</h1>
          <p style={{ color: '#64748b', margin: '0.25rem 0 0 0', fontSize: '0.9rem' }}>
            Maintain registered maintenance supervisors, contact emails, and phone extensions
          </p>
        </div>
      </div>

      <div className="admin-card" style={{ marginBottom: '2rem' }}>
        <div className="admin-card-header">
          <strong>Add New IFMS Team Member</strong>
        </div>
        <div className="admin-card-body">
          <form onSubmit={handleSubmit((data) => submit(data))}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '1rem',
                marginBottom: '1.25rem',
              }}
            >
              <div>
                <label className="admin-label" htmlFor="bvgTeamMemberId">Team Member ID *</label>
                <input
                  id="bvgTeamMemberId"
                  {...register('bvgTeamMemberId', {
                    required: 'Team Member ID required',
                    pattern: {
                      value: /^[A-Z0-9]+$/,
                      message: 'Only uppercase letters and numbers',
                    },
                  })}
                  className="form-control"
                  placeholder="e.g. IFMS001"
                />
                {errors.bvgTeamMemberId && <span className="error">{errors.bvgTeamMemberId.message}</span>}
              </div>

              <div>
                <label className="admin-label" htmlFor="email">Official Email *</label>
                <input
                  id="email"
                  type="email"
                  {...register('email', {
                    required: 'Email required',
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: 'Invalid email address',
                    },
                  })}
                  className="form-control"
                  placeholder="supervisor@hpcl.in"
                />
                {errors.email && <span className="error">{errors.email.message}</span>}
              </div>

              <div>
                <label className="admin-label" htmlFor="phoneNo">Phone Number *</label>
                <input
                  id="phoneNo"
                  {...register('phoneNo', {
                    required: 'Phone required',
                    pattern: {
                      value: /^[0-9]{10}$/,
                      message: 'Must be 10 digits',
                    },
                  })}
                  className="form-control"
                  placeholder="9876543210"
                />
                {errors.phoneNo && <span className="error">{errors.phoneNo.message}</span>}
              </div>
            </div>

            <button type="submit" disabled={isPending} className="btn btn-primary">
              <i className="fa fa-user-plus" aria-hidden="true" style={{ marginRight: '6px' }} />
              {isPending ? 'Registering...' : 'Add Team Member'}
            </button>
          </form>
        </div>
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
              {masters.map((master: IFMSMaster) => (
                <tr key={master.id ?? master.bvgTeamMemberId}>
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
                    {master.id !== undefined && (
                      <button
                        onClick={() => {
                          if (window.confirm('Delete this member?')) {
                            remove(master.id!);
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
                    )}
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
