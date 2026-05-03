import { useCallback, useEffect, useState } from 'react';
import Layout from '../../components/layout/Layout';
import Card, { CardHead, CardBody } from '../../components/common/Card';
import StatsCards from '../../components/dashboard/StatsCards';
import NotificationsFeed from '../../components/dashboard/NotificationsFeed';
import { InlineLoader } from '../../components/common/Loader';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import { useTasks } from '../../hooks/useTasks';
import { useNotifications } from '../../hooks/useNotifications';
import { checkIn, checkOut, getAttendanceStatus } from '../../api/attendance.api';
import { startTask, completeTask } from '../../api/task.api';
import { useAuth } from '../../context/AuthContext';
import { getPriorityEmoji, getPriorityLabel, getCompletionRate } from '../../utils/formatters';
import '../../styles/dashboard.css';
import '../../styles/tasks.css';
import '../../styles/components.css';

const DEFAULT_ATTENDANCE_STATUS = {
  checkedIn: false,
  alreadyCompletedShift: false,
  canCheckIn: false,
  currentShift: null,
  attendance: null,
};

export default function StaffDashboard() {
  const { user } = useAuth();
  const { tasks, loading, refetch } = useTasks();
  const { notifications, markAsRead } = useNotifications();
  const [attendanceStatus, setAttendanceStatus] = useState(DEFAULT_ATTENDANCE_STATUS);
  const [statusLoading, setStatusLoading] = useState(true);
  const [attLoading, setAttLoading] = useState(false);
  const [isShiftExpired, setIsShiftExpired] = useState(false);

  // --- METRICS & SNAPSHOT LOGIC ---
  // 1. Calculate live task arrays
  const liveCompleted = tasks.filter((task) => task.status === 'completed').length;
  const inProgress = tasks.filter((task) => task.status === 'in-progress').length;
  const assigned = tasks.filter((task) => task.status === 'assigned').length;
  const paused = tasks.filter((task) => task.status === 'paused').length;

  // 2. Check for historical snapshot data
  const isShiftComplete = attendanceStatus.alreadyCompletedShift;
  const snapshotData = attendanceStatus.attendance?.shiftStats;

  // 3. Determine whether to show live data or frozen snapshot data
  const displayCompleted = (isShiftComplete && snapshotData) 
    ? snapshotData.completedTasks 
    : liveCompleted;

  const displayTotal = (isShiftComplete && snapshotData) 
    ? snapshotData.totalAssigned 
    : tasks.length;

  const rate = getCompletionRate(displayCompleted, displayTotal);

  const stats = [
    { icon: '#', label: 'Total Tasks', value: displayTotal },
    { icon: 'OK', label: 'Completed', value: displayCompleted },
    { icon: '!', label: 'In Progress', value: inProgress },
    { icon: '...', label: 'Pending', value: assigned },
  ];

  const loadAttendanceStatus = useCallback(async function () {
    setStatusLoading(true);
    try {
      const res = await getAttendanceStatus();
      setAttendanceStatus(res.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to load attendance status');
    } finally {
      setStatusLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAttendanceStatus();
  }, [loadAttendanceStatus]);

  // --- SHIFT EXPIRY LOGIC ---
  useEffect(() => {
    if (attendanceStatus.currentShift?.end && !attendanceStatus.checkedIn) {
      const now = new Date();
      const [endHour, endMin] = attendanceStatus.currentShift.end.split(':').map(Number);
      
      const shiftEndTime = new Date();
      shiftEndTime.setHours(endHour, endMin, 0, 0);

      if (now > shiftEndTime) {
        setIsShiftExpired(true);
      } else {
        setIsShiftExpired(false);
      }
    }
  }, [attendanceStatus]);

  async function handleCheckIn() {
    setAttLoading(true);
    try {
      await checkIn();
      await Promise.all([loadAttendanceStatus(), refetch()]);
    } catch (err) {
      alert(err.response?.data?.message || 'Check-in failed');
    } finally {
      setAttLoading(false);
    }
  }

  async function handleCheckOut() {
    setAttLoading(true);
    try {
      await checkOut();
      await Promise.all([loadAttendanceStatus(), refetch()]);
    } catch (err) {
      alert(err.response?.data?.message || 'Check-out failed');
    } finally {
      setAttLoading(false);
    }
  }

  async function handleTaskAction(id, action) {
    try {
      if (action === 'start') await startTask(id);
      else await completeTask(id);
      refetch();
    } catch (err) {
      alert(err.response?.data?.message || 'Action failed');
    }
  }

  function getAttendanceCopy() {
    if (attendanceStatus.checkedIn) {
      return attendanceStatus.attendance?.isLate ? 'Checked in (late)' : 'Checked in';
    }

    if (attendanceStatus.alreadyCompletedShift) {
      return 'Shift attendance already completed';
    }

    if (isShiftExpired) {
      return `Your scheduled shift has ended.`;
    }

    if (attendanceStatus.currentShift) {
      return `Ready for ${attendanceStatus.currentShift.name}`;
    }

    return 'Check-in available only during an active shift';
  }

  const firstName = user?.name?.split(' ')[0] || 'there';

  return (
    <Layout title={`Good day, ${firstName}`} subtitle="Your overview for today" notifCount={notifications.length}>
      {loading || statusLoading ? <InlineLoader /> : (
        <>
          <StatsCards stats={stats} />

          <div className="grid-2" style={{ marginBottom: '16px' }}>
            <Card>
              <CardHead title="Attendance" />
              <CardBody>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  <div className={`status-dot ${attendanceStatus.checkedIn ? 'active' : 'inactive'}`} />
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                    {getAttendanceCopy()}
                  </span>
                </div>

                {/* DYNAMIC BUTTON RENDERING */}
                {attendanceStatus.checkedIn ? (
                  <button
                    className="checkin-btn check-out"
                    onClick={handleCheckOut}
                    disabled={attLoading}
                  >
                    {attLoading ? 'Loading...' : 'Mark Check-Out'}
                  </button>
                ) : isShiftExpired ? (
                  <button
                    className="checkin-btn"
                    disabled
                    style={{ backgroundColor: 'var(--danger)', opacity: 0.6, cursor: 'not-allowed' }}
                  >
                    Shift Missed
                  </button>
                ) : (
                  <button
                    className="checkin-btn check-in"
                    onClick={handleCheckIn}
                    disabled={attLoading || !attendanceStatus.canCheckIn}
                  >
                    {attLoading ? 'Loading...' : 'Mark Check-In'}
                  </button>
                )}

                {attendanceStatus.currentShift && (
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '10px' }}>
                    Scheduled shift: {attendanceStatus.currentShift.name} ({attendanceStatus.currentShift.start} - {attendanceStatus.currentShift.end})
                  </div>
                )}
              </CardBody>
            </Card>

            <Card>
              <CardHead
                title="Alerts"
                action={notifications.length > 0 ? <span style={{ color: 'var(--danger)', fontSize: '12px' }}>{notifications.length} unread</span> : null}
              />
              <CardBody>
                <NotificationsFeed
                  notifications={notifications}
                  onMarkAsRead={markAsRead}
                  emptyText="No new alerts for you"
                />
              </CardBody>
            </Card>
          </div>

          <div className="grid-2" style={{ marginBottom: '16px' }}>
            <Card>
              <CardHead title="Completion Rate" action={<span style={{ color: 'var(--gold)', fontFamily: 'var(--font-display)', fontSize: '18px' }}>{rate}%</span>} />
              <CardBody>
                <div className="progress-bar" style={{ marginBottom: '12px', height: '8px' }}>
                  <div className="progress-fill" style={{ width: `${rate}%` }} />
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  {displayCompleted} of {displayTotal} tasks completed {isShiftComplete ? 'this shift' : 'today'}
                </div>
                {paused > 0 && (
                  <div style={{ fontSize: '12px', color: 'var(--status-paused)', marginTop: '6px' }}>
                    {paused} task{paused > 1 ? 's' : ''} paused
                  </div>
                )}
              </CardBody>
            </Card>

            <Card>
              <CardHead title="Shift Summary" action={attendanceStatus.currentShift?.name || 'Off shift'} />
              <CardBody>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.7' }}>
                  {attendanceStatus.checkedIn && 'You are currently checked in and can check out once for this shift.'}
                  {!attendanceStatus.checkedIn && attendanceStatus.alreadyCompletedShift && 'You have already completed attendance for this shift.'}
                  {!attendanceStatus.checkedIn && !attendanceStatus.alreadyCompletedShift && attendanceStatus.currentShift && 'You can check in once for the current shift, and check out once before it ends.'}
                  {!attendanceStatus.currentShift && 'No active shift is running right now.'}
                </div>
              </CardBody>
            </Card>
          </div>

          <Card>
            <CardHead title="Today's Tasks" action={`${tasks.length} total`} />
            <CardBody style={{ padding: '12px' }}>
              {tasks.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">#</div>
                  <p className="empty-text">No tasks assigned yet. Check in to get tasks.</p>
                </div>
              ) : (
                <div className="task-list">
                  {tasks.map((task, index) => (
                    <div key={task._id} className={`task-card p${task.priority}`} style={{ animationDelay: `${index * 45}ms` }}>
                      <div className={`task-prio-icon p${task.priority}`}>
                        {getPriorityEmoji(task.priority)}
                      </div>
                      <div className="task-body">
                        <div className="task-title">Room {task.roomId?.roomNo} - Floor {task.roomId?.floor}</div>
                        <div className="task-meta">
                          <span className="task-meta-item">Time {task.estimatedTime} min</span>
                          <span className="task-meta-item">Type {task.roomId?.roomType}</span>
                          <span className="task-meta-item">{getPriorityLabel(task.priority)}</span>
                        </div>
                      </div>
                      <div className="task-actions">
                        <Badge type={task.status}>{task.status}</Badge>
                        {task.status === 'assigned' && (
                          <Button variant="secondary" size="sm" onClick={() => handleTaskAction(task._id, 'start')}
                          disabled={!attendanceStatus.checkedIn}
                          >Start</Button>
                        )}
                        {task.status === 'in-progress' && (
                          <Button variant="success" size="sm" onClick={() => handleTaskAction(task._id, 'complete')}
                          disabled={!attendanceStatus.checkedIn}
                          >Done</Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        </>
      )}
    </Layout>
  );
}