import { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  listAllotmentComplexes,
  listFlatsByComplex,
  getEmployeeByFlat,
  raiseProxyRequest,
  type Colony,
} from '../../lib/api/ifms';
import '../common.css';

/**
 * Raise Proxy Request — mirrors proxy_request.jsp
 *
 * The form has two ways to identify the employee:
 *  1. Cascading dropdown: Select Complex → Select Flat → Employee (auto-filled, read-only)
 *  2. OR: Enter Employee No manually
 *
 * Validation: exactly one path must yield a non-empty employee number.
 * On submit, calls POST /api/v1/ifms/proxy with { empNo }.
 */
export function ProxyRequestPage() {
  // ── Path 1: complex → flat → emp (auto) ──────────────────────────────────
  const [selectedComplex, setSelectedComplex] = useState('');
  const [selectedFlat, setSelectedFlat] = useState('');
  const [autoEmpNo, setAutoEmpNo] = useState('');
  const [flats, setFlats] = useState<string[]>([]);
  const [flatsLoading, setFlatsLoading] = useState(false);

  // ── Path 2: manual employee number ───────────────────────────────────────
  const [manualEmpNo, setManualEmpNo] = useState('');

  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Load complexes that have allotment data
  const { data: complexes = [], isLoading: complexesLoading } = useQuery<Colony[]>({
    queryKey: ['allotment-complexes'],
    queryFn: listAllotmentComplexes,
  });

  // When complex changes, reload flats
  useEffect(() => {
    if (!selectedComplex) {
      setFlats([]);
      setSelectedFlat('');
      setAutoEmpNo('');
      return;
    }
    setFlatsLoading(true);
    setSelectedFlat('');
    setAutoEmpNo('');
    listFlatsByComplex(selectedComplex)
      .then((f) => setFlats(f))
      .catch(() => setFlats([]))
      .finally(() => setFlatsLoading(false));
  }, [selectedComplex]);

  // When flat changes, auto-fill employee number
  useEffect(() => {
    if (!selectedComplex || !selectedFlat) {
      setAutoEmpNo('');
      return;
    }
    getEmployeeByFlat(selectedComplex, selectedFlat)
      .then((e) => setAutoEmpNo(e))
      .catch(() => setAutoEmpNo(''));
  }, [selectedComplex, selectedFlat]);

  const { mutate: submit, isPending } = useMutation({
    mutationFn: (empNo: string) => raiseProxyRequest({ empNo }),
    onSuccess: () => {
      setSuccessMsg('Proxy request raised successfully!');
      setErrorMsg('');
      setSelectedComplex('');
      setSelectedFlat('');
      setAutoEmpNo('');
      setManualEmpNo('');
      setFlats([]);
    },
    onError: (err: Error) => {
      setErrorMsg(err.message ?? 'Failed to raise proxy request.');
      setSuccessMsg('');
    },
  });

  const handleSubmit = () => {
    setSuccessMsg('');
    setErrorMsg('');

    // Determine which emp no to use
    const targetEmpNo = manualEmpNo.trim() || autoEmpNo.trim();

    if (!targetEmpNo) {
      if (!autoEmpNo.trim()) {
        setErrorMsg(
          'Please Select Proper Complex Code and Flat No for employee no to be automatically generated, OR enter Employee No manually.'
        );
      } else {
        setErrorMsg('Please Enter Employee No or select a Complex and Flat.');
      }
      return;
    }

    submit(targetEmpNo);
  };

  return (
    <div className="ifms-page-container">
      {/* Card wrapper matching legacy layout */}
      <div className="ifms-proxy-card">
        <div className="ifms-proxy-card-header">
          <h3>Raise Proxy Request</h3>
        </div>
        <div className="ifms-proxy-card-body">
          {/* ── Row 1: Complex → Flat → Employee (auto) ── */}
          <div className="ifms-proxy-row">
            <label className="ifms-proxy-label">Select Complex :</label>
            <select
              id="complex"
              className="ifms-proxy-select"
              value={selectedComplex}
              onChange={(e) => {
                setSelectedComplex(e.target.value);
                setManualEmpNo(''); // clear manual if they pick dropdown path
              }}
            >
              <option value="">Select Complex</option>
              {complexesLoading ? (
                <option disabled>Loading…</option>
              ) : (
                complexes.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name}
                  </option>
                ))
              )}
            </select>

            <label className="ifms-proxy-label" style={{ marginLeft: '1rem' }}>
              Select Flat:
            </label>
            <select
              id="flat"
              className="ifms-proxy-select ifms-proxy-flat"
              value={selectedFlat}
              onChange={(e) => setSelectedFlat(e.target.value)}
              disabled={!selectedComplex || flatsLoading}
            >
              <option value="">Select Flat</option>
              {flatsLoading ? (
                <option disabled>Loading…</option>
              ) : (
                flats.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))
              )}
            </select>

            <label className="ifms-proxy-label" style={{ marginLeft: '1rem' }}>
              Employee :
            </label>
            <input
              id="top_emp_no1"
              type="text"
              className="ifms-proxy-emp-readonly"
              value={autoEmpNo}
              readOnly
              placeholder="(auto-filled)"
            />
          </div>

          {/* ── OR divider ── */}
          <div className="ifms-proxy-or">
            <strong>OR</strong>
          </div>

          {/* ── Row 2: Manual emp no ── */}
          <div className="ifms-proxy-row">
            <label className="ifms-proxy-label">Enter Employee No :</label>
            <input
              id="top_emp_no"
              type="text"
              className="ifms-proxy-emp-manual"
              value={manualEmpNo}
              onChange={(e) => {
                setManualEmpNo(e.target.value);
                // If they type manually, clear the dropdown path
                if (e.target.value.trim()) {
                  setSelectedComplex('');
                  setSelectedFlat('');
                  setAutoEmpNo('');
                }
              }}
              placeholder="e.g. 12345678"
            />
          </div>

          {/* ── Messages ── */}
          {errorMsg && <p className="ifms-validation-error">{errorMsg}</p>}
          {successMsg && <p className="ifms-success-msg">{successMsg}</p>}

          {/* ── Submit ── */}
          <div className="ifms-proxy-row" style={{ justifyContent: 'center', marginTop: '1.5rem' }}>
            <button
              className="ifms-raise-btn"
              onClick={handleSubmit}
              disabled={isPending}
            >
              {isPending ? 'Raising…' : 'Raise Request'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
