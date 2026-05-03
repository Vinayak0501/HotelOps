import { useEffect, useState } from 'react';

const DESKTOP_MEDIA_QUERY = '(min-width: 1025px)';

function getInitialDesktopState() {
  if (typeof window === 'undefined') {
    return true;
  }

  return window.matchMedia(DESKTOP_MEDIA_QUERY).matches;
}

export default function useResponsiveSidebar() {
  const [isDesktop, setIsDesktop] = useState(getInitialDesktopState);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(DESKTOP_MEDIA_QUERY);

    function handleViewportChange(event) {
      setIsDesktop(event.matches);

      if (event.matches) {
        setIsSidebarOpen(false);
      }
    }

    setIsDesktop(mediaQuery.matches);

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', handleViewportChange);
      return () => mediaQuery.removeEventListener('change', handleViewportChange);
    }

    mediaQuery.addListener(handleViewportChange);
    return () => mediaQuery.removeListener(handleViewportChange);
  }, []);

  useEffect(() => {
    if (isDesktop || !isSidebarOpen) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    const previousTouchAction = document.body.style.touchAction;

    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';

    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.touchAction = previousTouchAction;
    };
  }, [isDesktop, isSidebarOpen]);

  useEffect(() => {
    if (isDesktop || !isSidebarOpen) {
      return undefined;
    }

    function handleEscape(event) {
      if (event.key === 'Escape') {
        setIsSidebarOpen(false);
      }
    }

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isDesktop, isSidebarOpen]);

  function closeSidebar() {
    setIsSidebarOpen(false);
  }

  function toggleSidebar() {
    if (!isDesktop) {
      setIsSidebarOpen((previous) => !previous);
    }
  }

  return {
    isDesktop,
    isSidebarOpen,
    closeSidebar,
    toggleSidebar,
  };
}
