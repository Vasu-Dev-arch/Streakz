'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { HabitModal } from './HabitModal';
import { ConfirmModal } from './ConfirmModal';
import { FirstHabitPrompt } from './FirstHabitPrompt';
import { ProfileMenu } from './ProfileMenu';
import { PWAInstallBanner } from './PWAInstallBanner';
import { useAuth } from '../hooks/useAuth';
import { useHabits } from '../hooks/useHabits';
import { useTodos } from '../hooks/useTodos';
import { HabitsContext } from '../context/HabitsContext';
import { TodosContext } from '../context/TodosContext';
import { DAYS, MONTHS } from '../constants';

function pathnameToView(pathname) {
  if (pathname === '/dashboard' || pathname === '/dashboard/') return 'today';
  const seg = pathname.split('/')[2];
  return seg ?? 'today';
}

function HamburgerIcon() {
  return (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
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

  const [authReady, setAuthReady] = useState(false);
  useEffect(() => { setAuthReady(true); }, []);

  useEffect(() => {
    if (authReady && !token) router.replace('/auth');
  }, [authReady, token, router]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [habitToDelete, setHabitToDelete] = useState(null);
  const [showFirstHabitPrompt, setShowFirstHabitPrompt] = useState(false);
  const promptTimerRef = useRef(null);

  // AI Coach persisted state
  const [aiCoachGoal, setAiCoachGoal] = useState('');
  const [aiCoachPlan, setAiCoachPlan] = useState(null);
  const [aiCoachLoading, setAiCoachLoading] = useState(false);
  const [aiCoachError, setAiCoachError] = useState(null);
  const [aiCoachAddedIndexes, setAiCoachAddedIndexes] = useState(new Set());
  const [aiCoachAddingAll, setAiCoachAddingAll] = useState(false);
  const [aiCoachAllAdded, setAiCoachAllAdded] = useState(false);

  const {
    habits,
    completions,
    dailyGoal,
    reminderTime,
    categories,
    loading,
    toggleHabit,
    toggleHabitForDate,
    addHabit,
    updateHabit,
    deleteHabit,
    updateDailyGoal,
    updateReminderTime,
    addCategory,
  } = useHabits(token);

  const {
    todos,
    loading: todosLoading,
    addTodo,
    updateTodo,
    toggleTodo,
    deleteTodo,
  } = useTodos(token);

  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') setSidebarOpen(false); }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [sidebarOpen]);

  useEffect(() => {
    clearTimeout(promptTimerRef.current);
    if (token && user === null) return;
    if (loading) return;
    if (firstHabitPromptShown) return;
    if (habits.length > 0) return;
    promptTimerRef.current = setTimeout(() => setShowFirstHabitPrompt(true), 600);
    return () => clearTimeout(promptTimerRef.current);
  }, [loading, firstHabitPromptShown, habits.length, token, user]);

  useEffect(() => {
    if (habits.length > 0 && !firstHabitPromptShown) {
      markFirstHabitPromptShown();
    }
  }, [habits.length, firstHabitPromptShown, markFirstHabitPromptShown]);

  useEffect(() => () => clearTimeout(promptTimerRef.current), []);

  const handleAddHabit = () => { setEditingHabit(null); setIsModalOpen(true); };

  const handleEditHabit = (id) => {
    const habit = habits.find((h) => h.id === id);
    if (habit) { setEditingHabit(habit); setIsModalOpen(true); }
  };

  const handleSaveHabit = async (habitData) => {
    try {
      if (editingHabit) { await updateHabit(editingHabit.id, habitData); }
      else { await addHabit(habitData); }
      setIsModalOpen(false);
      setEditingHabit(null);
    } catch { /* logged in useHabits */ }
  };

  const confirmDeleteHabit = () => {
    if (habitToDelete) { deleteHabit(habitToDelete); setHabitToDelete(null); }
  };

  const handleDismissFirstHabitPrompt = async () => {
    setShowFirstHabitPrompt(false);
    await markFirstHabitPromptShown();
  };

  const handleFirstHabitAdd = async () => {
    setShowFirstHabitPrompt(false);
    await markFirstHabitPromptShown();
    setEditingHabit(null);
    setIsModalOpen(true);
  };

  const handleAddCategory = async (name) => {
    try { await addCategory(name); } catch { /* logged */ }
  };

  const resetAiCoachState = () => {
    setAiCoachGoal('');
    setAiCoachPlan(null);
    setAiCoachAllAdded(false);
    setAiCoachAddedIndexes(new Set());
    setAiCoachError(null);
  };

  const activeView = pathnameToView(pathname);

  const VIEW_TITLES = {
    today: 'Today',
    analytics: 'Analytics',
    heatmap: 'Heatmap',
    goals: 'Goals',
    journal: 'Journal',
    'ai-coach': 'AI Coach',
    settings: 'Settings',
    todo: 'To-Do',
  };

  const getFormattedDate = () => {
    const d = new Date();
    return `${DAYS[d.getDay()]}, ${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
  };

  const handleViewChange = (view) => {
    router.push(view === 'today' ? '/dashboard' : `/dashboard/${view}`);
  };

  const habitsContextValue = {
    habits,
    completions,
    dailyGoal,
    reminderTime,
    categories,
    loading,
    toggleHabit,
    toggleHabitForDate,
    addHabit,
    updateHabit,
    deleteHabit,
    updateDailyGoal,
    updateReminderTime,
    addCategory: handleAddCategory,
    onEditHabit: handleEditHabit,
    onDeleteHabit: (id) => setHabitToDelete(id),
    onNavigateToAiCoach: () => router.push('/dashboard/ai-coach'),
    aiCoachGoal, setAiCoachGoal,
    aiCoachPlan, setAiCoachPlan,
    aiCoachLoading, setAiCoachLoading,
    aiCoachError, setAiCoachError,
    aiCoachAddedIndexes, setAiCoachAddedIndexes,
    aiCoachAddingAll, setAiCoachAddingAll,
    aiCoachAllAdded, setAiCoachAllAdded,
    resetAiCoachState,
  };

  const todosContextValue = {
    todos,
    loading: todosLoading,
    addTodo,
    updateTodo,
    toggleTodo,
    deleteTodo,
  };

  if (!authReady) return null;
  if (!token) return null;

  return (
    <div className="app">
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
        onAddHabit={handleAddHabit}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="main">
        <div className="main-header">
          <div className="header-left">
            <button
              className="hamburger"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              <HamburgerIcon />
            </button>
            <div className="header-title-block">
              <div className="main-title">{VIEW_TITLES[activeView] ?? 'Today'}</div>
              <div className="main-date">{getFormattedDate()}</div>
            </div>
          </div>

          <div className="header-actions">
            <button
              className={`btn-sm ai-coach-header-btn${activeView === 'ai-coach' ? ' active' : ''}`}
              onClick={() => router.push('/dashboard/ai-coach')}
              title="AI Habit Coach"
              style={activeView === 'ai-coach' ? { color: 'var(--accent2)', borderColor: 'rgba(124,106,247,0.4)' } : {}}
            >
              ✦ AI Coach
            </button>
            <button className="btn-sm" onClick={handleAddHabit}>+ New Habit</button>
            <ProfileMenu
              user={user}
              onSettings={() => router.push('/dashboard/settings')}
              onLogout={() => { logout(); router.replace('/auth'); }}
            />
          </div>
        </div>

        <div className="content-area">
          <HabitsContext.Provider value={habitsContextValue}>
            <TodosContext.Provider value={todosContextValue}>
              {children}
            </TodosContext.Provider>
          </HabitsContext.Provider>
        </div>
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
        onCancel={() => setHabitToDelete(null)}
      />

      <FirstHabitPrompt
        isOpen={showFirstHabitPrompt}
        onAddHabit={handleFirstHabitAdd}
        onLater={handleDismissFirstHabitPrompt}
      />

      <PWAInstallBanner />
    </div>
  );
}
