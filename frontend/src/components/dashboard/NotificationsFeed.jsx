import { formatTime } from '../../utils/formatters';
import '../../styles/dashboard.css';

export default function NotificationsFeed({
  notifications,
  onMarkAsRead,
  emptyText = 'All clear - no alerts',
}) {
  if (notifications.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">OK</div>
        <p className="empty-text">{emptyText}</p>
      </div>
    );
  }

  return (
    <div className="notif-list">
      {notifications.map((notification, index) => (
        <div
          key={notification._id}
          className={`notif-item ${notification.type}`}
          style={{ animationDelay: `${index * 40}ms` }}
        >
          <div className="notif-copy">
            <div className="notif-msg">{notification.message}</div>
            <div className="notif-time">{formatTime(notification.createdAt)}</div>
          </div>
          <button
            type="button"
            className="notif-mark-read"
            onClick={() => onMarkAsRead(notification._id)}
            aria-label="Mark notification as read"
          >
            Mark read
          </button>
        </div>
      ))}
    </div>
  );
}
