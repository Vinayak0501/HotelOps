import { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import Card, { CardHead, CardBody } from '../../components/common/Card';
import { InlineLoader } from '../../components/common/Loader';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import Badge from '../../components/common/Badge';
import { applyLeave, getMyLeaves } from '../../api/leave.api';
import { formatDate } from '../../utils/formatters';
import '../../styles/tasks.css';
import '../../styles/components.css';

export default function Leave() {
  const [form, setForm] = useState({ leaveDate: '', reason: '' });
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    getMyLeaves()
      .then(res => setLeaves(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setAlert(null);
    setSubmitting(true);
    try {
      await applyLeave(form);
      setAlert({ type: 'success', msg: 'Leave application submitted successfully!' });
      setForm({ leaveDate: '', reason: '' });
      const res = await getMyLeaves();
      setLeaves(res.data);
    } catch (err) {
      setAlert({ type: 'error', msg: err.response?.data?.message || 'Failed to apply for leave' });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Layout title="Leave Management" subtitle="Apply for leave and track your requests">
      <div className="grid-2">
        <Card>
          <CardHead title="Apply for Leave" />
          <CardBody>
            {alert && (
              <div className="mobile-section-gap">
                <Alert type={alert.type} onClose={() => setAlert(null)}>{alert.msg}</Alert>
              </div>
            )}
            <form className="leave-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Leave Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={form.leaveDate}
                  onChange={e => setForm(p => ({ ...p, leaveDate: e.target.value }))}
                  required
                />
                <div className="form-hint">Must be applied at least 2 days in advance</div>
              </div>
              <div className="form-group">
                <label className="form-label">Reason</label>
                <textarea
                  className="form-textarea"
                  placeholder="Describe the reason for your leave..."
                  value={form.reason}
                  onChange={e => setForm(p => ({ ...p, reason: e.target.value }))}
                  required
                />
              </div>
              <Button type="submit" variant="primary" block loading={submitting}>
                Submit Application
              </Button>
            </form>
          </CardBody>
        </Card>

        <Card>
          <CardHead title="Leave History" action={`${leaves.length} requests`} />
          <CardBody style={{ padding: '8px' }}>
            {loading ? <InlineLoader /> : (
              leaves.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">[]</div>
                  <p className="empty-text">No leave requests yet</p>
                </div>
              ) : (
                <div className="card-surface-list">
                  {leaves.map((leave, i) => (
                    <div
                      key={leave._id}
                      className="surface-item"
                      style={{ animation: `fadeInUp 0.35s ${i * 45}ms ease both` }}
                    >
                      <div className="surface-item-head">
                        <span className="copy-strong">{formatDate(leave.leaveDate)}</span>
                        <Badge type={leave.status}>{leave.status}</Badge>
                      </div>
                      <div className="surface-item-copy">{leave.reason}</div>
                      <div className="surface-item-meta">Applied: {formatDate(leave.appliedAt)}</div>
                    </div>
                  ))}
                </div>
              )
            )}
          </CardBody>
        </Card>
      </div>
    </Layout>
  );
}
