'use client';

import { useState, useCallback } from 'react';
import { getStreak, getLast14, todayKey } from '../utils/dateUtils';
import { HabitIcon } from './HabitIcon';
import { PastDatePicker } from './PastDatePicker';
import { DAY_LETTERS } from '../constants';

/**
 * HabitCard
 *
 * Primary click  → toggle TODAY's completion (unchanged behaviour)
 * Calendar icon  → open PastDatePicker to mark yesterday / day before
 */
export function HabitCard({
  habit,
  completions,
  onToggle,
  onToggleForDate,
  onEdit,
  onDelete,
}) {
  const tk = todayKey();
  const isDone = completions[tk]?.has(habit.id);
  const streak = getStreak(habit.id, completions);
  const last14 = getLast14(habit.id, completions);

  const [pickerOpen, setPickerOpen] = useState(false);

  const handleToggle = (e) => {
    e.stopPropagation();
    // Close picker if open, then toggle today
    setPickerOpen(false);
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

  const handleCalendarClick = (e) => {
    e.stopPropagation();
    setPickerOpen((v) => !v);
  };

  const handlePickerToggle = useCallback(
    (habitId, date) => {
      onToggleForDate(habitId, date);
    },
    [onToggleForDate]
  );

  const frequencyLabel = () => {
    if (!habit.frequencyType || habit.frequencyType === 'daily') return 'Daily';
    if (habit.frequencyType === 'weekly' && habit.daysOfWeek?.length) {
      if (habit.daysOfWeek.length === 7) return 'Daily';
      return habit.daysOfWeek.map((d) => DAY_LETTERS[d]).join(' ');
    }
    return 'Weekly';
  };

  return (
    // position:relative so the picker panel is anchored to this card
    <div
      className={`habit-card${isDone ? ' done' : ''}`}
      onClick={handleToggle}
      style={{ position: 'relative' }}
    >
      <div className="habit-card-top">
        <div
          className="habit-icon-wrapper"
          style={{
            background: isDone ? `${habit.color}22` : 'var(--bg3)',
            borderColor: isDone ? `${habit.color}44` : 'var(--border)',
          }}
        >
          <HabitIcon
            iconId={habit.icon}
            emoji={habit.emoji}
            size={18}
            color={isDone ? habit.color : 'var(--text2)'}
          />
        </div>
        <div
          className={`habit-check${isDone ? ' checked' : ''}`}
          style={isDone ? { background: habit.color, borderColor: habit.color } : {}}
        >
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
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

      {habit.description && (
        <div className="habit-description">{habit.description}</div>
      )}

      <div className="habit-meta">
        {streak > 0 ? (
          <span className="habit-streak-badge">🔥 {streak} day streak</span>
        ) : (
          <span className="habit-freq" style={{ color: 'var(--text3)' }}>
            No streak yet
          </span>
        )}
        {habit.category && (
          <span className="habit-category">{habit.category}</span>
        )}
        <span
          className="habit-freq"
          style={{ marginLeft: 'auto', color: 'var(--text3)', fontSize: '10px' }}
        >
          {frequencyLabel()}
        </span>
      </div>

      <div className="habit-heatmap">
        {last14.map((v, i) => (
          <div
            key={i}
            className={`heatmap-cell${v ? ' done' : ''}${v && i === 13 ? ' today' : ''}`}
            style={v ? { background: habit.color, opacity: i === 13 ? 1 : 0.65 } : {}}
          />
        ))}
      </div>

      {/* Action row */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          marginTop: '10px',
          gap: '4px',
        }}
      >
        {/* ── Past-date picker trigger ── */}
        <button
          onClick={handleCalendarClick}
          className={`habit-action-btn${pickerOpen ? ' habit-action-btn--active' : ''}`}
          title="Mark completion for past days"
          aria-label="Mark completion for past days"
          aria-expanded={pickerOpen}
        >
          {/* Calendar icon */}
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
            <line x1="8" y1="14" x2="8" y2="14" strokeWidth="2.5" />
            <line x1="12" y1="14" x2="12" y2="14" strokeWidth="2.5" />
            <line x1="16" y1="14" x2="16" y2="14" strokeWidth="2.5" />
          </svg>
        </button>

        {/* ── Edit ── */}
        <button
          onClick={handleEdit}
          className="habit-action-btn"
          title="Edit habit"
          aria-label="Edit habit"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
        </button>

        {/* ── Delete ── */}
        <button
          onClick={handleDelete}
          className="habit-action-btn habit-action-btn--delete"
          title="Delete habit"
          aria-label="Delete habit"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
        </button>
      </div>

      {/* ── PastDatePicker inline panel ─────────────────────────────────────── */}
      {pickerOpen && (
        <PastDatePicker
          habitId={habit.id}
          habitColor={habit.color}
          completions={completions}
          onToggle={handlePickerToggle}
          onClose={() => setPickerOpen(false)}
        />
      )}
    </div>
  );
}
