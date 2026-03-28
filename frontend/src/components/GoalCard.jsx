import React from 'react';
import { todayKey } from '../utils/dateUtils';

/**
 * Goal card component for setting and tracking daily goals
 */
export function GoalCard({ habits, completions, dailyGoal, onGoalChange }) {
  const tk = todayKey();
  const done = habits.filter((h) => completions[tk]?.has(h.id)).length;
  
  const handleGoalChange = (e) => {
    const value = parseInt(e.target.value) || 3;
    onGoalChange(value);
  };

  return (
    <div className="goal-card">
      <div className="goal-label">Daily Goal</div>
      <div className="goal-progress">{done}/{dailyGoal}</div>
      <div className={`goal-message${done >= dailyGoal ? ' success' : ''}`}>
        {done >= dailyGoal ? 'Goal completed' : 'Keep going'}
      </div>
      <div style={{ marginTop: '10px' }}>
        <label className="form-label" style={{ marginBottom: '4px' }}>Habits per day</label>
        <input
          type="number"
          className="goal-input"
          min="1"
          max="20"
          value={dailyGoal}
          onChange={handleGoalChange}
        />
      </div>
    </div>
  );
}
