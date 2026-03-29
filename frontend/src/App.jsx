import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { TodayView } from './components/TodayView';
import { AnalyticsView } from './components/AnalyticsView';
import { HeatmapView } from './components/HeatmapView';
import { SettingsView } from './components/SettingsView';
import { HabitModal } from './components/HabitModal';
import { useHabits } from './hooks/useHabits';
import { DAYS, MONTHS } from './constants';

/**
 * Main App component
 */
function App() {
  const [activeView, setActiveView] = useState('today');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);

  const {
    habits,
    completions,
    dailyGoal,
    reminderTime,
    categories,
    toggleHabit,
    addHabit,
    updateHabit,
    deleteHabit,
    updateDailyGoal,
    updateReminderTime,
    addCategory,
  } = useHabits();

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

  const handleDeleteHabit = (id) => {
    if (window.confirm('Delete this habit? All completion data will be lost.')) {
      deleteHabit(id);
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
      // Errors logged in useHabits; keep modal open so user can retry
    }
  };

  const handleAddCategory = async (categoryName) => {
    try {
      await addCategory(categoryName);
    } catch {
      // Errors logged in useHabits
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingHabit(null);
  };

  const getViewTitle = () => {
    switch (activeView) {
      case 'today':
        return 'Today';
      case 'analytics':
        return 'Analytics';
      case 'calendar':
        return 'Heatmap';
      case 'settings':
        return 'Settings';
      default:
        return 'Today';
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
      case 'analytics':
        return (
          <AnalyticsView
            habits={habits}
            completions={completions}
          />
        );
      case 'calendar':
        return (
          <HeatmapView
            habits={habits}
            completions={completions}
          />
        );
      case 'settings':
        return <SettingsView />;
      default:
        return null;
    }
  };

  return (
    <div className="app">
      <Sidebar
        habits={habits}
        completions={completions}
        activeView={activeView}
        onViewChange={setActiveView}
        onAddHabit={handleAddHabit}
      />

      <main className="main">
        <div className="main-header">
          <div>
            <div className="main-title">{getViewTitle()}</div>
            <div className="main-date">{getFormattedDate()}</div>
          </div>
          <div className="header-actions">
            <button className="btn-sm" onClick={handleAddHabit}>
              + New Habit
            </button>
          </div>
        </div>

        <div className="content-area">
          {renderView()}
        </div>
      </main>

      <HabitModal
        isOpen={isModalOpen}
        habit={editingHabit}
        categories={categories}
        onSave={handleSaveHabit}
        onClose={handleCloseModal}
        onAddCategory={handleAddCategory}
      />
    </div>
  );
}

export default App;
