import { useMutation, useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { listAdminRoles, createAdminRole } from '../../lib/api/admin';
import '../common.css';

type RoleForm = {
  role: string;
  empNo: string;
  complexCode: string;
  permissions: string;
};

export function AdminRolesPage() {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<RoleForm>();
  const { data: roles = [], refetch, isLoading } = useQuery({
    queryKey: ['admin-roles'],
    queryFn: () => listAdminRoles(),
  });

  const { mutate: submit, isPending } = useMutation({
    mutationFn: (data: RoleForm) =>
      createAdminRole({
        role: data.role,
        empNo: data.empNo,
        complexCode: data.complexCode,
        permissions: data.permissions.split(',').map((p) => p.trim()),
      }),
    onSuccess: () => {
      reset();
      refetch();
    },
  });

  return (
    <div className="container">
      <div className="header">
        <h1>Admin Roles</h1>
      </div>

      <div style={{ background: '#fff', padding: '2rem', marginBottom: '2rem', borderRadius: '4px' }}>
        <h3>Assign New Role</h3>
        <form onSubmit={handleSubmit((data) => submit(data))}>
          <div style={{ marginBottom: '1rem' }}>
            <label>Role</label>
            <select {...register('role', { required: true })} className="form-control">
              <option value="">Select Role</option>
              <option value="ADMIN">Admin</option>
              <option value="COMPLEX_ADMIN">Complex Admin</option>
              <option value="IFMS">IFMS</option>
              <option value="SECURITY">Security</option>
            </select>
            {errors.role && <span className="error">Required</span>}
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label>Employee No.</label>
            <input
              {...register('empNo', { required: true })}
              className="form-control"
            />
            {errors.empNo && <span className="error">Required</span>}
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label>Complex Code</label>
            <input
              {...register('complexCode', { required: true })}
              className="form-control"
            />
            {errors.complexCode && <span className="error">Required</span>}
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label>Permissions (comma-separated)</label>
            <textarea
              {...register('permissions', { required: true })}
              className="form-control"
              rows={2}
              placeholder="e.g., read, write, approve"
            />
            {errors.permissions && <span className="error">Required</span>}
          </div>
          <button type="submit" disabled={isPending} className="btn btn-primary">
            {isPending ? 'Assigning...' : 'Assign Role'}
          </button>
        </form>
      </div>

      <h3>Current Roles</h3>
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Employee No.</th>
                <th>Role</th>
                <th>Complex Code</th>
                <th>Permissions</th>
              </tr>
            </thead>
            <tbody>
              {roles.map((role: any) => (
                <tr key={role.id}>
                  <td>
                    <strong>{role.empNo}</strong>
                  </td>
                  <td>
                    <span style={{ background: '#e8f4f8', padding: '0.25rem 0.75rem', borderRadius: '4px', color: '#0066cc', fontWeight: '500' }}>
                      {role.role}
                    </span>
                  </td>
                  <td>{role.complexCode}</td>
                  <td>{role.permissions?.join(', ')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
