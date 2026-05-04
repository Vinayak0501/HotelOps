import { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import Card, { CardBody } from '../../components/common/Card';
import { InlineLoader } from '../../components/common/Loader';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import { getTodayTasks, manualAssignTask } from '../../api/admin.api';
import { getAllStaff } from '../../api/staff.api';
import { getInitials, getPriorityEmoji, getPriorityLabel } from '../../utils/formatters';
import '../../styles/tasks.css';
import '../../styles/components.css';

const FILTERS = ['all', 'pending', 'assigned', 'in-progress', 'paused', 'completed'];

export default function AdminTasks() {
  const [tasks, setTasks] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [modal, setModal] = useState(null);
  const [selectedStaff, setSelectedStaff] = useState('');
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    Promise.all([getTodayTasks(), getAllStaff()])
      .then(([taskRes, staffRes]) => {
        setTasks(taskRes.data.tasks);
        setStaff(staffRes.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  async function handleAssign() {
    if (!selectedStaff || !modal) return;

    setAssigning(true);
    try {
      await manualAssignTask(modal, selectedStaff);
      const res = await getTodayTasks();
      setTasks(res.data.tasks);
      setModal(null);
      setSelectedStaff('');
    } catch (err) {
      alert(err.response?.data?.message || 'Assignment failed');
    } finally {
      setAssigning(false);
    }
  }

  const filtered = filter === 'all' ? tasks : tasks.filter(t => t.status === filter);

  return (
    <Layout title="Tasks Today" subtitle="All cleaning tasks across the hotel">
      {loading ? <InlineLoader /> : (
        <>
          <div className="tabs-row">
            {FILTERS.map(f => (
              <button
                key={f}
                className={`tab-btn ${filter === f ? 'active' : ''}`}
                onClick={() => setFilter(f)}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
                {f !== 'all' && (
                  <span style={{ marginLeft: '4px', color: 'var(--text-muted)' }}>
                    ({tasks.filter(t => t.status === f).length})
                  </span>
                )}
              </button>
            ))}
          </div>

          <Card>
            <CardBody flush>
              <div className="table-wrap">
                <table className="table table-stack">
                  <thead>
                    <tr>
                      <th>Room</th>
                      <th>Priority</th>
                      <th>Assigned To</th>
                      <th>Est. Time</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((task, i) => (
                      <tr key={task._id} style={{ animation: `fadeInUp 0.35s ${i * 30}ms ease both` }}>
                        <td data-label="Room">
                          <div className="copy-strong">Room {task.roomId?.roomNo}</div>
                          <div className="copy-subtle">Floor {task.roomId?.floor} | {task.roomId?.roomType}</div>
                        </td>
                        <td data-label="Priority">
                          <div className="priority-inline">
                            <span>{getPriorityEmoji(task.priority)}</span>
                            <span className="copy-muted">{getPriorityLabel(task.priority)}</span>
                          </div>
                        </td>
                        <td data-label="Assigned To">
                          {task.assignedTo ? (
                            <div className="inline-cluster">
                              <div className="avatar avatar-sm">{getInitials(task.assignedTo?.name)}</div>
                              <span>{task.assignedTo?.name}</span>
                            </div>
                          ) : (
                            <span className="copy-subtle">Unassigned</span>
                          )}
                        </td>
                        <td data-label="Est. Time" className="copy-muted">{task.estimatedTime} min</td>
                        <td data-label="Status"><Badge type={task.status}>{task.status}</Badge></td>
                        <td data-label="Action">
                          <Button variant="ghost" size="sm" onClick={() => setModal(task._id)}>
                            Reassign
                          </Button>
                        </td>
                      </tr>
                    ))}
                    {filtered.length === 0 && (
                      <tr>
                        <td colSpan={6} style={{ textAlign: 'center', padding: '48px', color: 'var(--text-secondary)' }}>
                          No tasks in this category
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardBody>
          </Card>
        </>
      )}

      {modal && (
        <Modal
          title="Manually Assign Task"
          onClose={() => { setModal(null); setSelectedStaff(''); }}
          footer={(
            <>
              <Button variant="ghost" onClick={() => { setModal(null); setSelectedStaff(''); }}>Cancel</Button>
              <Button variant="primary" onClick={handleAssign} loading={assigning} disabled={!selectedStaff}>
                Assign Task
              </Button>
            </>
          )}
        >
          <div className="form-group">
            <label className="form-label">Select Staff Member</label>
            <select
              className="form-select"
              value={selectedStaff}
              onChange={e => setSelectedStaff(e.target.value)}
            >
              <option value="">Choose a staff member...</option>
              {staff.map(s => (
                <option key={s._id} value={s._id}>
                  {`${s.name} - ${s.skillLevel} | Floor ${s.assignedFloor ?? '-'}`}
                </option>
              ))}
            </select>
          </div>
        </Modal>
      )}
    </Layout>
  );
}
