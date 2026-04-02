import React from 'react';

/**
 * Modal shown once after onboarding to prompt the user to create their first habit.
 *
 * Props:
 *   isOpen           — boolean
 *   onAddHabit       — () => void  — opens the habit creation modal
 *   onLater          — () => void  — dismisses and marks as shown
 *   onDontShowAgain  — () => void  — marks as shown permanently
 */
export function FirstHabitPrompt({ isOpen, onAddHabit, onLater, onDontShowAgain }) {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.65)',
        backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 400, padding: '16px',
        animation: 'wlFadeUp 0.25s ease',
      }}
      onClick={onLater}
    >
      <div
        style={{
          background: 'var(--bg2)',
          border: '1px solid var(--border2)',
          borderRadius: '20px',
          padding: '36px 32px',
          maxWidth: '420px',
          width: '100%',
          textAlign: 'center',
          animation: 'modalSlideUp 0.25s cubic-bezier(0.4,0,0.2,1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icon */}
        <div
          style={{
            width: '64px', height: '64px', borderRadius: '20px',
            background: 'rgba(124,106,247,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px',
          }}
        >
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="var(--accent2)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </div>

        <h2 style={{
          fontSize: '22px', fontWeight: 700, color: 'var(--text)',
          marginBottom: '10px', lineHeight: 1.3, fontFamily: 'var(--sans)',
        }}>
          Start your first habit
        </h2>

        <p style={{
          fontSize: '14px', color: 'var(--text2)', lineHeight: 1.7,
          marginBottom: '28px', fontFamily: 'var(--sans)',
        }}>
          The hardest part is beginning. Add one habit to track and we'll help you build momentum from there.
        </p>

        {/* Suggestion chips */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', marginBottom: '28px' }}>
          {['Morning run', 'Read 20 min', 'Drink 8 glasses', 'Meditate'].map((s) => (
            <span
              key={s}
              style={{
                padding: '5px 12px', borderRadius: '20px',
                background: 'var(--bg3)', border: '1px solid var(--border)',
                fontSize: '12px', color: 'var(--text2)', fontFamily: 'var(--mono)',
              }}
            >
              {s}
            </span>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '16px' }}>
          <button
            onClick={onLater}
            style={{
              flex: 1,
              padding: '12px 20px', borderRadius: '10px',
              border: '1px solid var(--border2)', background: 'transparent',
              color: 'var(--text2)', fontFamily: 'var(--sans)', fontSize: '14px',
              cursor: 'pointer', transition: 'background 0.15s', minHeight: '46px',
            }}
          >
            Later
          </button>
          <button
            onClick={onAddHabit}
            style={{
              flex: 2,
              padding: '12px 20px', borderRadius: '10px',
              border: 'none', background: 'var(--accent)',
              color: '#fff', fontFamily: 'var(--sans)', fontSize: '14px',
              fontWeight: 600, cursor: 'pointer', transition: 'background 0.15s', minHeight: '46px',
            }}
          >
            Add First Habit
          </button>
        </div>

        <button
          onClick={() => {
            if (onDontShowAgain) onDontShowAgain();
            onLater();
          }}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text3)',
            fontSize: '12px',
            fontFamily: 'var(--mono)',
            cursor: 'pointer',
            padding: '8px 0',
            textDecoration: 'underline',
          }}
        >
          Don't show again
        </button>
      </div>
    </div>
  );
}