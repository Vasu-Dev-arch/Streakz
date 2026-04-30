'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { getToken } from '../hooks/useAuth';
import {
  getCachedJournalEntries,
  upsertCachedJournalEntry,
  cacheJournalEntries,
  enqueueAction,
} from '../utils/offlineDB';
import { OfflineFeatureNotice } from './OfflineFeatureNotice';

function localDateKey(daysAgo) {
  var offset = daysAgo || 0;
  var d = new Date();
  d.setDate(d.getDate() - offset);
  return (
    d.getFullYear() +
    '-' +
    String(d.getMonth() + 1).padStart(2, '0') +
    '-' +
    String(d.getDate()).padStart(2, '0')
  );
}

function formatDateLabel(dateStr, todayStr, yesterdayStr) {
  var parts = dateStr.split('-').map(Number);
  var y = parts[0];
  var m = parts[1];
  var day = parts[2];
  var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var monthName = months[m - 1];
  if (dateStr === todayStr) return 'Today, ' + monthName + ' ' + day;
  if (dateStr === yesterdayStr) return 'Yesterday, ' + monthName + ' ' + day;
  return monthName + ' ' + day + ', ' + y;
}

async function apiFetch(path, options) {
  var opts = options || {};
  var token = getToken();
  var res = await fetch(path, Object.assign({}, opts, {
    headers: Object.assign(
      { 'Content-Type': 'application/json' },
      token ? { Authorization: 'Bearer ' + token } : {},
      opts.headers || {}
    ),
  }));
  if (res.status === 204) return null;
  var data = await res.json();
  if (!res.ok) throw new Error((data && data.error) ? data.error : String(res.status));
  return data;
}

export function JournalView() {
  var todayStr = localDateKey(0);
  var yesterdayStr = localDateKey(1);

  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [fetchLoading, setFetchLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState(null); // null | 'saved' | 'saved-offline' | 'error'
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [expandedEntry, setExpandedEntry] = useState(null);
  const statusTimerRef = useRef(null);

  useEffect(function () {
    function up() { setIsOnline(true); }
    function down() { setIsOnline(false); }
    window.addEventListener('online', up);
    window.addEventListener('offline', down);
    return function () {
      window.removeEventListener('online', up);
      window.removeEventListener('offline', down);
    };
  }, []);

  // ── Fetch history — offline-first ──────────────────────────────────────────
  const fetchHistory = useCallback(async function () {
    setHistoryLoading(true);
    try {
      // Show cached first
      var cached = await getCachedJournalEntries();
      if (cached.length) {
        var past = cached.filter(function (e) { return e.date < todayStr; });
        setHistory(past.sort(function (a, b) { return b.date.localeCompare(a.date); }));
      }

      if (navigator.onLine) {
        var entries = await apiFetch('/api/journal/history');
        var arr = Array.isArray(entries) ? entries : [];
        setHistory(arr);
        await cacheJournalEntries(arr);
      }
    } catch (_err) {
      // keep whatever we have
    } finally {
      setHistoryLoading(false);
    }
  }, [todayStr]);

  useEffect(function () {
    fetchHistory();
    function onSync() { fetchHistory(); }
    window.addEventListener('streakz:sync-complete', onSync);
    return function () { window.removeEventListener('streakz:sync-complete', onSync); };
  }, [fetchHistory]);

  // ── Fetch entry for selected date — offline-first ─────────────────────────
  const fetchEntry = useCallback(async function (date) {
    setFetchLoading(true);
    setStatus(null);
    try {
      // Try cache first
      var cached = await getCachedJournalEntries();
      var local = cached.find(function (e) { return e.date === date; });
      if (local) {
        setTitle(local.title || '');
        setContent(local.content || '');
      }

      if (navigator.onLine) {
        var entry = await apiFetch('/api/journal?date=' + date);
        setTitle((entry && entry.title) ? entry.title : '');
        setContent((entry && entry.content) ? entry.content : '');
        if (entry) await upsertCachedJournalEntry(entry);
      } else if (!local) {
        setTitle('');
        setContent('');
      }
    } catch (_err) {
      if (!content) { setTitle(''); setContent(''); }
    } finally {
      setFetchLoading(false);
    }
  }, []);

  useEffect(function () {
    fetchEntry(selectedDate);
  }, [selectedDate, fetchEntry]);

  useEffect(function () {
    return function () { clearTimeout(statusTimerRef.current); };
  }, []);

  // ── Save ──────────────────────────────────────────────────────────────────
  async function handleSave() {
    if (!content.trim()) return;
    setSaving(true);
    setStatus(null);
    clearTimeout(statusTimerRef.current);

    var payload = {
      date: selectedDate,
      title: title.trim(),
      content: content.trim(),
    };

    // Always save to local cache immediately
    await upsertCachedJournalEntry(payload);

    if (!isOnline) {
      // Queue for later sync — dedupeKey ensures only one pending save per date
      await enqueueAction('journal-save', payload, 'journal-save-' + selectedDate);
      setStatus('saved-offline');
      setSaving(false);
      statusTimerRef.current = setTimeout(function () { setStatus(null); }, 3500);
      // Update history list from cache
      fetchHistory();
      return;
    }

    try {
      await apiFetch('/api/journal', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      setStatus('saved');
      fetchHistory();
    } catch (_err) {
      // Network error during attempt — queue it
      await enqueueAction('journal-save', payload, 'journal-save-' + selectedDate);
      setStatus('saved-offline');
    } finally {
      setSaving(false);
      statusTimerRef.current = setTimeout(function () { setStatus(null); }, 3500);
    }
  }

  function getPreviewText(entry) {
    var text = (entry.title && entry.title.trim()) || (entry.content && entry.content.trim()) || '';
    return text.length > 40 ? text.slice(0, 40) + '…' : text;
  }

  function handleToggleEntry(date) {
    setExpandedEntry(function (cur) { return cur === date ? null : date; });
  }

  return (
    <div className="journal-view">
      {/* Date tabs — today and yesterday only */}
      <div className="journal-date-tabs" role="tablist" aria-label="Select date">
        {[todayStr, yesterdayStr].map(function (date) {
          return (
            <button
              key={date}
              role="tab"
              aria-selected={selectedDate === date}
              className={'journal-date-tab' + (selectedDate === date ? ' active' : '')}
              onClick={function () { if (date !== selectedDate) setSelectedDate(date); }}
            >
              {formatDateLabel(date, todayStr, yesterdayStr)}
            </button>
          );
        })}
      </div>

      {/* Entry editor */}
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
            onChange={function (e) { setTitle(e.target.value); }}
            maxLength={200}
            aria-label="Journal entry title"
          />
          <textarea
            className="journal-content-input"
            placeholder="What's on your mind today?"
            value={content}
            onChange={function (e) { setContent(e.target.value); }}
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
            {status === 'saved-offline' && (
              <span className="journal-status" style={{ color: 'var(--amber)' }}>
                📡 Saved offline — will sync
              </span>
            )}
            {status === 'error' && (
              <span className="journal-status journal-status--error">Failed to save</span>
            )}
          </div>
        </div>
      )}

      {/* Past entries */}
      <section className="journal-history">
        <h2 className="journal-history__title">Past Entries</h2>
        {historyLoading ? (
          <p className="journal-history__empty" style={{ fontFamily: 'var(--mono)', fontSize: '13px' }}>Loading…</p>
        ) : history.length === 0 ? (
          <p className="journal-history__empty">No past entries yet.</p>
        ) : (
          <div className="journal-history__list">
            {history.map(function (entry) {
              var isExpanded = expandedEntry === entry.date;
              return (
                <div key={entry.date} className="journal-history__item">
                  <button
                    type="button"
                    className={'journal-history__toggle' + (isExpanded ? ' expanded' : '')}
                    onClick={function () { handleToggleEntry(entry.date); }}
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
                      {entry.title && (
                        <div style={{ fontWeight: 600, marginBottom: '8px', color: 'var(--text)' }}>
                          {entry.title}
                        </div>
                      )}
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
