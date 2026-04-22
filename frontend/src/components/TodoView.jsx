'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

// ── Helpers ───────────────────────────────────────────────────────────────────

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function formatDeadline(dateStr) {
  if (!dateStr) return null;
  const [, m, day] = dateStr.split('-').map(Number);
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${months[m - 1]} ${day}`;
}

function isOverdue(dateStr, completed) {
  if (!dateStr || completed) return false;
  return dateStr < todayStr();
}

function isDueToday(dateStr) {
  return !!dateStr && dateStr === todayStr();
}

// ── Priority config ───────────────────────────────────────────────────────────

const P = {
  high:   { label: 'High', color: 'var(--red,#f05252)',   bg: 'color-mix(in srgb,var(--red,#f05252) 12%,transparent)',   border: 'color-mix(in srgb,var(--red,#f05252) 28%,transparent)'   },
  medium: { label: 'Med',  color: 'var(--amber,#f5a623)', bg: 'color-mix(in srgb,var(--amber,#f5a623) 12%,transparent)', border: 'color-mix(in srgb,var(--amber,#f5a623) 28%,transparent)' },
  low:    { label: 'Low',  color: 'var(--teal,#22c97a)',  bg: 'color-mix(in srgb,var(--teal,#22c97a) 12%,transparent)',  border: 'color-mix(in srgb,var(--teal,#22c97a) 28%,transparent)'  },
};

function PriorityBadge({ priority }) {
  const cfg = P[priority] ?? P.medium;
  return (
    <span style={{
      fontSize: '10px', fontFamily: 'var(--mono)', textTransform: 'uppercase',
      letterSpacing: '0.4px', padding: '2px 7px', borderRadius: '4px',
      background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`, flexShrink: 0,
    }}>
      {cfg.label}
    </span>
  );
}

function PriorityPicker({ value, onChange }) {
  return (
    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
      {['high','medium','low'].map((p) => {
        const cfg = P[p]; const active = value === p;
        return (
          <button key={p} type="button" onClick={() => onChange(p)} style={{
            padding: '4px 11px', borderRadius: '5px', cursor: 'pointer',
            border: `1px solid ${active ? cfg.color : 'var(--border)'}`,
            background: active ? cfg.bg : 'transparent',
            color: active ? cfg.color : 'var(--text3)',
            fontSize: '11px', fontFamily: 'var(--mono)',
            textTransform: 'uppercase', letterSpacing: '0.4px', transition: 'all 0.15s',
          }}>
            {cfg.label}
          </button>
        );
      })}
    </div>
  );
}

// ── Deadline badge ────────────────────────────────────────────────────────────

function DeadlineBadge({ deadline, completed }) {
  if (!deadline) return null;
  const overdue = isOverdue(deadline, completed);
  const today   = isDueToday(deadline);
  return (
    <span style={{
      fontSize: '10px', fontFamily: 'var(--mono)', padding: '2px 7px',
      borderRadius: '4px', flexShrink: 0,
      background: overdue ? 'color-mix(in srgb,var(--red,#f05252) 12%,transparent)'
                 : today   ? 'color-mix(in srgb,var(--amber,#f5a623) 12%,transparent)'
                 :            'var(--bg3)',
      color: overdue ? 'var(--red,#f05252)' : today ? 'var(--amber,#f5a623)' : 'var(--text3)',
      border: `1px solid ${
        overdue ? 'color-mix(in srgb,var(--red,#f05252) 28%,transparent)'
        : today ? 'color-mix(in srgb,var(--amber,#f5a623) 28%,transparent)'
        :         'var(--border)'
      }`,
    }}>
      {overdue ? '⚠ ' : today ? '📅 ' : ''}{formatDeadline(deadline)}
    </span>
  );
}

// ── Shared form fields (used in both modal and inline edit) ───────────────────

function TodoFormFields({ title, setTitle, category, setCategory, priority, setPriority, deadline, setDeadline, error, titleRef, onKeyDown }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '11px' }}>
      <div>
        <label className="form-label">Title *</label>
        <input
          ref={titleRef}
          className="form-input"
          type="text"
          placeholder="What needs to be done?"
          value={title}
          onChange={(e) => { setTitle(e.target.value); }}
          onKeyDown={onKeyDown}
          maxLength={300}
          autoFocus
        />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        <div>
          <label className="form-label">Category</label>
          <input className="form-input" type="text" placeholder="e.g. Work"
            value={category} onChange={(e) => setCategory(e.target.value)} maxLength={50} />
        </div>
        <div>
          <label className="form-label">Deadline</label>
          <input className="form-input" type="date" value={deadline ?? ''}
            onChange={(e) => setDeadline(e.target.value)} style={{ colorScheme: 'dark' }} />
        </div>
      </div>
      <div>
        <label className="form-label">Priority</label>
        <PriorityPicker value={priority} onChange={setPriority} />
      </div>
      {error && (
        <p style={{ margin: 0, fontSize: '12px', color: 'var(--red)', fontFamily: 'var(--mono)' }}>{error}</p>
      )}
    </div>
  );
}

// ── Add Task Modal (floating, triggered by FAB) ───────────────────────────────

function AddTaskModal({ onSave, onClose }) {
  const [title, setTitle]       = useState('');
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState('medium');
  const [deadline, setDeadline] = useState('');
  const [error, setError]       = useState('');
  const titleRef = useRef(null);

  useEffect(() => {
    titleRef.current?.focus();
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const handleSubmit = useCallback(async (e) => {
    e?.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) { setError('Title is required'); titleRef.current?.focus(); return; }
    setError('');
    await onSave({ title: trimmed, category: category.trim(), priority, deadline: deadline || null });
    onClose();
  }, [title, category, priority, deadline, onSave, onClose]);

  return (
    <>
      <style>{`
        @keyframes _tdBgIn { from{opacity:0} to{opacity:1} }
        @keyframes _tdPanIn { from{opacity:0;transform:translate(-50%,-48%) scale(0.97)} to{opacity:1;transform:translate(-50%,-50%) scale(1)} }
      `}</style>
      {/* Backdrop */}
      <div onClick={onClose} style={{
        position:'fixed', inset:0, zIndex:8000,
        background:'rgba(0,0,0,0.55)', backdropFilter:'blur(3px)',
        animation:'_tdBgIn 0.18s ease',
      }} />
      {/* Panel */}
      <div role="dialog" aria-modal="true" aria-label="Add task"
        onClick={(e) => e.stopPropagation()}
        style={{
          position:'fixed', zIndex:8001,
          top:'50%', left:'50%', transform:'translate(-50%,-50%)',
          width:'min(480px, calc(100vw - 32px))',
          background:'var(--bg2)', border:'1px solid var(--border2)',
          borderRadius:'var(--radius)', padding:'24px',
          animation:'_tdPanIn 0.2s cubic-bezier(0.4,0,0.2,1)',
          boxShadow:'0 8px 40px rgba(0,0,0,0.5)',
        }}
      >
        <div style={{ fontSize:'15px', fontWeight:600, marginBottom:'16px', color:'var(--text)' }}>
          New task
        </div>
        <form onSubmit={handleSubmit}>
          <TodoFormFields
            title={title} setTitle={setTitle}
            category={category} setCategory={setCategory}
            priority={priority} setPriority={setPriority}
            deadline={deadline} setDeadline={setDeadline}
            error={error} titleRef={titleRef}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) handleSubmit(e); }}
          />
          <div className="modal-actions" style={{ marginTop:'16px' }}>
            <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-save">Add task</button>
          </div>
        </form>
      </div>
    </>
  );
}

// ── Inline Edit Panel (renders inside the card, no backdrop) ──────────────────

function InlineEditForm({ todo, onSave, onCancel }) {
  const [title, setTitle]       = useState(todo.title);
  const [category, setCategory] = useState(todo.category ?? '');
  const [priority, setPriority] = useState(todo.priority);
  const [deadline, setDeadline] = useState(todo.deadline ?? '');
  const [error, setError]       = useState('');
  const titleRef = useRef(null);

  const handleSave = useCallback(async (e) => {
    e?.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) { setError('Title is required'); titleRef.current?.focus(); return; }
    setError('');
    await onSave({ title: trimmed, category: category.trim(), priority, deadline: deadline || null });
  }, [title, category, priority, deadline, onSave]);

  return (
    <div
      data-edit-form
      onClick={(e) => e.stopPropagation()}
      style={{
        marginTop:'10px', padding:'12px',
        background:'var(--bg3)', border:'1px solid var(--border2)',
        borderRadius:'var(--radius-sm)',
        animation:'_tdEditIn 0.16s ease',
      }}
    >
      <style>{`@keyframes _tdEditIn{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:translateY(0)}}`}</style>
      <form onSubmit={handleSave}>
        <TodoFormFields
          title={title} setTitle={setTitle}
          category={category} setCategory={setCategory}
          priority={priority} setPriority={setPriority}
          deadline={deadline} setDeadline={setDeadline}
          error={error} titleRef={titleRef}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) handleSave(e); if (e.key === 'Escape') onCancel(); }}
        />
        <div className="modal-actions" style={{ marginTop:'12px' }}>
          <button type="button" className="btn-cancel" onClick={onCancel}>Cancel</button>
          <button type="submit" className="btn-save">Save changes</button>
        </div>
      </form>
    </div>
  );
}

// ── Undo Toast ────────────────────────────────────────────────────────────────

function UndoToast({ message, onUndo, onDismiss }) {
  useEffect(() => { const t = setTimeout(onDismiss, 4500); return () => clearTimeout(t); }, [onDismiss]);
  return (
    <div style={{
      position:'fixed', bottom:'28px', left:'50%', transform:'translateX(-50%)',
      zIndex:9000, display:'flex', alignItems:'center', gap:'12px',
      background:'var(--bg2)', border:'1px solid var(--border2)',
      borderRadius:'10px', padding:'10px 16px',
      fontSize:'13px', fontFamily:'var(--mono)', color:'var(--text2)',
      boxShadow:'0 4px 24px rgba(0,0,0,0.5)', backdropFilter:'blur(10px)',
      whiteSpace:'nowrap', animation:'_tdToastIn 0.22s ease forwards',
      maxWidth:'calc(100vw - 40px)',
    }}>
      <style>{`@keyframes _tdToastIn{from{opacity:0;transform:translateX(-50%) translateY(10px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}`}</style>
      <span>{message}</span>
      <button onClick={onUndo} style={{
        background:'var(--accent-a20)', border:'1px solid var(--accent)',
        borderRadius:'5px', color:'var(--accent2)', fontSize:'12px',
        fontFamily:'var(--mono)', padding:'3px 10px', cursor:'pointer',
      }}>
        Undo
      </button>
    </div>
  );
}

// ── Todo Card ─────────────────────────────────────────────────────────────────

function TodoCard({ todo, onToggle, onEdit, onDelete }) {
  const [isEditing, setIsEditing] = useState(false);
  const overdue = isOverdue(todo.deadline, todo.completed);

  // Click anywhere on card → toggle; clicks on data-action elements are excluded
  const handleCardClick = useCallback((e) => {
    if (e.target.closest('[data-action]') || e.target.closest('[data-edit-form]')) return;
    onToggle(todo.id);
  }, [todo.id, onToggle]);

  const handleSave = async (updates) => {
    await onEdit(todo.id, updates);
    setIsEditing(false);
  };

  return (
    <div
      onClick={handleCardClick}
      role="checkbox"
      aria-checked={todo.completed}
      tabIndex={0}
      onKeyDown={(e) => {
        if ((e.key === ' ' || e.key === 'Enter') && !e.target.closest('[data-action]')) {
          e.preventDefault();
          onToggle(todo.id);
        }
      }}
      style={{
        background: 'var(--bg2)',
        border: `1px solid ${overdue && !todo.completed
          ? 'color-mix(in srgb,var(--red,#f05252) 30%,var(--border))'
          : 'var(--border)'}`,
        borderRadius: 'var(--radius-sm)',
        padding: '10px 12px',
        cursor: 'pointer',
        opacity: todo.completed ? 0.58 : 1,
        transition: 'border-color 0.15s, opacity 0.2s, background 0.12s',
        userSelect: 'none',
      }}
      onMouseEnter={(e) => { if (!todo.completed && !isEditing) e.currentTarget.style.background = 'var(--bg3)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = ''; }}
    >
      <div style={{ display:'flex', alignItems:'flex-start', gap:'8px' }}>
        {/* Visual checkbox — decorative, card handles interaction */}
        <div aria-hidden="true" style={{
          marginTop:'2px', width:'15px', height:'15px', borderRadius:'3px', flexShrink:0,
          border:`2px solid ${todo.completed ? 'var(--green,#22c97a)' : overdue ? 'var(--red,#f05252)' : 'var(--border2)'}`,
          background: todo.completed ? 'var(--green,#22c97a)' : 'transparent',
          display:'flex', alignItems:'center', justifyContent:'center', transition:'all 0.15s',
        }}>
          {todo.completed && (
            <svg width="8" height="8" viewBox="0 0 12 12" fill="none">
              <polyline points="2 6 5 9 10 3" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </div>

        {/* Content */}
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{
            fontSize:'13.5px', color:'var(--text)', lineHeight:1.4,
            textDecoration: todo.completed ? 'line-through' : 'none',
            wordBreak:'break-word',
          }}>
            {todo.title}
          </div>
          {(todo.category || todo.priority || todo.deadline) && (
            <div style={{ display:'flex', gap:'5px', marginTop:'5px', flexWrap:'wrap', alignItems:'center' }}>
              {todo.category && (
                <span style={{
                  fontSize:'10px', fontFamily:'var(--mono)', color:'var(--text3)',
                  background:'var(--bg3)', border:'1px solid var(--border)',
                  borderRadius:'4px', padding:'1px 6px',
                }}>
                  {todo.category}
                </span>
              )}
              <PriorityBadge priority={todo.priority} />
              <DeadlineBadge deadline={todo.deadline} completed={todo.completed} />
            </div>
          )}
        </div>

        {/* Action buttons — data-action prevents card toggle on click */}
        <div data-action style={{ display:'flex', gap:'2px', flexShrink:0, marginTop:'-1px' }}>
          {!todo.completed && (
            <button
              data-action
              className="habit-action-btn"
              onClick={(e) => { e.stopPropagation(); setIsEditing((v) => !v); }}
              aria-label="Edit task" title="Edit"
              style={isEditing ? { color:'var(--accent2)', borderColor:'rgba(124,106,247,0.4)' } : {}}
            >
              <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </button>
          )}
          <button
            data-action
            className="habit-action-btn habit-action-btn--delete"
            onClick={(e) => { e.stopPropagation(); onDelete(todo.id, todo.title); }}
            aria-label="Delete task" title="Delete"
          >
            <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
              <path d="M10 11v6M14 11v6"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Inline edit form — no backdrop, lives inside the card */}
      {isEditing && (
        <InlineEditForm
          todo={todo}
          onSave={handleSave}
          onCancel={() => setIsEditing(false)}
        />
      )}
    </div>
  );
}

// ── Priority Column ───────────────────────────────────────────────────────────

function PriorityColumn({ priority, todos, onToggle, onEdit, onDelete }) {
  const cfg = P[priority];
  return (
    <div style={{
      background:'var(--bg2)', border:'1px solid var(--border)',
      borderRadius:'var(--radius)', padding:'12px',
      display:'flex', flexDirection:'column', gap:'6px', minWidth:0,
    }}>
      {/* Column header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'6px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'6px' }}>
          <div style={{ width:'7px', height:'7px', borderRadius:'50%', background:cfg.color }} />
          <span style={{ fontSize:'11px', fontWeight:600, color:'var(--text2)', fontFamily:'var(--mono)', textTransform:'uppercase', letterSpacing:'0.6px' }}>
            {cfg.label}
          </span>
        </div>
        <span style={{ fontSize:'11px', fontFamily:'var(--mono)', color:'var(--text3)' }}>
          {todos.length}
        </span>
      </div>

      {todos.length === 0 ? (
        <div style={{
          padding:'18px 0', textAlign:'center',
          color:'var(--text3)', fontSize:'12px', fontFamily:'var(--mono)', opacity:0.6,
        }}>
          No tasks
        </div>
      ) : (
        todos.map((t) => (
          <TodoCard key={t.id} todo={t} onToggle={onToggle} onEdit={onEdit} onDelete={onDelete} />
        ))
      )}
    </div>
  );
}

// ── Empty State ───────────────────────────────────────────────────────────────

function EmptyState({ onAdd }) {
  return (
    <div style={{
      display:'flex', flexDirection:'column', alignItems:'center',
      justifyContent:'center', padding:'60px 20px', gap:'14px',
    }}>
      <svg width="64" height="64" viewBox="0 0 64 64" fill="none" aria-hidden="true">
        <rect x="8" y="12" width="48" height="44" rx="6"
          fill="color-mix(in srgb,var(--accent,#7c6af7) 8%,transparent)"
          stroke="var(--border2)" strokeWidth="1.5"/>
        <rect x="16" y="4" width="8" height="16" rx="4"
          fill="var(--bg3)" stroke="var(--border2)" strokeWidth="1.5"/>
        <rect x="40" y="4" width="8" height="16" rx="4"
          fill="var(--bg3)" stroke="var(--border2)" strokeWidth="1.5"/>
        <line x1="8" y1="26" x2="56" y2="26" stroke="var(--border2)" strokeWidth="1.5"/>
        <rect x="18" y="34" width="20" height="3" rx="1.5" fill="var(--border2)" opacity="0.5"/>
        <rect x="18" y="41" width="14" height="3" rx="1.5" fill="var(--border2)" opacity="0.35"/>
        <circle cx="48" cy="48" r="10"
          fill="color-mix(in srgb,var(--accent,#7c6af7) 15%,transparent)"
          stroke="var(--accent,#7c6af7)" strokeWidth="1.5"/>
        <line x1="48" y1="44" x2="48" y2="52" stroke="var(--accent,#7c6af7)" strokeWidth="2" strokeLinecap="round"/>
        <line x1="44" y1="48" x2="52" y2="48" stroke="var(--accent,#7c6af7)" strokeWidth="2" strokeLinecap="round"/>
      </svg>
      <div style={{ fontSize:'15px', fontWeight:600, color:'var(--text)' }}>No tasks yet</div>
      <div style={{ fontSize:'13px', color:'var(--text3)', textAlign:'center', maxWidth:'220px', lineHeight:1.6 }}>
        Add your first task to start tracking what needs to be done.
      </div>
      <button className="btn-primary" onClick={onAdd} style={{ marginTop:'2px' }}>
        + Add first task
      </button>
    </div>
  );
}

// ── Main TodoView ─────────────────────────────────────────────────────────────

export function TodoView({ todos, loading, onAdd, onToggle, onEdit, onDelete }) {
  const [showModal, setShowModal] = useState(false);
  const [undoStack, setUndoStack] = useState(null);
  const undoTimerRef = useRef(null);

  const handleDelete = useCallback((id, title) => {
    const todo = todos.find((t) => t.id === id);
    if (!todo) return;
    onDelete(id);
    clearTimeout(undoTimerRef.current);
    setUndoStack({ todo, title });
    undoTimerRef.current = setTimeout(() => setUndoStack(null), 4500);
  }, [todos, onDelete]);

  const handleUndo = useCallback(async () => {
    if (!undoStack) return;
    clearTimeout(undoTimerRef.current);
    setUndoStack(null);
    await onAdd({
      title:    undoStack.todo.title,
      category: undoStack.todo.category,
      priority: undoStack.todo.priority,
      deadline: undoStack.todo.deadline,
    });
  }, [undoStack, onAdd]);

  useEffect(() => () => clearTimeout(undoTimerRef.current), []);

  const active    = todos.filter((t) => !t.completed);
  const completed = todos.filter((t) => t.completed);

  const byPriority = {
    high:   active.filter((t) => t.priority === 'high'),
    medium: active.filter((t) => t.priority === 'medium'),
    low:    active.filter((t) => t.priority === 'low'),
  };

  return (
    <>
      <style>{`
        .todo-priority-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
        }
        @media (max-width: 768px) {
          .todo-priority-grid { grid-template-columns: 1fr; }
        }
        /* FAB sits above the sync pill (bottom-right, pill is at right:20px/bottom:20px) */
        .todo-fab {
          position: fixed;
          bottom: 72px;
          right: 24px;
          z-index: 7000;
          display: flex;
          align-items: center;
          gap: 7px;
          background: var(--accent, #7c6af7);
          color: #fff;
          border: none;
          border-radius: 999px;
          padding: 11px 20px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          box-shadow: 0 4px 20px rgba(124,106,247,0.45);
          transition: transform 0.15s, box-shadow 0.15s;
          white-space: nowrap;
        }
        .todo-fab:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 24px rgba(124,106,247,0.6);
        }
        @media (max-width: 640px) {
          .todo-fab { bottom: 60px; right: 16px; padding: 10px 16px; font-size: 13px; }
        }
      `}</style>

      <div style={{ maxWidth:'960px', margin:'0 auto', paddingBottom:'100px' }}>

        {loading && (
          <div style={{ color:'var(--text3)', fontFamily:'var(--mono)', fontSize:'13px', marginBottom:'20px' }}>
            Loading…
          </div>
        )}

        {/* Empty state */}
        {!loading && todos.length === 0 && (
          <EmptyState onAdd={() => setShowModal(true)} />
        )}

        {/* Active tasks — 3-column priority grid */}
        {active.length > 0 && (
          <section style={{ marginBottom:'32px' }}>
            <div className="section-header" style={{ marginBottom:'12px' }}>
              <span className="section-title">Tasks</span>
              <span style={{ fontSize:'12px', fontFamily:'var(--mono)', color:'var(--text3)' }}>
                {active.length} pending
              </span>
            </div>
            <div className="todo-priority-grid">
              {['high','medium','low'].map((p) => (
                <PriorityColumn
                  key={p} priority={p} todos={byPriority[p]}
                  onToggle={onToggle} onEdit={onEdit} onDelete={handleDelete}
                />
              ))}
            </div>
          </section>
        )}

        {/* Completed section */}
        {completed.length > 0 && (
          <section>
            <div className="section-header" style={{ marginBottom:'10px' }}>
              <span className="section-title" style={{ color:'var(--text3)' }}>Completed</span>
              <span style={{ fontSize:'12px', fontFamily:'var(--mono)', color:'var(--text3)' }}>
                {completed.length}
              </span>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
              {completed.map((t) => (
                <TodoCard key={t.id} todo={t} onToggle={onToggle} onEdit={onEdit} onDelete={handleDelete} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Floating Add Task button — shown whenever there are todos or we're not in empty state */}
      {(todos.length > 0 || loading) && (
        <button className="todo-fab" onClick={() => setShowModal(true)} aria-label="Add new task">
          <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Add Task
        </button>
      )}

      {/* Add task modal */}
      {showModal && (
        <AddTaskModal onSave={onAdd} onClose={() => setShowModal(false)} />
      )}

      {/* Undo toast */}
      {undoStack && (
        <UndoToast
          message={`"${undoStack.title.slice(0, 32)}${undoStack.title.length > 32 ? '…' : ''}" deleted`}
          onUndo={handleUndo}
          onDismiss={() => setUndoStack(null)}
        />
      )}
    </>
  );
}
