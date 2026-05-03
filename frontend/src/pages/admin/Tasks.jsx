// ADMIN --> see the tasks for the day

import { useState, useEffect } from "react";
import Layout  from "../../components/layout/Layout";
import Card, { CardHead, CardBody} from "../../components/common/Card";
import { InlineLoader } from "../../components/common/Loader";
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import { getTodayTasks, manualAssignTask } from "../../api/admin.api";
import { getAllStaff } from "../../api/staff.api";
import { getInitials, getPriorityEmoji, getPriorityLabel } from "../../utils/formatters";
import '../../styles/tasks.css';
import '../../styles/components.css';


const FILTERS = ['all', 'pending', 'assigned', 'in-progress', 'paused', 'completed'];


export default function AdminTasks(){

    const [ tasks, setTasks ] = useState([]);
    const [ staff, setStaff ] = useState([]);
    const [ loading, setLoading ] = useState(true);
    const [ filter, setFilter ] = useState('all');
    const [ modal, setModal ] = useState(null);
    const [ selectedStaff, setSelectedStaff ] = useState('');
    const [ assigning, setAssigning ] = useState(false);


    // Fetch the data
    useEffect(() => {
        // Promise.all --> used to run multiple async operations in parallel --> wait until all of them finishes

        Promise.all([getTodayTasks(), getAllStaff()])
        .then(([taskRes, staffRes]) => {
            setTasks(taskRes.data.tasks);
            setStaff(staffRes.data);
        })
        .catch(console.error)
        .finally(() => setLoading(false));

    },[]);


    // Action handler
    async function handleAssign() {
        
        // if someone clicks 'Assign' without picking a staff --> stop function immediately
        // modal --> taskId
        if(!selectedStaff || !modal){
            return;
        }

        setAssigning(true); // turn the spinner on

        try{

            // assign taskId (modal) to staffId (selectedStaff)
            await manualAssignTask(modal, selectedStaff);
            // fetch fresh list of tasks from DB so that UI updates instantly
            const res = await getTodayTasks();
            setTasks(res.data.tasks);
            setModal(null);
            setSelectedStaff('');

        }

        catch(err){
            alert(err.response?.data?.message || 'Assignment failed');
        }

        finally{
            setAssigning(false);
        }
    }

    // Derived state (filtering) --> before rendering the screen --> React --> looks at currently active filter tab
    // if 'all' -> shows everything
    // if 'pending' -> filters everything except pending task

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
              <table className="table">
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
                      <td>
                        <div style={{ fontWeight: '600', fontSize: '13px' }}>Room {task.roomId?.roomNo}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                          Floor {task.roomId?.floor} · {task.roomId?.roomType}
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span>{getPriorityEmoji(task.priority)}</span>
                          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{getPriorityLabel(task.priority)}</span>
                        </div>
                      </td>
                      <td>
                        {task.assignedTo ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div className="avatar avatar-sm">{getInitials(task.assignedTo?.name)}</div>
                            <span style={{ fontSize: '13px' }}>{task.assignedTo?.name}</span>
                          </div>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>— Unassigned</span>
                        )}
                      </td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>{task.estimatedTime} min</td>
                      <td><Badge type={task.status}>{task.status}</Badge></td>
                      <td>
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
            </CardBody>
          </Card>
        </>
      )}

      {modal && (
        <Modal
          title="Manually Assign Task"
          onClose={() => { setModal(null); setSelectedStaff(''); }}
          footer={
            <>
              <Button variant="ghost" onClick={() => { setModal(null); setSelectedStaff(''); }}>Cancel</Button>
              <Button variant="primary" onClick={handleAssign} loading={assigning} disabled={!selectedStaff}>
                Assign Task
              </Button>
            </>
          }
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
                  {s.name} — {s.skillLevel} · Floor {s.assignedFloor}
                </option>
              ))}
            </select>
          </div>
        </Modal>
      )}
    </Layout>
  );
}