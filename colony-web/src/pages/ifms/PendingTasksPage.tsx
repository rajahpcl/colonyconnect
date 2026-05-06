import { useState } from 'react';
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
      {/* ── Filter Panel ── */}
      <div className="ifms-filter-panel">
        <div className="ifms-filter-row">
          {/* Colony multi-select */}
          <div className="ifms-filter-group ifms-colony-group">
            <label className="ifms-filter-label">
              <strong>Colony :</strong>
            </label>
            <select
              id="drp_colony"
              multiple
              className="ifms-multiselect"
              value={selectedColonies}
              onChange={handleColonyChange}
              size={6}
            >
              {coloniesLoading ? (
                <option disabled>Loading…</option>
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
            <button className="ifms-search-btn" onClick={handleSearch}>
              Search
            </button>
          </div>
        </div>

        {validationError && (
          <p className="ifms-validation-error">{validationError}</p>
        )}
      </div>

      {/* ── Results Table ── */}
      {showTable && (
        <div style={{ marginTop: '1.5rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '0.75rem' }}>
            <h4>
              <strong>Request List - My Pending Tasks (Submitted Status)</strong>
            </h4>
          </div>

          {tasksLoading ? (
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
                    <th>Status</th>
                    <th>Submit Date</th>
                    <th>Edit / View</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.length === 0 ? (
                    <tr>
                      <td colSpan={8} style={{ textAlign: 'center', padding: '2rem' }}>
                        No pending tasks found for selected colony(ies).
                      </td>
                    </tr>
                  ) : (
                    tasks
                      .slice()
                      .sort((a, b) => b.id - a.id)
                      .map((task) => (
                        <tr key={task.id}>
                          <td>{task.id}</td>
                          <td>{task.complexName ?? task.complexCode ?? '-'}</td>
                          <td>{task.flatNo ?? '-'}</td>
                          <td>{task.categoryName ?? '-'}</td>
                          <td>{task.subcategoryName ?? '-'}</td>
                          <td>{task.statusName ?? task.status ?? '-'}</td>
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
                            <a
                              className="ifms-action-link"
                              href={`/app/complaints/${task.id}`}
                            >
                              Action
                            </a>
                          </td>
                        </tr>
                      ))
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
