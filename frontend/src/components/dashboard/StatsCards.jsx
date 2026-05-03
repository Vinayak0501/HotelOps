import AnimatedNumber from '../common/AnimatedNumber';
import '../../styles/dashboard.css';

const colors = ['gold', 'green', 'blue', 'purple', 'red', 'pink'];

export default function StatsCards({ stats }) {
  return (
    <div className="stats-grid">
      {stats.map((stat, i) => (
        <div
          key={stat.label}
          className={`stat-card ${colors[i % colors.length]}`}
          style={{ animationDelay: `${i * 60}ms`, animation: 'fadeInUp 0.5s ease both' }}
        >
          <span className="stat-icon">{stat.icon}</span>
          <div className="stat-number">
            <AnimatedNumber value={stat.value} duration={900} />
          </div>
          <div className="stat-label">{stat.label}</div>
          {stat.sub && <div className="stat-sub">{stat.sub}</div>}
        </div>
      ))}
    </div>
  );
}