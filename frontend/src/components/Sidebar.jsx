import React from 'react';
import { getStreak } from '../utils/dateUtils';

/**
 * Sidebar component with navigation and habits list
 */
export function Sidebar({ habits, completions, activeView, onViewChange, onAddHabit }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-mark">◆ Streakz</div>
        <div className="logo-sub">Habit Analytics</div>
      </div>
      
      <div className="sidebar-section-label">Navigate</div>
      <ul className="nav-list">
        <li 
          className={`nav-item ${activeView === 'today' ? 'active' : ''}`}
          onClick={() => onViewChange('today')}
        >
          <span className="nav-icon">
            <svg
              width="16"
              height="16"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </span>
          Today
        </li>
        <li 
          className={`nav-item ${activeView === 'analytics' ? 'active' : ''}`}
          onClick={() => onViewChange('analytics')}
        >
          <span className="nav-icon">
            <svg
              width="16"
              height="16"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
          </span>
          Analytics
        </li>
        <li 
          className={`nav-item ${activeView === 'calendar' ? 'active' : ''}`}
          onClick={() => onViewChange('calendar')}
        >
          <span className="nav-icon">
            <svg
              width="16"
              height="16"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <path d="M8 2v4M16 2v4M3 10h18" />
            </svg>
          </span>
          Heatmap
        </li>
        <li 
          className={`nav-item ${activeView === 'settings' ? 'active' : ''}`}
          onClick={() => onViewChange('settings')}
        >
          <span className="nav-icon">
            <svg
              width="16"
              height="16"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </span>
          Settings
        </li>
      </ul>
      
      <div className="sidebar-section-label">My Habits</div>
      <div className="habit-sidebar-list">
        {habits.length === 0 ? (
          <div style={{ padding: '8px 12px', fontSize: '12px', color: 'var(--text3)', fontFamily: 'var(--mono)' }}>
            No habits yet
          </div>
        ) : (
          habits.map((habit) => {
            const streak = getStreak(habit.id, completions);
            return (
              <div 
                key={habit.id} 
                className="habit-sidebar-item"
                onClick={() => onViewChange('today')}
              >
                <span className="habit-dot" style={{ background: habit.color }}></span>
                <span className="habit-sidebar-name">{habit.emoji} {habit.name}</span>
                <span className="habit-sidebar-streak">
                  {streak > 0 ? `🔥${streak}` : ''}
                </span>
              </div>
            );
          })
        )}
      </div>
      
      <button className="sidebar-btn" onClick={onAddHabit}>
        + Add habit
      </button>
    </aside>
  );
}
