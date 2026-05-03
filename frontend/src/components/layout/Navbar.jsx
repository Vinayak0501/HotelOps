import { formatDateLong } from '../../utils/formatters';
import ThemeSwitcher from './ThemeSwitcher';
import '../../styles/layout.css';

export default function Navbar({
  title,
  subtitle,
  onMenuClick,
  menuButtonRef,
  isSidebarOpen = false,
  showMenuButton = false,
}) {
  return (
    <header className="navbar">
      <div className="navbar-leading">
        <button
          ref={menuButtonRef}
          type="button"
          className={`hamburger ${showMenuButton ? 'visible' : ''}`}
          onClick={onMenuClick}
          aria-label={isSidebarOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={showMenuButton ? isSidebarOpen : undefined}
          aria-controls={showMenuButton ? 'app-sidebar' : undefined}
        >
          <span />
          <span />
          <span />
        </button>
        <div className="navbar-left">
          <span className="navbar-title">{title}</span>
          {subtitle && <span className="navbar-subtitle">{subtitle}</span>}
        </div>
      </div>
      <div className="navbar-right">
        <ThemeSwitcher />
        <span className="navbar-date">{formatDateLong(new Date())}</span>
      </div>
    </header>
  );
}
