'use client';

/**
 * AiCoachPageClient
 *
 * Consumes HabitsContext and renders the existing AiCoachView.
 * All AI Coach state is stored in DashboardShell so it persists
 * across navigations within the dashboard.
 */

import { useHabitsContext } from '../../context/HabitsContext';
import { AiCoachView } from '../AiCoachView';

export function AiCoachPageClient() {
  const {
    addHabit,
    categories,
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
  } = useHabitsContext();

  return (
    <AiCoachView
      onAddHabit={addHabit}
      categories={categories}
      goal={aiCoachGoal}
      setGoal={setAiCoachGoal}
      plan={aiCoachPlan}
      setPlan={setAiCoachPlan}
      loading={aiCoachLoading}
      setLoading={setAiCoachLoading}
      error={aiCoachError}
      setError={setAiCoachError}
      addedIndexes={aiCoachAddedIndexes}
      setAddedIndexes={setAiCoachAddedIndexes}
      addingAll={aiCoachAddingAll}
      setAddingAll={setAiCoachAddingAll}
      allAdded={aiCoachAllAdded}
      setAllAdded={setAiCoachAllAdded}
      onReset={resetAiCoachState}
    />
  );
}
