import '../../styles/dashboard.css';

const STATUS_CONFIG = [
  { key: 'completed', label: 'Completed', color: 'var(--status-completed)' },
  { key: 'inProgress', label: 'In Progress', color: 'var(--status-progress)' },
  { key: 'assigned', label: 'Assigned', color: 'var(--status-assigned)' },
  { key: 'pending', label: 'Pending', color: 'var(--status-pending)' },
  { key: 'paused', label: 'Paused', color: 'var(--status-paused)' },
];

export default function TaskChart({ summary }) {
  if (!summary) return null;
  const total = summary.total || 1;

  return (
    <div>
      {STATUS_CONFIG.map((s) => {
        const val = summary[s.key] || 0;
        const pct = Math.round((val / total) * 100);
        return (
          <div className="breakdown-row" key={s.key}>
            <div className="breakdown-head">
              <span className="breakdown-label">{s.label}</span>
              <span className="breakdown-value" style={{ color: s.color }}>{val}</span>
            </div>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${pct}%`, background: s.color }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}