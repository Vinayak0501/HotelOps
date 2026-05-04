import { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import Card, { CardHead, CardBody } from '../../components/common/Card';
import { InlineLoader } from '../../components/common/Loader';
import api from '../../api/axios';
import { formatDate, formatTime } from '../../utils/formatters';
import '../../styles/dashboard.css';
import '../../styles/components.css';

export default function AttendanceHistory() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/attendance/my-history')
      .then(res => setRecords(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const totalDays = records.length;
  const lateDays = records.filter(r => r.isLate).length;
  const autoCheckouts = records.filter(r => r.autoCheckout).length;

  return (
    <Layout title="My Attendance" subtitle="Your attendance history">
      {loading ? <InlineLoader /> : (
        <>
          <div className="stats-grid mobile-section-gap">
            <div className="stat-card gold">
              <span className="stat-icon">[]</span>
              <div className="stat-number">{totalDays}</div>
              <div className="stat-label">Days Present</div>
            </div>
            <div className="stat-card blue">
              <span className="stat-icon">T</span>
              <div className="stat-number">{lateDays}</div>
              <div className="stat-label">Late Arrivals</div>
            </div>
            <div className="stat-card purple">
              <span className="stat-icon">O</span>
              <div className="stat-number">{autoCheckouts}</div>
              <div className="stat-label">Auto Checkouts</div>
            </div>
          </div>

          <Card>
            <CardHead title="Attendance Log" action={`${totalDays} records`} />
            <CardBody flush>
              {records.length === 0 ? (
                <div className="empty-state">
                  <span className="empty-icon">[]</span>
                  <p className="empty-text">No attendance records found</p>
                </div>
              ) : (
                <div className="table-wrap">
                  <table className="table table-stack">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Check In</th>
                        <th>Check Out</th>
                        <th>Status</th>
                        <th>Note</th>
                      </tr>
                    </thead>
                    <tbody>
                      {records.map((r, i) => (
                        <tr key={r._id} style={{ animation: `fadeInUp 0.35s ${i * 30}ms ease both` }}>
                          <td data-label="Date" className="copy-strong">{formatDate(r.checkInTime)}</td>
                          <td data-label="Check In">
                            {formatTime(r.checkInTime)}
                            {r.isLate && (
                              <span className="badge badge-pending" style={{ marginLeft: '8px' }}>Late</span>
                            )}
                          </td>
                          <td data-label="Check Out" className="copy-muted">
                            {r.checkOutTime ? formatTime(r.checkOutTime) : (
                              <span style={{ color: 'var(--status-completed)' }}>Active</span>
                            )}
                          </td>
                          <td data-label="Status">
                            <div className="status-inline">
                              <div className={`status-dot ${r.checkOutTime ? 'inactive' : 'active'}`} />
                              <span className="copy-muted">{r.checkOutTime ? 'Completed' : 'On Duty'}</span>
                            </div>
                          </td>
                          <td data-label="Note" className="copy-subtle">
                            {r.autoCheckout ? 'Auto checkout' : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardBody>
          </Card>
        </>
      )}
    </Layout>
  );
}
