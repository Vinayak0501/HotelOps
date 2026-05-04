import { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import Card, { CardBody } from '../../components/common/Card';
import { InlineLoader } from '../../components/common/Loader';
import Button from '../../components/common/Button';
import { getPendingLeaves, updateLeave } from '../../api/leave.api';
import { getInitials, formatDate } from '../../utils/formatters';
import '../../styles/components.css';

export default function AdminLeaves() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);

  useEffect(() => {
    fetchLeaves();
  }, []);

  async function fetchLeaves() {
    setLoading(true);
    try {
      const res = await getPendingLeaves();
      setLeaves(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleLeave(id, status) {
    setProcessing(id + status);
    try {
      await updateLeave(id, status);
      setLeaves(prev => prev.filter(l => l._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Action failed');
    } finally {
      setProcessing(null);
    }
  }

  return (
    <Layout title="Leave Requests" subtitle="Review and approve staff leave applications">
      {loading ? <InlineLoader /> : (
        leaves.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">[]</span>
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
                        <div className="copy-strong" style={{ marginBottom: '4px', fontSize: '14px' }}>
                          {leave.staffId?.name}
                        </div>
                        <div className="copy-muted" style={{ marginBottom: '6px' }}>
                          Leave on {formatDate(leave.leaveDate)}
                        </div>
                        <div className="fluid-note">{leave.reason}</div>
                        <div className="copy-subtle" style={{ marginTop: '6px' }}>
                          Applied: {formatDate(leave.appliedAt)}
                        </div>
                      </div>
                    </div>
                    <div className="leave-request-actions">
                      <Button
                        variant="success"
                        size="sm"
                        loading={processing === leave._id + 'approved'}
                        onClick={() => handleLeave(leave._id, 'approved')}
                      >
                        Approve
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        loading={processing === leave._id + 'rejected'}
                        onClick={() => handleLeave(leave._id, 'rejected')}
                      >
                        Reject
                      </Button>
                    </div>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        )
      )}
    </Layout>
  );
}
