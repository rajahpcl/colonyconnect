import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { listAllTasks } from '../../lib/api/ifms';
import '../common.css';

export function RequestListPage() {
  const [filter, setFilter] = useState('');
  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['ifms-requests', filter],
    queryFn: () => listAllTasks({ status: filter || undefined }),
  });

  return (
    <div className="container">
      <div className="header">
        <h1>IFMS Request List</h1>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="form-control"
          style={{ maxWidth: '200px' }}
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Request ID</th>
                <th>Assigned To</th>
                <th>Status</th>
                <th>Due Date</th>
                <th>Priority</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task: any) => (
                <tr key={task.id}>
                  <td>
                    <strong>#{task.requestId}</strong>
                  </td>
                  <td>{task.assignedTo}</td>
                  <td>
                    <span className={`status-badge status-${task.status?.toLowerCase()}`}>
                      {task.status}
                    </span>
                  </td>
                  <td>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '-'}</td>
                  <td>{task.priority}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
