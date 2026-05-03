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
    { icon: '👥', label: 'Total Staff', value: data.totalStaff },
    { icon: '✅', label: 'Present', value: data.present },
    { icon: '❌', label: 'Absent', value: data.absent },
  ] : [];

  return (
    <Layout title="Attendance" subtitle="Today's staff attendance record">
      {loading ? <InlineLoader /> : (
        <>
          <StatsCards stats={stats} />
          <Card>
            <CardHead title="Attendance Log" action={`${data?.present}/${data?.totalStaff} present`} />
            <CardBody flush>
              <table className="table">
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
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div className="avatar avatar-md">{getInitials(a.staffId?.name)}</div>
                          <div>
                            <div style={{ fontWeight: '600' }}>{a.staffId?.name}</div>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{a.staffId?.email}</div>
                          </div>
                        </div>
                      </td>
                      <td><Badge type={a.staffId?.skillLevel}>{a.staffId?.skillLevel}</Badge></td>
                      <td style={{ color: 'var(--text-secondary)' }}>Floor {a.staffId?.assignedFloor}</td>
                      <td>
                        <span style={{ fontWeight: '500' }}>{formatTime(a.checkInTime)}</span>
                        {a.isLate && <Badge type="pending" style={{ marginLeft: '8px' }}>Late</Badge>}
                      </td>
                      <td style={{ color: 'var(--text-secondary)' }}>
                        {a.checkOutTime ? formatTime(a.checkOutTime) : (
                          <span style={{ color: 'var(--status-completed)', fontSize: '12px' }}>Still active</span>
                        )}
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <div className={`status-dot ${a.checkOutTime ? 'inactive' : 'active'}`} />
                          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                            {a.checkOutTime ? 'Done' : 'On Duty'}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardBody>
          </Card>
        </>
      )}
    </Layout>
  );
}