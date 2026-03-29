import React, { useState } from 'react';

/**
 * Combined Login / Signup page.
 * Calls onLogin / onSignup provided by App, which delegate to useAuth.
 */
export function AuthPage({ onLogin, onSignup, error, loading }) {
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (mode === 'signup') {
      await onSignup({ name, email, password });
    } else {
      await onLogin({ email, password });
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg)',
      fontFamily: 'var(--sans)',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '400px',
        padding: '40px 36px',
        background: 'var(--bg2)',
        border: '1px solid var(--border)',
        borderRadius: '16px',
      }}>
        {/* Logo */}
        <div style={{ marginBottom: '28px', textAlign: 'center' }}>
          <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--accent2)', letterSpacing: '-0.5px' }}>
            ◆ Streakz
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text3)', fontFamily: 'var(--mono)', marginTop: '4px' }}>
            Habit Analytics
          </div>
        </div>

        {/* Mode tabs */}
        <div style={{
          display: 'flex',
          gap: '2px',
          background: 'var(--bg3)',
          borderRadius: '8px',
          padding: '3px',
          marginBottom: '24px',
        }}>
          {['login', 'signup'].map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              style={{
                flex: 1,
                padding: '7px',
                borderRadius: '6px',
                border: 'none',
                background: mode === m ? 'var(--bg2)' : 'transparent',
                color: mode === m ? 'var(--text)' : 'var(--text3)',
                fontFamily: 'var(--sans)',
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              {m === 'login' ? 'Log in' : 'Sign up'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          {mode === 'signup' && (
            <div style={{ marginBottom: '14px' }}>
              <label style={{
                display: 'block',
                fontSize: '11px',
                fontFamily: 'var(--mono)',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                color: 'var(--text3)',
                marginBottom: '6px',
              }}>
                Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  background: 'var(--bg3)',
                  border: '1px solid var(--border2)',
                  color: 'var(--text)',
                  fontFamily: 'var(--sans)',
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          )}

          <div style={{ marginBottom: '14px' }}>
            <label style={{
              display: 'block',
              fontSize: '11px',
              fontFamily: 'var(--mono)',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              color: 'var(--text3)',
              marginBottom: '6px',
            }}>
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '8px',
                background: 'var(--bg3)',
                border: '1px solid var(--border2)',
                color: 'var(--text)',
                fontFamily: 'var(--sans)',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontSize: '11px',
              fontFamily: 'var(--mono)',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              color: 'var(--text3)',
              marginBottom: '6px',
            }}>
              Password
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 6 characters"
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '8px',
                background: 'var(--bg3)',
                border: '1px solid var(--border2)',
                color: 'var(--text)',
                fontFamily: 'var(--sans)',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {error && (
            <div style={{
              marginBottom: '16px',
              padding: '10px 12px',
              borderRadius: '8px',
              background: 'rgba(240,82,82,0.1)',
              border: '1px solid rgba(240,82,82,0.25)',
              color: 'var(--red)',
              fontSize: '13px',
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '11px',
              borderRadius: '8px',
              border: 'none',
              background: 'var(--accent)',
              color: '#fff',
              fontFamily: 'var(--sans)',
              fontSize: '14px',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              transition: 'opacity 0.15s',
            }}
          >
            {loading ? 'Please wait…' : mode === 'login' ? 'Log in' : 'Create account'}
          </button>
        </form>
      </div>
    </div>
  );
}
