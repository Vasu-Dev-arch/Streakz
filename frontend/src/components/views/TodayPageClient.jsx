'use client';

/**
 * TodayPageClient
 *
 * Consumes HabitsContext and TodosContext provided by DashboardShell.
 * Passes todos down to TodayView for the compact widget.
 */

import { useHabitsContext } from '../../context/HabitsContext';
import { useTodosContext } from '../../context/TodosContext';
import { TodayView } from '../TodayView';

export function TodayPageClient() {
  const {
    habits,
    completions,
    dailyGoal,
    reminderTime,
    categories,
    toggleHabit,
    toggleHabitForDate,
    onEditHabit,
    onDeleteHabit,
    updateDailyGoal,
    updateReminderTime,
    onNavigateToAiCoach,
  } = useHabitsContext();

  const { todos, toggleTodo } = useTodosContext();

  return (
    <TodayView
      habits={habits}
      completions={completions}
      dailyGoal={dailyGoal}
      reminderTime={reminderTime}
      categories={categories}
      onToggleHabit={toggleHabit}
      onToggleHabitForDate={toggleHabitForDate}
      onEditHabit={onEditHabit}
      onDeleteHabit={onDeleteHabit}
      onGoalChange={updateDailyGoal}
      onReminderChange={updateReminderTime}
      onNavigateToAiCoach={onNavigateToAiCoach}
      todos={todos}
      onToggleTodo={toggleTodo}
    />
  );
}
