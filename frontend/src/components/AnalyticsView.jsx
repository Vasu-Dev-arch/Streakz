import React, { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import { dateKey, getStreak, getBestStreak, getCompletionRate } from '../utils/dateUtils';
import { MONTHS } from '../constants';

// Register Chart.js components
Chart.register(...registerables);

/**
 * Analytics view component with charts and performance metrics
 */
export function AnalyticsView({ habits, completions }) {
  const weeklyChartRef = useRef(null);
  const donutChartRef = useRef(null);
  const dailyChartRef = useRef(null);
  const chartsRef = useRef({});

  useEffect(() => {
    if (habits.length > 0) {
      renderWeeklyChart();
      renderDonutChart();
      renderDailyChart();
    }

    return () => {
      // Cleanup charts on unmount
      Object.values(chartsRef.current).forEach(chart => {
        if (chart) chart.destroy();
      });
    };
  }, [habits, completions]);

  const renderWeeklyChart = () => {
    const labels = [];
    const data = [];
    const d = new Date();
    
    for (let w = 7; w >= 0; w--) {
      const weekDays = [];
      for (let day = 6; day >= 0; day--) {
        const dd = new Date(d);
        dd.setDate(d.getDate() - (w * 7 + day));
        weekDays.push(dd);
      }
      const monthDay = weekDays[6];
      labels.push(`${MONTHS[monthDay.getMonth()]} ${monthDay.getDate()}`);
      
      let total = 0;
      let possible = 0;
      weekDays.forEach((dd) => {
        const k = dateKey(dd);
        total += completions[k] ? completions[k].size : 0;
        possible += habits.length;
      });
      data.push(possible ? Math.round((total / possible) * 100) : 0);
    }

    if (chartsRef.current.weekly) {
      chartsRef.current.weekly.destroy();
    }

    const ctx = weeklyChartRef.current.getContext('2d');
    chartsRef.current.weekly = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            data,
            borderColor: '#7c6af7',
            backgroundColor: 'rgba(124,106,247,0.08)',
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#7c6af7',
            pointRadius: 3,
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: {
            grid: { color: 'rgba(255,255,255,0.04)' },
            ticks: {
              color: '#5a5a68',
              font: { size: 10, family: "'DM Mono'" },
            },
          },
          y: {
            min: 0,
            max: 100,
            grid: { color: 'rgba(255,255,255,0.04)' },
            ticks: {
              color: '#5a5a68',
              font: { size: 10, family: "'DM Mono'" },
              callback: (v) => v + '%',
            },
          },
        },
      },
    });
  };

  const renderDonutChart = () => {
    if (!habits.length) return;

    const labels = habits.map((h) => h.name);
    const data = habits.map((h) => {
      let c = 0;
      Object.values(completions).forEach((s) => {
        if (s.has(h.id)) c++;
      });
      return c;
    });
    const colors = habits.map((h) => h.color);

    if (chartsRef.current.donut) {
      chartsRef.current.donut.destroy();
    }

    const ctx = donutChartRef.current.getContext('2d');
    chartsRef.current.donut = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [
          { data, backgroundColor: colors, borderWidth: 0, hoverOffset: 4 },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        plugins: {
          legend: {
            position: 'right',
            labels: {
              color: '#8a8a96',
              font: { size: 11, family: "'DM Mono'" },
              boxWidth: 10,
              padding: 10,
            },
          },
        },
      },
    });
  };

  const renderDailyChart = () => {
    const labels = [];
    const data = [];
    const d = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const dd = new Date(d);
      dd.setDate(d.getDate() - i);
      const k = dateKey(dd);
      labels.push(
        i === 0
          ? 'Today'
          : i % 5 === 0
            ? `${MONTHS[dd.getMonth()]} ${dd.getDate()}`
            : ''
      );
      data.push(completions[k] ? completions[k].size : 0);
    }

    if (chartsRef.current.daily) {
      chartsRef.current.daily.destroy();
    }

    const ctx = dailyChartRef.current.getContext('2d');
    chartsRef.current.daily = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            data,
            backgroundColor: data.map((_, i) =>
              i === 29 ? '#7c6af7' : 'rgba(124,106,247,0.4)'
            ),
            borderRadius: 4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              color: '#5a5a68',
              font: { size: 10, family: "'DM Mono'" },
            },
          },
          y: {
            min: 0,
            max: Math.max(habits.length, 1),
            grid: { color: 'rgba(255,255,255,0.04)' },
            ticks: { color: '#5a5a68', font: { size: 10 }, stepSize: 1 },
          },
        },
      },
    });
  };

  return (
    <div className="view active">
      <div className="analytics-grid">
        <div className="chart-card">
          <div className="chart-title">Weekly completion rate</div>
          <div className="chart-sub">Last 8 weeks</div>
          <div className="chart-wrap">
            <canvas ref={weeklyChartRef}></canvas>
          </div>
        </div>
        <div className="chart-card">
          <div className="chart-title">Habit breakdown</div>
          <div className="chart-sub">Total completions</div>
          <div className="chart-wrap">
            <canvas ref={donutChartRef}></canvas>
          </div>
        </div>
      </div>
      
      <div className="chart-card" style={{ marginBottom: '24px' }}>
        <div className="chart-title">Daily completions — last 30 days</div>
        <div className="chart-sub">Number of habits completed per day</div>
        <div className="chart-wrap" style={{ height: '200px' }}>
          <canvas ref={dailyChartRef}></canvas>
        </div>
      </div>
      
      <div className="section-header">
        <span className="section-title">Habit Performance</span>
      </div>
      
      <div>
        {habits.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📊</div>
            <div className="empty-text">No habits to analyze</div>
            <div className="empty-sub">Add habits to see performance metrics</div>
          </div>
        ) : (
          habits.map((habit) => {
            const streak = getStreak(habit.id, completions);
            const best = getBestStreak(habit.id, completions);
            const rate30 = getCompletionRate(habit.id, completions, 30);
            const rate7 = getCompletionRate(habit.id, completions, 7);
            
            return (
              <div 
                key={habit.id}
                className="chart-card"
                style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '20px' }}
              >
                <span style={{ fontSize: '28px', flexShrink: 0 }}>{habit.emoji}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '8px' }}>{habit.name}</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                    <div>
                      <div style={{ fontSize: '10px', color: 'var(--text3)', fontFamily: 'var(--mono)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '3px' }}>Streak</div>
                      <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--amber)' }}>{streak}d</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '10px', color: 'var(--text3)', fontFamily: 'var(--mono)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '3px' }}>Best</div>
                      <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--accent2)' }}>{best}d</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '10px', color: 'var(--text3)', fontFamily: 'var(--mono)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '3px' }}>7-day</div>
                      <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--teal)' }}>{rate7}%</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '10px', color: 'var(--text3)', fontFamily: 'var(--mono)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '3px' }}>30-day</div>
                      <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--green)' }}>{rate30}%</div>
                    </div>
                  </div>
                  <div className="progress-bar-wrap" style={{ marginTop: '10px' }}>
                    <div className="progress-bar-fill" style={{ width: `${rate30}%`, background: habit.color }}></div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
