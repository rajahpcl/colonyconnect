import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import '../common.css';
import './admin.css';

/**
 * Assign Flats — mirrors colonyassign.jsp
 *
 * Form:
 *  - Select Complex Name (dropdown, filtered by admin access)
 *  - Employee Number (text input)
 *  - Flat Number (text input)
 *  - Submit (insert) OR Update (if pre-filled from edit row)
 *
 * Table: Complex | Employee Number | flat no | EDIT (pencil icon)
 */

type Complex = { code: string; name: string };
type Assignment = { complexCode: string; empNo: string; flatNo: string };
type EditTarget = { complexCode: string; empNo: string; flatNo: string } | null;

export function AssignFlatsPage() {
  const [complexCode, setComplexCode] = useState('');
  const [empNo, setEmpNo] = useState('');
  const [flatNo, setFlatNo] = useState('');
  const [editTarget, setEditTarget] = useState<EditTarget>(null); // original values for update
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const qc = useQueryClient();

  // Complexes (the logged-in admin's complexes)
  const { data: complexes = [] } = useQuery<Complex[]>({
    queryKey: ['admin-complexes-assign'],
    queryFn: () =>
      fetch('/api/v1/ifms/colonies', { credentials: 'include' }).then((r) => r.json()),
  });

  // Allotments filtered by selected complex
  const { data: assignments = [] } = useQuery<Assignment[]>({
    queryKey: ['flat-assignments', complexCode],
    queryFn: () =>
      fetch(
        `/api/v1/admin/flat-assignments${complexCode ? `?complexCode=${encodeURIComponent(complexCode)}` : ''}`,
        { credentials: 'include' }
      ).then((r) => r.json()),
    enabled: !!complexCode,
  });

  const { mutate: submitForm, isPending } = useMutation({
    mutationFn: async () => {
      if (!complexCode) throw new Error('Select a Complex');
      if (!empNo.trim()) throw new Error('Enter Employee Number');
      if (!flatNo.trim()) throw new Error('Enter Flat Number');

      if (editTarget) {
        // UPDATE
        const res = await fetch('/api/v1/admin/flat-assignments/update', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            oldComplexCode: editTarget.complexCode,
            oldEmpNo: editTarget.empNo,
            oldFlatNo: editTarget.flatNo,
            complexCode,
            empNo: empNo.trim(),
            flatNo: flatNo.trim(),
          }),
        });
        if (!res.ok) throw new Error('Update failed');
      } else {
        // INSERT
        const res = await fetch('/api/v1/admin/flat-assignments', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ complexCode, empNo: empNo.trim(), flatNo: flatNo.trim() }),
        });
        if (!res.ok) throw new Error('Failed to save assignment');
      }
    },
    onSuccess: () => {
      setMsg(editTarget ? 'Updated Successfully' : 'Saved Successfully');
      setError('');
      setEmpNo('');
      setFlatNo('');
      setEditTarget(null);
      qc.invalidateQueries({ queryKey: ['flat-assignments'] });
    },
    onError: (e: Error) => {
      setError(e.message);
      setMsg('');
    },
  });

  const handleEdit = (row: Assignment) => {
    setComplexCode(row.complexCode);
    setEmpNo(row.empNo);
    setFlatNo(row.flatNo);
    setEditTarget({ complexCode: row.complexCode, empNo: row.empNo, flatNo: row.flatNo });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEmpNo('');
    setFlatNo('');
    setEditTarget(null);
    setMsg('');
    setError('');
  };

  return (
    <div className="admin-page-container">
      {/* ── Card: Form ── */}
      <div className="admin-card">
        <div className="admin-card-header">
          <strong>COLONY MANAGEMENT</strong>
        </div>
        <div className="admin-card-body">
          {/* Row 1: Complex + Employee */}
          <div className="admin-form-grid">
            <div className="admin-form-row">
              <label className="admin-label">Select Complex Name :</label>
              <select
                id="complex"
                className="admin-select"
                value={complexCode}
                onChange={(e) => {
                  setComplexCode(e.target.value);
                  setEmpNo('');
                  setFlatNo('');
                  setEditTarget(null);
                }}
              >
                <option value="">PLEASE SELECT ZONE</option>
                {complexes.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="admin-form-row">
              <label className="admin-label">Employee Number</label>
              <input
                id="empnumber"
                type="text"
                className="admin-text-input"
                value={empNo}
                onChange={(e) => setEmpNo(e.target.value)}
                placeholder="Employee No."
              />
            </div>
          </div>

          {/* Row 2: Flat */}
          <div className="admin-form-row" style={{ marginTop: '0.75rem' }}>
            <label className="admin-label">Flat Number:</label>
            <input
              id="flat"
              type="text"
              className="admin-text-input"
              value={flatNo}
              onChange={(e) => setFlatNo(e.target.value)}
              placeholder="e.g. 1/001"
            />
          </div>

          {error && <p className="admin-error-msg">{error}</p>}
          {msg && <p className="admin-success-msg">{msg}</p>}

          <div className="admin-form-center" style={{ marginTop: '1rem', gap: '0.5rem' }}>
            <button
              id={editTarget ? 'Update' : 'Submit'}
              className="admin-submit-btn"
              onClick={() => submitForm()}
              disabled={isPending}
            >
              {isPending ? 'Saving…' : editTarget ? 'Update' : 'Submit'}
            </button>
            {editTarget && (
              <button className="admin-cancel-btn" onClick={cancelEdit}>
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Assignments Table ── */}
      {complexCode && (
        <div className="table-responsive" style={{ marginTop: '1.5rem' }}>
          <table className="admin-table" id="report_table">
            <thead>
              <tr>
                <th>Complex</th>
                <th>Employee Number</th>
                <th>flat no</th>
                <th>EDIT</th>
              </tr>
            </thead>
            <tbody>
              {assignments.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: '1.5rem' }}>
                    No assignments for this complex.
                  </td>
                </tr>
              ) : (
                assignments.map((row) => (
                  <tr key={`${row.complexCode}-${row.empNo}-${row.flatNo}`}>
                    <td>{row.complexCode}</td>
                    <td>{row.empNo}</td>
                    <td>{row.flatNo}</td>
                    <td>
                      <button
                        className="admin-edit-icon-btn"
                        title="Edit"
                        onClick={() => handleEdit(row)}
                      >
                        ✏️
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
