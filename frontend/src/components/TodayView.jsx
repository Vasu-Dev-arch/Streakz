import React, { useState } from 'react';
import { StatsRow } from './StatsRow';
import { HabitCard } from './HabitCard';
import { CategoryFilter } from './CategoryFilter';
import { GoalCard } from './GoalCard';
import { ReminderCard } from './ReminderCard';
import { todayKey } from '../utils/dateUtils';

/**
 * Today view component showing today's habits and statistics
 */
export function TodayView({ 
  habits, 
  completions, 
  dailyGoal, 
  reminderTime,
  categories,
  onToggleHabit, 
  onEditHabit, 
  onDeleteHabit,
  onGoalChange,
  onReminderChange
}) {
  const [activeCategory, setActiveCategory] = useState('All');
  const tk = todayKey();

  const filteredHabits = activeCategory === 'All' 
    ? habits 
    : habits.filter(h => h.category === activeCategory);

  const done = filteredHabits.filter((h) => completions[tk]?.has(h.id)).length;

  return (
    <div className="view active">
      <StatsRow habits={habits} completions={completions} />
      
      <div className="goal-reminder-row">
        <GoalCard 
          habits={habits}
          completions={completions}
          dailyGoal={dailyGoal}
          onGoalChange={onGoalChange}
        />
        <ReminderCard 
          habits={habits}
          completions={completions}
          reminderTime={reminderTime}
          onReminderChange={onReminderChange}
        />
      </div>
      
      <div className="section-header">
        <span className="section-title">Habits</span>
        <span style={{ fontSize: '12px', color: 'var(--text3)', fontFamily: 'var(--mono)' }}>
          {done} / {filteredHabits.length} complete
        </span>
      </div>
      
      <CategoryFilter 
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
        categories={categories}
      />
      
      <div className="habits-grid">
        {filteredHabits.length === 0 ? (
          <div className="empty-state" style={{ gridColumn: '1/-1' }}>
            <div className="empty-icon">🌱</div>
            <div className="empty-text">No habits yet</div>
            <div className="empty-sub">Add your first habit to get started</div>
          </div>
        ) : (
          filteredHabits.map((habit) => (
            <HabitCard
              key={habit.id}
              habit={habit}
              completions={completions}
              onToggle={onToggleHabit}
              onEdit={onEditHabit}
              onDelete={onDeleteHabit}
            />
          ))
        )}
      </div>
    </div>
  );
}
