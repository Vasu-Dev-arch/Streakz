import React from 'react';
import { getStreak, getLast14, todayKey } from '../utils/dateUtils';

/**
 * Habit card component for displaying a single habit
 */
export function HabitCard({ habit, completions, onToggle, onEdit, onDelete }) {
  const tk = todayKey();
  const isDone = completions[tk]?.has(habit.id);
  const streak = getStreak(habit.id, completions);
  const last14 = getLast14(habit.id, completions);

  const handleToggle = (e) => {
    e.stopPropagation();
    onToggle(habit.id);
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    onEdit(habit.id);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete(habit.id);
  };

  return (
    <div 
      className={`habit-card${isDone ? ' done' : ''}`}
      onClick={handleToggle}
    >
      <div className="habit-card-top">
        <span className="habit-emoji">{habit.emoji}</span>
        <div 
          className={`habit-check${isDone ? ' checked' : ''}`}
          style={isDone ? { background: 'var(--green)', borderColor: 'var(--green)' } : {}}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <polyline 
              points="2,6 5,9 10,3" 
              stroke="white" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
      
      <div className="habit-name">{habit.name}</div>
      
      <div className="habit-meta">
        {streak > 0 ? (
          <span className="habit-streak-badge">🔥 {streak} day streak</span>
        ) : (
          <span className="habit-freq" style={{ color: 'var(--text3)' }}>No streak yet</span>
        )}
        {habit.category && (
          <span className="habit-category">{habit.category}</span>
        )}
      </div>
      
      <div className="habit-heatmap">
        {last14.map((v, i) => (
          <div 
            key={i}
            className={`heatmap-cell${v ? ' done' : ''}${v && i === 13 ? ' today' : ''}`}
          ></div>
        ))}
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px', gap: '6px' }}>
        <button 
          onClick={handleEdit}
          style={{ 
            background: 'none', 
            border: 'none', 
            color: 'var(--text3)', 
            cursor: 'pointer', 
            fontSize: '12px', 
            fontFamily: 'var(--mono)' 
          }}
        >
          edit
        </button>
        <button 
          onClick={handleDelete}
          style={{ 
            background: 'none', 
            border: 'none', 
            color: 'var(--red)', 
            cursor: 'pointer', 
            fontSize: '12px', 
            fontFamily: 'var(--mono)', 
            opacity: 0.5 
          }}
        >
          delete
        </button>
      </div>
    </div>
  );
}
