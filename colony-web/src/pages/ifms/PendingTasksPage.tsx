import { useQuery, useMutation } from '@tanstack/react-query';
import { listMyPendingTasks, updateTaskStatus } from '../../lib/api/ifms';
import '../common.css';

export function PendingTasksPage() {
  const { data: tasks = [], isLoading, refetch } = useQuery({
    queryKey: ['pending-tasks'],
    queryFn: () => listMyPendingTasks(),
  });

  const { mutate: updateStatus } = useMutation({
    mutationFn: (data: { id: number; status: string }) =>
      updateTaskStatus(data.id, data.status),
    onSuccess: () => refetch(),
  });

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      high: '#e74c3c',
      medium: '#f39c12',
      low: '#27ae60',
    };
    return colors[priority?.toLowerCase()] || '#666';
  };

  return (
    <div className="container">
      <h1>My Pending Tasks</h1>
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Request ID</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Due Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task: any) => (
                <tr key={task.id}>
                  <td>#{task.requestId}</td>
                  <td>{task.status}</td>
                  <td>
                    <span
                      style={{
                        display: 'inline-block',
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        backgroundColor: getPriorityColor(task.priority),
                        marginRight: '0.5rem',
                      }}
                    />
                    {task.priority}
                  </td>
                  <td>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '-'}</td>
                  <td>
                    <select
                      value={task.status}
                      onChange={(e) => updateStatus({ id: task.id, status: e.target.value })}
                      className="form-control"
                      style={{ width: '120px' }}
                    >
                      <option value="pending">Pending</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
