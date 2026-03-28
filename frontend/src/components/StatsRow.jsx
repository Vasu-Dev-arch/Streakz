import React from 'react';
import { getTodayStats } from '../utils/dateUtils';

/**
 * Stats row component showing today's statistics
 */
export function StatsRow({ habits, completions }) {
  const { done, total, maxStreak, avgRate } = getTodayStats(habits, completions);
  const pct = total ? Math.round((done / total) * 100) : 0;

  return (
    <div className="stats-row">
      <div className="stat-card">
        <div className="stat-label">Completed today</div>
        <div className="stat-value" style={{ color: 'var(--green)' }}>
          {done}<span style={{ fontSize: '16px', color: 'var(--text3)' }}>/{total}</span>
        </div>
        <div className="progress-bar-wrap">
          <div 
            className="progress-bar-fill" 
            style={{ width: `${pct}%`, background: 'var(--green)' }}
          ></div>
        </div>
      </div>
      
      <div className="stat-card">
        <div className="stat-label">Completion rate</div>
        <div className="stat-value" style={{ color: 'var(--accent2)' }}>
          {pct}<span style={{ fontSize: '16px', color: 'var(--text3)' }}>%</span>
        </div>
        <div className="stat-sub">today</div>
      </div>
      
      <div className="stat-card">
        <div className="stat-label">Top streak</div>
        <div className="stat-value" style={{ color: 'var(--amber)' }}>
          {maxStreak}<span style={{ fontSize: '16px', color: 'var(--text3)' }}> days</span>
        </div>
        <div className="stat-sub">current best</div>
      </div>
      
      <div className="stat-card">
        <div className="stat-label">30-day avg</div>
        <div className="stat-value" style={{ color: 'var(--teal)' }}>
          {avgRate}<span style={{ fontSize: '16px', color: 'var(--text3)' }}>%</span>
        </div>
        <div className="stat-sub">all habits</div>
      </div>
    </div>
  );
}
