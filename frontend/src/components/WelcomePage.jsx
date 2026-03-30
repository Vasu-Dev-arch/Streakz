import React, { useState } from 'react';

/**
 * WelcomePage — shown to first-time users immediately after login.
 * Collects a display name, saves it, then navigates to /onboarding.
 *
 * Props:
 *   initialName   — pre-filled from auth (may be email-like for Google users)
 *   onContinue(name) — async: saves name via API, then caller sets path to '/onboarding'
 */
export function WelcomePage({ initialName = '', onContinue }) {
  const [name, setName] = useState(initialName || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    setLoading(true);
    setError(null);
    try {
      await onContinue(trimmed);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div style={styles.root}>
      <div style={styles.card}>
        {/* Logo mark */}
        <div style={styles.logo}>◆ Streakz</div>

        {/* Heading */}
        <h1 style={styles.heading}>How should we call you?</h1>
        <p style={styles.sub}>
          This is how your name will appear in the app.
        </p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            type="text"
            autoFocus
            autoComplete="given-name"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={60}
            style={styles.input}
            disabled={loading}
          />

          {error && <p style={styles.error}>{error}</p>}

          <button
            type="submit"
            disabled={!name.trim() || loading}
            style={{
              ...styles.btn,
              opacity: !name.trim() || loading ? 0.5 : 1,
              cursor: !name.trim() || loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Saving…' : 'Continue →'}
          </button>
        </form>
      </div>

      {/* Decorative background blobs */}
      <div style={{ ...styles.blob, top: '-120px', right: '-80px', background: 'rgba(124,106,247,0.12)' }} />
      <div style={{ ...styles.blob, bottom: '-100px', left: '-60px', background: 'rgba(34,201,122,0.08)', width: '320px', height: '320px' }} />
    </div>
  );
}

const styles = {
  root: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--bg)',
    fontFamily: 'var(--sans)',
    position: 'relative',
    overflow: 'hidden',
    padding: '24px 16px',
  },
  card: {
    width: '100%',
    maxWidth: '420px',
    background: 'var(--bg2)',
    border: '1px solid var(--border)',
    borderRadius: '20px',
    padding: '44px 40px',
    position: 'relative',
    zIndex: 1,
    animation: 'wlFadeUp 0.45s cubic-bezier(0.4,0,0.2,1) both',
  },
  logo: {
    fontSize: '16px',
    fontWeight: 700,
    color: 'var(--accent2)',
    letterSpacing: '-0.3px',
    marginBottom: '32px',
  },
  heading: {
    fontSize: '26px',
    fontWeight: 700,
    color: 'var(--text)',
    lineHeight: 1.25,
    marginBottom: '10px',
  },
  sub: {
    fontSize: '14px',
    color: 'var(--text3)',
    marginBottom: '32px',
    lineHeight: 1.6,
    fontFamily: 'var(--mono)',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  input: {
    width: '100%',
    padding: '13px 16px',
    borderRadius: '10px',
    border: '1px solid var(--border2)',
    background: 'var(--bg3)',
    color: 'var(--text)',
    fontFamily: 'var(--sans)',
    fontSize: '16px',
    outline: 'none',
    transition: 'border-color 0.15s',
    boxSizing: 'border-box',
  },
  btn: {
    padding: '14px',
    borderRadius: '10px',
    border: 'none',
    background: 'var(--accent)',
    color: '#fff',
    fontFamily: 'var(--sans)',
    fontSize: '15px',
    fontWeight: 600,
    transition: 'background 0.15s, opacity 0.15s',
    width: '100%',
  },
  error: {
    fontSize: '13px',
    color: 'var(--red)',
    margin: 0,
    fontFamily: 'var(--mono)',
  },
  blob: {
    position: 'absolute',
    width: '400px',
    height: '400px',
    borderRadius: '50%',
    filter: 'blur(60px)',
    pointerEvents: 'none',
  },
};
