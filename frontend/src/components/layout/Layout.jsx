import { useEffect, useRef } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import useResponsiveSidebar from '../../hooks/useResponsiveSidebar';
import '../../styles/layout.css';

export default function Layout({ children, title, subtitle, notifCount = 0 }) {
  const menuButtonRef = useRef(null);
  const wasSidebarOpenRef = useRef(false);
  const {
    isDesktop,
    isSidebarOpen,
    closeSidebar,
    toggleSidebar,
  } = useResponsiveSidebar();

  useEffect(() => {
    if (!isDesktop && wasSidebarOpenRef.current && !isSidebarOpen) {
      menuButtonRef.current?.focus();
    }

    wasSidebarOpenRef.current = isSidebarOpen;
  }, [isDesktop, isSidebarOpen]);

  return (
    <div className="app-shell">
      <Sidebar
        notifCount={notifCount}
        open={isSidebarOpen}
        isDesktop={isDesktop}
        onClose={closeSidebar}
      />
      <div className="main-content">
        <Navbar
          title={title}
          subtitle={subtitle}
          onMenuClick={toggleSidebar}
          menuButtonRef={menuButtonRef}
          isSidebarOpen={isSidebarOpen}
          showMenuButton={!isDesktop}
        />
        <div className="page-body">
          {children}
        </div>
      </div>
    </div>
  );
}
