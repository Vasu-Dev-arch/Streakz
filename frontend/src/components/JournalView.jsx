'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { getToken } from '../hooks/useAuth';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000';

/**
 * Returns YYYY-MM-DD for a date offset by `daysAgo` days from today,
 * using local time (consistent with the backend helper).
 */
function localDateKey(daysAgo = 0) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/**
 * Format a YYYY-MM-DD string into a human-readable label, e.g. "Today, Apr 15".
 */
function formatDateLabel(dateStr, todayStr, yesterdayStr) {
  const [, m, day] = dateStr.split('-').map(Number);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  if (dateStr === todayStr) {
    return `Today, ${months[m - 1]} ${day}`;
  }
  if (dateStr === yesterdayStr) {
    return `Yesterday, ${months[m - 1]} ${day}`;
  }

  return `${months[m - 1]} ${day}`;
}

async function apiFetch(path, options = {}) {
  const token = getToken();
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  if (res.status === 204) return null;
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `${res.status}`);
  return data;
}

export function JournalView() {
  const todayStr = localDateKey(0);
  const yesterdayStr = localDateKey(1);

  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [fetchLoading, setFetchLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState(null); // null | 'saved' | 'error'
  const [history, setHistory] = useState([]);
  const [expandedEntry, setExpandedEntry] = useState(null);
  const statusTimerRef = useRef(null);

  // Fetch the entry whenever the selected date changes
  const fetchEntry = useCallback(async (date) => {
    setFetchLoading(true);
    setStatus(null);
    try {
      const entry = await apiFetch(`/api/journal?date=${date}`);
      setTitle(entry?.title ?? '');
      setContent(entry?.content ?? '');
    } catch {
      setTitle('');
      setContent('');
    } finally {
      setFetchLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    async function loadHistory() {
      try {
        const pastEntries = await apiFetch('/api/journal/history');
        if (mounted) setHistory(Array.isArray(pastEntries) ? pastEntries : []);
      } catch {
        if (mounted) setHistory([]);
      }
    }

    loadHistory();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    fetchEntry(selectedDate);
  }, [selectedDate, fetchEntry]);

  // Cleanup status timer on unmount
  useEffect(() => () => clearTimeout(statusTimerRef.current), []);

  const handleDateChange = (date) => {
    if (date === selectedDate) return;
    setSelectedDate(date);
  };

  const handleSave = async () => {
    if (!content.trim()) return;
    setSaving(true);
    setStatus(null);
    clearTimeout(statusTimerRef.current);
    try {
      await apiFetch('/api/journal', {
        method: 'POST',
        body: JSON.stringify({
          date: selectedDate,
          title: title.trim(),
          content: content.trim(),
        }),
      });
      setStatus('saved');
    } catch {
      setStatus('error');
    } finally {
      setSaving(false);
      statusTimerRef.current = setTimeout(() => setStatus(null), 3000);
    }
  };

  const getPreviewText = (entry) => {
    const text = entry.title?.trim() || entry.content.trim();
    if (!text) return '';
    return text.length > 30 ? `${text.slice(0, 30)}…` : text;
  };

  const handleToggleEntry = (date) => {
    setExpandedEntry((current) => (current === date ? null : date));
  };

  return (
    <div className="journal-view">
      {/* Date tabs — today and yesterday only */}
      <div className="journal-date-tabs" role="tablist" aria-label="Select date">
        {[todayStr, yesterdayStr].map((date) => (
          <button
            key={date}
            role="tab"
            aria-selected={selectedDate === date}
            className={`journal-date-tab${selectedDate === date ? ' active' : ''}`}
            onClick={() => handleDateChange(date)}
          >
            {formatDateLabel(date, todayStr, yesterdayStr)}
          </button>
        ))}
      </div>

      {fetchLoading ? (
        <div style={{ color: 'var(--text3)', fontFamily: 'var(--mono)', fontSize: '13px', paddingTop: '20px' }}>
          Loading…
        </div>
      ) : (
        <div className="journal-form">
          <input
            type="text"
            className="journal-title-input"
            placeholder="Title (optional)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={200}
            aria-label="Journal entry title"
          />
          <textarea
            className="journal-content-input"
            placeholder="What's on your mind today?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength={10000}
            aria-label="Journal entry content"
          />
          <div className="journal-actions">
            <button
              className="journal-save-btn"
              onClick={handleSave}
              disabled={saving || !content.trim()}
            >
              {saving ? 'Saving…' : 'Save entry'}
            </button>
            {status === 'saved' && (
              <span className="journal-status journal-status--saved">✓ Saved</span>
            )}
            {status === 'error' && (
              <span className="journal-status journal-status--error">Failed to save</span>
            )}
          </div>
        </div>
      )}

      <section className="journal-history">
        <h2 className="journal-history__title">Past Entries</h2>
        {history.length === 0 ? (
          <p className="journal-history__empty">No past entries yet</p>
        ) : (
          <div className="journal-history__list">
            {history.map((entry) => {
              const isExpanded = expandedEntry === entry.date;
              return (
                <div key={entry.date} className="journal-history__item">
                  <button
                    type="button"
                    className={`journal-history__toggle${isExpanded ? ' expanded' : ''}`}
                    onClick={() => handleToggleEntry(entry.date)}
                  >
                    <span className="journal-history__date">
                      {formatDateLabel(entry.date, todayStr, yesterdayStr)}
                    </span>
                    <span className="journal-history__preview">
                      {getPreviewText(entry)}
                    </span>
                  </button>
                  {isExpanded && (
                    <div className="journal-history__content">
                      {entry.content}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
