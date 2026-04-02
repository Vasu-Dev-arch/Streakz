import React, { useState, useMemo } from 'react';
import { dateKey, getStreak, getBestStreak, getCompletionRate } from '../utils/dateUtils';
import { MONTHS, DAY_LETTERS } from '../constants';
import { HabitIcon } from './HabitIcon';

const scrollbarHideStyles = `
  .heatmap-scroll-container::-webkit-scrollbar {
    display: none;
  }
  .heatmap-scroll-container {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
`;

const MONTH_LABELS = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function buildGitHubStyleGrid(getCellValue, maxVal = 1, isBinary = true) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const currentYear = today.getFullYear();
  
  const startDate = new Date(currentYear, 0, 1);
  const endDate = new Date(currentYear, 11, 31);
  
  while (startDate.getDay() !== 0) {
    startDate.setDate(startDate.getDate() - 1);
  }
  
  const cols = [];
  const monthLabels = [];
  let lastMonth = -1;
  let weekIndex = 0;
  
  const currentDate = new Date(startDate);
  while (currentDate <= endDate || currentDate.getDay() !== 0) {
    const weekCol = [];
    for (let d = 0; d < 7; d++) {
      const date = new Date(currentDate);
      const k = dateKey(date);
      const val = getCellValue(k, date);
      const level = isBinary ? (val > 0 ? 1 : 0) : (maxVal > 0 ? Math.min(4, Math.ceil((val / maxVal) * 4)) : 0);
      const inYear = date.getFullYear() === currentYear;
      const tipText = inYear 
        ? `${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}: ${val}`
        : `${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}: ${val}`;

      weekCol.push(
        <div
          key={`${weekIndex}-${d}`}
          className={`heatmap-sq${level > 0 ? ` l${level}` : ''}`}
          title={tipText}
        />
      );
      currentDate.setDate(currentDate.getDate() + 1);
    }

    cols.push(
      <div key={weekIndex} className="heatmap-col">
        {weekCol}
      </div>
    );

    const colDate = new Date(currentDate);
    colDate.setDate(currentDate.getDate() - 7);
    const month = colDate.getMonth() + 1;
    if (month !== lastMonth) {
      monthLabels.push(
        <span key={weekIndex} style={{ minWidth: '14px', display: 'inline-block' }}>
          {MONTH_LABELS[month]}
        </span>
      );
      lastMonth = month;
    } else {
      monthLabels.push(
        <span key={weekIndex} style={{ minWidth: '14px', display: 'inline-block' }} />
      );
    }
    weekIndex++;
  }

  return { cols, monthLabels };
}

function HeatmapGrid({ getCellValue, maxVal, isBinary = true }) {
  const { cols, monthLabels } = useMemo(
    () => buildGitHubStyleGrid(getCellValue, maxVal, isBinary),
    [getCellValue, maxVal, isBinary]
  );

  const dayLabels = DAY_LABELS.map((label, i) => (
    <div 
      key={i} 
      className="heatmap-day-label" 
      style={{ 
        fontSize: '10px', 
        height: '12px', 
        display: 'flex', 
        alignItems: 'center',
        fontFamily: 'var(--mono)',
        color: 'var(--text3)'
      }}
    >
      {i % 2 === 1 ? label : ''}
    </div>
  ));

  return (
    <div className="heatmap-scroll-container" style={{ overflowX: 'auto', overflowY: 'hidden', paddingBottom: '4px' }}>
      <div style={{ minWidth: 'max-content' }}>
        <div
          className="heatmap-months"
          style={{ paddingLeft: '28px', display: 'flex', gap: '0', fontSize: '10px', color: 'var(--text3)', fontFamily: 'var(--mono)', marginBottom: '4px' }}
        >
          {monthLabels}
        </div>
        <div style={{ display: 'flex', gap: '3px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', paddingTop: '0px', width: '26px' }}>
            {dayLabels}
          </div>
          <div style={{ display: 'flex', gap: '3px' }}>
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

  const today = new Date();
  const currentYear = today.getFullYear();

  const overallMax = Math.max(habits.length, 1);
  const overallGetCell = (k) => completions[k] ? completions[k].size : 0;

  return (
    <div className="view active">
      <style>{scrollbarHideStyles}</style>
      
      {/* Overall */}
      <div className="chart-card" style={{ marginBottom: '20px' }}>
        <div className="chart-title">Overall completion heatmap</div>
        <div className="chart-sub">{currentYear} — darker = more habits completed that day</div>
        <div style={{ marginTop: '16px' }}>
          <HeatmapGrid
            getCellValue={overallGetCell}
            maxVal={overallMax}
            isBinary={false}
          />
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '12px', justifyContent: 'flex-end' }}>
          <span style={{ fontSize: '10px', color: 'var(--text3)', fontFamily: 'var(--mono)' }}>Less</span>
          {[0, 1, 2, 3, 4].map((l) => (
            <div
              key={l}
              style={{
                width: '10px', height: '10px', borderRadius: '2px',
                background: l === 0 ? 'var(--theme-backgroundQuaternary, #222228)' :
                  l === 1 ? 'rgba(165, 153, 255, 0.25)' :
                  l === 2 ? 'rgba(165, 153, 255, 0.5)' :
                  l === 3 ? 'rgba(165, 153, 255, 0.75)' :
                  'var(--theme-accentSecondary, #a599ff)',
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
                maxVal={1}
                isBinary={true}
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
