'use client';

/**
 * DashboardShell
 *
 * Replaces the old AuthenticatedApp component.
 * Responsibilities:
 *   - Auth guard: redirects to /auth when no token is present
 *   - Loads all habit data via useHabits
 *   - Renders the Sidebar + main-header shell
 *   - Provides HabitsContext to child pages
 *   - Manages overlay modals (HabitModal, ConfirmModal, FirstHabitPrompt)
 *
 * Navigation is now handled by Next.js router; the active "view" is derived
 * from the current pathname rather than a local state variable.
 */

import { useState, useRef, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { HabitModal } from './HabitModal';
import { ConfirmModal } from './ConfirmModal';
import { FirstHabitPrompt } from './FirstHabitPrompt';
import { ProfileMenu } from './ProfileMenu';
import { useAuth } from '../hooks/useAuth';
import { useHabits } from '../hooks/useHabits';
import { HabitsContext } from '../context/HabitsContext';
import { DAYS, MONTHS } from '../constants';

// Derive a simple view key from the pathname so the Sidebar can highlight
// the correct item and the header can show the right title.
function pathnameToView(pathname) {
  if (pathname === '/dashboard' || pathname === '/dashboard/') return 'today';
  const seg = pathname.split('/')[2]; // e.g. "analytics"
  return seg ?? 'today';
}

function HamburgerIcon() {
  return (
    <svg
      width="18"
      height="18"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
    >
      <line x1="3" y1="6" x2="21" y2="6" strokeLinecap="round" />
      <line x1="3" y1="12" x2="21" y2="12" strokeLinecap="round" />
      <line x1="3" y1="18" x2="21" y2="18" strokeLinecap="round" />
    </svg>
  );
}

export function DashboardShell({ children }) {
  const router = useRouter();
  const pathname = usePathname();

  const {
    token,
    user,
    firstHabitPromptShown,
    markFirstHabitPromptShown,
    logout,
  } = useAuth();

  // ── Auth guard ──────────────────────────────────────────────────────────────
  // On the very first render token may still be null while localStorage is read.
  // We use a "ready" flag so we don't flash a redirect before hydration.
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    setAuthReady(true);
  }, []);

  useEffect(() => {
    if (authReady && !token) {
      router.replace('/auth');
    }
  }, [authReady, token, router]);

  // ── Modal state ─────────────────────────────────────────────────────────────
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [habitToDelete, setHabitToDelete] = useState(null);

  // ── First-habit prompt ──────────────────────────────────────────────────────
  const [showFirstHabitPrompt, setShowFirstHabitPrompt] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const promptTimerRef = useRef(null);

  // ── AI Coach state (persists across navigations inside the shell) ───────────
  const [aiCoachGoal, setAiCoachGoal] = useState('');
  const [aiCoachPlan, setAiCoachPlan] = useState(null);
  const [aiCoachLoading, setAiCoachLoading] = useState(false);
  const [aiCoachError, setAiCoachError] = useState(null);
  const [aiCoachAddedIndexes, setAiCoachAddedIndexes] = useState(new Set());
  const [aiCoachAddingAll, setAiCoachAddingAll] = useState(false);
  const [aiCoachAllAdded, setAiCoachAllAdded] = useState(false);

  // ── Habits data ─────────────────────────────────────────────────────────────
  const {
    habits,
    completions,
    dailyGoal,
    reminderTime,
    categories,
    loading,
    toggleHabit,
    addHabit,
    updateHabit,
    deleteHabit,
    updateDailyGoal,
    updateReminderTime,
    addCategory,
  } = useHabits(token);

  // ── Keyboard / scroll side-effects ─────────────────────────────────────────
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') setSidebarOpen(false);
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [sidebarOpen]);

  // ── localStorage dontShowAgain (client-only) ────────────────────────────────
  useEffect(() => {
    setDontShowAgain(
      localStorage.getItem('firstHabitPromptDismissed') === 'true'
    );
  }, []);

  // ── First-habit prompt trigger ──────────────────────────────────────────────
  useEffect(() => {
    if (loading) return;
    if (dontShowAgain) return;
    if (!firstHabitPromptShown && habits.length === 0) {
      promptTimerRef.current = setTimeout(
        () => setShowFirstHabitPrompt(true),
        600
      );
    }
    return () => clearTimeout(promptTimerRef.current);
  }, [firstHabitPromptShown, habits.length, loading, dontShowAgain]);

  useEffect(() => {
    if (habits.length > 0 && !firstHabitPromptShown) {
      markFirstHabitPromptShown();
    }
  }, [habits.length, firstHabitPromptShown, markFirstHabitPromptShown]);

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleAddHabit = () => {
    setEditingHabit(null);
    setIsModalOpen(true);
  };

  const handleEditHabit = (id) => {
    const habit = habits.find((h) => h.id === id);
    if (habit) {
      setEditingHabit(habit);
      setIsModalOpen(true);
    }
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
    } catch {
      /* errors logged in useHabits */
    }
  };

  const confirmDeleteHabit = () => {
    if (habitToDelete) {
      deleteHabit(habitToDelete);
      setHabitToDelete(null);
    }
  };

  const handleDismissFirstHabitPrompt = async () => {
    setShowFirstHabitPrompt(false);
    await markFirstHabitPromptShown();
  };

  const handleDontShowAgain = async () => {
    setShowFirstHabitPrompt(false);
    setDontShowAgain(true);
    localStorage.setItem('firstHabitPromptDismissed', 'true');
    await markFirstHabitPromptShown();
  };

  const handleFirstHabitAdd = async () => {
    setShowFirstHabitPrompt(false);
    await markFirstHabitPromptShown();
    setEditingHabit(null);
    setIsModalOpen(true);
  };

  const handleAddCategory = async (name) => {
    try {
      await addCategory(name);
    } catch {
      /* logged in useHabits */
    }
  };

  const resetAiCoachState = () => {
    setAiCoachGoal('');
    setAiCoachPlan(null);
    setAiCoachAllAdded(false);
    setAiCoachAddedIndexes(new Set());
    setAiCoachError(null);
  };

  // ── View helpers ────────────────────────────────────────────────────────────
  const activeView = pathnameToView(pathname);

  const VIEW_TITLES = {
    today: 'Today',
    analytics: 'Analytics',
    heatmap: 'Heatmap',
    'ai-coach': 'AI Coach',
    settings: 'Settings',
  };

  const getFormattedDate = () => {
    const d = new Date();
    return `${DAYS[d.getDay()]}, ${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
  };

  const handleViewChange = (view) => {
    const path = view === 'today' ? '/dashboard' : `/dashboard/${view}`;
    router.push(path);
  };

  // ── Context value passed to child pages ─────────────────────────────────────
  const habitsContextValue = {
    habits,
    completions,
    dailyGoal,
    reminderTime,
    categories,
    loading,
    toggleHabit,
    addHabit,
    updateHabit,
    deleteHabit,
    updateDailyGoal,
    updateReminderTime,
    addCategory: handleAddCategory,
    onEditHabit: handleEditHabit,
    onDeleteHabit: (id) => setHabitToDelete(id),
    onNavigateToAiCoach: () => router.push('/dashboard/ai-coach'),
    // AI Coach state
    aiCoachGoal,
    setAiCoachGoal,
    aiCoachPlan,
    setAiCoachPlan,
    aiCoachLoading,
    setAiCoachLoading,
    aiCoachError,
    setAiCoachError,
    aiCoachAddedIndexes,
    setAiCoachAddedIndexes,
    aiCoachAddingAll,
    setAiCoachAddingAll,
    aiCoachAllAdded,
    setAiCoachAllAdded,
    resetAiCoachState,
  };

  // Don't render the shell at all until we know auth state
  if (!authReady) return null;
  if (!token) return null; // router.replace('/auth') is in flight

  return (
    <div className="app">
      {/* Mobile sidebar overlay */}
      <div
        className={`sidebar-overlay${sidebarOpen ? ' sidebar--open' : ''}`}
        onClick={() => setSidebarOpen(false)}
        aria-hidden="true"
      />

      <Sidebar
        habits={habits}
        completions={completions}
        activeView={activeView}
        onViewChange={handleViewChange}
        onAddHabit={() => {
          handleAddHabit();
        }}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="main">
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <header className="main-header" role="banner">
          <div className="header-left">
            <button
              className="hamburger"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open navigation menu"
            >
              <HamburgerIcon />
            </button>
            <div className="header-title-block">
              <h1 className="main-title">
                {VIEW_TITLES[activeView] ?? 'Today'}
              </h1>
              <time className="main-date" dateTime={new Date().toISOString()}>{getFormattedDate()}</time>
            </div>
          </div>

          <div className="header-actions" role="navigation" aria-label="Actions">
            <button
              className={`btn-sm ai-coach-header-btn${activeView === 'ai-coach' ? ' active' : ''}`}
              onClick={() => router.push('/dashboard/ai-coach')}
              title="AI Habit Coach"
              aria-label="Open AI Habit Coach"
              style={
                activeView === 'ai-coach'
                  ? {
                      color: 'var(--accent2)',
                      borderColor: 'rgba(124,106,247,0.4)',
                    }
                  : {}
              }
            >
              ✦ AI Coach
            </button>
            <button className="btn-sm" onClick={handleAddHabit} aria-label="Add new habit">
              + New Habit
            </button>
            <ProfileMenu
              user={user}
              onSettings={() => router.push('/dashboard/settings')}
              onLogout={() => {
                logout();
                router.replace('/auth');
              }}
            />
          </div>
        </header>

        {/* ── Page content injected here via Next.js layout system ────────── */}
        <div className="content-area">
          <HabitsContext.Provider value={habitsContextValue}>
            {children}
          </HabitsContext.Provider>
        </div>
      </div>

      {/* ── Overlay modals ─────────────────────────────────────────────────── */}
      <HabitModal
        isOpen={isModalOpen}
        habit={editingHabit}
        categories={categories}
        onSave={handleSaveHabit}
        onClose={() => {
          setIsModalOpen(false);
          setEditingHabit(null);
        }}
        onAddCategory={handleAddCategory}
      />

      <ConfirmModal
        isOpen={habitToDelete !== null}
        title="Delete Habit"
        message="Are you sure you want to delete this habit? All completion data will be lost."
        onConfirm={confirmDeleteHabit}
        onCancel={() => setHabitToDelete(null)}
      />

      <FirstHabitPrompt
        isOpen={showFirstHabitPrompt}
        onAddHabit={handleFirstHabitAdd}
        onLater={handleDismissFirstHabitPrompt}
        onDontShowAgain={handleDontShowAgain}
      />
    </div>
  );
}
