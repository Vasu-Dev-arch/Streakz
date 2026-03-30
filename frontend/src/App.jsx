import React, { useState, useRef, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { TodayView } from './components/TodayView';
import { AnalyticsView } from './components/AnalyticsView';
import { HeatmapView } from './components/HeatmapView';
import { SettingsView } from './components/SettingsView';
import { HabitModal } from './components/HabitModal';
import { ConfirmModal } from './components/ConfirmModal';
import { AuthPage } from './components/AuthPage';
import { AuthCallbackPage } from './components/AuthCallbackPage';
import { useAuth } from './hooks/useAuth';
import { useHabits } from './hooks/useHabits';
import { DAYS, MONTHS } from './constants';

// ── Profile avatar + dropdown ─────────────────────────────────────────────────
function ProfileMenu({ user, onSettings, onLogout }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const initials = user?.name
    ? user.name.trim().split(/\s+/).map((w) => w[0].toUpperCase()).slice(0, 2).join('')
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
          transition: 'background 0.15s',
          flexShrink: 0,
        }}
      >
        {initials}
      </button>

      {open && (
        <div style={{
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
        }}>
          {user?.name && (
            <div style={{
              padding: '8px 10px 10px',
              borderBottom: '1px solid var(--border)',
              marginBottom: '4px',
            }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>
                {user.name}
              </div>
              {user?.email && (
                <div style={{ fontSize: '11px', color: 'var(--text3)', fontFamily: 'var(--mono)', marginTop: '2px' }}>
                  {user.email}
                </div>
              )}
            </div>
          )}

          <button onClick={() => { setOpen(false); onSettings(); }} style={menuItemStyle}>
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}>
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
            </svg>
            Settings
          </button>

          <div style={{ height: '1px', background: 'var(--border)', margin: '4px 0' }} />

          <button onClick={() => { setOpen(false); onLogout(); }} style={{ ...menuItemStyle, color: 'var(--red)' }}>
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}>
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>
            </svg>
            Log out
          </button>
        </div>
      )}
    </div>
  );
}

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

// ── Hamburger icon SVG ────────────────────────────────────────────────────────
function HamburgerIcon() {
  return (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <line x1="3" y1="6"  x2="21" y2="6"  strokeLinecap="round"/>
      <line x1="3" y1="12" x2="21" y2="12" strokeLinecap="round"/>
      <line x1="3" y1="18" x2="21" y2="18" strokeLinecap="round"/>
    </svg>
  );
}

// ── Root ──────────────────────────────────────────────────────────────────────
function App() {
  const { token, user, error, loading, login, signup, loginWithGoogle, handleGoogleCallback, logout } = useAuth();

  const isCallbackPage = window.location.pathname === '/auth/callback';

  if (isCallbackPage) {
    return (
      <AuthCallbackPage
        handleGoogleCallback={handleGoogleCallback}
        onSuccess={() => window.location.replace('/')}
        onFailure={() => window.location.replace('/auth/callback?error=true')}
      />
    );
  }

  if (!token) {
    return (
      <AuthPage
        onLogin={login}
        onSignup={signup}
        onGoogleLogin={loginWithGoogle}
        error={error}
        loading={loading}
      />
    );
  }

  return <AuthenticatedApp token={token} user={user} onLogout={logout} />;
}

// ── Authenticated shell ───────────────────────────────────────────────────────
function AuthenticatedApp({ token, user, onLogout }) {
  const [activeView, setActiveView] = useState('today');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [habitToDelete, setHabitToDelete] = useState(null);

  // Close sidebar on Escape key
  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') setSidebarOpen(false); }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  // Prevent body scroll when sidebar drawer is open on mobile
  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [sidebarOpen]);

  const {
    habits, completions, dailyGoal, reminderTime, categories,
    toggleHabit, addHabit, updateHabit, deleteHabit,
    updateDailyGoal, updateReminderTime, addCategory,
  } = useHabits(token);

  const handleAddHabit = () => { setEditingHabit(null); setIsModalOpen(true); };

  const handleEditHabit = (id) => {
    const habit = habits.find((h) => h.id === id);
    if (habit) { setEditingHabit(habit); setIsModalOpen(true); }
  };

  const handleDeleteHabit = (id) => {
    setHabitToDelete(id);
  };

  const confirmDeleteHabit = () => {
    if (habitToDelete) {
      deleteHabit(habitToDelete);
      setHabitToDelete(null);
    }
  };

  const cancelDeleteHabit = () => {
    setHabitToDelete(null);
  };

  const handleSaveHabit = async (habitData) => {
    try {
      if (editingHabit) {
        await updateHabit(editingHabit.id, habitData);
      } else {
        await addHabit(habitData);
      }
      setIsModalOpen(false);
      setEditingHabit(null);
    } catch { /* logged in useHabits */ }
  };

  const handleAddCategory = async (name) => {
    try { await addCategory(name); } catch { /* logged in useHabits */ }
  };

  const getViewTitle = () => {
    switch (activeView) {
      case 'today':     return 'Today';
      case 'analytics': return 'Analytics';
      case 'calendar':  return 'Heatmap';
      case 'settings':  return 'Settings';
      default:          return 'Today';
    }
  };

  const getFormattedDate = () => {
    const d = new Date();
    return `${DAYS[d.getDay()]}, ${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
  };

  const renderView = () => {
    switch (activeView) {
      case 'today':
        return (
          <TodayView
            habits={habits}
            completions={completions}
            dailyGoal={dailyGoal}
            reminderTime={reminderTime}
            categories={categories}
            onToggleHabit={toggleHabit}
            onEditHabit={handleEditHabit}
            onDeleteHabit={handleDeleteHabit}
            onGoalChange={updateDailyGoal}
            onReminderChange={updateReminderTime}
          />
        );
      case 'analytics': return <AnalyticsView habits={habits} completions={completions} />;
      case 'calendar':  return <HeatmapView habits={habits} completions={completions} />;
      case 'settings':  return <SettingsView />;
      default:          return null;
    }
  };

  return (
    <div className="app">
      {/* Overlay backdrop — only active on mobile when sidebar is open */}
      <div
        className={`sidebar-overlay${sidebarOpen ? ' sidebar--open' : ''}`}
        onClick={() => setSidebarOpen(false)}
        aria-hidden="true"
      />

      <Sidebar
        habits={habits}
        completions={completions}
        activeView={activeView}
        onViewChange={setActiveView}
        onAddHabit={handleAddHabit}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="main">
        <div className="main-header">
          {/* Left side: hamburger (mobile) + title */}
          <div className="header-left">
            <button
              className="hamburger"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              <HamburgerIcon />
            </button>
            <div className="header-title-block">
              <div className="main-title">{getViewTitle()}</div>
              <div className="main-date">{getFormattedDate()}</div>
            </div>
          </div>

          {/* Right side: actions */}
          <div className="header-actions">
            <button className="btn-sm" onClick={handleAddHabit}>+ New Habit</button>
            <ProfileMenu
              user={user}
              onSettings={() => setActiveView('settings')}
              onLogout={onLogout}
            />
          </div>
        </div>

        <div className="content-area">{renderView()}</div>
      </main>

      <HabitModal
        isOpen={isModalOpen}
        habit={editingHabit}
        categories={categories}
        onSave={handleSaveHabit}
        onClose={() => { setIsModalOpen(false); setEditingHabit(null); }}
        onAddCategory={handleAddCategory}
      />

      <ConfirmModal
        isOpen={habitToDelete !== null}
        title="Delete Habit"
        message="Are you sure you want to delete this habit? All completion data will be lost."
        onConfirm={confirmDeleteHabit}
        onCancel={cancelDeleteHabit}
      />
    </div>
  );
}

export default App;
