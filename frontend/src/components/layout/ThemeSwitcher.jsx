import { useEffect, useRef, useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import '../../styles/layout.css';

export default function ThemeSwitcher() {
  const { themeId, themes, currentTheme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    function handlePointerDown(event) {
      if (!wrapperRef.current?.contains(event.target)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div className="theme-switcher" ref={wrapperRef}>
      <button
        type="button"
        className="theme-trigger"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Choose website theme"
        onClick={() => setOpen((previous) => !previous)}
      >
        <span className="theme-trigger-label">
          <span className="theme-trigger-title">Theme</span>
          <span className="theme-trigger-value">{currentTheme.label}</span>
        </span>

        <span className="theme-preview" aria-hidden="true">
          {currentTheme.preview.map((color) => (
            <span
              key={color}
              className="theme-preview-dot"
              style={{ background: color }}
            />
          ))}
        </span>

        <span className={`theme-trigger-caret ${open ? 'open' : ''}`} aria-hidden="true">
          v
        </span>
      </button>

      {open && (
        <div className="theme-menu animate-fadeInDown" role="menu" aria-label="Theme options">
          {themes.map((theme) => (
            <button
              key={theme.id}
              type="button"
              className={`theme-option ${theme.id === themeId ? 'active' : ''}`}
              role="menuitemradio"
              aria-checked={theme.id === themeId}
              onClick={() => {
                setTheme(theme.id);
                setOpen(false);
              }}
            >
              <span className="theme-option-preview" aria-hidden="true">
                {theme.preview.map((color) => (
                  <span
                    key={`${theme.id}-${color}`}
                    className="theme-option-swatch"
                    style={{ background: color }}
                  />
                ))}
              </span>

              <span className="theme-option-copy">
                <span className="theme-option-title">{theme.label}</span>
                <span className="theme-option-description">{theme.description}</span>
              </span>

              <span className="theme-option-check" aria-hidden="true">
                {theme.id === themeId ? '*' : ''}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
