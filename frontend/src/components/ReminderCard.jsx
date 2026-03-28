import React, { useEffect, useRef } from 'react';
import { todayKey } from '../utils/dateUtils';

/**
 * Reminder card component for setting daily reminders
 */
export function ReminderCard({ habits, completions, reminderTime, onReminderChange }) {
  const reminderIntervalRef = useRef(null);

  useEffect(() => {
    // Request notification permission on mount
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    // Start reminder check if reminder is set
    if (reminderTime) {
      startReminderCheck();
    } else {
      if (reminderIntervalRef.current) {
        clearInterval(reminderIntervalRef.current);
      }
    }

    return () => {
      if (reminderIntervalRef.current) {
        clearInterval(reminderIntervalRef.current);
      }
    };
  }, [reminderTime, habits, completions]);

  const startReminderCheck = () => {
    if (reminderIntervalRef.current) {
      clearInterval(reminderIntervalRef.current);
    }

    reminderIntervalRef.current = setInterval(() => {
      const now = new Date();
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

      if (currentTime === reminderTime) {
        showReminderNotification();
      }
    }, 60000); // Check every minute
  };

  const showReminderNotification = () => {
    const tk = todayKey();
    const done = habits.filter((h) => completions[tk]?.has(h.id)).length;
    const remaining = habits.length - done;

    if (remaining > 0) {
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Habit Reminder', {
          body: `You have ${remaining} habit${remaining > 1 ? 's' : ''} left to complete today!`,
          icon: '🔔',
        });
      } else {
        alert(`Reminder: You have ${remaining} habit${remaining > 1 ? 's' : ''} left to complete today!`);
      }
    }
  };

  const handleReminderChange = (e) => {
    onReminderChange(e.target.value || null);
  };

  return (
    <div className="reminder-card">
      <div className="reminder-label">Daily Reminder</div>
      <div style={{ fontSize: '14px', color: 'var(--text2)', marginBottom: '10px' }}>
        {reminderTime ? `Reminder set for ${reminderTime}` : 'No reminder set'}
      </div>
      <div>
        <label className="form-label" style={{ marginBottom: '4px' }}>Reminder time</label>
        <input
          type="time"
          className="reminder-input"
          value={reminderTime || ''}
          onChange={handleReminderChange}
        />
      </div>
    </div>
  );
}
