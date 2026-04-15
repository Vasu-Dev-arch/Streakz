'use client';

import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useGoals } from '../hooks/useGoals';

// ── Helpers ──────────────────────────────────────────────────────────────────

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function formatDeadline(dateStr) {
  if (!dateStr) return '';
  const [y, m, day] = dateStr.split('-').map(Number);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[m - 1]} ${day}, ${y}`;
}

function daysUntil(dateStr) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr + 'T00:00:00');
  const diff = Math.round((target - today) / 86400000);
  if (diff === 0) return 'Due today';
  if (diff === 1) return 'Due tomorrow';
  if (diff < 0) return `${Math.abs(diff)}d overdue`;
  return `${diff}d left`;
}

const PRIORITY_COLORS = {
  high: 'var(--red)',
  medium: 'var(--amber)',
  low: 'var(--teal)',
};

const PRIORITY_BG = {
  high: 'color-mix(in srgb, var(--red) 12%, transparent)',
  medium: 'color-mix(in srgb, var(--amber) 12%, transparent)',
  low: 'color-mix(in srgb, var(--teal) 12%, transparent)',
};

const STATUS_STYLE = {
  active: { color: 'var(--accent2)', bg: 'var(--accent-a15)' },
  completed: { color: 'var(--green)', bg: 'color-mix(in srgb, var(--green) 12%, transparent)' },
  overdue: { color: 'var(--red)', bg: 'color-mix(in srgb, var(--red) 12%, transparent)' },
};

// ── Create Goal Form ──────────────────────────────────────────────────────────

const EMPTY_FORM = {
  title: '',
  description: '',
  deadline: '',
  priority: 'medium',
  progressType: 'percentage',
  targetValue: '',
};

function GoalForm({ onSave, onCancel, saving }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [err, setErr] = useState('');

  const set = (key, val) => setForm((prev) => ({ ...prev, [key]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr('');

    if (!form.title.trim()) { setErr('Title is required'); return; }
    if (!form.deadline) { setErr('Deadline is required'); return; }
    if (form.deadline <= todayStr()) { setErr('Deadline must be in the future'); return; }
    if (form.progressType === 'count') {
      const tv = Number(form.targetValue);
      if (!form.targetValue || !Number.isFinite(tv) || tv <= 0) {
        setErr('Target value must be a positive number');
        return;
      }
    }

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      deadline: form.deadline,
      priority: form.priority,
      progressType: form.progressType,
    };
    if (form.progressType === 'count') payload.targetValue = Number(form.targetValue);

    try {
      await onSave(payload);
    } catch (e) {
      setErr(e.message || 'Failed to create goal');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* Title */}
      <div className="form-group" style={{ marginBottom: 0 }}>
        <label className="form-label">Title *</label>
        <input
          className="form-input"
          type="text"
          placeholder="e.g. Run a 5K"
          value={form.title}
          onChange={(e) => set('title', e.target.value)}
          maxLength={200}
          autoFocus
        />
      </div>

      {/* Description */}
      <div className="form-group" style={{ marginBottom: 0 }}>
        <label className="form-label">Description</label>
        <input
          className="form-input"
          type="text"
          placeholder="Optional notes"
          value={form.description}
          onChange={(e) => set('description', e.target.value)}
          maxLength={1000}
        />
      </div>

      {/* Deadline */}
      <div className="form-group" style={{ marginBottom: 0 }}>
        <label className="form-label">Deadline *</label>
        <input
          className="form-input"
          type="date"
          value={form.deadline}
          min={todayStr()}
          onChange={(e) => set('deadline', e.target.value)}
          style={{ colorScheme: 'dark' }}
        />
      </div>

      {/* Priority + Progress type row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Priority</label>
          <select
            className="form-input"
            value={form.priority}
            onChange={(e) => set('priority', e.target.value)}
            style={{ cursor: 'pointer' }}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Progress type</label>
          <select
            className="form-input"
            value={form.progressType}
            onChange={(e) => set('progressType', e.target.value)}
            style={{ cursor: 'pointer' }}
          >
            <option value="percentage">Percentage</option>
            <option value="count">Count</option>
          </select>
        </div>
      </div>

      {/* Conditional: target value for count goals */}
      {form.progressType === 'count' && (
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Target value *</label>
          <input
            className="form-input"
            type="number"
            min="1"
            step="1"
            placeholder="e.g. 30"
            value={form.targetValue}
            onChange={(e) => set('targetValue', e.target.value)}
          />
        </div>
      )}

      {err && (
        <p style={{ fontSize: '13px', color: 'var(--red)', fontFamily: 'var(--mono)', margin: 0 }}>
          {err}
        </p>
      )}

      <div className="modal-actions" style={{ marginTop: '8px' }}>
        <button type="button" className="btn-cancel" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn-save" disabled={saving}>
          {saving ? 'Creating…' : 'Create goal'}
        </button>
      </div>
    </form>
  );
}

// ── Progress Update Panel ─────────────────────────────────────────────────────

function ProgressPanel({ goal, onUpdate, onClose }) {
  const isCount = goal.progressType === 'count';
  const [value, setValue] = useState(isCount ? goal.currentValue : goal.progress);
  const [saving, setSaving] = useState(false);

  const QUICK_PCT = [25, 50, 75, 100];

  const handleSave = async (override) => {
    setSaving(true);
    const v = override !== undefined ? override : value;
    const payload = isCount ? { currentValue: Number(v) } : { progress: Number(v) };
    try {
      await onUpdate(goal.id, payload);
      onClose();
    } catch {
      setSaving(false);
    }
  };

  return (
    <div
      style={{
        background: 'var(--bg2)',
        border: '1px solid var(--border2)',
        borderRadius: 'var(--radius)',
        padding: '16px',
        marginTop: '10px',
        animation: 'modalSlideUp 0.18s cubic-bezier(0.4,0,0.2,1)',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {isCount ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <label className="form-label" style={{ marginBottom: 0 }}>
            Current value (target: {goal.targetValue})
          </label>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button
              className="btn-sm"
              onClick={() => setValue((v) => Math.max(0, Number(v) - 1))}
              style={{ width: '36px', padding: '0', flexShrink: 0 }}
            >−</button>
            <input
              className="form-input"
              type="number"
              min="0"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              style={{ textAlign: 'center' }}
            />
            <button
              className="btn-sm"
              onClick={() => setValue((v) => Number(v) + 1)}
              style={{ width: '36px', padding: '0', flexShrink: 0 }}
            >+</button>
          </div>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <button className="btn-cancel" style={{ flex: 0, padding: '8px 16px', minHeight: 0 }} onClick={onClose}>Cancel</button>
            <button className="btn-save" style={{ flex: 0, padding: '8px 20px', minHeight: 0 }} onClick={() => handleSave()} disabled={saving}>
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <label className="form-label" style={{ marginBottom: 0 }}>Progress: {Math.round(value)}%</label>
          <input
            type="range"
            min="0"
            max="100"
            step="1"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            style={{ width: '100%', accentColor: 'var(--accent)', cursor: 'pointer' }}
          />
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {QUICK_PCT.map((pct) => (
              <button
                key={pct}
                className="btn-sm"
                style={Number(value) === pct ? { background: 'var(--accent-a20)', borderColor: 'var(--accent)', color: 'var(--accent2)' } : {}}
                onClick={() => handleSave(pct)}
                disabled={saving}
              >
                {pct}%
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <button className="btn-cancel" style={{ flex: 0, padding: '8px 16px', minHeight: 0 }} onClick={onClose}>Cancel</button>
            <button className="btn-save" style={{ flex: 0, padding: '8px 20px', minHeight: 0 }} onClick={() => handleSave()} disabled={saving}>
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Goal Card ─────────────────────────────────────────────────────────────────

function GoalCard({ goal, onUpdateProgress, onDelete }) {
  const [progressOpen, setProgressOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const statusStyle = STATUS_STYLE[goal.status] ?? STATUS_STYLE.active;
  const isCompleted = goal.status === 'completed';

  const progressPct = goal.progressType === 'count'
    ? Math.min(100, goal.targetValue > 0 ? Math.round((goal.currentValue / goal.targetValue) * 100) : 0)
    : Math.min(100, goal.progress);

  const handleDelete = async () => {
    if (!confirm(`Delete goal "${goal.title}"?`)) return;
    setDeleting(true);
    await onDelete(goal.id);
  };

  return (
    <div
      className={`goal-card${isCompleted ? ' goal-card--completed' : ''}`}
      style={{
        background: 'var(--bg2)',
        border: `1px solid ${isCompleted ? 'color-mix(in srgb, var(--green) 30%, transparent)' : 'var(--border)'}`,
        borderRadius: 'var(--radius)',
        padding: '16px 18px',
        position: 'relative',
        opacity: deleting ? 0.5 : 1,
        transition: 'border-color 0.15s, opacity 0.15s',
      }}
    >
      {/* Completed accent bar */}
      {isCompleted && (
        <div style={{
          position: 'absolute', left: 0, top: 0, bottom: 0, width: 3,
          background: 'var(--green)',
          borderRadius: 'var(--radius) 0 0 var(--radius)',
        }} />
      )}

      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px', marginBottom: '8px' }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text)', lineHeight: 1.3, marginBottom: '4px' }}>
            {goal.title}
          </div>
          {goal.description && (
            <div style={{ fontSize: '12px', color: 'var(--text3)', lineHeight: 1.5, marginBottom: '6px' }}>
              {goal.description}
            </div>
          )}
        </div>
        {/* Delete button */}
        <button
          className="habit-action-btn habit-action-btn--delete"
          onClick={handleDelete}
          disabled={deleting}
          aria-label="Delete goal"
          title="Delete goal"
        >
          <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
            <path d="M10 11v6M14 11v6" />
          </svg>
        </button>
      </div>

      {/* Badges row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
        {/* Priority */}
        <span style={{
          fontSize: '10px', fontFamily: 'var(--mono)', textTransform: 'uppercase',
          letterSpacing: '0.5px', padding: '2px 8px', borderRadius: '4px',
          background: PRIORITY_BG[goal.priority],
          color: PRIORITY_COLORS[goal.priority],
          border: `1px solid color-mix(in srgb, ${PRIORITY_COLORS[goal.priority]} 25%, transparent)`,
        }}>
          {goal.priority}
        </span>
        {/* Status */}
        <span style={{
          fontSize: '10px', fontFamily: 'var(--mono)', textTransform: 'uppercase',
          letterSpacing: '0.5px', padding: '2px 8px', borderRadius: '4px',
          background: statusStyle.bg, color: statusStyle.color,
        }}>
          {goal.status}
        </span>
        {/* Deadline */}
        <span style={{ fontSize: '11px', fontFamily: 'var(--mono)', color: goal.status === 'overdue' ? 'var(--red)' : 'var(--text3)' }}>
          {formatDeadline(goal.deadline)} · {daysUntil(goal.deadline)}
        </span>
      </div>

      {/* Progress display */}
      <div style={{ marginBottom: progressOpen ? '0' : '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
          <span style={{ fontSize: '11px', fontFamily: 'var(--mono)', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Progress
          </span>
          <span style={{ fontSize: '13px', fontFamily: 'var(--mono)', fontWeight: 600, color: 'var(--text2)' }}>
            {goal.progressType === 'count'
              ? `${goal.currentValue} / ${goal.targetValue}`
              : `${Math.round(goal.progress)}%`}
          </span>
        </div>
        <div className="progress-bar-wrap">
          <div
            className="progress-bar-fill"
            style={{
              width: `${progressPct}%`,
              background: isCompleted ? 'var(--green)' : 'var(--accent)',
            }}
          />
        </div>
      </div>

      {/* Progress panel (inline, not a modal) */}
      {progressOpen && (
        <ProgressPanel
          goal={goal}
          onUpdate={onUpdateProgress}
          onClose={() => setProgressOpen(false)}
        />
      )}

      {/* Footer actions */}
      {!isCompleted && !progressOpen && (
        <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
          <button
            className="btn-sm"
            style={{ flex: 1, fontSize: '12px' }}
            onClick={() => setProgressOpen(true)}
          >
            Update progress
          </button>
          {/* Quick complete */}
          <button
            className="btn-sm"
            title="Mark as complete"
            onClick={() => onUpdateProgress(goal.id, goal.progressType === 'count'
              ? { currentValue: goal.targetValue }
              : { progress: 100 }
            )}
            style={{ padding: '7px 10px' }}
          >
            ✓
          </button>
        </div>
      )}
    </div>
  );
}

// ── Main GoalsView ────────────────────────────────────────────────────────────

export function GoalsView() {
  const { token } = useAuth();
  const { goals, loading, addGoal, updateProgress, deleteGoal } = useGoals(token);

  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleAddGoal = async (payload) => {
    setSaving(true);
    try {
      await addGoal(payload);
      setShowForm(false);
    } finally {
      setSaving(false);
    }
  };

  // Sort: active first, then overdue, then completed; within each by deadline
  const sorted = [...goals].sort((a, b) => {
    const ORDER = { active: 0, overdue: 1, completed: 2 };
    const od = (ORDER[a.status] ?? 0) - (ORDER[b.status] ?? 0);
    if (od !== 0) return od;
    return a.deadline.localeCompare(b.deadline);
  });

  const active = sorted.filter((g) => g.status === 'active');
  const overdue = sorted.filter((g) => g.status === 'overdue');
  const completed = sorted.filter((g) => g.status === 'completed');

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto' }}>
      {/* Page header */}
      <div className="section-header" style={{ marginBottom: '20px' }}>
        <div>
          <div style={{ fontSize: '13px', color: 'var(--text3)', fontFamily: 'var(--mono)', marginBottom: '4px' }}>
            {goals.length} goal{goals.length !== 1 ? 's' : ''} total
          </div>
        </div>
        {!showForm && (
          <button className="btn-primary" onClick={() => setShowForm(true)}>
            + New goal
          </button>
        )}
      </div>

      {/* Create form */}
      {showForm && (
        <div style={{
          background: 'var(--bg2)',
          border: '1px solid var(--border2)',
          borderRadius: 'var(--radius)',
          padding: '22px 24px',
          marginBottom: '28px',
        }}>
          <div style={{ fontSize: '15px', fontWeight: 600, marginBottom: '18px' }}>New Goal</div>
          <GoalForm onSave={handleAddGoal} onCancel={() => setShowForm(false)} saving={saving} />
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div style={{ color: 'var(--text3)', fontFamily: 'var(--mono)', fontSize: '13px' }}>Loading…</div>
      )}

      {/* Empty state */}
      {!loading && goals.length === 0 && !showForm && (
        <div className="empty-state">
          <div className="empty-icon">🎯</div>
          <div className="empty-text">No goals yet</div>
          <div className="empty-sub">Create your first goal to start tracking long-term progress.</div>
        </div>
      )}

      {/* Active goals */}
      {active.length > 0 && (
        <section style={{ marginBottom: '28px' }}>
          <div className="section-header">
            <span className="section-title">Active</span>
            <span style={{ fontSize: '12px', fontFamily: 'var(--mono)', color: 'var(--text3)' }}>{active.length}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {active.map((g) => (
              <GoalCard key={g.id} goal={g} onUpdateProgress={updateProgress} onDelete={deleteGoal} />
            ))}
          </div>
        </section>
      )}

      {/* Overdue goals */}
      {overdue.length > 0 && (
        <section style={{ marginBottom: '28px' }}>
          <div className="section-header">
            <span className="section-title" style={{ color: 'var(--red)' }}>Overdue</span>
            <span style={{ fontSize: '12px', fontFamily: 'var(--mono)', color: 'var(--red)' }}>{overdue.length}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {overdue.map((g) => (
              <GoalCard key={g.id} goal={g} onUpdateProgress={updateProgress} onDelete={deleteGoal} />
            ))}
          </div>
        </section>
      )}

      {/* Completed goals */}
      {completed.length > 0 && (
        <section>
          <div className="section-header">
            <span className="section-title" style={{ color: 'var(--green)' }}>Completed</span>
            <span style={{ fontSize: '12px', fontFamily: 'var(--mono)', color: 'var(--green)' }}>{completed.length}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {completed.map((g) => (
              <GoalCard key={g.id} goal={g} onUpdateProgress={updateProgress} onDelete={deleteGoal} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
