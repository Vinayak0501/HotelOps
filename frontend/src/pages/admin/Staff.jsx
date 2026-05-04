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
            <div className="table-wrap">
              <table className="table table-stack">
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
                      <td data-label="Name">
                        <div className="inline-cluster">
                          <div className="avatar avatar-md">{getInitials(s.name)}</div>
                          <span className="copy-strong">{s.name}</span>
                        </div>
                      </td>
                      <td data-label="Email" className="copy-muted">{s.email}</td>
                      <td data-label="Skill Level"><Badge type={s.skillLevel}>{s.skillLevel}</Badge></td>
                      <td data-label="Assigned Floor" className="copy-muted">Floor {s.assignedFloor || '-'}</td>
                      <td data-label="Workload" className="copy-muted">{s.assignedTime || 0} min assigned</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>
      )}
    </Layout>
  );
}
