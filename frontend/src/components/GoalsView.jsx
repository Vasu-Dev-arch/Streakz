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
  const parts = dateStr.split('-').map(Number);
  const y = parts[0];
  const m = parts[1];
  const day = parts[2];
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

// ── Shared inline panel wrapper ───────────────────────────────────────────────

function InlinePanel({ children }) {
  return (
    <div
      style={{
        background: 'var(--bg3)',
        border: '1px solid var(--border2)',
        borderRadius: 'var(--radius-sm)',
        padding: '14px',
        marginTop: '10px',
        animation: 'modalSlideUp 0.18s cubic-bezier(0.4,0,0.2,1)',
      }}
      onClick={function (e) { e.stopPropagation(); }}
    >
      {children}
    </div>
  );
}

// ── Goal Form (shared by create + edit) ───────────────────────────────────────

function GoalForm({ initial, onSave, onCancel, saving, submitLabel }) {
  var label = submitLabel || 'Create goal';
  var isEdit = Boolean(initial);

  const [form, setForm] = useState({
    title: initial ? (initial.title || '') : '',
    description: initial ? (initial.description || '') : '',
    deadline: initial ? (initial.deadline || '') : '',
    priority: initial ? (initial.priority || 'medium') : 'medium',
    progressType: initial ? (initial.progressType || 'percentage') : 'percentage',
    targetValue: initial && initial.targetValue != null ? String(initial.targetValue) : '',
  });
  const [err, setErr] = useState('');

  function set(key, val) {
    setForm(function (prev) {
      var next = Object.assign({}, prev);
      next[key] = val;
      return next;
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErr('');

    if (!form.title.trim()) { setErr('Title is required'); return; }
    if (!form.deadline) { setErr('Deadline is required'); return; }
    if (!isEdit && form.deadline <= todayStr()) {
      setErr('Deadline must be in the future');
      return;
    }
    if (!isEdit && form.progressType === 'count') {
      var tv = Number(form.targetValue);
      if (!form.targetValue || !Number.isFinite(tv) || tv <= 0) {
        setErr('Target value must be a positive number');
        return;
      }
    }

    var payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      deadline: form.deadline,
      priority: form.priority,
    };
    if (!isEdit) {
      payload.progressType = form.progressType;
      if (form.progressType === 'count') {
        payload.targetValue = Number(form.targetValue);
      }
    }

    try {
      await onSave(payload);
    } catch (saveErr) {
      setErr((saveErr && saveErr.message) ? saveErr.message : 'Failed to save goal');
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

      <div className="form-group" style={{ marginBottom: 0 }}>
        <label className="form-label">Title *</label>
        <input
          className="form-input"
          type="text"
          placeholder="e.g. Run a 5K"
          value={form.title}
          onChange={function (e) { set('title', e.target.value); }}
          maxLength={200}
          autoFocus
        />
      </div>

      <div className="form-group" style={{ marginBottom: 0 }}>
        <label className="form-label">Description</label>
        <input
          className="form-input"
          type="text"
          placeholder="Optional notes"
          value={form.description}
          onChange={function (e) { set('description', e.target.value); }}
          maxLength={1000}
        />
      </div>

      <div className="form-group" style={{ marginBottom: 0 }}>
        <label className="form-label">Deadline *</label>
        <input
          className="form-input"
          type="date"
          value={form.deadline}
          onChange={function (e) { set('deadline', e.target.value); }}
          style={{ colorScheme: 'dark' }}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isEdit ? '1fr' : '1fr 1fr', gap: '12px' }}>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Priority</label>
          <select
            className="form-input"
            value={form.priority}
            onChange={function (e) { set('priority', e.target.value); }}
            style={{ cursor: 'pointer' }}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
        {!isEdit && (
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Progress type</label>
            <select
              className="form-input"
              value={form.progressType}
              onChange={function (e) { set('progressType', e.target.value); }}
              style={{ cursor: 'pointer' }}
            >
              <option value="percentage">Percentage</option>
              <option value="count">Count</option>
            </select>
          </div>
        )}
      </div>

      {!isEdit && form.progressType === 'count' && (
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Target value *</label>
          <input
            className="form-input"
            type="number"
            min="1"
            step="1"
            placeholder="e.g. 30"
            value={form.targetValue}
            onChange={function (e) { set('targetValue', e.target.value); }}
          />
        </div>
      )}

      {err && (
        <p style={{ fontSize: '13px', color: 'var(--red)', fontFamily: 'var(--mono)', margin: 0 }}>
          {err}
        </p>
      )}

      <div className="modal-actions" style={{ marginTop: '4px' }}>
        <button type="button" className="btn-cancel" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn-save" disabled={saving}>
          {saving ? 'Saving…' : label}
        </button>
      </div>
    </form>
  );
}

// ── Progress Panel ────────────────────────────────────────────────────────────

function ProgressPanel({ goal, onUpdate, onClose }) {
  var isCount = goal.progressType === 'count';
  const [value, setValue] = useState(isCount ? goal.currentValue : goal.progress);
  const [saving, setSaving] = useState(false);

  var QUICK_PCT = [25, 50, 75, 100];

  async function handleSave(override) {
    setSaving(true);
    var v = override !== undefined ? override : value;
    var payload = isCount ? { currentValue: Number(v) } : { progress: Number(v) };
    try {
      await onUpdate(goal.id, payload);
      onClose();
    } catch (_err) {
      setSaving(false);
    }
  }

  return (
    <InlinePanel>
      {isCount ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <label className="form-label" style={{ marginBottom: 0 }}>
            Current value (target: {goal.targetValue})
          </label>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button
              className="btn-sm"
              onClick={function () { setValue(function (v) { return Math.max(0, Number(v) - 1); }); }}
              style={{ width: '36px', padding: '0', flexShrink: 0 }}
            >−</button>
            <input
              className="form-input"
              type="number"
              min="0"
              value={value}
              onChange={function (e) { setValue(e.target.value); }}
              style={{ textAlign: 'center' }}
            />
            <button
              className="btn-sm"
              onClick={function () { setValue(function (v) { return Number(v) + 1; }); }}
              style={{ width: '36px', padding: '0', flexShrink: 0 }}
            >+</button>
          </div>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <button className="btn-cancel" style={{ flex: 0, padding: '8px 16px', minHeight: 0 }} onClick={onClose}>
              Cancel
            </button>
            <button className="btn-save" style={{ flex: 0, padding: '8px 20px', minHeight: 0 }} onClick={function () { handleSave(); }} disabled={saving}>
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <label className="form-label" style={{ marginBottom: 0 }}>
            Progress: {Math.round(value)}%
          </label>
          <input
            type="range"
            min="0"
            max="100"
            step="1"
            value={value}
            onChange={function (e) { setValue(e.target.value); }}
            style={{ width: '100%', accentColor: 'var(--accent)', cursor: 'pointer' }}
          />
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {QUICK_PCT.map(function (pct) {
              return (
                <button
                  key={pct}
                  className="btn-sm"
                  style={Number(value) === pct
                    ? { background: 'var(--accent-a20)', borderColor: 'var(--accent)', color: 'var(--accent2)' }
                    : {}}
                  onClick={function () { handleSave(pct); }}
                  disabled={saving}
                >
                  {pct}%
                </button>
              );
            })}
          </div>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <button className="btn-cancel" style={{ flex: 0, padding: '8px 16px', minHeight: 0 }} onClick={onClose}>
              Cancel
            </button>
            <button className="btn-save" style={{ flex: 0, padding: '8px 20px', minHeight: 0 }} onClick={function () { handleSave(); }} disabled={saving}>
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>
      )}
    </InlinePanel>
  );
}

// ── Edit Panel ────────────────────────────────────────────────────────────────

function EditPanel({ goal, onUpdate, onClose }) {
  const [saving, setSaving] = useState(false);
  const [panelErr, setPanelErr] = useState('');

  async function handleSave(payload) {
    setSaving(true);
    setPanelErr('');
    try {
      await onUpdate(goal.id, payload);
      onClose();
    } catch (updateErr) {
      setSaving(false);
      setPanelErr((updateErr && updateErr.message) ? updateErr.message : 'Failed to update goal');
    }
  }

  return (
    <InlinePanel>
      {panelErr && (
        <p style={{ fontSize: '13px', color: 'var(--red)', fontFamily: 'var(--mono)', margin: '0 0 10px 0' }}>
          {panelErr}
        </p>
      )}
      <GoalForm
        initial={goal}
        onSave={handleSave}
        onCancel={onClose}
        saving={saving}
        submitLabel="Save changes"
      />
    </InlinePanel>
  );
}

// ── Goal Card ─────────────────────────────────────────────────────────────────

function GoalCard({ goal, onUpdateProgress, onUpdate, onDelete }) {
  const [panel, setPanel] = useState(null); // null | 'progress' | 'edit'
  const [deleting, setDeleting] = useState(false);

  var statusStyle = STATUS_STYLE[goal.status] || STATUS_STYLE.active;
  var isCompleted = goal.status === 'completed';

  var progressPct = goal.progressType === 'count'
    ? Math.min(100, goal.targetValue > 0 ? Math.round((goal.currentValue / goal.targetValue) * 100) : 0)
    : Math.min(100, goal.progress);

  async function handleDelete() {
    if (!confirm('Delete goal "' + goal.title + '"?')) return;
    setDeleting(true);
    await onDelete(goal.id);
  }

  function openPanel(name) {
    setPanel(function (cur) { return cur === name ? null : name; });
  }

  return (
    <div
      style={{
        background: 'var(--bg2)',
        border: '1px solid ' + (isCompleted ? 'color-mix(in srgb, var(--green) 30%, transparent)' : 'var(--border)'),
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

        {/* Edit + Delete buttons */}
        <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
          <button
            className={'habit-action-btn' + (panel === 'edit' ? ' habit-action-btn--active' : '')}
            onClick={function () { openPanel('edit'); }}
            aria-label="Edit goal"
            title="Edit goal"
          >
            <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
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
      </div>

      {/* Badges */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
        <span style={{
          fontSize: '10px', fontFamily: 'var(--mono)', textTransform: 'uppercase',
          letterSpacing: '0.5px', padding: '2px 8px', borderRadius: '4px',
          background: PRIORITY_BG[goal.priority],
          color: PRIORITY_COLORS[goal.priority],
          border: '1px solid color-mix(in srgb, ' + PRIORITY_COLORS[goal.priority] + ' 25%, transparent)',
        }}>
          {goal.priority}
        </span>
        <span style={{
          fontSize: '10px', fontFamily: 'var(--mono)', textTransform: 'uppercase',
          letterSpacing: '0.5px', padding: '2px 8px', borderRadius: '4px',
          background: statusStyle.bg, color: statusStyle.color,
        }}>
          {goal.status}
        </span>
        <span style={{ fontSize: '11px', fontFamily: 'var(--mono)', color: goal.status === 'overdue' ? 'var(--red)' : 'var(--text3)' }}>
          {formatDeadline(goal.deadline)} · {daysUntil(goal.deadline)}
        </span>
      </div>

      {/* Progress bar */}
      <div style={{ marginBottom: panel ? '0' : '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
          <span style={{ fontSize: '11px', fontFamily: 'var(--mono)', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Progress
          </span>
          <span style={{ fontSize: '13px', fontFamily: 'var(--mono)', fontWeight: 600, color: 'var(--text2)' }}>
            {goal.progressType === 'count'
              ? (goal.currentValue + ' / ' + goal.targetValue)
              : (Math.round(goal.progress) + '%')}
          </span>
        </div>
        <div className="progress-bar-wrap">
          <div
            className="progress-bar-fill"
            style={{
              width: progressPct + '%',
              background: isCompleted ? 'var(--green)' : 'var(--accent)',
            }}
          />
        </div>
      </div>

      {/* Inline panels — only one open at a time */}
      {panel === 'progress' && (
        <ProgressPanel
          goal={goal}
          onUpdate={onUpdateProgress}
          onClose={function () { setPanel(null); }}
        />
      )}
      {panel === 'edit' && (
        <EditPanel
          goal={goal}
          onUpdate={onUpdate}
          onClose={function () { setPanel(null); }}
        />
      )}

      {/* Footer actions */}
      {!isCompleted && !panel && (
        <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
          <button
            className="btn-sm"
            style={{ flex: 1, fontSize: '12px' }}
            onClick={function () { openPanel('progress'); }}
          >
            Update progress
          </button>
          <button
            className="btn-sm"
            title="Mark as complete"
            onClick={function () {
              var payload = goal.progressType === 'count'
                ? { currentValue: goal.targetValue }
                : { progress: 100 };
              onUpdateProgress(goal.id, payload);
            }}
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
  const { goals, loading, addGoal, updateGoal, updateProgress, deleteGoal } = useGoals(token);

  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleAddGoal(payload) {
    setSaving(true);
    try {
      await addGoal(payload);
      setShowForm(false);
    } finally {
      setSaving(false);
    }
  }

  var ORDER = { active: 0, overdue: 1, completed: 2 };
  var sorted = goals.slice().sort(function (a, b) {
    var od = (ORDER[a.status] || 0) - (ORDER[b.status] || 0);
    if (od !== 0) return od;
    return a.deadline < b.deadline ? -1 : a.deadline > b.deadline ? 1 : 0;
  });

  var active = sorted.filter(function (g) { return g.status === 'active'; });
  var overdue = sorted.filter(function (g) { return g.status === 'overdue'; });
  var completed = sorted.filter(function (g) { return g.status === 'completed'; });

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto' }}>
      {/* Page header */}
      <div className="section-header" style={{ marginBottom: '20px' }}>
        <div style={{ fontSize: '13px', color: 'var(--text3)', fontFamily: 'var(--mono)' }}>
          {goals.length} goal{goals.length !== 1 ? 's' : ''} total
        </div>
        {!showForm && (
          <button className="btn-primary" onClick={function () { setShowForm(true); }}>
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
          <GoalForm
            onSave={handleAddGoal}
            onCancel={function () { setShowForm(false); }}
            saving={saving}
          />
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

      {/* Active */}
      {active.length > 0 && (
        <section style={{ marginBottom: '28px' }}>
          <div className="section-header">
            <span className="section-title">Active</span>
            <span style={{ fontSize: '12px', fontFamily: 'var(--mono)', color: 'var(--text3)' }}>{active.length}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {active.map(function (g) {
              return (
                <GoalCard key={g.id} goal={g} onUpdateProgress={updateProgress} onUpdate={updateGoal} onDelete={deleteGoal} />
              );
            })}
          </div>
        </section>
      )}

      {/* Overdue */}
      {overdue.length > 0 && (
        <section style={{ marginBottom: '28px' }}>
          <div className="section-header">
            <span className="section-title" style={{ color: 'var(--red)' }}>Overdue</span>
            <span style={{ fontSize: '12px', fontFamily: 'var(--mono)', color: 'var(--red)' }}>{overdue.length}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {overdue.map(function (g) {
              return (
                <GoalCard key={g.id} goal={g} onUpdateProgress={updateProgress} onUpdate={updateGoal} onDelete={deleteGoal} />
              );
            })}
          </div>
        </section>
      )}

      {/* Completed */}
      {completed.length > 0 && (
        <section>
          <div className="section-header">
            <span className="section-title" style={{ color: 'var(--green)' }}>Completed</span>
            <span style={{ fontSize: '12px', fontFamily: 'var(--mono)', color: 'var(--green)' }}>{completed.length}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {completed.map(function (g) {
              return (
                <GoalCard key={g.id} goal={g} onUpdateProgress={updateProgress} onUpdate={updateGoal} onDelete={deleteGoal} />
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
