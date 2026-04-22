'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { StatsRow } from './StatsRow';
import { HabitCard } from './HabitCard';
import { CategoryFilter } from './CategoryFilter';
import { GoalCard } from './GoalCard';
import { ReminderCard } from './ReminderCard';
import { todayKey } from '../utils/dateUtils';

const PRIORITY_DOT_COLOR = {
  high:   'var(--red, #f05252)',
  medium: 'var(--amber, #f5a623)',
  low:    'var(--teal, #22c97a)',
};

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function isOverdue(deadline, completed) {
  return !completed && deadline && deadline < todayStr();
}

// ── Compact To-Do widget ──────────────────────────────────────────────────────

function CompactTodoWidget({ todos, onToggleTodo }) {
  const router = useRouter();
  const all      = todos ?? [];
  const pending  = all.filter((t) => !t.completed);
  const done     = all.filter((t) => t.completed);

  // Show up to 5 pending + up to 3 completed
  const shownPending   = pending.slice(0, 5);
  const extraPending   = pending.length - shownPending.length;
  const shownCompleted = done.slice(0, 3);

  function TodoRow({ todo, idx, isLast }) {
    const overdue = isOverdue(todo.deadline, todo.completed);
    return (
      <div
        style={{
          display: 'flex', alignItems: 'center', gap: '9px',
          padding: '9px 14px',
          borderBottom: isLast ? 'none' : '1px solid var(--border)',
          transition: 'background 0.12s',
          cursor: 'pointer',
          opacity: todo.completed ? 0.55 : 1,
        }}
        onClick={() => onToggleTodo(todo.id)}
        onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg3)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = ''; }}
        title={todo.completed ? 'Mark incomplete' : 'Mark complete'}
      >
        {/* Visual checkbox */}
        <div style={{
          width: '15px', height: '15px', borderRadius: '3px', flexShrink: 0,
          border: `2px solid ${todo.completed ? 'var(--green,#22c97a)' : overdue ? 'var(--red,#f05252)' : 'var(--border2)'}`,
          background: todo.completed ? 'var(--green,#22c97a)' : 'transparent',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {todo.completed && (
            <svg width="8" height="8" viewBox="0 0 12 12" fill="none">
              <polyline points="2 6 5 9 10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </div>

        {/* Priority dot */}
        <div style={{
          width: '6px', height: '6px', borderRadius: '50%', flexShrink: 0,
          background: PRIORITY_DOT_COLOR[todo.priority] ?? 'var(--border2)',
        }} />

        {/* Title */}
        <span style={{
          flex: 1, fontSize: '13px', color: 'var(--text)',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          textDecoration: todo.completed ? 'line-through' : 'none',
        }}>
          {todo.title}
        </span>

        {/* Overdue badge */}
        {overdue && (
          <span style={{
            fontSize: '10px', fontFamily: 'var(--mono)',
            color: 'var(--red,#f05252)', flexShrink: 0,
          }}>overdue</span>
        )}

        {/* Category */}
        {todo.category && (
          <span style={{
            fontSize: '10px', fontFamily: 'var(--mono)', color: 'var(--text3)',
            background: 'var(--bg3)', border: '1px solid var(--border)',
            borderRadius: '4px', padding: '1px 5px', flexShrink: 0,
            maxWidth: '70px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {todo.category}
          </span>
        )}
      </div>
    );
  }

  return (
    <div style={{ marginTop: '32px' }}>
      <div className="section-header" style={{ marginBottom: '12px' }}>
        <span className="section-title">To-Do</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {pending.length > 0 && (
            <span style={{ fontSize: '12px', color: 'var(--text3)', fontFamily: 'var(--mono)' }}>
              {pending.length} pending
            </span>
          )}
          <button
            className="btn-sm"
            onClick={() => router.push('/dashboard/todo')}
            style={{ fontSize: '11px', padding: '4px 10px' }}
          >
            Open To-Do →
          </button>
        </div>
      </div>

      <div style={{
        background: 'var(--bg2)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius)', overflow: 'hidden',
      }}>
        {all.length === 0 ? (
          <div style={{
            padding: '20px 18px', textAlign: 'center',
            color: 'var(--text3)', fontSize: '13px', fontFamily: 'var(--mono)',
          }}>
            🎉 All caught up — no tasks
          </div>
        ) : (
          <>
            {/* Pending */}
            {shownPending.map((todo, idx) => (
              <TodoRow
                key={todo.id} todo={todo} idx={idx}
                isLast={idx === shownPending.length - 1 && extraPending === 0 && shownCompleted.length === 0}
              />
            ))}
            {extraPending > 0 && (
              <div
                style={{
                  padding: '8px 14px', fontSize: '12px', fontFamily: 'var(--mono)',
                  color: 'var(--text3)', textAlign: 'center', cursor: 'pointer',
                  borderBottom: shownCompleted.length > 0 ? '1px solid var(--border)' : 'none',
                  transition: 'background 0.12s',
                }}
                onClick={() => router.push('/dashboard/todo')}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg3)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = ''; }}
              >
                +{extraPending} more — view all →
              </div>
            )}

            {/* Completed section separator */}
            {shownCompleted.length > 0 && pending.length > 0 && (
              <div style={{
                padding: '5px 14px',
                fontSize: '10px', fontFamily: 'var(--mono)', color: 'var(--text3)',
                textTransform: 'uppercase', letterSpacing: '0.5px',
                background: 'var(--bg3)', borderTop: '1px solid var(--border)',
              }}>
                Completed today
              </div>
            )}
            {shownCompleted.map((todo, idx) => (
              <TodoRow
                key={todo.id} todo={todo} idx={idx}
                isLast={idx === shownCompleted.length - 1}
              />
            ))}
          </>
        )}
      </div>
    </div>
  );
}

// ── Main TodayView ────────────────────────────────────────────────────────────

export function TodayView({
  habits, completions, dailyGoal, reminderTime, categories,
  onToggleHabit, onToggleHabitForDate, onEditHabit, onDeleteHabit,
  onGoalChange, onReminderChange, onNavigateToAiCoach,
  todos, onToggleTodo,
}) {
  const [activeCategory, setActiveCategory] = useState('All');
  const tk = todayKey();

  const filteredHabits = activeCategory === 'All'
    ? habits
    : habits.filter((h) => h.category === activeCategory);

  const done = filteredHabits.filter((h) => completions[tk]?.has(h.id)).length;

  return (
    <div className="view active">
      <StatsRow habits={habits} completions={completions} />

      <div className="goal-reminder-row">
        <GoalCard habits={habits} completions={completions} dailyGoal={dailyGoal} onGoalChange={onGoalChange} />
        <ReminderCard habits={habits} completions={completions} reminderTime={reminderTime} onReminderChange={onReminderChange} />
      </div>

      <div className="section-header">
        <span className="section-title">Habits</span>
        <span style={{ fontSize: '12px', color: 'var(--text3)', fontFamily: 'var(--mono)' }}>
          {done} / {filteredHabits.length} complete
        </span>
      </div>

      <CategoryFilter activeCategory={activeCategory} onCategoryChange={setActiveCategory} categories={categories} />

      <div className="habits-grid">
        {filteredHabits.length === 0 ? (
          <div className="empty-state" style={{ gridColumn: '1/-1' }}>
            <div className="empty-icon">🌱</div>
            <div className="empty-text">
              {habits.length === 0 ? 'No habits yet' : 'No habits in this category'}
            </div>
            <div className="empty-sub">
              {habits.length === 0 ? 'Add your first habit to get started' : 'Switch category or add a new habit'}
            </div>
            {habits.length === 0 && onNavigateToAiCoach && (
              <button className="ai-coach-entry-btn" onClick={onNavigateToAiCoach}>
                <span>✦</span>
                Get an AI-generated habit plan
              </button>
            )}
          </div>
        ) : (
          filteredHabits.map((habit) => (
            <HabitCard
              key={habit.id} habit={habit} completions={completions}
              onToggle={onToggleHabit} onToggleForDate={onToggleHabitForDate}
              onEdit={onEditHabit} onDelete={onDeleteHabit}
            />
          ))
        )}
      </div>

      {todos !== undefined && onToggleTodo && (
        <CompactTodoWidget todos={todos} onToggleTodo={onToggleTodo} />
      )}
    </div>
  );
}
