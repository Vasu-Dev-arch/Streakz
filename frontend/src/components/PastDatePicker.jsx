'use client';

/**
 * PastDatePicker
 *
 * A lightweight inline dropdown that lets users mark a habit as completed
 * for today, yesterday, or the day before yesterday.
 *
 * Rules enforced here (mirroring backend validation):
 *   - Maximum 2 days back (today = 0, yesterday = 1, day before = 2)
 *   - Dates already completed show a check and can be un-marked (toggle)
 *   - No heavy date library — uses the existing dateKey util
 *
 * Props:
 *   habitId      string   — the habit to toggle
 *   habitColor   string   — used for the completion indicator colour
 *   completions  object   — { 'YYYY-MM-DD': Set<habitId> }
 *   onToggle     (habitId: string, date: string) => void
 *   onClose      () => void
 *   anchorRef    React ref  — used to position the popup near the trigger
 */

import { useEffect, useRef } from 'react';
import { dateKey } from '../utils/dateUtils';

const MAX_DAYS_BACK = 2;

/** Build the list of selectable day entries. */
function buildDayOptions() {
  const options = [];
  const now = new Date();
  for (let i = 0; i <= MAX_DAYS_BACK; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const key = dateKey(d);
    let label;
    if (i === 0) label = 'Today';
    else if (i === 1) label = 'Yesterday';
    else label = formatShortDate(d);
    options.push({ key, label, daysAgo: i });
  }
  return options;
}

function formatShortDate(date) {
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export function PastDatePicker({ habitId, habitColor, completions, onToggle, onClose }) {
  const panelRef = useRef(null);
  const days = buildDayOptions();

  // Close on outside click or Escape
  useEffect(() => {
    function handlePointerDown(e) {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        onClose();
      }
    }
    function handleKey(e) {
      if (e.key === 'Escape') onClose();
    }
    // Use capture so we get the event before anything else
    document.addEventListener('pointerdown', handlePointerDown, true);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown, true);
      document.removeEventListener('keydown', handleKey);
    };
  }, [onClose]);

  const handleDayClick = (e, dateStr) => {
    e.stopPropagation();
    onToggle(habitId, dateStr);
    // Don't auto-close so the user can toggle multiple days
  };

  return (
    <div
      ref={panelRef}
      className="past-date-picker"
      role="dialog"
      aria-label="Mark completion for past days"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="past-date-picker__header">
        <span className="past-date-picker__title">Mark as done</span>
        <button
          className="past-date-picker__close"
          onClick={(e) => { e.stopPropagation(); onClose(); }}
          aria-label="Close"
        >
          ✕
        </button>
      </div>

      <div className="past-date-picker__days">
        {days.map(({ key, label, daysAgo }) => {
          const isDone = completions[key]?.has(habitId) ?? false;
          return (
            <button
              key={key}
              className={`past-date-picker__day${isDone ? ' past-date-picker__day--done' : ''}`}
              onClick={(e) => handleDayClick(e, key)}
              aria-pressed={isDone}
              style={isDone ? { '--habit-color': habitColor } : {}}
            >
              <span className="past-date-picker__day-check" aria-hidden="true">
                {isDone ? (
                  // Filled check circle
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="8" r="8" fill={habitColor} />
                    <polyline
                      points="4,8 7,11 12,5"
                      stroke="white"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  // Empty circle
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="8" r="7" stroke="var(--border2)" strokeWidth="1.5" />
                  </svg>
                )}
              </span>
              <span className="past-date-picker__day-label">{label}</span>
              {daysAgo === 0 && (
                <span className="past-date-picker__day-tag">today</span>
              )}
            </button>
          );
        })}
      </div>

      <p className="past-date-picker__hint">
        Tap a day to toggle completion
      </p>
    </div>
  );
}
