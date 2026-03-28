/**
 * Get the date key in YYYY-MM-DD format
 * @param {Date} date - The date object
 * @returns {string} The date key string
 */
export function dateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

/**
 * Get today's date key
 * @returns {string} Today's date key string
 */
export function todayKey() {
  return dateKey(new Date());
}

/**
 * Get the current streak for a habit
 * @param {string} habitId - The habit ID
 * @param {Object} completions - The completions object
 * @returns {number} The current streak count
 */
export function getStreak(habitId, completions) {
  let streak = 0;
  const d = new Date();
  
  // If not done today, start from yesterday
  if (!completions[dateKey(d)]?.has(habitId)) {
    d.setDate(d.getDate() - 1);
  }
  
  while (true) {
    const k = dateKey(d);
    if (completions[k]?.has(habitId)) {
      streak++;
      d.setDate(d.getDate() - 1);
    } else {
      break;
    }
  }
  
  return streak;
}

/**
 * Get the best streak for a habit
 * @param {string} habitId - The habit ID
 * @param {Object} completions - The completions object
 * @returns {number} The best streak count
 */
export function getBestStreak(habitId, completions) {
  let best = 0;
  let cur = 0;
  const keys = Object.keys(completions)
    .filter((k) => completions[k].has(habitId))
    .sort();
  
  if (!keys.length) return 0;
  
  let prev = null;
  for (const k of keys) {
    if (prev) {
      const diff = (new Date(k) - new Date(prev)) / 86400000;
      if (diff === 1) {
        cur++;
        best = Math.max(best, cur);
      } else {
        cur = 1;
      }
    } else {
      cur = 1;
    }
    prev = k;
  }
  
  return Math.max(best, cur);
}

/**
 * Get the completion rate for a habit over a period
 * @param {string} habitId - The habit ID
 * @param {Object} completions - The completions object
 * @param {number} days - Number of days to check (default: 30)
 * @returns {number} The completion rate as a percentage
 */
export function getCompletionRate(habitId, completions, days = 30) {
  let done = 0;
  const d = new Date();
  
  for (let i = 0; i < days; i++) {
    if (completions[dateKey(d)]?.has(habitId)) done++;
    d.setDate(d.getDate() - 1);
  }
  
  return Math.round((done / days) * 100);
}

/**
 * Get the last 14 days completion status for a habit
 * @param {string} habitId - The habit ID
 * @param {Object} completions - The completions object
 * @returns {Array} Array of 14 values (1 for done, 0 for not done)
 */
export function getLast14(habitId, completions) {
  const res = [];
  const d = new Date();
  
  for (let i = 13; i >= 0; i--) {
    const dd = new Date(d);
    dd.setDate(d.getDate() - i);
    res.push(completions[dateKey(dd)]?.has(habitId) ? 1 : 0);
  }
  
  return res;
}

/**
 * Get today's statistics
 * @param {Array} habits - The habits array
 * @param {Object} completions - The completions object
 * @returns {Object} Statistics object with done, total, maxStreak, avgRate
 */
export function getTodayStats(habits, completions) {
  const tk = todayKey();
  const done = habits.filter((h) => completions[tk]?.has(h.id)).length;
  const total = habits.length;
  const streaks = habits.map((h) => getStreak(h.id, completions));
  const maxStreak = streaks.length ? Math.max(...streaks) : 0;
  const avgRate = habits.length
    ? Math.round(
        habits.reduce((a, h) => a + getCompletionRate(h.id, completions), 0) /
          habits.length
      )
    : 0;
  
  return { done, total, maxStreak, avgRate };
}
