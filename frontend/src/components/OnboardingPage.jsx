import React, { useState, useEffect } from 'react';

// ── Demo: Heatmap grid ────────────────────────────────────────────────────────
function HeatmapDemo() {
  const weeks = 18;
  const days = 7;
  // Pre-seeded random-looking fill data (deterministic so no flicker)
  const seed = [
    [0,1,2,3,2,1,0],[1,2,3,4,3,2,1],[0,1,3,5,4,2,0],[2,3,4,5,3,1,0],
    [1,2,3,4,5,3,2],[0,1,2,3,4,5,3],[2,3,4,5,4,3,1],[1,2,3,4,3,2,1],
    [0,1,2,4,5,3,2],[1,3,4,5,4,2,0],[2,3,5,4,3,2,1],[1,2,3,4,5,4,2],
    [0,1,2,3,4,5,3],[1,2,4,5,3,2,1],[2,3,4,5,4,3,0],[1,2,3,4,5,4,2],
    [0,1,3,4,5,3,2],[2,3,4,5,4,3,1],
  ];
  const colors = ['var(--bg4)', 'rgba(124,106,247,0.2)', 'rgba(124,106,247,0.38)', 'rgba(124,106,247,0.56)', 'rgba(124,106,247,0.74)', 'var(--accent2)'];

  return (
    <div style={{ display: 'flex', gap: '3px', justifyContent: 'center', flexWrap: 'nowrap', overflow: 'hidden' }}>
      {seed.slice(0, weeks).map((week, wi) => (
        <div key={wi} style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
          {week.map((level, di) => (
            <div
              key={di}
              style={{
                width: '12px', height: '12px', borderRadius: '2px',
                background: colors[Math.min(level, 5)],
                transition: 'background 0.3s',
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

// ── Demo: Bar chart ───────────────────────────────────────────────────────────
function BarChartDemo() {
  const bars = [
    { label: 'Mon', value: 60, color: 'var(--accent)' },
    { label: 'Tue', value: 85, color: 'var(--accent)' },
    { label: 'Wed', value: 45, color: 'var(--accent)' },
    { label: 'Thu', value: 100, color: 'var(--accent2)' },
    { label: 'Fri', value: 70, color: 'var(--accent)' },
    { label: 'Sat', value: 90, color: 'var(--accent)' },
    { label: 'Sun', value: 55, color: 'var(--accent)' },
  ];

  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: '80px', justifyContent: 'center' }}>
      {bars.map((b) => (
        <div key={b.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
          <div
            style={{
              width: '22px',
              height: `${b.value * 0.72}px`,
              background: b.color,
              borderRadius: '4px 4px 0 0',
              opacity: 0.85,
            }}
          />
          <span style={{ fontSize: '9px', color: 'var(--text3)', fontFamily: 'var(--mono)' }}>{b.label}</span>
        </div>
      ))}
    </div>
  );
}

// ── Demo: Donut chart ─────────────────────────────────────────────────────────
function DonutDemo() {
  const segments = [
    { pct: 40, color: 'var(--accent2)', label: 'Exercise' },
    { pct: 30, color: 'var(--green)', label: 'Reading' },
    { pct: 20, color: 'var(--amber)', label: 'Meditation' },
    { pct: 10, color: 'var(--teal)', label: 'Water' },
  ];

  // Build SVG arc paths for a donut
  const r = 34, cx = 44, cy = 44, stroke = 14;
  let cumulative = 0;
  const paths = segments.map((seg) => {
    const startAngle = (cumulative / 100) * 360 - 90;
    cumulative += seg.pct;
    const endAngle = (cumulative / 100) * 360 - 90;
    const largeArc = seg.pct > 50 ? 1 : 0;
    const toRad = (deg) => (deg * Math.PI) / 180;
    const x1 = cx + r * Math.cos(toRad(startAngle));
    const y1 = cy + r * Math.sin(toRad(startAngle));
    const x2 = cx + r * Math.cos(toRad(endAngle));
    const y2 = cy + r * Math.sin(toRad(endAngle));
    return { ...seg, d: `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}` };
  });

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', justifyContent: 'center' }}>
      <svg width="88" height="88" viewBox="0 0 88 88">
        {paths.map((p, i) => (
          <path
            key={i}
            d={p.d}
            fill="none"
            stroke={p.color}
            strokeWidth={stroke}
            strokeLinecap="butt"
            opacity="0.85"
          />
        ))}
        <circle cx={cx} cy={cy} r={r - stroke / 2 - 1} fill="var(--bg2)" />
        <text x={cx} y={cy + 1} textAnchor="middle" dominantBaseline="middle" style={{ fontSize: '13px', fontWeight: 700, fill: 'var(--text)', fontFamily: 'var(--sans)' }}>72%</text>
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {segments.map((s) => (
          <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: s.color, flexShrink: 0 }} />
            <span style={{ fontSize: '11px', color: 'var(--text2)', fontFamily: 'var(--mono)' }}>{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Demo: AI Coach ────────────────────────────────────────────────────────────
function AiCoachDemo() {
  const habits = [
    { emoji: '🏃', name: '20-min morning run', freq: 'Daily', color: 'var(--green)' },
    { emoji: '💧', name: 'Drink 8 glasses', freq: 'Daily', color: 'var(--teal)' },
    { emoji: '🧘', name: 'Evening meditation', freq: '5× / week', color: 'var(--accent2)' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div style={{ fontSize: '11px', color: 'var(--text3)', fontFamily: 'var(--mono)', marginBottom: '2px' }}>
        Goal: get fit and sleep better
      </div>
      {habits.map((h) => (
        <div
          key={h.name}
          style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '9px 12px', borderRadius: '8px',
            background: 'var(--bg3)', border: '1px solid var(--border)',
          }}
        >
          <span style={{ fontSize: '18px' }}>{h.emoji}</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{h.name}</div>
            <div style={{ fontSize: '10px', color: 'var(--text3)', fontFamily: 'var(--mono)' }}>{h.freq}</div>
          </div>
          <div style={{ width: '6px', height: '24px', borderRadius: '3px', background: h.color, flexShrink: 0 }} />
        </div>
      ))}
    </div>
  );
}

// ── Demo: Streak ticker ───────────────────────────────────────────────────────
function StreakDemo() {
  const streaks = [
    { emoji: '🏃', name: 'Running', days: 21, color: 'var(--green)' },
    { emoji: '📚', name: 'Reading', days: 14, color: 'var(--accent2)' },
    { emoji: '🧘', name: 'Meditation', days: 7, color: 'var(--amber)' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {streaks.map((s) => (
        <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '20px', flexShrink: 0 }}>{s.emoji}</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text)' }}>{s.name}</span>
              <span style={{ fontSize: '12px', fontFamily: 'var(--mono)', color: s.color, fontWeight: 700 }}>🔥{s.days}d</span>
            </div>
            <div style={{ height: '5px', borderRadius: '3px', background: 'var(--bg4)', overflow: 'hidden' }}>
              <div style={{ width: `${Math.min((s.days / 30) * 100, 100)}%`, height: '100%', background: s.color, borderRadius: '3px', transition: 'width 1s ease' }} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Feature slides data ───────────────────────────────────────────────────────
const FEATURES = [
  {
    key: 'heatmap',
    icon: '📅',
    title: 'Track every day',
    desc: 'Build habits with a beautiful heatmap that shows your consistency over weeks and months.',
    demo: <HeatmapDemo />,
  },
  {
    key: 'analytics',
    icon: '📊',
    title: 'See your progress',
    desc: 'Rich charts break down your completion rates by day, week, and habit so you always know where you stand.',
    demo: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <BarChartDemo />
        <DonutDemo />
      </div>
    ),
  },
  {
    key: 'ai',
    icon: '✦',
    title: 'AI Habit Coach',
    desc: 'Describe your goal and get a personalised 3-habit plan generated in seconds.',
    demo: <AiCoachDemo />,
  },
  {
    key: 'streaks',
    icon: '🔥',
    title: 'Streak consistency',
    desc: 'Never break the chain. Visual streaks keep you accountable and motivated every single day.',
    demo: <StreakDemo />,
  },
];

// ── Progress dots ─────────────────────────────────────────────────────────────
function Dots({ total, current }) {
  return (
    <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          style={{
            width: i === current ? '20px' : '7px',
            height: '7px',
            borderRadius: '4px',
            background: i === current ? 'var(--accent2)' : 'var(--bg4)',
            transition: 'width 0.25s ease, background 0.25s ease',
          }}
        />
      ))}
    </div>
  );
}

// ── Main OnboardingPage ───────────────────────────────────────────────────────
/**
 * Props:
 *   onFinish() — async: marks onboarding done and navigates to dashboard
 */
export function OnboardingPage({ onFinish }) {
  const [step, setStep] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [dir, setDir] = useState(1); // 1 = forward, -1 = back
  const [finishing, setFinishing] = useState(false);
  const isMobile = window.innerWidth <= 640;
  const isLast = step === FEATURES.length - 1;

  const goTo = (next) => {
    if (animating || next < 0 || next >= FEATURES.length) return;
    setDir(next > step ? 1 : -1);
    setAnimating(true);
    setTimeout(() => {
      setStep(next);
      setAnimating(false);
    }, 220);
  };

  const handleFinish = async () => {
    setFinishing(true);
    try {
      await onFinish();
    } catch {
      setFinishing(false);
    }
  };

  const handleSkip = async () => {
    setFinishing(true);
    try {
      await onFinish();
    } catch {
      setFinishing(false);
    }
  };

  // ── Desktop layout: show all 4 cards in a grid ────────────────────────────
  if (!isMobile) {
    return (
      <div style={styles.root}>
        <div style={styles.desktopWrap}>
          {/* Header */}
          <div style={styles.header}>
            <span style={styles.logoMark}>◆ Streakz</span>
            <button style={styles.skipBtn} onClick={handleSkip} disabled={finishing}>
              {finishing ? 'Loading…' : 'Skip →'}
            </button>
          </div>

          <h1 style={styles.mainTitle}>Everything you need to build lasting habits</h1>
          <p style={styles.mainSub}>Here's what's waiting for you inside.</p>

          {/* 2×2 feature grid */}
          <div style={styles.grid}>
            {FEATURES.map((f, i) => (
              <div
                key={f.key}
                style={{
                  ...styles.featureCard,
                  animationDelay: `${i * 80}ms`,
                }}
              >
                <div style={styles.featureIcon}>{f.icon}</div>
                <div style={styles.featureTitle}>{f.title}</div>
                <div style={styles.featureDesc}>{f.desc}</div>
                <div style={styles.demoWrap}>{f.demo}</div>
              </div>
            ))}
          </div>

          <button
            style={{ ...styles.ctaBtn, opacity: finishing ? 0.7 : 1 }}
            onClick={handleFinish}
            disabled={finishing}
          >
            {finishing ? 'Loading…' : 'Get Started →'}
          </button>
        </div>

        {/* Background blobs */}
        <div style={{ ...styles.blob, top: '-80px', right: '-80px', background: 'rgba(124,106,247,0.1)' }} />
        <div style={{ ...styles.blob, bottom: '-60px', left: '-60px', background: 'rgba(34,201,122,0.07)', width: '350px', height: '350px' }} />
      </div>
    );
  }

  // ── Mobile layout: one feature at a time ──────────────────────────────────
  const feature = FEATURES[step];
  return (
    <div style={styles.root}>
      <div style={styles.mobileWrap}>
        {/* Header */}
        <div style={styles.header}>
          <span style={styles.logoMark}>◆ Streakz</span>
          <button style={styles.skipBtn} onClick={handleSkip} disabled={finishing}>
            Skip
          </button>
        </div>

        {/* Animated slide */}
        <div
          style={{
            ...styles.slide,
            opacity: animating ? 0 : 1,
            transform: animating
              ? `translateX(${dir * 30}px)`
              : 'translateX(0)',
            transition: animating ? 'none' : 'opacity 0.22s ease, transform 0.22s ease',
          }}
        >
          <div style={styles.featureIconLg}>{feature.icon}</div>
          <h2 style={styles.slideTitle}>{feature.title}</h2>
          <p style={styles.slideDesc}>{feature.desc}</p>
          <div style={styles.mobileDemoWrap}>{feature.demo}</div>
        </div>

        {/* Dots + navigation */}
        <div style={styles.navRow}>
          <Dots total={FEATURES.length} current={step} />
          <button
            style={{
              ...styles.nextBtn,
              ...(isLast ? styles.getStartedBtn : {}),
              opacity: finishing ? 0.7 : 1,
            }}
            onClick={isLast ? handleFinish : () => goTo(step + 1)}
            disabled={animating || finishing}
          >
            {finishing ? 'Loading…' : isLast ? 'Get Started' : 'Next →'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = {
  root: {
    minHeight: '100vh',
    background: 'var(--bg)',
    fontFamily: 'var(--sans)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
    padding: '0 16px 40px',
    position: 'relative',
    overflow: 'hidden',
  },
  desktopWrap: {
    width: '100%',
    maxWidth: '920px',
    paddingTop: '32px',
    position: 'relative',
    zIndex: 1,
    animation: 'wlFadeUp 0.4s ease both',
  },
  mobileWrap: {
    width: '100%',
    maxWidth: '400px',
    paddingTop: '28px',
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    position: 'relative',
    zIndex: 1,
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '32px',
  },
  logoMark: {
    fontSize: '16px',
    fontWeight: 700,
    color: 'var(--accent2)',
    letterSpacing: '-0.3px',
  },
  skipBtn: {
    border: 'none',
    background: 'none',
    color: 'var(--text3)',
    fontFamily: 'var(--mono)',
    fontSize: '12px',
    cursor: 'pointer',
    padding: '4px 0',
  },
  mainTitle: {
    fontSize: '28px',
    fontWeight: 700,
    color: 'var(--text)',
    lineHeight: 1.3,
    marginBottom: '10px',
    textAlign: 'center',
  },
  mainSub: {
    fontSize: '14px',
    color: 'var(--text3)',
    marginBottom: '32px',
    textAlign: 'center',
    fontFamily: 'var(--mono)',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
    marginBottom: '32px',
  },
  featureCard: {
    background: 'var(--bg2)',
    border: '1px solid var(--border)',
    borderRadius: '16px',
    padding: '24px',
    animation: 'wlFadeUp 0.5s ease both',
  },
  featureIcon: {
    fontSize: '24px',
    marginBottom: '10px',
  },
  featureTitle: {
    fontSize: '15px',
    fontWeight: 700,
    color: 'var(--text)',
    marginBottom: '6px',
  },
  featureDesc: {
    fontSize: '13px',
    color: 'var(--text2)',
    lineHeight: 1.6,
    marginBottom: '18px',
  },
  demoWrap: {
    borderRadius: '10px',
    padding: '14px',
    background: 'var(--bg3)',
    border: '1px solid var(--border)',
  },
  ctaBtn: {
    display: 'block',
    margin: '0 auto',
    padding: '15px 48px',
    borderRadius: '12px',
    border: 'none',
    background: 'var(--accent)',
    color: '#fff',
    fontSize: '16px',
    fontFamily: 'var(--sans)',
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'opacity 0.15s, background 0.15s',
    letterSpacing: '0.2px',
  },
  // Mobile
  slide: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  featureIconLg: {
    fontSize: '40px',
    marginBottom: '20px',
  },
  slideTitle: {
    fontSize: '24px',
    fontWeight: 700,
    color: 'var(--text)',
    marginBottom: '12px',
    lineHeight: 1.3,
  },
  slideDesc: {
    fontSize: '14px',
    color: 'var(--text2)',
    lineHeight: 1.7,
    marginBottom: '28px',
  },
  mobileDemoWrap: {
    borderRadius: '14px',
    padding: '20px',
    background: 'var(--bg2)',
    border: '1px solid var(--border)',
    marginBottom: '32px',
  },
  navRow: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '20px',
    paddingBottom: '24px',
  },
  nextBtn: {
    width: '100%',
    padding: '15px',
    borderRadius: '12px',
    border: '1px solid var(--border2)',
    background: 'var(--bg2)',
    color: 'var(--text)',
    fontSize: '15px',
    fontFamily: 'var(--sans)',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'background 0.15s',
  },
  getStartedBtn: {
    background: 'var(--accent)',
    color: '#fff',
    border: 'none',
  },
  blob: {
    position: 'absolute',
    width: '400px',
    height: '400px',
    borderRadius: '50%',
    filter: 'blur(70px)',
    pointerEvents: 'none',
  },
};
