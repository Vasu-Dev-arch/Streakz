'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getStreak } from '../utils/dateUtils';
import { HabitIcon } from './HabitIcon';

export function Sidebar({
  habits,
  completions,
  activeView,
  onViewChange,
  onAddHabit,
  isOpen,
  onClose,
}) {
  const handleNavClick = (view) => {
    onViewChange(view);
    if (onClose) onClose();
  };

  return (
    <>
      <div
        className={`sidebar-overlay${isOpen ? ' sidebar--open' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        className={`sidebar${isOpen ? ' sidebar--open' : ''}`}
        aria-label="Main navigation"
      >
        <button
          className="sidebar-close-btn"
          onClick={onClose}
          aria-label="Close navigation menu"
        >
          <span aria-hidden="true">✕</span>
        </button>

        <div className="sidebar-logo" role="banner">
          <Link
            href="/dashboard"
            className="logo-mark"
            style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '700', textDecoration: 'none', color: 'inherit' }}
          >
            <Image
              src="/assets/logo.png"
              alt="Streakz"
              width={24}
              height={24}
              style={{ objectFit: 'contain' }}
            />
            <span>Streakz</span>
          </Link>
          <div className="logo-sub">Habit Analytics</div>
        </div>

        <nav aria-label="Primary navigation">
          <div className="sidebar-section-label" id="nav-label">Navigate</div>
          <ul className="nav-list" role="menubar" aria-labelledby="nav-label">
            {[
              {
                view: 'today', label: 'Today',
                icon: <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>,
              },
              {
                view: 'todo', label: 'To-Do',
                icon: <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg>,
              },
              {
                view: 'analytics', label: 'Analytics',
                icon: <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>,
              },
              {
                view: 'heatmap', label: 'Heatmap',
                icon: <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M8 2v4M16 2v4M3 10h18" /></svg>,
              },
              {
                view: 'goals', label: 'Goals',
                icon: <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></svg>,
              },
              {
                view: 'journal', label: 'Journal',
                icon: <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>,
              },
              {
                view: 'ai-coach', label: 'AI Coach', badge: 'AI',
                icon: <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2z" /><path d="M12 8v4l3 3" /></svg>,
              },
              {
                view: 'settings', label: 'Settings',
                icon: <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>,
              },
            ].map(({ view, label, icon, badge }) => (
              <li
                key={view}
                className={`nav-item${activeView === view ? ' active' : ''}`}
                onClick={() => handleNavClick(view)}
                role="menuitem"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && handleNavClick(view)}
              >
                <span className="nav-icon" aria-hidden="true">{icon}</span>
                <span>{label}</span>
                {badge && <span className="nav-badge" aria-label="AI powered feature">{badge}</span>}
              </li>
            ))}
          </ul>
        </nav>

        <div className="sidebar-main">
          <nav aria-label="Your habits">
            <div className="sidebar-section-label">My Habits</div>
            <div className="habit-sidebar-list" role="list">
              {habits.length === 0 ? (
                <div
                  role="listitem"
                  style={{
                    padding: '8px 12px',
                    fontSize: '12px',
                    color: 'var(--text3)',
                    fontFamily: 'var(--mono)',
                  }}
                >
                  No habits yet
                </div>
              ) : (
                habits.map((habit) => {
                  const streak = getStreak(habit.id, completions);
                  return (
                    <div
                      key={habit.id}
                      className="habit-sidebar-item"
                      onClick={() => handleNavClick('today')}
                      role="listitem"
                      tabIndex={0}
                      onKeyDown={(e) => e.key === 'Enter' && handleNavClick('today')}
                    >
                      <span className="habit-dot" style={{ background: habit.color }} />
                      <HabitIcon
                        iconId={habit.icon}
                        emoji={habit.emoji}
                        size={13}
                        color={habit.color}
                        style={{ flexShrink: 0 }}
                        aria-hidden="true"
                      />
                      <span className="habit-sidebar-name">{habit.name}</span>
                      <span className="habit-sidebar-streak" aria-label={`${streak} day streak`}>
                        {streak > 0 ? `🔥${streak}` : ''}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </nav>
        </div>

        <div className="sidebar-footer">
          <button
            className="sidebar-btn"
            onClick={() => {
              onAddHabit();
              if (onClose) onClose();
            }}
            aria-label="Add a new habit"
          >
            + Add habit
          </button>
        </div>
      </aside>
    </>
  );
}
