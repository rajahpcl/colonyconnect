import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import '../common.css';
import './admin.css';

/** Electric Reading Page — mirrors electric_reading.jsp */

type Complex = { code: string; name: string };
type ReadingRow = {
  id: number;
  enteredDate: string;
  flatNo: string;
  empNo: string;
  empName?: string;
  initReading: number;
  finalReading: number;
  totalAmount: string;
  status?: string;
};

function currentMonthISO() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function fmtMonth(isoDate?: string) {
  if (!isoDate) return '-';
  const d = new Date(isoDate);
  return d.toLocaleString('en-US', { month: 'short', year: 'numeric' }).replace(' ', '-');
}

export function ElectricReadingFormPage() {
  // ── Form state ──
  const [month, setMonth] = useState(currentMonthISO());
  const [complexCode, setComplexCode] = useState('');
  const [building, setBuilding] = useState('');
  const [flatNo, setFlatNo] = useState('');
  const [empNo, setEmpNo] = useState('');
  const [empLabel, setEmpLabel] = useState('');
  const [initReading, setInitReading] = useState('');
  const [finalReading, setFinalReading] = useState('');
  // second reading pair (Add button)
  const [showSecond, setShowSecond] = useState(false);
  const [initReading2, setInitReading2] = useState('');
  const [finalReading2, setFinalReading2] = useState('');

  // ── Filter state for table ──
  const [filterMonth, setFilterMonth] = useState(currentMonthISO());
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  const [formMsg, setFormMsg] = useState('');
  const [formError, setFormError] = useState('');
  const qc = useQueryClient();

  // ── Buildings and flats (cascading) ──
  const [buildings, setBuildings] = useState<string[]>([]);
  const [flats, setFlats] = useState<string[]>([]);

  // Load complexes
  const { data: complexes = [] } = useQuery<Complex[]>({
    queryKey: ['admin-complexes'],
    queryFn: () =>
      fetch('/api/v1/ifms/colonies', { credentials: 'include' }).then((r) => r.json()),
  });

  // When complex changes → fetch buildings
  useEffect(() => {
    if (!complexCode) { setBuildings([]); setBuilding(''); setFlats([]); setFlatNo(''); return; }
    fetch(`/api/v1/admin/buildings?complexCode=${encodeURIComponent(complexCode)}`, { credentials: 'include' })
      .then((r) => r.json())
      .then((data: { building: string }[]) => {
        setBuildings(data.map((b) => b.building));
        setBuilding('');
        setFlats([]);
        setFlatNo('');
      })
      .catch(() => setBuildings([]));
  }, [complexCode]);

  // When building changes → fetch flats
  useEffect(() => {
    if (!complexCode || !building) { setFlats([]); setFlatNo(''); return; }
    fetch(`/api/v1/admin/flats?complexCode=${encodeURIComponent(complexCode)}&building=${encodeURIComponent(building)}`, { credentials: 'include' })
      .then((r) => r.json())
      .then((data: { flatNo: string }[]) => {
        setFlats(data.map((f) => f.flatNo));
        setFlatNo('');
      })
      .catch(() => setFlats([]));
  }, [complexCode, building]);

  // When flat changes → fetch employee + last reading
  useEffect(() => {
    setEmpNo('');
    setEmpLabel('');
    setInitReading('');
    if (!flatNo || !complexCode) return;

    // Fetch employee
    fetch(`/api/v1/admin/employee?flatNo=${encodeURIComponent(flatNo)}&complexCode=${encodeURIComponent(complexCode)}`, { credentials: 'include' })
      .then((r) => r.json())
      .then((d: { empNo?: string; empName?: string }) => {
        setEmpNo(d.empNo ?? '');
        setEmpLabel(`${d.empName ?? ''} (${d.empNo ?? ''})`);
      });

    // Fetch last reading for this flat
    fetch(`/api/v1/electricreadings/last?flatNo=${encodeURIComponent(flatNo)}&month=${encodeURIComponent(month)}`, { credentials: 'include' })
      .then((r) => r.ok ? r.json() : null)
      .then((d: { finalReading?: number } | null) => {
        if (d?.finalReading != null) setInitReading(String(d.finalReading));
      })
      .catch(() => {});
  }, [flatNo, complexCode]);

  // ── Readings table filtered by month ──
  const { data: readings = [], refetch: refetchReadings } = useQuery<ReadingRow[]>({
    queryKey: ['electric-readings', filterMonth],
    queryFn: () => {
      const [yr, mo] = filterMonth.split('-');
      const enteredDate = `${yr}-${mo}-01T00:00:00`;
      return fetch(
        `/api/v1/electricreadings?enteredDate=${encodeURIComponent(enteredDate)}`,
        { credentials: 'include' }
      ).then((r) => r.json());
    },
  });

  // ── Submit new reading ──
  const { mutate: submitReading, isPending: submitting } = useMutation({
    mutationFn: async () => {
      if (!flatNo) throw new Error('Enter Flat No');
      if (!empNo) throw new Error('Enter Employee');
      if (!initReading) throw new Error('Enter Initial Reading');
      if (!finalReading) throw new Error('Enter Final Reading');
      if (parseInt(finalReading) < parseInt(initReading))
        throw new Error('Final reading should be greater than Initial reading');

      const [yr, mo] = month.split('-');
      const enteredDate = `${yr}-${mo}-01T00:00:00`;

      // Calculate bill via backend
      const calcRes = await fetch(
        `/api/v1/electricreadings/calculate?initReading=${initReading}&finalReading=${finalReading}&month=${mo}-${yr}`,
        { credentials: 'include', method: 'POST' }
      );
      const calc = calcRes.ok ? await calcRes.json() : { totalAmount: 0 };

      const payload: any = {
        enteredDate,
        initReading: parseFloat(initReading),
        finalReading: parseFloat(finalReading),
        flatNo,
        empNo,
        totalAmount: String(calc.totalAmount ?? 0),
      };

      const res = await fetch('/api/v1/electricreadings', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to save reading');

      // Second reading pair if shown
      if (showSecond && initReading2 && finalReading2) {
        const payload2 = { ...payload, initReading: parseFloat(initReading2), finalReading: parseFloat(finalReading2) };
        await fetch('/api/v1/electricreadings', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload2),
        });
      }
    },
    onSuccess: () => {
      setFormMsg('Saved Successfully');
      setFormError('');
      setFlatNo('');
      setEmpNo('');
      setEmpLabel('');
      setInitReading('');
      setFinalReading('');
      setShowSecond(false);
      setInitReading2('');
      setFinalReading2('');
      qc.invalidateQueries({ queryKey: ['electric-readings'] });
    },
    onError: (e: Error) => {
      setFormError(e.message);
      setFormMsg('');
    },
  });

  // ── Approve selected ──
  const { mutate: approveSelected } = useMutation({
    mutationFn: async () => {
      if (selectedIds.size === 0) return;
      await fetch('/api/v1/electricreadings/approve', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Array.from(selectedIds)),
      });
    },
    onSuccess: () => {
      setSelectedIds(new Set());
      refetchReadings();
    },
  });

  // ── Delete ──
  const { mutate: deleteReading } = useMutation({
    mutationFn: (id: number) =>
      fetch(`/api/v1/electricreadings/${id}`, { method: 'DELETE', credentials: 'include' }),
    onSuccess: () => refetchReadings(),
  });

  const toggleSelect = (id: number, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      checked ? next.add(id) : next.delete(id);
      return next;
    });
  };

  const toggleAll = (checked: boolean) => {
    setSelectedIds(checked ? new Set(readings.filter((r) => r.status !== 'Approved').map((r) => r.id)) : new Set());
  };

  return (
    <div className="admin-page-container">
      {/* ── Electric Reading Form ── */}
      <div className="admin-card">
        <div className="admin-card-header">
          <strong>Electric Reading</strong>
        </div>
        <div className="admin-card-body">
          {/* Row 1: Date, Complex, Building */}
          <div className="er-grid-row">
            <div className="er-field">
              <span className="er-label">Date :</span>
              <input
                type="month"
                className="admin-date-input"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
              />
            </div>
            <div className="er-field">
              <span className="er-label">Complex :</span>
              <select
                id="cid"
                className="er-select"
                value={complexCode}
                onChange={(e) => setComplexCode(e.target.value)}
              >
                <option value="">select Complex</option>
                {complexes.map((c) => (
                  <option key={c.code} value={c.code}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="er-field">
              <span className="er-label">Building :</span>
              <select
                id="building"
                className="er-select"
                value={building}
                onChange={(e) => setBuilding(e.target.value)}
                disabled={!complexCode}
              >
                <option value="">select building</option>
                {buildings.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 2: Flat No, Emp No */}
          <div className="er-grid-row">
            <div className="er-field">
              <span className="er-label">Flat No :</span>
              <select
                id="flatno"
                className="er-select"
                value={flatNo}
                onChange={(e) => setFlatNo(e.target.value)}
                disabled={!building}
              >
                <option value="">select flat</option>
                {flats.map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>
            <div className="er-field" style={{ flex: 2 }}>
              <span className="er-label">Emp No :</span>
              <span id="lblemp" style={{ color: '#333' }}>{empLabel || '( )'}</span>
            </div>
          </div>

          {/* Row 3: Initial Reading, Final Reading, Add+ button */}
          <div className="er-grid-row">
            <div className="er-field">
              <span className="er-label">Initial Reading :</span>
              <input
                type="text"
                id="init"
                className="er-text-input"
                value={initReading}
                onChange={(e) => setInitReading(e.target.value.replace(/\D/g, ''))}
              />
            </div>
            <div className="er-field">
              <span className="er-label">Final Reading :</span>
              <input
                type="text"
                id="finalreding"
                className="er-text-input"
                value={finalReading}
                onChange={(e) => setFinalReading(e.target.value.replace(/\D/g, ''))}
              />
            </div>
            {!showSecond && (
              <div className="er-field" style={{ minWidth: 'auto' }}>
                <button
                  className="admin-add-row-btn"
                  title="Add second meter"
                  onClick={() => setShowSecond(true)}
                >
                  ➕ Add
                </button>
              </div>
            )}
          </div>

          {/* Second reading row */}
          {showSecond && (
            <div className="er-grid-row" id="scndreding">
              <div className="er-field">
                <span className="er-label">Initial Reading 1 :</span>
                <input
                  type="text"
                  className="er-text-input"
                  value={initReading2}
                  onChange={(e) => setInitReading2(e.target.value.replace(/\D/g, ''))}
                />
              </div>
              <div className="er-field">
                <span className="er-label">Final Reading 1 :</span>
                <input
                  type="text"
                  className="er-text-input"
                  value={finalReading2}
                  onChange={(e) => setFinalReading2(e.target.value.replace(/\D/g, ''))}
                />
              </div>
            </div>
          )}

          {formError && <p className="admin-error-msg">{formError}</p>}
          {formMsg && <p className="admin-success-msg">{formMsg}</p>}

          <div className="admin-form-center" style={{ marginTop: '1rem' }}>
            <button className="admin-submit-btn" onClick={() => submitReading()} disabled={submitting}>
              {submitting ? 'Saving…' : 'Add'}
            </button>
          </div>
        </div>
      </div>

      {/* ── Filter row ── */}
      <div className="er-filter-bar" style={{ marginTop: '1.5rem' }}>
        <input
          type="month"
          className="admin-date-input"
          value={filterMonth}
          onChange={(e) => setFilterMonth(e.target.value)}
        />
        <label style={{ marginLeft: '1rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          <input type="checkbox" onChange={(e) => toggleAll(e.target.checked)} />
          Select All
        </label>
        <button
          className="admin-approve-btn"
          style={{ marginLeft: '0.5rem' }}
          onClick={() => approveSelected()}
        >
          Approve
        </button>
        <button
          className="admin-download-btn"
          style={{ marginLeft: 'auto' }}
          onClick={() => {
            const table = document.getElementById('MyTable');
            if (table) {
              const html = `<table border='2px'>${table.innerHTML}</table>`;
              window.open('data:application/vnd.ms-excel,' + encodeURIComponent(html));
            }
          }}
        >
          Download Report
        </button>
      </div>

      {/* ── Readings Table ── */}
      <div className="table-responsive" style={{ marginTop: '0.5rem' }}>
        <table className="admin-table" id="MyTable">
          <thead>
            <tr>
              <th>#</th>
              <th>Month</th>
              <th>Flat No</th>
              <th>Employee</th>
              <th>Initial Reading</th>
              <th>Final Reading</th>
              <th>Reliance Amount to be Recovered</th>
            </tr>
          </thead>
          <tbody>
            {readings.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '1.5rem' }}>
                  No readings for selected month.
                </td>
              </tr>
            ) : (
              readings.map((r) => (
                <tr key={r.id}>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <button
                      className="admin-delete-btn"
                      onClick={() => {
                        if (confirm('Do you want to delete this entry?')) deleteReading(r.id);
                      }}
                    >
                      Delete
                    </button>
                    {r.status !== 'Approved' && (
                      <input
                        type="checkbox"
                        className="admin-checkbox"
                        checked={selectedIds.has(r.id)}
                        onChange={(e) => toggleSelect(r.id, e.target.checked)}
                      />
                    )}
                  </td>
                  <td>{fmtMonth(r.enteredDate)}</td>
                  <td>{r.flatNo}</td>
                  <td>
                    {r.empNo}
                    {r.empName ? ` - ${r.empName}` : ''}
                  </td>
                  <td>{r.initReading}</td>
                  <td>{r.finalReading}</td>
                  <td>{r.totalAmount}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
