import Layout from '../../components/layout/Layout';
import Card, { CardHead, CardBody } from '../../components/common/Card';
import { InlineLoader } from '../../components/common/Loader';
import StatsCards from '../../components/dashboard/StatsCards';
import Badge from '../../components/common/Badge';
import { useAttendance } from '../../hooks/useAttendance';
import { getInitials, formatTime } from '../../utils/formatters';
import '../../styles/dashboard.css';
import '../../styles/components.css';

export default function Attendance() {
  const { data, loading } = useAttendance();

  const stats = data ? [
    { icon: '[]', label: 'Total Staff', value: data.totalStaff },
    { icon: 'OK', label: 'Present', value: data.present },
    { icon: 'X', label: 'Absent', value: data.absent },
  ] : [];

  return (
    <Layout title="Attendance" subtitle="Today's staff attendance record">
      {loading ? <InlineLoader /> : (
        <>
          <StatsCards stats={stats} />
          <Card>
            <CardHead title="Attendance Log" action={`${data?.present}/${data?.totalStaff} present`} />
            <CardBody flush>
              <div className="table-wrap">
                <table className="table table-stack">
                  <thead>
                    <tr>
                      <th>Staff Member</th>
                      <th>Skill Level</th>
                      <th>Floor</th>
                      <th>Check In</th>
                      <th>Check Out</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.attendance?.map((a, i) => (
                      <tr key={a._id} style={{ animation: `fadeInUp 0.35s ${i * 35}ms ease both` }}>
                        <td data-label="Staff Member">
                          <div className="inline-cluster">
                            <div className="avatar avatar-md">{getInitials(a.staffId?.name)}</div>
                            <div className="inline-cluster-copy">
                              <div className="copy-strong">{a.staffId?.name}</div>
                              <div className="copy-subtle">{a.staffId?.email}</div>
                            </div>
                          </div>
                        </td>
                        <td data-label="Skill Level"><Badge type={a.staffId?.skillLevel}>{a.staffId?.skillLevel}</Badge></td>
                        <td data-label="Floor" className="copy-muted">Floor {a.staffId?.assignedFloor}</td>
                        <td data-label="Check In">
                          <span className="copy-strong">{formatTime(a.checkInTime)}</span>
                          {a.isLate && <Badge type="pending" style={{ marginLeft: '8px' }}>Late</Badge>}
                        </td>
                        <td data-label="Check Out" className="copy-muted">
                          {a.checkOutTime ? formatTime(a.checkOutTime) : (
                            <span style={{ color: 'var(--status-completed)', fontSize: '12px' }}>Still active</span>
                          )}
                        </td>
                        <td data-label="Status">
                          <div className="status-inline">
                            <div className={`status-dot ${a.checkOutTime ? 'inactive' : 'active'}`} />
                            <span className="copy-muted">{a.checkOutTime ? 'Done' : 'On Duty'}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardBody>
          </Card>
        </>
      )}
    </Layout>
  );
}
