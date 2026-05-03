import { getInitials, getCompletionRate } from '../../utils/formatters';
import '../../styles/dashboard.css';
import '../../styles/components.css';

export default function StaffLoadChart({ data = [] }) {
  if (!data.length) return (
    <div className="empty-state">
      <div className="empty-icon">👥</div>
      <p className="empty-text">No staff data available</p>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {data.map((item) => {
        const rate = getCompletionRate(item.completed, item.assigned);
        return (
          <div key={item.staff.id} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="avatar avatar-sm">{getInitials(item.staff.name)}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-primary)', fontWeight: '500' }} className="truncate">
                  {item.staff.name}
                </span>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)', flexShrink: 0, marginLeft: '8px' }}>
                  {item.completed}/{item.assigned}
                </span>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{
                    width: `${rate}%`,
                    background: rate === 100 ? 'var(--status-completed)' : rate > 50 ? 'var(--gold)' : 'var(--status-assigned)'
                  }}
                />
              </div>
            </div>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)', width: '32px', textAlign: 'right' }}>
              {rate}%
            </span>
          </div>
        );
      })}
    </div>
  );
}