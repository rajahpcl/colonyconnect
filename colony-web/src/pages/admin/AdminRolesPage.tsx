import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import '../common.css';
import './admin.css';

/**
 * Admin Roles — mirrors admin_role.jsp
 *
 * Form: Select Complex Name (dropdown) + Enter Employee Number + Add Role button
 * Table: S.No | Complex Name | Complex Admin (comma-separated emp nos)
 *
 * DB: housing_complex_list has columns: COMPLEX_CODE, COMPLEX_NAME, COMPLEX_ADMIN
 * City/State columns are not present in the current DB schema.
 */

type ComplexRow = { complexCode: string; complexName: string; complexAdmin?: string };

export function AdminRolesPage() {
  const [selectedCode, setSelectedCode] = useState('');
  const [empNo, setEmpNo] = useState('');
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const qc = useQueryClient();

  // Fetch all complexes for the table (and reuse for dropdown)
  const { data: complexes = [] } = useQuery<ComplexRow[]>({
    queryKey: ['admin-roles'],
    queryFn: () =>
      fetch('/api/v1/admin/roles', { credentials: 'include' }).then((r) => r.json()),
  });

  const { mutate: addRole, isPending } = useMutation({
    mutationFn: async () => {
      if (!selectedCode) throw new Error('Select a Complex');
      if (!empNo.trim()) throw new Error('Enter Employee Number');

      const res = await fetch('/api/v1/admin/roles/add', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ complexCode: selectedCode, empNo: empNo.trim() }),
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || 'Failed to add role');
      }
      return res.json();
    },
    onSuccess: () => {
      setMsg('Admin Role Added Successfully');
      setError('');
      setEmpNo('');
      qc.invalidateQueries({ queryKey: ['admin-roles'] });
    },
    onError: (e: Error) => {
      setError(e.message);
      setMsg('');
    },
  });

  return (
    <div className="admin-page-container">
      {/* ── Add Role Form ── */}
      <div className="admin-card" style={{ maxWidth: '640px', margin: '0 auto 2rem' }}>
        <div className="admin-card-header">
          <strong>Complex Admin</strong>
        </div>
        <div className="admin-card-body">
          <div className="admin-form-row">
            <label className="admin-label">Select Complex Name :</label>
            <select
              id="comp_code"
              className="admin-select"
              value={selectedCode}
              onChange={(e) => setSelectedCode(e.target.value)}
            >
              <option value="">-- Select Complex --</option>
              {complexes.map((c) => (
                <option key={c.complexCode} value={c.complexCode}>
                  {c.complexName}
                </option>
              ))}
            </select>
          </div>

          <div className="admin-form-row" style={{ marginTop: '0.75rem' }}>
            <label className="admin-label">Enter Employee Number :</label>
            <input
              id="e_no_add"
              type="text"
              className="admin-text-input"
              value={empNo}
              onChange={(e) => setEmpNo(e.target.value)}
              placeholder="Employee No."
            />
          </div>

          {error && <p className="admin-error-msg">{error}</p>}
          {msg && <p className="admin-success-msg">{msg}</p>}

          <div style={{ marginTop: '1rem' }}>
            <button className="admin-submit-btn" onClick={() => addRole()} disabled={isPending}>
              {isPending ? 'Adding…' : 'Add Role'}
            </button>
          </div>
        </div>
      </div>

      {/* ── All Complexes Table ── */}
      <div className="table-responsive">
        <table className="admin-table" id="report_table">
          <thead>
            <tr>
              <th>S.No.</th>
              <th>Complex Name</th>
              <th>Complex Code</th>
              <th>Complex Admin</th>
            </tr>
          </thead>
          <tbody>
            {complexes.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', padding: '1.5rem' }}>
                  No complexes found.
                </td>
              </tr>
            ) : (
              complexes.map((c, i) => (
                <tr key={c.complexCode}>
                  <td>{i + 1}</td>
                  <td>{c.complexName}</td>
                  <td>{c.complexCode}</td>
                  <td style={{ wordBreak: 'break-all' }}>{c.complexAdmin ?? '-'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
