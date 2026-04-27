import { useMutation, useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  getComplexList,
  getEmployeeListByComplex,
  getAvailableFlats,
  createFlatAssignment,
  listFlatAssignments,
} from '../../lib/api/admin-extended';
import '../common.css';

type AssignForm = {
  complexCode: string;
  empNo: string;
  flatNo: string;
};

export function AssignFlatsPage() {
  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm<AssignForm>();
  const complexCode = watch('complexCode');

  const [employees, setEmployees] = useState<any[]>([]);
  const [flats, setFlats] = useState<any[]>([]);

  const { data: complexes = [] } = useQuery({
    queryKey: ['complex-list'],
    queryFn: () => getComplexList(),
  });

  const { data: assignments = [], refetch, isLoading } = useQuery({
    queryKey: ['flat-assignments', complexCode],
    queryFn: () => listFlatAssignments(complexCode),
  });

  const { mutate: assign, isPending } = useMutation({
    mutationFn: (data: AssignForm) => createFlatAssignment(data),
    onSuccess: () => {
      reset();
      refetch();
    },
  });

  useEffect(() => {
    if (complexCode) {
      getEmployeeListByComplex(complexCode).then(setEmployees);
      getAvailableFlats(complexCode).then(setFlats);
    }
  }, [complexCode]);

  return (
    <div className="container">
      <div className="header">
        <h1>Assign Flats</h1>
      </div>

      <div style={{ background: '#fff', padding: '2rem', marginBottom: '2rem', borderRadius: '4px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <h3>Assign Flat to Employee</h3>
        <form onSubmit={handleSubmit((data) => assign(data))}>
          <div style={{ marginBottom: '1rem' }}>
            <label>Complex Code</label>
            <select
              {...register('complexCode', { required: 'Select complex' })}
              className="form-control"
            >
              <option value="">Select Complex</option>
              {complexes.map((c: any) => (
                <option key={c.code} value={c.code}>
                  {c.name} ({c.code})
                </option>
              ))}
            </select>
            {errors.complexCode && <span className="error">{errors.complexCode.message}</span>}
          </div>

          {complexCode && (
            <>
              <div style={{ marginBottom: '1rem' }}>
                <label>Employee No.</label>
                <select
                  {...register('empNo', { required: 'Select employee' })}
                  className="form-control"
                >
                  <option value="">Select Employee</option>
                  {employees.map((e: any) => (
                    <option key={e.empNo} value={e.empNo}>
                      {e.empName} ({e.empNo})
                    </option>
                  ))}
                </select>
                {errors.empNo && <span className="error">{errors.empNo.message}</span>}
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label>Flat No.</label>
                <select
                  {...register('flatNo', { required: 'Select flat' })}
                  className="form-control"
                >
                  <option value="">Select Flat</option>
                  {flats.map((f: any) => (
                    <option key={f.flatNo} value={f.flatNo}>
                      {f.flatNo}
                    </option>
                  ))}
                </select>
                {errors.flatNo && <span className="error">{errors.flatNo.message}</span>}
              </div>
            </>
          )}

          <button type="submit" disabled={isPending || !complexCode} className="btn btn-primary">
            {isPending ? 'Assigning...' : 'Assign Flat'}
          </button>
        </form>
      </div>

      {complexCode && (
        <>
          <h3>Current Assignments - {complexCode}</h3>
          {isLoading ? (
            <p>Loading...</p>
          ) : assignments.length === 0 ? (
            <p>No assignments yet</p>
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Employee No.</th>
                    <th>Employee Name</th>
                    <th>Flat No.</th>
                    <th>Allotment Date</th>
                  </tr>
                </thead>
                <tbody>
                  {assignments.map((assign: any) => (
                    <tr key={`${assign.empNo}-${assign.flatNo}`}>
                      <td>
                        <strong>{assign.empNo}</strong>
                      </td>
                      <td>{assign.empName}</td>
                      <td>{assign.flatNo}</td>
                      <td>
                        {assign.allotmentDate
                          ? new Date(assign.allotmentDate).toLocaleDateString()
                          : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
