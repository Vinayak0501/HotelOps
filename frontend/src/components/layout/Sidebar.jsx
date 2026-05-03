import { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getInitials } from '../../utils/formatters';
import { getPendingLeaves } from '../../api/leave.api';
import { getNotifications } from '../../api/notification.api';
import '../../styles/layout.css';

const ADMIN_NAV = [
  {
    section: 'Overview',
    items: [
      { label: 'Dashboard', icon: '[]', path: '/admin', badgeKey: 'notifs' },
      { label: 'Tasks Today', icon: 'OK', path: '/admin/tasks' },
      { label: 'Rooms', icon: '#', path: '/admin/rooms' },
    ],
  },
  {
    section: 'Workforce',
    items: [
      { label: 'Attendance', icon: 'O', path: '/admin/attendance' },
      { label: 'Performance', icon: '^', path: '/admin/performance' },
      { label: 'Leave Requests', icon: '~', path: '/admin/leaves', badgeKey: 'leaves' },
      { label: 'Staff', icon: '@', path: '/admin/staff' },
    ],
  },
];

const STAFF_NAV = [
  {
    section: 'My Work',
    items: [
      { label: 'Dashboard', icon: '[]', path: '/staff', badgeKey: 'notifs' },
      { label: 'My Tasks', icon: 'OK', path: '/staff/tasks' },
    ],
  },
  {
    section: 'Requests',
    items: [
      { label: 'Leave', icon: '~', path: '/staff/leave' },
      { label: 'My Attendance', icon: 'O', path: '/staff/attendance' },
    ],
  },
];

const FOCUSABLE_SELECTOR = [
  'button:not([disabled])',
  'a[href]',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

export default function Sidebar({ open, onClose, isDesktop = false }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [badges, setBadges] = useState({ notifs: 0, leaves: 0 });
  const sidebarRef = useRef(null);
  const closeButtonRef = useRef(null);

  const nav = user?.role === 'admin' ? ADMIN_NAV : STAFF_NAV;
  const initials = getInitials(user?.name);

  useEffect(() => {
    if (!user) {
      return undefined;
    }

    async function fetchBadges() {
      try {
        const notifPromise = getNotifications();
        const leavePromise = user.role === 'admin'
          ? getPendingLeaves()
          : Promise.resolve({ data: [] });

        const [notifRes, leaveRes] = await Promise.all([notifPromise, leavePromise]);

        setBadges({
          notifs: notifRes.data.length,
          leaves: leaveRes.data.length,
        });
      } catch (error) {
        console.error(error);
      }
    }

    fetchBadges();
    const interval = setInterval(fetchBadges, 30000);
    window.addEventListener('notification-updated', fetchBadges);

    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    if (isDesktop || !open) {
      return undefined;
    }

    closeButtonRef.current?.focus();

    function trapFocus(event) {
      if (event.key !== 'Tab' || !sidebarRef.current) {
        return;
      }

      const focusableElements = Array.from(
        sidebarRef.current.querySelectorAll(FOCUSABLE_SELECTOR),
      );

      if (focusableElements.length === 0) {
        event.preventDefault();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }

    document.addEventListener('keydown', trapFocus);
    return () => document.removeEventListener('keydown', trapFocus);
  }, [isDesktop, open]);

  function handleNav(path) {
    navigate(path);

    if (!isDesktop) {
      onClose?.();
    }
  }

  function handleLogout() {
    logout();
    navigate('/login');
    onClose?.();
  }

  return (
    <>
      {!isDesktop && open && (
        <button
          type="button"
          className="sidebar-overlay"
          onClick={onClose}
          aria-label="Close navigation menu"
        />
      )}

      <aside
        id="app-sidebar"
        ref={sidebarRef}
        className={`sidebar ${open ? 'open' : ''} ${isDesktop ? 'desktop' : 'mobile'}`}
        aria-hidden={!isDesktop && !open}
        aria-label="Sidebar navigation"
        role={!isDesktop ? 'dialog' : undefined}
        aria-modal={!isDesktop && open ? 'true' : undefined}
      >
        <div className="sidebar-head">
          <div className="sidebar-brand-wrap">
            <div className="sidebar-logo">H</div>
            <div className="sidebar-brand">
              <h4>HotelOps</h4>
              <span>{user?.role === 'admin' ? 'Admin Panel' : 'Staff Portal'}</span>
            </div>
          </div>

          {!isDesktop && (
            <button
              ref={closeButtonRef}
              type="button"
              className="sidebar-close"
              onClick={onClose}
              aria-label="Close navigation menu"
            >
              x
            </button>
          )}
        </div>

        <nav className="sidebar-nav">
          {nav.map((section) => (
            <div className="nav-section" key={section.section}>
              <div className="nav-section-title">{section.section}</div>
              {section.items.map((item) => {
                const badgeCount = item.badgeKey ? badges[item.badgeKey] : 0;

                return (
                  <button
                    key={item.path}
                    type="button"
                    className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
                    onClick={() => handleNav(item.path)}
                    aria-current={location.pathname === item.path ? 'page' : undefined}
                  >
                    <span className="nav-icon">{item.icon}</span>
                    <span className="nav-label">{item.label}</span>
                    {badgeCount > 0 && (
                      <span className="nav-badge">{badgeCount}</span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="sidebar-foot">
          <div className="sidebar-user">
            <div className="user-avatar">{initials}</div>
            <div className="user-info">
              <div className="user-name">{user?.name}</div>
              <div className="user-role">{user?.role}</div>
            </div>
          </div>
          <button type="button" className="logout-btn" onClick={handleLogout}>
            <span>&lt;-</span> Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
