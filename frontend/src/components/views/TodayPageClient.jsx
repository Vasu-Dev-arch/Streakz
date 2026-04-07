'use client';

/**
 * TodayPageClient
 *
 * Consumes HabitsContext provided by DashboardShell and renders
 * the existing TodayView component. No business logic lives here.
 */

import { useHabitsContext } from '../../context/HabitsContext';
import { TodayView } from '../TodayView';

export function TodayPageClient() {
  const {
    habits,
    completions,
    dailyGoal,
    reminderTime,
    categories,
    toggleHabit,
    onEditHabit,
    onDeleteHabit,
    updateDailyGoal,
    updateReminderTime,
    onNavigateToAiCoach,
  } = useHabitsContext();

  return (
    <TodayView
      habits={habits}
      completions={completions}
      dailyGoal={dailyGoal}
      reminderTime={reminderTime}
      categories={categories}
      onToggleHabit={toggleHabit}
      onEditHabit={onEditHabit}
      onDeleteHabit={onDeleteHabit}
      onGoalChange={updateDailyGoal}
      onReminderChange={updateReminderTime}
      onNavigateToAiCoach={onNavigateToAiCoach}
    />
  );
}
