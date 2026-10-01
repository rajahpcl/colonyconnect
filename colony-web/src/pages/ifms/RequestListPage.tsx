import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  listColonies,
  listStatuses,
  listRequests,
  type ComplaintRecord,
  type Colony,
  type StatusOption,
  type RequestListParams,
} from '../../lib/api/ifms';
import '../common.css';
/**
 * Request List — mirrors bvgAckByMe.jsp
 *
 * Layout:
 *  - From Date (text, dd-Mon-yyyy)   |  Colony multi-select  |  Status multi-select  | Search
 *  - To Date   (text, dd-Mon-yyyy)   |
 *
 * Columns: Complaint Id, Colony, Flat No., Complaint Type, Sub Category Type,
 *          Complaint Details, Status (+ status date), Submit Date, Edit/View, Voucher, Amount*
 *
 * Validation: fromDate required, colony required, status required
 */
export function RequestListPage() {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [selectedColonies, setSelectedColonies] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<number[]>([]);
  const [searchParams, setSearchParams] = useState<RequestListParams | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  const { data: colonies = [], isLoading: coloniesLoading } = useQuery<Colony[]>({
    queryKey: ['ifms-colonies'],
    queryFn: listColonies,
  });

  const { data: statuses = [], isLoading: statusesLoading } = useQuery<StatusOption[]>({
    queryKey: ['ifms-statuses'],
    queryFn: listStatuses,
  });

  const { data: records = [], isLoading: recordsLoading } = useQuery<ComplaintRecord[]>({
    queryKey: ['ifms-requests', searchParams],
    queryFn: () => listRequests(searchParams!),
    enabled: searchParams !== null,
  });

  const handleSearch = () => {
    const newErrors: string[] = [];
    if (!fromDate) newErrors.push('Please select the From Date.');
    if (toDate && fromDate && new Date(toDate) < new Date(fromDate))
      newErrors.push('To Date must be greater than or equal to From Date.');
    if (selectedColonies.length === 0) newErrors.push('Please Select Colony.');
    if (selectedStatuses.length === 0) newErrors.push('Please Select Status.');

    if (newErrors.length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors([]);
    setSearchParams({
      complexCodes: selectedColonies,
      statuses: selectedStatuses,
      fromDate: fromDate || undefined,
      toDate: toDate || undefined,
    });
  };

  const handleColonyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedColonies(Array.from(e.target.selectedOptions).map((o) => o.value));
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedStatuses(Array.from(e.target.selectedOptions).map((o) => Number(o.value)));
  };

  const show60 = selectedStatuses.includes(60);
  const showTable = searchParams !== null;

  // Format Oracle-style date string  dd-Mon-yyyy
  const formatDate = (dt?: string) => {
    if (!dt) return '';
    const d = new Date(dt);
    return d.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  return (
    <div className="ifms-page-container">
      {/* Header */}
      <div className="header">
        <div>
          <h1>IFMS Request Directory</h1>
          <p style={{ color: '#64748b', margin: '0.25rem 0 0 0', fontSize: '0.9rem' }}>
            Comprehensive inquiry and audit list for all colony maintenance complaints across lifecycle stages
          </p>
        </div>
      </div>

      {/* ── Filter Panel ── */}
      <div className="ifms-filter-panel">
        <div className="ifms-filter-row">
          {/* Date column */}
          <div className="ifms-filter-group ifms-date-group" style={{ flex: 1, minWidth: '180px' }}>
            <label className="ifms-filter-label" htmlFor="from_date">From Date:</label>
            <input
              id="from_date"
              type="date"
              className="ifms-date-input"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
            <label className="ifms-filter-label" htmlFor="to_date" style={{ marginTop: '0.5rem' }}>
              To Date:
            </label>
            <input
              id="to_date"
              type="date"
              className="ifms-date-input"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              min={fromDate}
            />
          </div>

          {/* Colony multi-select */}
          <div className="ifms-filter-group ifms-colony-group" style={{ flex: 2, minWidth: '200px' }}>
            <label className="ifms-filter-label" htmlFor="drp_colony">
              <strong>Colony Sector(s):</strong>
            </label>
            <select
              id="drp_colony"
              multiple
              className="ifms-multiselect"
              value={selectedColonies}
              onChange={handleColonyChange}
              size={5}
            >
              {coloniesLoading ? (
                <option disabled>Loading colonies…</option>
              ) : (
                colonies.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Status multi-select */}
          <div className="ifms-filter-group ifms-status-group" style={{ flex: 1.5, minWidth: '180px' }}>
            <label className="ifms-filter-label" htmlFor="status">
              <strong>Complaint Status:</strong>
            </label>
            <select
              id="status"
              multiple
              className="ifms-multiselect"
              value={selectedStatuses.map(String)}
              onChange={handleStatusChange}
              size={5}
            >
              {statusesLoading ? (
                <option disabled>Loading statuses…</option>
              ) : (
                statuses.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Search button */}
          <div className="ifms-filter-action" style={{ alignSelf: 'flex-end' }}>
            <button className="ifms-search-btn" onClick={handleSearch} type="button">
              <i className="fa fa-filter" aria-hidden="true" style={{ marginRight: '6px' }} />
              Filter Requests
            </button>
          </div>
        </div>

        {errors.length > 0 && (
          <div className="ifms-validation-error">
            {errors.map((e, i) => (
              <p key={i} style={{ margin: '2px 0' }}>
                <i className="fa fa-exclamation-circle" aria-hidden="true" style={{ marginRight: '4px' }} />
                {e}
              </p>
            ))}
          </div>
        )}
      </div>

      {/* ── Results Table ── */}
      {showTable && (
        <div style={{ marginTop: '1.5rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '0.75rem' }}>
            <h4>
              <strong>Request List</strong>
            </h4>
          </div>

          {recordsLoading ? (
            <p style={{ textAlign: 'center' }}>Loading…</p>
          ) : (
            <div className="table-responsive">
              <table className="ifms-table" id="report_table">
                <thead>
                  <tr>
                    <th>Complaint Id</th>
                    <th>Colony</th>
                    <th>Flat No.</th>
                    <th>Complaint Type</th>
                    <th>Sub Category Type</th>
                    <th>Complaint Details</th>
                    <th>Status</th>
                    <th>Submit Date</th>
                    <th>Edit / View</th>
                    <th>Voucher</th>
                    {show60 && <th>Amount</th>}
                  </tr>
                </thead>
                <tbody>
                  {records.length === 0 ? (
                    <tr>
                      <td colSpan={show60 ? 11 : 10} style={{ textAlign: 'center', padding: '2rem' }}>
                        No records found for the selected filters.
                      </td>
                    </tr>
                  ) : (
                    records
                      .slice()
                      .sort((a, b) => b.id - a.id)
                      .map((rec) => {
                        const statusNum = rec.status ?? 0;
                        const isWorkable = statusNum >= 25 && statusNum < 60;
                        return (
                          <tr key={rec.id}>
                            <td>
                              <Link className="ifms-action-link" to={`/app/complaints/${rec.id}`}>
                                <strong>#{rec.id}</strong>
                              </Link>
                            </td>
                            <td>{rec.complexName ?? rec.complexCode ?? '-'}</td>
                            <td>{rec.flatNo ?? '-'}</td>
                            <td>{rec.categoryName ?? '-'}</td>
                            <td>{rec.subcategoryName ?? '-'}</td>
                            <td>{rec.compDetails ?? '-'}</td>
                            <td>
                              <span className="status-badge status-active" style={{ background: '#e0f2fe', color: '#0284c7' }}>
                                {rec.statusName ?? rec.status ?? '-'}
                              </span>
                              {rec.updateDate && (
                                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                                  on {formatDate(rec.updateDate)}
                                </div>
                              )}
                            </td>
                            <td>{formatDate(rec.submitDate)}</td>
                            <td>
                              <Link
                                className="ifms-action-link"
                                to={`/app/complaints/${rec.id}`}
                                style={{ fontWeight: 600, color: '#004085' }}
                              >
                                {isWorkable ? 'Work on Request →' : 'View →'}
                              </Link>
                            </td>
                            <td>
                              {statusNum >= 25 && (
                                <button
                                  className="ifms-voucher-btn"
                                  title="Generate Job Voucher"
                                  onClick={() => alert(`Voucher for complaint #${rec.id} — generate here`)}
                                  type="button"
                                >
                                  📋
                                </button>
                              )}
                            </td>
                            {show60 && (
                              <td style={{ textAlign: 'right' }}>
                                {rec.poTotalAmount != null ? (
                                  <strong style={{ color: 'green' }}>
                                    ₹ {rec.poTotalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                  </strong>
                                ) : (
                                  '-'
                                )}
                              </td>
                            )}
                          </tr>
                        );
                      })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
