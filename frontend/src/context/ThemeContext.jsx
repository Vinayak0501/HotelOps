import {
  createContext,
  useContext,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  DEFAULT_THEME_ID,
  THEME_STORAGE_KEY,
  themes,
  themesById,
} from '../theme/themes';

const ThemeContext = createContext(null);

function getStoredTheme() {
  if (typeof window === 'undefined') {
    return DEFAULT_THEME_ID;
  }

  const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
  return storedTheme && themesById[storedTheme] ? storedTheme : DEFAULT_THEME_ID;
}

function applyTheme(themeId) {
  const theme = themesById[themeId] ?? themesById[DEFAULT_THEME_ID];
  const root = document.documentElement;

  root.dataset.theme = theme.id;
  root.style.colorScheme = theme.mode;

  Object.entries(theme.variables).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
}

export function ThemeProvider({ children }) {
  const [themeId, setThemeId] = useState(getStoredTheme);
  const hasMountedRef = useRef(false);
  const transitionTimeoutRef = useRef(null);

  useLayoutEffect(() => {
    const root = document.documentElement;

    if (hasMountedRef.current) {
      root.classList.add('theme-transition');
    }

    applyTheme(themeId);
    window.localStorage.setItem(THEME_STORAGE_KEY, themeId);

    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return undefined;
    }

    window.clearTimeout(transitionTimeoutRef.current);
    transitionTimeoutRef.current = window.setTimeout(() => {
      root.classList.remove('theme-transition');
    }, 320);

    return () => {
      window.clearTimeout(transitionTimeoutRef.current);
      root.classList.remove('theme-transition');
    };
  }, [themeId]);

  const value = useMemo(() => ({
    themeId,
    currentTheme: themesById[themeId] ?? themesById[DEFAULT_THEME_ID],
    themes,
    setTheme: setThemeId,
  }), [themeId]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  return context;
}
