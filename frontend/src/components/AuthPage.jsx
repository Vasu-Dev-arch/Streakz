'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import './AuthPage.css';

/**
 * Combined Login / Signup page with modern split-screen layout.
 * Calls onLogin / onSignup for email+password, onGoogleLogin for OAuth.
 * Offline-aware: disables Google OAuth and shows a notice when offline.
 */
export function AuthPage({ onLogin, onSignup, onGoogleLogin, error, loading }) {
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const up = () => setIsOnline(true);
    const down = () => setIsOnline(false);
    window.addEventListener('online', up);
    window.addEventListener('offline', down);
    return () => {
      window.removeEventListener('online', up);
      window.removeEventListener('offline', down);
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (mode === 'signup') {
      await onSignup({ name, email, password });
    } else {
      await onLogin({ email, password });
    }
  };

  const handleGoogleLogin = () => {
    if (!isOnline) return;
    onGoogleLogin();
  };

  return (
    <div className="auth-container">
      {/* Left Section — Branding */}
      <div className="auth-left-section">
        <div className="auth-left-content">
          {/* Logo */}
          <div className="auth-logo-container">
            <div className="auth-logo-icon">
              <Image
                src="/assets/logo.png"
                alt="Streakz logo"
                width={32}
                height={32}
              />
            </div>
            <div className="auth-logo-text">Streakz</div>
          </div>

          {/* Tagline */}
          <h1 className="auth-tagline">
            Build consistency.
            <br />
            Track your progress.
          </h1>

          {/* Feature Highlights */}
          <div className="auth-features-container">
            <FeatureCard
              icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83" />
                </svg>
              }
              title="Streak Tracking"
              description="Build and maintain daily habits with visual streak counters"
            />
            <FeatureCard
              icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 3v18h18" />
                  <path d="M18 17V9" />
                  <path d="M13 17V5" />
                  <path d="M8 17v-3" />
                </svg>
              }
              title="Analytics"
              description="Deep insights into your habit patterns and progress"
            />
            <FeatureCard
              icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2a10 10 0 1 0 10 10H12V2z" />
                  <path d="M12 2a10 10 0 0 1 10 10" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              }
              title="AI Habit Coach"
              description="Personalised recommendations powered by AI"
            />
          </div>

          {/* Demo UI Preview */}
          <div className="auth-demo-preview">
            <div className="auth-demo-card">
              <div className="auth-demo-header">
                <div className="auth-demo-dot" />
                <div className="auth-demo-dot" />
                <div className="auth-demo-dot" />
              </div>
              <div className="auth-demo-content">
                <div className="auth-demo-stat">
                  <div className="auth-demo-stat-value">21</div>
                  <div className="auth-demo-stat-label">Day Streak</div>
                </div>
                <div className="auth-demo-stat">
                  <div className="auth-demo-stat-value">87%</div>
                  <div className="auth-demo-stat-label">Completion</div>
                </div>
                <div className="auth-demo-stat">
                  <div className="auth-demo-stat-value">12</div>
                  <div className="auth-demo-stat-label">Habits</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Section — Auth Form */}
      <div className="auth-right-section">
        <div className="auth-form-container">
          {/* Mobile Logo */}
          <div className="auth-mobile-logo">
            <div className="auth-logo-icon">
              <Image
                src="/assets/logo.png"
                alt="Streakz logo"
                width={28}
                height={28}
              />
            </div>
            <div className="auth-mobile-logo-text">Streakz</div>
          </div>

          {/* Offline banner */}
          {!isOnline && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 14px',
              borderRadius: '8px',
              background: 'rgba(245,166,35,0.1)',
              border: '1px solid rgba(245,166,35,0.25)',
              color: '#f5a623',
              fontSize: '13px',
              marginBottom: '16px',
              lineHeight: '1.5',
            }}>
              <span style={{ fontSize: '16px', flexShrink: 0 }}>📡</span>
              <span>
                You&apos;re offline. Email login still works — Google Sign-in requires internet.
              </span>
            </div>
          )}

          {/* Form Header */}
          <div className="auth-form-header">
            <h2 className="auth-form-title">
              {mode === 'login' ? 'Welcome back' : 'Create account'}
            </h2>
            <p className="auth-form-subtitle">
              {mode === 'login'
                ? 'Sign in to continue your journey'
                : 'Start building better habits today'}
            </p>
          </div>

          {/* Mode Tabs */}
          <div className="auth-tab-container">
            <button
              onClick={() => setMode('login')}
              className={`auth-tab ${mode === 'login' ? 'active' : ''}`}
            >
              Log in
            </button>
            <button
              onClick={() => setMode('signup')}
              className={`auth-tab ${mode === 'signup' ? 'active' : ''}`}
            >
              Sign up
            </button>
          </div>

          {/* Google Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="auth-google-button"
            disabled={!isOnline}
            title={!isOnline ? 'Internet required for Google Sign-in' : undefined}
            style={!isOnline ? { opacity: 0.45, cursor: 'not-allowed' } : undefined}
          >
            <svg width="18" height="18" viewBox="0 0 48 48" style={{ flexShrink: 0 }}>
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
              <path fill="none" d="M0 0h48v48H0z" />
            </svg>
            Continue with Google
          </button>

          {/* Divider */}
          <div className="auth-divider">
            <div className="auth-divider-line" />
            <span className="auth-divider-text">or</span>
            <div className="auth-divider-line" />
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleSubmit}>
            {mode === 'signup' && (
              <div className="auth-input-group">
                <label className="auth-label">Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="auth-input"
                />
              </div>
            )}

            <div className="auth-input-group">
              <label className="auth-label">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="auth-input"
              />
            </div>

            <div className="auth-input-group">
              <label className="auth-label">Password</label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 6 characters"
                className="auth-input"
              />
            </div>

            {error && (
              <div className="auth-error-container">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !isOnline}
              className="auth-submit-button"
              title={!isOnline ? 'Sign-up requires internet' : undefined}
            >
              {loading ? (
                <span className="auth-loading-spinner">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83" />
                  </svg>
                  Please wait…
                </span>
              ) : mode === 'login' ? (
                'Log in'
              ) : (
                'Create account'
              )}
            </button>

            {/* Offline login note */}
            {!isOnline && mode === 'login' && (
              <p style={{ fontSize: '12px', color: 'rgba(245,166,35,0.8)', fontFamily: 'monospace', marginTop: '10px', textAlign: 'center' }}>
                Note: login requires a server connection. If you were previously logged in, reopen the app.
              </p>
            )}
          </form>

          {/* Footer */}
          <div className="auth-footer">
            {mode === 'login' ? (
              <p className="auth-footer-text">
                Don&apos;t have an account?{' '}
                <button onClick={() => setMode('signup')} className="auth-footer-link">
                  Sign up
                </button>
              </p>
            ) : (
              <p className="auth-footer-text">
                Already have an account?{' '}
                <button onClick={() => setMode('login')} className="auth-footer-link">
                  Log in
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="auth-feature-card">
      <div className="auth-feature-icon">{icon}</div>
      <div className="auth-feature-content">
        <div className="auth-feature-title">{title}</div>
        <div className="auth-feature-description">{description}</div>
      </div>
    </div>
  );
}
