import Layout from '../../components/layout/Layout';
import Card, { CardHead, CardBody } from '../../components/common/Card';
import { InlineLoader } from '../../components/common/Loader';
import Badge from '../../components/common/Badge';
import { useStaff } from '../../hooks/useStaff';
import { getInitials } from '../../utils/formatters';
import '../../styles/components.css';

export default function Staff() {
  const { staff, loading } = useStaff();

  return (
    <Layout title="Staff" subtitle="All staff members in your hotel">
      {loading ? <InlineLoader /> : (
        <Card>
          <CardHead title="Staff Directory" action={`${staff.length} members`} />
          <CardBody flush>
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Skill Level</th>
                  <th>Assigned Floor</th>
                  <th>Workload</th>
                </tr>
              </thead>
              <tbody>
                {staff.map((s, i) => (
                  <tr key={s._id} style={{ animation: `fadeInUp 0.35s ${i * 35}ms ease both` }}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div className="avatar avatar-md">{getInitials(s.name)}</div>
                        <span style={{ fontWeight: '600' }}>{s.name}</span>
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>{s.email}</td>
                    <td><Badge type={s.skillLevel}>{s.skillLevel}</Badge></td>
                    <td style={{ color: 'var(--text-secondary)' }}>Floor {s.assignedFloor || '—'}</td>
                    <td>
                      <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                        {s.assignedTime || 0} min assigned
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardBody>
        </Card>
      )}
    </Layout>
  );
}