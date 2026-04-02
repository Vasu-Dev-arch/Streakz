import React, { useEffect, useRef, useState } from 'react';
import { todayKey } from '../utils/dateUtils';

/**
 * Reminder card component for setting daily reminders
 */
export function ReminderCard({ habits, completions, reminderTime, onReminderChange }) {
  const reminderIntervalRef = useRef(null);
  const lastTriggeredRef = useRef(null);
  const [inAppReminder, setInAppReminder] = useState(null);

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
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
  }, [reminderTime]);

  const startReminderCheck = () => {
    if (reminderIntervalRef.current) {
      clearInterval(reminderIntervalRef.current);
    }

    reminderIntervalRef.current = setInterval(() => {
      const now = new Date();
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

      if (currentTime === reminderTime) {
        const todayDate = now.toDateString();
        if (lastTriggeredRef.current !== todayDate) {
          lastTriggeredRef.current = todayDate;
          showReminderNotification();
        }
      }
    }, 30000);
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
      }
      setInAppReminder({
        count: remaining,
        message: `You have ${remaining} habit${remaining > 1 ? 's' : ''} left to complete today!`
      });
      setTimeout(() => setInAppReminder(null), 10000);
    }
  };

  const dismissInAppReminder = () => {
    setInAppReminder(null);
  };

  const handleReminderChange = (e) => {
    lastTriggeredRef.current = null;
    onReminderChange(e.target.value || null);
  };

  return (
    <>
      {inAppReminder && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: 'var(--bg2)',
            border: '1px solid var(--accent)',
            borderRadius: '12px',
            padding: '16px 20px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
            zIndex: 1000,
            maxWidth: '320px',
            animation: 'wlFadeUp 0.25s ease',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <div style={{ fontSize: '24px' }}>🔔</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, color: 'var(--text)', marginBottom: '4px', fontSize: '14px' }}>
                Reminder
              </div>
              <div style={{ color: 'var(--text2)', fontSize: '13px', lineHeight: 1.5 }}>
                {inAppReminder.message}
              </div>
            </div>
            <button
              onClick={dismissInAppReminder}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text3)',
                cursor: 'pointer',
                padding: '4px',
                fontSize: '16px',
                lineHeight: 1,
              }}
              aria-label="Dismiss"
            >
              ×
            </button>
          </div>
        </div>
      )}
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
    </>
  );
}
