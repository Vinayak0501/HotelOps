import { useEffect, useState, useMemo } from 'react';
import Layout from '../../components/layout/Layout';
import StatsCards from '../../components/dashboard/StatsCards';
import TaskChart from '../../components/dashboard/TaskChart';
import StaffLoadChart from '../../components/dashboard/StaffLoadChart';
import NotificationsFeed from '../../components/dashboard/NotificationsFeed';
import Card, { CardHead, CardBody } from '../../components/common/Card';
import { InlineLoader } from '../../components/common/Loader';
import { getInitials, formatTime } from '../../utils/formatters';
import { useAttendance } from '../../hooks/useAttendance';
import { useNotifications } from '../../hooks/useNotifications';
import { usePerformance } from '../../hooks/useStaff';
import { getTodayTasks } from '../../api/admin.api';
import '../../styles/dashboard.css';
import '../../styles/components.css';

export default function AdminDashboard() {
  const { data: attendance, loading: attLoading } = useAttendance();
  const { notifications, markAsRead } = useNotifications();
  const { data: perfData, loading: perfLoading } = usePerformance();
  const [taskSummary, setTaskSummary] = useState(null);

  useEffect(() => {
    getTodayTasks().then((res) => setTaskSummary(res.data.summary)).catch(console.error);
  }, []);

  // --- ADDED: SNAPSHOT INTERCEPTOR ---
  // This safely merges live performance data with our frozen checkout snapshots
// --- ADDED: SNAPSHOT INTERCEPTOR (WITH DEBUGGER) ---
// --- SNAPSHOT INTERCEPTOR ---
  const historicalPerfData = useMemo(() => {
    if (!perfData || !attendance?.attendance) return perfData;

    return perfData.map((staffNode) => {
      // 1. Find the exact ID inside the nested staff object
      const matchId = staffNode.staff?.id || staffNode.staff?._id || staffNode._id;
      
      // 2. Find the matching attendance record using bulletproof string comparison
      const attRecord = attendance.attendance.find((a) => {
        const recordStaffId = a.staffId?._id || a.staffId;
        return recordStaffId?.toString() === matchId?.toString();
      });

      // 3. If they went home, freeze the chart!
      if (attRecord && attRecord.checkOutTime && attRecord.shiftStats) {
        const frozenTotal = attRecord.shiftStats.totalAssigned;
        const frozenCompleted = attRecord.shiftStats.completedTasks;
        const frozenRate = frozenTotal > 0 ? Math.round((frozenCompleted / frozenTotal) * 100) : 0;

        return {
          ...staffNode,
          assigned: frozenTotal, 
          completed: frozenCompleted,
          rate: frozenRate, 
          isSnapshot: true 
        };
      }

      // 4. Otherwise, show their live tasks
      return staffNode;
    });
  }, [perfData, attendance]);
  // -----------------------------------

  const stats = attendance && taskSummary ? [
    { icon: '[]', label: 'Present Today', value: attendance.present, sub: `of ${attendance.totalStaff} staff`, color: 'gold' },
    { icon: 'X', label: 'Absent', value: attendance.absent, color: 'red' },
    { icon: '#', label: 'Total Tasks', value: taskSummary.total, color: 'blue' },
    { icon: 'OK', label: 'Completed', value: taskSummary.completed, color: 'green' },
    { icon: '!', label: 'In Progress', value: taskSummary.inProgress, color: 'purple' },
    { icon: '...', label: 'Pending', value: taskSummary.pending, color: 'pink' },
  ] : [];

  return (
    <Layout title="Operations Overview" subtitle="Real-time hotel operations dashboard" notifCount={notifications.length}>
      {attLoading ? <InlineLoader /> : (
        <>
          <StatsCards stats={stats} />

          <div className="grid-2">
            <Card>
              <CardHead title="Task Status Breakdown" action={taskSummary ? `${taskSummary.total} total` : ''} />
              <CardBody>
                <TaskChart summary={taskSummary} />
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
                  emptyText="All clear - no alerts"
                />
              </CardBody>
            </Card>
          </div>

          <Card>
            <CardHead title="Staff Load Today" />
            <CardBody>
              {/* WE PASS THE NEW historicalPerfData HERE INSTEAD OF THE RAW perfData */}
              {perfLoading ? <InlineLoader /> : <StaffLoadChart data={historicalPerfData} />}
            </CardBody>
          </Card>

          <div style={{ marginTop: '16px' }}>
            <Card>
              <CardHead title="Today's Attendance" action={attendance ? `${attendance.present}/${attendance.totalStaff} present` : ''} />
              <CardBody flush>
                <div className="table-wrap">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Staff Member</th>
                        <th>Skill</th>
                        <th>Check In</th>
                        <th>Check Out</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attendance?.attendance?.map((item, index) => (
                        <tr key={item._id} style={{ animation: `fadeInUp 0.35s ${index * 35}ms ease both` }}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <div className="avatar avatar-sm">{getInitials(item.staffId?.name)}</div>
                              <span style={{ fontWeight: '500' }}>{item.staffId?.name}</span>
                            </div>
                          </td>
                          <td><span className={`badge badge-${item.staffId?.skillLevel}`}>{item.staffId?.skillLevel}</span></td>
                          <td>
                            {formatTime(item.checkInTime)}
                            {item.isLate && <span className="badge badge-pending" style={{ marginLeft: '6px' }}>Late</span>}
                          </td>
                          <td style={{ color: 'var(--text-secondary)' }}>{formatTime(item.checkOutTime)}</td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <div className={`status-dot ${item.checkOutTime ? 'inactive' : 'active'}`} />
                              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                                {item.checkOutTime ? 'Done' : 'On Duty'}
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardBody>
            </Card>
          </div>
        </>
      )}
    </Layout>
  );
}