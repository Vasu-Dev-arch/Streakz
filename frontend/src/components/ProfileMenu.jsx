'use client';

/**
 * ProfileMenu — avatar button + dropdown with theme switcher, settings, logout.
 * Extracted from the old App.jsx into its own file for Next.js compatibility.
 */
import { useState, useRef, useEffect } from 'react';
import { useTheme } from '../themes/ThemeContext';

const menuItemStyle = {
  width: '100%',
  padding: '8px 10px',
  borderRadius: '6px',
  border: 'none',
  background: 'transparent',
  color: 'var(--text2)',
  fontFamily: 'var(--sans)',
  fontSize: '13px',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  textAlign: 'left',
  transition: 'background 0.12s',
};

export function ProfileMenu({ user, onSettings, onLogout }) {
  const [open, setOpen] = useState(false);
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const ref = useRef(null);
  const { currentThemeId, setTheme, getSystemPreference } = useTheme();

  useEffect(() => {
    if (!open) return;
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const initials = user?.name
    ? user.name
        .trim()
        .split(/\s+/)
        .map((w) => w[0].toUpperCase())
        .slice(0, 2)
        .join('')
    : '?';

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen((v) => !v)}
        title={user?.name ?? 'Profile'}
        style={{
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          background: 'rgba(124,106,247,0.18)',
          border: '1.5px solid rgba(124,106,247,0.35)',
          color: 'var(--accent2)',
          fontSize: '12px',
          fontWeight: 600,
          fontFamily: 'var(--mono)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'background 0.15s, border-color 0.15s',
          flexShrink: 0,
        }}
      >
        {initials}
      </button>

      {open && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            minWidth: '180px',
            background: 'var(--bg2)',
            border: '1px solid var(--border2)',
            borderRadius: '10px',
            padding: '6px',
            zIndex: 50,
            boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
          }}
        >
          {user?.name && (
            <div
              style={{
                padding: '8px 10px 10px',
                borderBottom: '1px solid var(--border)',
                marginBottom: '4px',
              }}
            >
              <div
                style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: 'var(--text)',
                }}
              >
                {user.name}
              </div>
              {user?.email && (
                <div
                  style={{
                    fontSize: '11px',
                    color: 'var(--text3)',
                    fontFamily: 'var(--mono)',
                    marginTop: '2px',
                  }}
                >
                  {user.email}
                </div>
              )}
            </div>
          )}

          {/* Theme sub-menu */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setThemeMenuOpen(!themeMenuOpen)}
              style={{
                ...menuItemStyle,
                ...(themeMenuOpen
                  ? { background: 'var(--bg3)', color: 'var(--text)' }
                  : {}),
              }}
              onMouseEnter={() => setThemeMenuOpen(true)}
              onMouseLeave={() => setThemeMenuOpen(false)}
            >
              <svg
                width="14"
                height="14"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
                style={{ flexShrink: 0 }}
              >
                <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
              </svg>
              Themes
              <svg
                width="10"
                height="10"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
                style={{
                  marginLeft: 'auto',
                  flexShrink: 0,
                  transform: 'rotate(180deg)',
                }}
              >
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>

            {themeMenuOpen && (
              <div
                style={{
                  position: 'absolute',
                  right: '100%',
                  top: 0,
                  minWidth: '140px',
                  background: 'var(--bg2)',
                  border: '1px solid var(--border2)',
                  borderRadius: '10px',
                  padding: '6px',
                  zIndex: 51,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
                }}
                onMouseEnter={() => setThemeMenuOpen(true)}
                onMouseLeave={() => setThemeMenuOpen(false)}
              >
                {[
                  {
                    id: null,
                    label: 'System',
                    check: !localStorage.getItem('habit-tracker-theme-id'),
                  },
                  { id: 'dark', label: 'Dark', check: currentThemeId === 'dark' },
                  {
                    id: 'light',
                    label: 'Light',
                    check: currentThemeId === 'light',
                  },
                  { id: 'nord', label: 'Nord', check: currentThemeId === 'nord' },
                  {
                    id: 'monokai',
                    label: 'Monokai',
                    check: currentThemeId === 'monokai',
                  },
                ].map((t) => (
                  <button
                    key={t.label}
                    onClick={() => {
                      if (t.id === null) {
                        localStorage.removeItem('habit-tracker-theme-id');
                        setTheme(getSystemPreference());
                      } else {
                        setTheme(t.id);
                      }
                      setOpen(false);
                      setThemeMenuOpen(false);
                    }}
                    style={{
                      ...menuItemStyle,
                      ...(t.check
                        ? { background: 'var(--bg3)', color: 'var(--text)' }
                        : {}),
                    }}
                  >
                    {t.label}
                    {t.check && (
                      <span style={{ marginLeft: 'auto' }}>✓</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Settings */}
          <button
            onClick={() => {
              setOpen(false);
              onSettings();
            }}
            style={menuItemStyle}
          >
            <svg
              width="14"
              height="14"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
              style={{ flexShrink: 0 }}
            >
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
            </svg>
            Settings
          </button>

          <div
            style={{
              height: '1px',
              background: 'var(--border)',
              margin: '4px 0',
            }}
          />

          {/* Logout */}
          <button
            onClick={() => {
              setOpen(false);
              onLogout();
            }}
            style={{ ...menuItemStyle, color: 'var(--red)' }}
          >
            <svg
              width="14"
              height="14"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
              style={{ flexShrink: 0 }}
            >
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
            </svg>
            Log out
          </button>
        </div>
      )}
    </div>
  );
}
