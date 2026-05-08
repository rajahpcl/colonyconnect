import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import '../common.css';
import './admin.css';

/** Tariff slabs exactly as in electric_rate.jsp */
const TARIFF_SLABS = ['0-100', '101-300', '301-500', '>500'];

type SlabValues = {
  fixedCharge: string;
  energyCharge: string;
  wheelingCharge: string;
  raCharge: string;
  facRate: string;
};

type RateRow = {
  id: number;
  enteredDate: string;
  tariffCategory: string;
  fixedCharge: number;
  energyCharge: number;
  wheelingCharge: number;
  raCharge: number;
  facRate: number;
};

const emptySlabs = (): SlabValues[] =>
  TARIFF_SLABS.map(() => ({
    fixedCharge: '',
    energyCharge: '',
    wheelingCharge: '',
    raCharge: '',
    facRate: '',
  }));

/** Format month for display: from ISO date → Mon-yyyy */
function fmtMonth(isoDate?: string) {
  if (!isoDate) return '-';
  const d = new Date(isoDate);
  return d.toLocaleString('en-US', { month: 'short', year: 'numeric' }).replace(' ', '-');
}

export function ElectricRatePage() {
  const [month, setMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [slabs, setSlabs] = useState<SlabValues[]>(emptySlabs);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const qc = useQueryClient();

  const { data: rates = [], isLoading } = useQuery<RateRow[]>({
    queryKey: ['electric-rates-all'],
    queryFn: () =>
      fetch('/api/v1/electricrates', { credentials: 'include' })
        .then((r) => r.json()),
  });

  const { mutate: save, isPending } = useMutation({
    mutationFn: async () => {
      // Validate all slabs
      for (let i = 0; i < TARIFF_SLABS.length; i++) {
        const s = slabs[i];
        if (!s.fixedCharge) throw new Error(`Enter Fixed Charges for ${TARIFF_SLABS[i]}`);
        if (!s.energyCharge) throw new Error(`Enter Energy Charges for ${TARIFF_SLABS[i]}`);
        if (!s.wheelingCharge) throw new Error(`Enter Wheeling Charges for ${TARIFF_SLABS[i]}`);
        if (!s.raCharge) throw new Error(`Enter RA Charges for ${TARIFF_SLABS[i]}`);
        if (!s.facRate) throw new Error(`Enter FAC Rate for ${TARIFF_SLABS[i]}`);
      }

      // month value is "YYYY-MM", server expects "01-Mon-YYYY"
      const [yr, mo] = month.split('-');
      const enteredDate = `${yr}-${mo}-01T00:00:00`;

      const payload = TARIFF_SLABS.map((cat, i) => ({
        enteredDate,
        tariffCategory: cat,
        fixedCharge: parseFloat(slabs[i].fixedCharge),
        energyCharge: parseFloat(slabs[i].energyCharge),
        wheelingCharge: parseFloat(slabs[i].wheelingCharge),
        raCharge: parseFloat(slabs[i].raCharge),
        facRate: parseFloat(slabs[i].facRate),
        updateBy: '',
      }));

      // Save each slab
      for (const slab of payload) {
        const res = await fetch('/api/v1/electricrates', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(slab),
        });
        if (!res.ok) throw new Error('Failed to save rate');
      }
    },
    onSuccess: () => {
      setMsg('Saved Successfully');
      setError('');
      setSlabs(emptySlabs());
      qc.invalidateQueries({ queryKey: ['electric-rates-all'] });
    },
    onError: (e: Error) => {
      setError(e.message);
      setMsg('');
    },
  });

  const updateSlab = (idx: number, field: keyof SlabValues, val: string) => {
    setSlabs((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: val };
      return copy;
    });
  };

  return (
    <div className="admin-page-container">
      {/* ── Card: Add Form ── */}
      <div className="admin-card">
        <div className="admin-card-header">
          <strong>Electric Rate</strong>
        </div>
        <div className="admin-card-body">
          <div className="admin-form-center">
            <label className="admin-label">Date :</label>
            <input
              type="month"
              className="admin-date-input"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
            />
          </div>

          <div className="table-responsive" style={{ marginTop: '1rem' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Tariff Category</th>
                  <th>Fixed Charges</th>
                  <th>Energy Charges</th>
                  <th>Wheeling Charges</th>
                  <th>RA Charges</th>
                  <th>FAC Rate</th>
                </tr>
              </thead>
              <tbody>
                {TARIFF_SLABS.map((cat, i) => (
                  <tr key={cat}>
                    <td style={{ fontWeight: '500', color: '#1a3a5c' }}>{cat}</td>
                    {(['fixedCharge', 'energyCharge', 'wheelingCharge', 'raCharge', 'facRate'] as (keyof SlabValues)[]).map((f) => (
                      <td key={f}>
                        <input
                          type="text"
                          className="admin-rate-input"
                          value={slabs[i][f]}
                          onChange={(e) => updateSlab(i, f, e.target.value.replace(/[^0-9.]/g, ''))}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {error && <p className="admin-error-msg">{error}</p>}
          {msg && <p className="admin-success-msg">{msg}</p>}

          <div className="admin-form-center" style={{ marginTop: '1rem' }}>
            <button className="admin-submit-btn" onClick={() => save()} disabled={isPending}>
              {isPending ? 'Saving…' : 'Add'}
            </button>
          </div>
        </div>
      </div>

      {/* ── Results Table ── */}
      <div style={{ marginTop: '1.5rem' }}>
        {isLoading ? (
          <p style={{ textAlign: 'center' }}>Loading…</p>
        ) : (
          <div className="table-responsive">
            <table className="admin-table" id="report_table">
              <thead>
                <tr>
                  <th>ENTERD DATE</th>
                  <th>TARRIF CATEGORY</th>
                  <th>FIXED CHARGE</th>
                  <th>ENERGY CHARGE</th>
                  <th>WHEELING CHARGE</th>
                  <th>RA CHARGE</th>
                  <th>FAC RATE</th>
                </tr>
              </thead>
              <tbody>
                {rates.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '1.5rem' }}>
                      No rates configured yet.
                    </td>
                  </tr>
                ) : (
                  rates
                    .slice()
                    .sort((a, b) => (a.id ?? 0) - (b.id ?? 0))
                    .map((r) => (
                      <tr key={r.id}>
                        <td>{fmtMonth(r.enteredDate)}</td>
                        <td>{r.tariffCategory}</td>
                        <td>{r.fixedCharge}</td>
                        <td>{r.energyCharge}</td>
                        <td>{r.wheelingCharge}</td>
                        <td>{r.raCharge}</td>
                        <td>{r.facRate}</td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
