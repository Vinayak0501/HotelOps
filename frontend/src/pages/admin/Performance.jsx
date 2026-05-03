import { useState } from 'react';
import Layout from '../../components/layout/Layout';
import Card, { CardHead, CardBody } from '../../components/common/Card';
import { InlineLoader } from '../../components/common/Loader';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import { usePerformance } from '../../hooks/useStaff';
import { getPendingLeaves, updateLeave } from '../../api/leave.api';
import { getInitials, getCompletionRate, formatDate } from '../../utils/formatters';
import { useEffect } from 'react';
import '../../styles/dashboard.css';
import '../../styles/components.css';

export default function Performance() {
  const { data, loading } = usePerformance();
  const [tab, setTab] = useState('performance');
  const [leaves, setLeaves] = useState([]);
  const [leavesLoading, setLeavesLoading] = useState(true);

  useEffect(() => {
    getPendingLeaves()
      .then(res => setLeaves(res.data))
      .catch(console.error)
      .finally(() => setLeavesLoading(false));
  }, []);

  async function handleLeave(id, status) {
    try {
      await updateLeave(id, status);
      setLeaves(prev => prev.filter(l => l._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Action failed');
    }
  }

  return (
    <Layout title="Performance & Leaves" subtitle="Staff metrics and leave approvals">
      <div className="tabs-row">
        <button className={`tab-btn ${tab === 'performance' ? 'active' : ''}`} onClick={() => setTab('performance')}>
          Performance
        </button>
        <button className={`tab-btn ${tab === 'leaves' ? 'active' : ''}`} onClick={() => setTab('leaves')}>
          Leave Requests {leaves.length > 0 && `(${leaves.length})`}
        </button>
      </div>

      {tab === 'performance' ? (
        <Card>
          <CardHead title="Staff Performance Today" />
          <CardBody flush>
            {loading ? <InlineLoader /> : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Staff Member</th>
                    <th>Skill</th>
                    <th>Assigned</th>
                    <th>Completed</th>
                    <th>Pending</th>
                    <th>Progress</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((item, i) => {
                    const rate = getCompletionRate(item.completed, item.assigned);
                    return (
                      <tr key={item.staff.id} style={{ animation: `fadeInUp 0.35s ${i * 35}ms ease both` }}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div className="avatar avatar-md">{getInitials(item.staff.name)}</div>
                            <div>
                              <div style={{ fontWeight: '600' }}>{item.staff.name}</div>
                              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Floor {item.staff.assignedFloor}</div>
                            </div>
                          </div>
                        </td>
                        <td><Badge type={item.staff.skillLevel}>{item.staff.skillLevel}</Badge></td>
                        <td style={{ color: 'var(--text-secondary)' }}>{item.assigned}</td>
                        <td style={{ color: 'var(--status-completed)', fontWeight: '600' }}>{item.completed}</td>
                        <td style={{ color: item.pending > 0 ? 'var(--status-pending)' : 'var(--text-muted)' }}>{item.pending}</td>
                        <td style={{ width: '130px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div className="progress-bar" style={{ flex: 1 }}>
                              <div className="progress-fill" style={{ width: `${rate}%` }} />
                            </div>
                            <span style={{ fontSize: '11px', color: 'var(--text-secondary)', width: '30px' }}>{rate}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </CardBody>
        </Card>
      ) : (
        leavesLoading ? <InlineLoader /> : (
          leaves.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📅</div>
              <p className="empty-text">No pending leave requests</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {leaves.map((leave, i) => (
                <Card key={leave._id} style={{ animationDelay: `${i * 50}ms` }}>
                  <CardBody>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
                      <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', flex: 1, minWidth: 0 }}>
                        <div className="avatar avatar-lg">{getInitials(leave.staffId?.name)}</div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontWeight: '600', marginBottom: '4px' }}>{leave.staffId?.name}</div>
                          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                            📅 Leave on {formatDate(leave.leaveDate)}
                          </div>
                          <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{leave.reason}</div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                            Applied: {formatDate(leave.appliedAt)}
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                        <Button variant="success" size="sm" onClick={() => handleLeave(leave._id, 'approved')}>
                          ✓ Approve
                        </Button>
                        <Button variant="danger" size="sm" onClick={() => handleLeave(leave._id, 'rejected')}>
                          ✕ Reject
                        </Button>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          )
        )
      )}
    </Layout>
  );
}