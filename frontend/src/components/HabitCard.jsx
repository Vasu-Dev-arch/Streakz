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
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '4px',
            transition: 'background 0.15s'
          }}
          title="Edit habit"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
        </button>
        <button 
          onClick={handleDelete}
          style={{ 
            background: 'none', 
            border: 'none', 
            color: 'var(--red)', 
            cursor: 'pointer', 
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '4px',
            transition: 'background 0.15s',
            opacity: 0.5 
          }}
          title="Delete habit"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            <line x1="10" y1="11" x2="10" y2="17"/>
            <line x1="14" y1="11" x2="14" y2="17"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
