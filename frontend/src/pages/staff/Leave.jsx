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
              <div style={{ marginBottom: '16px' }}>
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
                  <div className="empty-icon">📅</div>
                  <p className="empty-text">No leave requests yet</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {leaves.map((leave, i) => (
                    <div
                      key={leave._id}
                      style={{
                        padding: '12px 14px',
                        background: 'var(--bg-tertiary)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border)',
                        animation: `fadeInUp 0.35s ${i * 45}ms ease both`
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                        <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>
                          {formatDate(leave.leaveDate)}
                        </span>
                        <Badge type={leave.status}>{leave.status}</Badge>
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '3px' }}>
                        {leave.reason}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        Applied: {formatDate(leave.appliedAt)}
                      </div>
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