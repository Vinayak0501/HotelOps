import { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import Card, { CardBody } from '../../components/common/Card';
import { InlineLoader } from '../../components/common/Loader';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import { useTasks } from '../../hooks/useTasks';
import { startTask, completeTask } from '../../api/task.api';
import { getAttendanceStatus } from '../../api/attendance.api';
import { getPriorityEmoji, getPriorityLabel } from '../../utils/formatters';
import '../../styles/tasks.css';
import '../../styles/components.css';

const FILTERS = ['all', 'assigned', 'in-progress', 'paused', 'completed'];

export default function MyTasks() {
  const { tasks, loading, refetch } = useTasks();
  const [filter, setFilter] = useState('all');
  const [ isCheckedIn, setIsCheckedIn ] = useState(false);


  // fetch attendance status on mount to lock/unlock task buttons

  useEffect(() => {

    getAttendanceStatus()
      .then(res => setIsCheckedIn(res.data.checkedIn))
      .catch(console.error);
  },[]);

  const filtered = filter === 'all' ? tasks : tasks.filter(t => t.status === filter);

  async function handleAction(id, action) {
    try {
      if (action === 'start') await startTask(id);
      else await completeTask(id);
      refetch();
    } catch (err) {
      alert(err.response?.data?.message || 'Action failed');
    }
  }

  return (
    <Layout title="My Tasks" subtitle="All tasks assigned to you today">
      <div className="tabs-row">
        {FILTERS.map(f => (
          <button
            key={f}
            className={`tab-btn ${filter === f ? 'active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
            <span style={{ marginLeft: '3px', color: 'var(--text-muted)', fontSize: '11px' }}>
              ({(f === 'all' ? tasks : tasks.filter(t => t.status === f)).length})
            </span>
          </button>
        ))}
      </div>

      {loading ? <InlineLoader /> : (
        filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">✓</div>
            <p className="empty-text">No tasks in this category</p>
          </div>
        ) : (
          <Card>
            <CardBody style={{ padding: '12px' }}>
              <div className="task-list">
                {filtered.map((task, i) => (
                  <div key={task._id} className={`task-card p${task.priority}`} style={{ animationDelay: `${i * 40}ms` }}>
                    <div className={`task-prio-icon p${task.priority}`}>
                      {getPriorityEmoji(task.priority)}
                    </div>
                    <div className="task-body">
                      <div className="task-title">
                        Room {task.roomId?.roomNo} — Floor {task.roomId?.floor} ({task.roomId?.roomType})
                      </div>
                      <div className="task-meta">
                        <span className="task-meta-item">⏱ {task.estimatedTime} min</span>
                        <span className="task-meta-item">{getPriorityLabel(task.priority)}</span>
                        {task.shift && <span className="task-meta-item">🕐 {task.shift} shift</span>}
                      </div>
                    </div>
                    <div className="task-actions">
                      <Badge type={task.status}>{task.status}</Badge>
                      {task.status === 'assigned' && (
                        <Button variant="secondary" size="sm" onClick={() => handleAction(task._id, 'start')}
                        disabled={!isCheckedIn}
                        >
                          Start
                        </Button>
                      )}
                      {task.status === 'in-progress' && (
                        <Button variant="success" size="sm" onClick={() => handleAction(task._id, 'complete')}
                        disabled={!isCheckedIn}
                        >
                          Done ✓
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        )
      )}
    </Layout>
  );
}