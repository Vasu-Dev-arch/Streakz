'use client';

/**
 * AiCoachView
 * Offline-aware: shows a notice when internet is unavailable,
 * since AI generation requires a live server call.
 */

import React from 'react';
import { getToken } from '../hooks/useAuth';
import { COLORS, EMOJIS } from '../constants';
import { OfflineFeatureNotice } from './OfflineFeatureNotice';

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000';

function colorFor(index) {
  return COLORS[index % COLORS.length];
}

function resolveEmoji(aiEmoji) {
  if (aiEmoji && typeof aiEmoji === 'string') {
    const trimmed = [...aiEmoji.trim()][0];
    if (trimmed) return trimmed;
  }
  return EMOJIS[0];
}

export function AiCoachView({
  onAddHabit,
  categories,
  goal,
  setGoal,
  plan,
  setPlan,
  loading,
  setLoading,
  error,
  setError,
  addedIndexes,
  setAddedIndexes,
  addingAll,
  setAddingAll,
  allAdded,
  setAllAdded,
  onReset,
}) {
  const defaultCategory = categories?.[0] ?? 'General';

  // Detect online status locally so we can gate the generate button
  const [isOnline, setIsOnline] = React.useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  React.useEffect(() => {
    const up = () => setIsOnline(true);
    const down = () => setIsOnline(false);
    window.addEventListener('online', up);
    window.addEventListener('offline', down);
    return () => {
      window.removeEventListener('online', up);
      window.removeEventListener('offline', down);
    };
  }, []);

  const handleGenerate = async (e) => {
    e?.preventDefault();
    const trimmed = goal.trim();
    if (!trimmed) return;

    setLoading(true);
    setError(null);
    setPlan(null);
    setAddedIndexes(new Set());
    setAllAdded(false);

    try {
      const token = getToken();
      const res = await fetch(`${API_BASE}/api/ai/habit-coach`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ goal: trimmed }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate plan');
      setPlan(data);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddOne = async (habit, index) => {
    try {
      await onAddHabit({
        name: habit.name,
        emoji: resolveEmoji(habit.emoji),
        color: colorFor(index),
        category: defaultCategory,
      });
      setAddedIndexes((prev) => new Set([...prev, index]));
    } catch {
      // errors logged in useHabits
    }
  };

  const handleAddAll = async () => {
    if (!plan?.habits) return;
    setAddingAll(true);
    for (let i = 0; i < plan.habits.length; i++) {
      if (!addedIndexes.has(i)) {
        await handleAddOne(plan.habits[i], i);
      }
    }
    setAddingAll(false);
    setAllAdded(true);
  };

  const notYetAdded =
    plan?.habits?.filter((_, i) => !addedIndexes.has(i)) ?? [];

  return (
    <div className="view active ai-coach-view">
      {/* Header banner */}
      <div className="ai-coach-hero">
        <div className="ai-coach-hero-icon">✦</div>
        <div>
          <h1 className="ai-coach-title">AI Habit Coach</h1>
          <p className="ai-coach-subtitle">
            Describe your goal and get a personalised 3-habit plan, instantly.
          </p>
        </div>
      </div>

      {/* Offline notice — AI requires internet */}
      {!isOnline && (
        <OfflineFeatureNotice message="AI Coach requires an internet connection. Your existing habits are still available offline." />
      )}

      {/* Input */}
      <form className="ai-coach-form" onSubmit={handleGenerate}>
        <div className="ai-coach-input-row">
          <input
            className="ai-coach-input"
            type="text"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder="e.g. I want to get fit and sleep better"
            maxLength={300}
            disabled={loading || !isOnline}
            autoFocus
          />
          <button
            type="submit"
            className="ai-coach-generate-btn"
            disabled={loading || !goal.trim() || !isOnline}
            title={!isOnline ? 'Internet required' : undefined}
          >
            {loading ? (
              <span className="ai-thinking">
                <span className="ai-dot" />
                <span className="ai-dot" />
                <span className="ai-dot" />
                Thinking
              </span>
            ) : (
              '✦ Generate Plan'
            )}
          </button>
        </div>
        <p className="ai-coach-hint">
          Be specific for better results — mention your schedule, obstacles, or
          lifestyle.
        </p>
      </form>

      {/* Error */}
      {error && (
        <div className="ai-coach-error">
          <svg
            width="16"
            height="16"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
            style={{ flexShrink: 0 }}
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {error}
        </div>
      )}

      {/* Plan output */}
      {plan && (
        <div className="ai-plan">
          <div className="ai-plan-goal">
            <span className="ai-plan-goal-label">Your goal</span>
            <p className="ai-plan-goal-text">{plan.goal}</p>
          </div>

          <div className="ai-plan-habits-label">Recommended habits</div>
          <div className="ai-plan-habits">
            {plan.habits.map((habit, i) => {
              const isAdded = addedIndexes.has(i);
              return (
                <div
                  key={i}
                  className={`ai-habit-card${isAdded ? ' ai-habit-card--added' : ''}`}
                >
                  <div className="ai-habit-card-top">
                    <span className="ai-habit-emoji">
                      {resolveEmoji(habit.emoji)}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="ai-habit-name">{habit.name}</div>
                      <span className="ai-habit-freq">{habit.frequency}</span>
                    </div>
                    <button
                      className={`ai-habit-add-btn${isAdded ? ' ai-habit-add-btn--done' : ''}`}
                      onClick={() => handleAddOne(habit, i)}
                      disabled={isAdded}
                      title={isAdded ? 'Already added' : 'Add this habit'}
                    >
                      {isAdded ? '✓' : '+'}
                    </button>
                  </div>
                  <p className="ai-habit-why">{habit.why}</p>
                  <div
                    className="ai-habit-color-strip"
                    style={{ background: colorFor(i) }}
                  />
                </div>
              );
            })}
          </div>

          <div className="ai-plan-tip">
            <span className="ai-plan-tip-icon">💡</span>
            <p>{plan.tip}</p>
          </div>

          {!allAdded && notYetAdded.length > 0 && (
            <button
              className="ai-add-all-btn"
              onClick={handleAddAll}
              disabled={addingAll}
            >
              {addingAll
                ? 'Adding…'
                : `Add all ${notYetAdded.length} habit${notYetAdded.length > 1 ? 's' : ''} to my tracker`}
            </button>
          )}

          {allAdded && (
            <div className="ai-all-added-msg">
              <span>🎉</span>
              All habits added! Head to Today to start building your streaks.
            </div>
          )}

          <button className="ai-try-again-btn" onClick={onReset}>
            ← Try a different goal
          </button>
        </div>
      )}

      {/* Empty state */}
      {!plan && !loading && !error && (
        <div className="ai-coach-empty">
          <div className="ai-coach-empty-examples">
            <p className="ai-coach-empty-label">Try one of these goals:</p>
            <div className="ai-coach-suggestions">
              {[
                'Get fit and lose 10 kg in 6 months',
                'Read more and reduce screen time',
                'Build a morning routine that sets me up for the day',
                'Reduce stress and improve my mental health',
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  className="ai-suggestion-chip"
                  onClick={() => setGoal(suggestion)}
                  disabled={!isOnline}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
