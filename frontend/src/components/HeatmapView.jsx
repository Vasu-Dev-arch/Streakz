import React, { useState, useMemo } from 'react';
import { dateKey, getStreak, getBestStreak, getCompletionRate } from '../utils/dateUtils';
import { MONTHS, DAY_LETTERS } from '../constants';
import { HabitIcon } from './HabitIcon';

// Hide scrollbar while preserving scroll functionality
const scrollbarHideStyles = `
  .heatmap-scroll-container::-webkit-scrollbar {
    display: none;
  }
  .heatmap-scroll-container {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
`;

/**
 * Build a 26-week grid of day cells.
 * Returns { cols, monthLabels } where cols is an array of 7-cell column arrays.
 */
function buildGrid(getCellValue, getMax, showTip, hideTip) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const WEEKS = 26;

  // Find the Sunday that starts our grid
  const gridStart = new Date(today);
  gridStart.setDate(today.getDate() - WEEKS * 7 + 1);
  gridStart.setDate(gridStart.getDate() - gridStart.getDay()); // snap to Sunday

  const maxVal = getMax();
  const cols = [];
  const monthLabels = [];
  let lastMonth = -1;

  for (let w = 0; w < WEEKS; w++) {
    const col = [];

    for (let d = 0; d < 7; d++) {
      const date = new Date(gridStart);
      date.setDate(gridStart.getDate() + w * 7 + d);
      const k = dateKey(date);
      const val = getCellValue(k, date);
      const level = maxVal > 0 ? Math.min(5, Math.ceil((val / maxVal) * 5)) : 0;
      const isFuture = date > today;
      const isToday = k === dateKey(today);
      const tipText = `${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}: ${val}`;

      col.push(
        <div
          key={`${w}-${d}`}
          className={`heatmap-sq${!isFuture && level > 0 ? ` l${level}` : ''}${isFuture ? ' heatmap-sq--future' : ''}`}
          style={isToday ? { outline: '1.5px solid var(--accent)', outlineOffset: '1px' } : undefined}
          title={tipText}
          onMouseMove={(e) => showTip(e, tipText)}
          onMouseLeave={hideTip}
        />
      );
    }

    cols.push(
      <div key={w} className="heatmap-col">
        {col}
      </div>
    );

    // Month label for this column
    const colDate = new Date(gridStart);
    colDate.setDate(gridStart.getDate() + w * 7);
    const month = colDate.getMonth();
    if (month !== lastMonth) {
      monthLabels.push(
        <span key={w} style={{ minWidth: `${7 * 14 + 2}px`, display: 'inline-block' }}>
          {MONTHS[month]}
        </span>
      );
      lastMonth = month;
    } else {
      monthLabels.push(
        <span key={w} style={{ minWidth: `${7 * 14 + 2}px`, display: 'inline-block' }} />
      );
    }
  }

  return { cols, monthLabels };
}

function HeatmapGrid({ getCellValue, getMax, showTip, hideTip, completions }) {
  const { cols, monthLabels } = useMemo(
    () => buildGrid(getCellValue, getMax, showTip, hideTip),
    [getCellValue, getMax, showTip, hideTip]
  );

  const dayLabels = DAY_LETTERS.map((l, i) => (
    <div key={i} className="heatmap-day-label" style={{ fontSize: '9px', height: '14px', display: 'flex', alignItems: 'center' }}>
      {i % 2 === 1 ? l : ''}
    </div>
  ));

  return (
    <div className="heatmap-scroll-container" style={{ overflowX: 'auto', overflowY: 'hidden', paddingBottom: '4px' }}>
      <div style={{ minWidth: 'max-content' }}>
        <div
          className="heatmap-months"
          style={{ paddingLeft: '26px', display: 'flex', gap: 0, fontSize: '10px', color: 'var(--text3)', fontFamily: 'var(--mono)', marginBottom: '4px' }}
        >
          {monthLabels}
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', paddingTop: '1px', width: '18px' }}>
            {dayLabels}
          </div>
          <div style={{ display: 'flex', gap: '2px' }}>
            {cols}
          </div>
        </div>
      </div>
    </div>
  );
}

export function HeatmapView({ habits, completions }) {
  const [tooltip, setTooltip] = useState({ show: false, text: '', x: 0, y: 0 });

  const showTip = (e, text) =>
    setTooltip({ show: true, text, x: e.clientX + 14, y: e.clientY - 34 });

  const hideTip = () =>
    setTooltip({ show: false, text: '', x: 0, y: 0 });

  // Overall heatmap: count habits completed per day
  const overallGetMax = () => Math.max(habits.length, 1);
  const overallGetCell = (k) => completions[k] ? completions[k].size : 0;

  return (
    <div className="view active">
      <style>{scrollbarHideStyles}</style>
      {/* Overall */}
      <div className="chart-card" style={{ marginBottom: '20px' }}>
        <div className="chart-title">Overall completion heatmap</div>
        <div className="chart-sub">Past 26 weeks — darker = more habits completed that day</div>
        <div style={{ marginTop: '16px' }}>
          <HeatmapGrid
            getCellValue={overallGetCell}
            getMax={overallGetMax}
            showTip={showTip}
            hideTip={hideTip}
            completions={completions}
          />
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '12px', justifyContent: 'flex-end' }}>
          <span style={{ fontSize: '10px', color: 'var(--text3)', fontFamily: 'var(--mono)' }}>Less</span>
          {[0, 1, 2, 3, 4, 5].map((l) => (
            <div
              key={l}
              style={{
                width: '12px', height: '12px', borderRadius: '2px',
                background: l === 0 ? 'var(--bg4)' :
                  l === 1 ? 'rgba(124,106,247,0.2)' :
                  l === 2 ? 'rgba(124,106,247,0.38)' :
                  l === 3 ? 'rgba(124,106,247,0.56)' :
                  l === 4 ? 'rgba(124,106,247,0.78)' :
                  'var(--accent2)',
              }}
            />
          ))}
          <span style={{ fontSize: '10px', color: 'var(--text3)', fontFamily: 'var(--mono)' }}>More</span>
        </div>
      </div>

      {/* Per-habit heatmaps */}
      {habits.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon" style={{ fontSize: '40px' }}>📅</div>
          <div className="empty-text">No habits yet</div>
          <div className="empty-sub">Add habits to see your heatmap</div>
        </div>
      ) : (
        habits.map((habit) => {
          const habitGetMax = () => 1;
          const habitGetCell = (k) => completions[k]?.has(habit.id) ? 1 : 0;

          return (
            <div key={habit.id} className="chart-card" style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                <div
                  style={{
                    width: '36px', height: '36px', borderRadius: '10px',
                    background: `${habit.color}20`, display: 'flex',
                    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}
                >
                  <HabitIcon iconId={habit.icon} emoji={habit.emoji} size={18} color={habit.color} />
                </div>
                <div>
                  <div className="chart-title" style={{ marginBottom: '2px' }}>{habit.name}</div>
                  <div className="chart-sub" style={{ marginBottom: 0 }}>
                    Current: {getStreak(habit.id, completions)}d · Best: {getBestStreak(habit.id, completions)}d · 30-day: {getCompletionRate(habit.id, completions, 30)}%
                  </div>
                </div>
              </div>

              <HeatmapGrid
                getCellValue={habitGetCell}
                getMax={habitGetMax}
                showTip={showTip}
                hideTip={hideTip}
                completions={completions}
              />
            </div>
          );
        })
      )}

      {tooltip.show && (
        <div
          className="tooltip"
          style={{ display: 'block', position: 'fixed', left: tooltip.x, top: tooltip.y, zIndex: 500 }}
        >
          {tooltip.text}
        </div>
      )}
    </div>
  );
}
