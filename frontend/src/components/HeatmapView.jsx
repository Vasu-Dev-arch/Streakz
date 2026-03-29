import React, { useState } from 'react';
import { dateKey, getStreak, getBestStreak, getCompletionRate } from '../utils/dateUtils';
import { MONTHS } from '../constants';

/**
 * Heatmap view component showing completion heatmaps
 */
export function HeatmapView({ habits, completions }) {
  const [tooltip, setTooltip] = useState({ show: false, text: '', x: 0, y: 0 });

  const showTip = (e, text) => {
    setTooltip({
      show: true,
      text,
      x: e.clientX + 12,
      y: e.clientY - 28,
    });
  };

  const hideTip = () => {
    setTooltip({ show: false, text: '', x: 0, y: 0 });
  };

  const buildHeatmapHTML = (getCellValue, getMax) => {
    const today = new Date();
    const weeks = 26;
    const totalDays = weeks * 7;
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - totalDays + 1);
    // Align to Sunday
    startDate.setDate(startDate.getDate() - startDate.getDay());

    const maxVal = getMax();
    const cols = [];
    const monthLabels = [];
    let lastMonth = -1;

    for (let w = 0; w < weeks; w++) {
      const col = [];
      for (let d = 0; d < 7; d++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + w * 7 + d);
        const k = dateKey(date);
        const val = getCellValue(k, date);
        const level = maxVal ? Math.ceil((val / maxVal) * 5) : 0;
        const isFuture = date > today;
        const isToday = dateKey(date) === dateKey(today);
        const title = `${date.toDateString()}: ${val}`;
        
        col.push(
          <div
            key={d}
            className={`heatmap-sq${!isFuture && level ? ` l${level}` : ''}`}
            style={isToday ? { outline: '1px solid #7c6af7' } : {}}
            title={title}
            onMouseMove={(e) => showTip(e, title)}
            onMouseLeave={hideTip}
          ></div>
        );
        
        if (d === 0) {
          if (date.getMonth() !== lastMonth) {
            monthLabels.push(
              <span key={w} style={{ minWidth: `${7 * 14 + 2}px` }}>
                {MONTHS[date.getMonth()]}
              </span>
            );
            lastMonth = date.getMonth();
          } else {
            monthLabels.push(
              <span key={w} style={{ minWidth: `${7 * 14 + 2}px` }}></span>
            );
          }
        }
      }
      cols.push(
        <div key={w} className="heatmap-col">
          {col}
        </div>
      );
    }

    const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((l, i) => (
      <div key={i} className="heatmap-day-label" style={{ fontSize: '9px' }}>
        {l}
      </div>
    ));

    return (
      <div style={{ overflowX: 'auto' }}>
        <div className="heatmap-months" style={{ paddingLeft: '22px', gap: 0 }}>
          {monthLabels}
        </div>
        <div className="heatmap-main">
          <div className="heatmap-days">{dayLabels}</div>
          <div className="heatmap-cols">{cols}</div>
        </div>
      </div>
    );
  };

  const renderOverallHeatmap = () => {
    const getMax = () => habits.length;
    const getCellValue = (k) => (completions[k] ? completions[k].size : 0);
    return buildHeatmapHTML(getCellValue, getMax);
  };

  const renderHabitHeatmaps = () => {
    if (!habits.length) return null;

    return habits.map((habit) => {
      const getMax = () => 1;
      const getCellValue = (k) => (completions[k]?.has(habit.id) ? 1 : 0);
      
      return (
        <div key={habit.id} className="chart-card" style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <span style={{ fontSize: '20px' }}>{habit.emoji}</span>
            <div>
              <div className="chart-title">{habit.name}</div>
              <div className="chart-sub">
                Current: {getStreak(habit.id, completions)}d streak · Best: {getBestStreak(habit.id, completions)}d · 30-day: {getCompletionRate(habit.id, completions, 30)}%
              </div>
            </div>
          </div>
          {buildHeatmapHTML(getCellValue, getMax)}
        </div>
      );
    });
  };

  return (
    <div className="view active">
      <div className="chart-card" style={{ marginBottom: '20px' }}>
        <div className="chart-title">Overall completion heatmap</div>
        <div className="chart-sub">
          Past 26 weeks — darker = more habits completed that day
        </div>
        <div style={{ marginTop: '16px', overflowX: 'auto' }}>
          {renderOverallHeatmap()}
        </div>
      </div>
      
      {renderHabitHeatmaps()}
      
      {tooltip.show && (
        <div
          className="tooltip"
          style={{
            display: 'block',
            left: tooltip.x,
            top: tooltip.y,
          }}
        >
          {tooltip.text}
        </div>
      )}
    </div>
  );
}
