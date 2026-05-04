import { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import Card, { CardHead, CardBody } from '../../components/common/Card';
import { InlineLoader } from '../../components/common/Loader';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import { usePerformance } from '../../hooks/useStaff';
import { getPendingLeaves, updateLeave } from '../../api/leave.api';
import { getInitials, getCompletionRate, formatDate } from '../../utils/formatters';
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
              <div className="table-wrap">
                <table className="table table-stack">
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
                          <td data-label="Staff Member">
                            <div className="inline-cluster">
                              <div className="avatar avatar-md">{getInitials(item.staff.name)}</div>
                              <div className="inline-cluster-copy">
                                <div className="copy-strong">{item.staff.name}</div>
                                <div className="copy-subtle">Floor {item.staff.assignedFloor}</div>
                              </div>
                            </div>
                          </td>
                          <td data-label="Skill"><Badge type={item.staff.skillLevel}>{item.staff.skillLevel}</Badge></td>
                          <td data-label="Assigned" className="copy-muted">{item.assigned}</td>
                          <td data-label="Completed" style={{ color: 'var(--status-completed)', fontWeight: '600' }}>{item.completed}</td>
                          <td data-label="Pending" style={{ color: item.pending > 0 ? 'var(--status-pending)' : 'var(--text-muted)' }}>{item.pending}</td>
                          <td data-label="Progress">
                            <div className="inline-cluster">
                              <div className="progress-bar" style={{ flex: 1 }}>
                                <div className="progress-fill" style={{ width: `${rate}%` }} />
                              </div>
                              <span className="copy-subtle" style={{ width: '32px' }}>{rate}%</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardBody>
        </Card>
      ) : (
        leavesLoading ? <InlineLoader /> : (
          leaves.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">[]</div>
              <p className="empty-text">No pending leave requests</p>
            </div>
          ) : (
            <div className="stack-list">
              {leaves.map((leave, i) => (
                <Card key={leave._id} style={{ animationDelay: `${i * 50}ms` }}>
                  <CardBody>
                    <div className="leave-request-row">
                      <div className="leave-request-info">
                        <div className="avatar avatar-lg">{getInitials(leave.staffId?.name)}</div>
                        <div className="inline-cluster-copy">
                          <div className="copy-strong" style={{ marginBottom: '4px' }}>{leave.staffId?.name}</div>
                          <div className="copy-muted" style={{ marginBottom: '6px' }}>
                            Leave on {formatDate(leave.leaveDate)}
                          </div>
                          <div className="fluid-note">{leave.reason}</div>
                          <div className="copy-subtle" style={{ marginTop: '4px' }}>
                            Applied: {formatDate(leave.appliedAt)}
                          </div>
                        </div>
                      </div>
                      <div className="leave-request-actions">
                        <Button variant="success" size="sm" onClick={() => handleLeave(leave._id, 'approved')}>
                          Approve
                        </Button>
                        <Button variant="danger" size="sm" onClick={() => handleLeave(leave._id, 'rejected')}>
                          Reject
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
