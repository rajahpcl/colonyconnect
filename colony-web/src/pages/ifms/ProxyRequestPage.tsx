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
      {/* Header */}
      <div className="header">
        <div>
          <h1>Raise Proxy Request</h1>
          <p style={{ color: '#64748b', margin: '0.25rem 0 0 0', fontSize: '0.9rem' }}>
            Submit an urgent maintenance request on behalf of an employee or unoccupied flat
          </p>
        </div>
      </div>

      {/* Card wrapper */}
      <div className="ifms-proxy-card" style={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <div
          className="ifms-proxy-card-header"
          style={{
            background: 'linear-gradient(135deg, #00173d 0%, #003366 100%)',
            color: '#ffffff',
            padding: '1rem 1.25rem',
            borderBottom: 'none',
          }}
        >
          <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#ffffff' }}>Proxy Request Dispatcher</h3>
        </div>
        <div className="ifms-proxy-card-body" style={{ padding: '1.5rem' }}>
          {/* Option A: Select Complex & Flat */}
          <div style={{ marginBottom: '1.25rem' }}>
            <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.95rem', color: '#0f172a' }}>
              Option A: Lookup by Colony & Flat Number
            </h4>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem',
                alignItems: 'end',
              }}
            >
              <div>
                <label className="ifms-proxy-label" htmlFor="complex" style={{ display: 'block', marginBottom: '4px', fontWeight: 600 }}>
                  Select Complex :
                </label>
                <select
                  id="complex"
                  className="ifms-proxy-select"
                  value={selectedComplex}
                  onChange={(e) => {
                    setSelectedComplex(e.target.value);
                    setManualEmpNo('');
                  }}
                  style={{ width: '100%', minHeight: '44px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
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
              </div>

              <div>
                <label className="ifms-proxy-label" htmlFor="flat" style={{ display: 'block', marginBottom: '4px', fontWeight: 600 }}>
                  Select Flat:
                </label>
                <select
                  id="flat"
                  className="ifms-proxy-select"
                  value={selectedFlat}
                  onChange={(e) => setSelectedFlat(e.target.value)}
                  disabled={!selectedComplex || flatsLoading}
                  style={{ width: '100%', minHeight: '44px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
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
              </div>

              <div>
                <label className="ifms-proxy-label" htmlFor="top_emp_no1" style={{ display: 'block', marginBottom: '4px', fontWeight: 600 }}>
                  Allotted Employee No:
                </label>
                <input
                  id="top_emp_no1"
                  type="text"
                  className="ifms-proxy-emp-readonly"
                  value={autoEmpNo}
                  readOnly
                  placeholder="(auto-filled from flat record)"
                  style={{ width: '100%', minHeight: '44px', borderRadius: '8px', background: '#f1f5f9', border: '1px solid #cbd5e1' }}
                />
              </div>
            </div>
          </div>

          {/* ── OR divider ── */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              margin: '1.5rem 0',
              color: '#94a3b8',
              fontSize: '0.85rem',
              fontWeight: 600,
            }}
          >
            <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
            <span style={{ padding: '0 1rem', background: '#ffffff' }}>OR</span>
            <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
          </div>

          {/* Option B: Manual emp no */}
          <div style={{ marginBottom: '1.5rem', maxWidth: '340px' }}>
            <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.95rem', color: '#0f172a' }}>
              Option B: Enter Employee Number Directly
            </h4>
            <label className="ifms-proxy-label" htmlFor="top_emp_no" style={{ display: 'block', marginBottom: '4px', fontWeight: 600 }}>
              Employee Number :
            </label>
            <input
              id="top_emp_no"
              type="text"
              className="ifms-proxy-emp-manual"
              value={manualEmpNo}
              onChange={(e) => {
                setManualEmpNo(e.target.value);
                if (e.target.value.trim()) {
                  setSelectedComplex('');
                  setSelectedFlat('');
                  setAutoEmpNo('');
                }
              }}
              placeholder="e.g. 31982600"
              style={{ width: '100%', minHeight: '44px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
            />
          </div>

          {/* Messages */}
          {errorMsg && (
            <p className="ifms-validation-error" style={{ padding: '0.75rem', background: '#fee2e2', borderRadius: '8px', border: '1px solid #fca5a5' }}>
              <i className="fa fa-exclamation-circle" aria-hidden="true" style={{ marginRight: '6px' }} />
              {errorMsg}
            </p>
          )}
          {successMsg && (
            <p className="ifms-success-msg" style={{ padding: '0.75rem', background: '#dcfce7', borderRadius: '8px', border: '1px solid #86efac' }}>
              <i className="fa fa-check-circle" aria-hidden="true" style={{ marginRight: '6px' }} />
              {successMsg}
            </p>
          )}

          {/* Submit */}
          <div style={{ marginTop: '1.5rem' }}>
            <button
              className="ifms-raise-btn"
              onClick={handleSubmit}
              disabled={isPending}
              type="button"
              style={{ minHeight: '46px', minWidth: '200px' }}
            >
              <i className="fa fa-paper-plane" aria-hidden="true" style={{ marginRight: '6px' }} />
              {isPending ? 'Submitting Proxy…' : 'Proceed with Proxy Request'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
