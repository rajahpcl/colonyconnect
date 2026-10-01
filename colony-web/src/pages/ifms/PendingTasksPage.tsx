import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { listColonies, listMyPendingTasks, type ComplaintRecord, type Colony } from '../../lib/api/ifms';
import '../common.css';
/**
 * My Pending Tasks — mirrors bvg_pending.jsp
 *
 * Layout:
 *  - Multi-select Colony listbox  (left, required)
 *  - Search button (right)
 *  - Table: Complaint Id, Colony, Flat No., Complaint Type, Sub Category Type, Status, Submit Date, Action
 *  - Only STATUS = 20 (Submitted) records are shown
 */
export function PendingTasksPage() {
  const [selectedColonies, setSelectedColonies] = useState<string[]>([]);
  const [searchColonies, setSearchColonies] = useState<string[]>([]);
  const [searchTriggered, setSearchTriggered] = useState(false);
  const [validationError, setValidationError] = useState('');

  // Load colony list for dropdown
  const { data: colonies = [], isLoading: coloniesLoading } = useQuery<Colony[]>({
    queryKey: ['ifms-colonies'],
    queryFn: listColonies,
  });

  // Load results only after Search is clicked
  const { data: tasks = [], isLoading: tasksLoading } = useQuery<ComplaintRecord[]>({
    queryKey: ['ifms-pending', searchColonies],
    queryFn: () => listMyPendingTasks(searchColonies),
    enabled: searchTriggered && searchColonies.length > 0,
  });

  const handleSearch = () => {
    if (selectedColonies.length === 0) {
      setValidationError('Please Select Colony.');
      return;
    }
    setValidationError('');
    setSearchColonies([...selectedColonies]);
    setSearchTriggered(true);
  };

  const handleColonyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = Array.from(e.target.selectedOptions).map((o) => o.value);
    setSelectedColonies(selected);
  };

  const showTable = searchTriggered && searchColonies.length > 0;

  return (
    <div className="ifms-page-container">
      {/* Header */}
      <div className="header">
        <div>
          <h1>Pending Tasks Queue</h1>
          <p style={{ color: '#64748b', margin: '0.25rem 0 0 0', fontSize: '0.9rem' }}>
            Actionable submitted maintenance requests awaiting technician inspection and vendor dispatch
          </p>
        </div>
      </div>

      {/* ── Filter Panel ── */}
      <div className="ifms-filter-panel">
        <div className="ifms-filter-row">
          {/* Colony multi-select */}
          <div className="ifms-filter-group ifms-colony-group" style={{ flex: 1 }}>
            <label className="ifms-filter-label" htmlFor="drp_colony">
              <strong>Select Colony Sector(s):</strong>
              <span style={{ fontSize: '0.78rem', color: '#64748b', marginLeft: '6px' }}>(Hold Ctrl / Cmd to pick multiple)</span>
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

          {/* Search button */}
          <div className="ifms-filter-action">
            <button className="ifms-search-btn" onClick={handleSearch} type="button">
              <i className="fa fa-search" aria-hidden="true" style={{ marginRight: '6px' }} />
              Fetch Pending Tasks
            </button>
          </div>
        </div>

        {validationError && (
          <p className="ifms-validation-error">
            <i className="fa fa-exclamation-triangle" aria-hidden="true" style={{ marginRight: '4px' }} />
            {validationError}
          </p>
        )}
      </div>

      {/* ── Results ── */}
      {showTable && (
        <div style={{ marginTop: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#0f172a' }}>
              Pending Tasks ({tasks.length} found)
            </h3>
          </div>

          {tasksLoading ? (
            <p style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>Loading pending tasks…</p>
          ) : tasks.length === 0 ? (
            <div className="table-responsive" style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
              <i className="fa fa-check-circle-o" aria-hidden="true" style={{ fontSize: '2rem', color: '#059669', marginBottom: '8px', display: 'block' }} />
              No pending tasks found for the selected colony(ies). All clear!
            </div>
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
                    <th>Status</th>
                    <th>Submit Date</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks
                    .slice()
                    .sort((a, b) => b.id - a.id)
                    .map((task) => (
                      <tr key={task.id}>
                        <td>
                          <strong style={{ color: '#004085' }}>#{task.id}</strong>
                        </td>
                        <td>{task.complexName ?? task.complexCode ?? '-'}</td>
                        <td>{task.flatNo ?? '-'}</td>
                        <td>{task.categoryName ?? '-'}</td>
                        <td>{task.subcategoryName ?? '-'}</td>
                        <td>
                          <span className="status-badge status-active" style={{ background: '#fef3c7', color: '#d97706' }}>
                            {task.statusName ?? task.status ?? 'Submitted'}
                          </span>
                        </td>
                        <td>
                          {task.submitDate
                            ? new Date(task.submitDate).toLocaleString('en-IN', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: false,
                              })
                            : '-'}
                        </td>
                        <td>
                          <Link
                            className="ifms-action-link"
                            to={`/app/complaints/${task.id}`}
                            style={{ fontWeight: 600, color: '#004085' }}
                          >
                            Open Details →
                          </Link>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
