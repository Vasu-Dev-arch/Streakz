export const COLORS = [
  "#7c6af7",
  "#22c97a",
  "#f5a623",
  "#f05252",
  "#20d6c7",
  "#e060b0",
  "#4fa3e7",
  "#a3e635",
];

export const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
export const DAY_LETTERS = ["S", "M", "T", "W", "T", "F", "S"];

export const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

// Icon system — SVG path data keyed by icon id
export const HABIT_ICONS = [
  { id: "run",       label: "Run",        path: "M13.5 5.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM9.75 8.75l-1.5 8.75M14 8l-2.5 5-2 2.5-2.5 1" },
  { id: "dumbbell",  label: "Workout",    path: "M6.5 6.5h1M6.5 17.5h1M16.5 6.5h1M16.5 17.5h1M3.5 9v6M20.5 9v6M3.5 12h17M9 6.5v11M15 6.5v11" },
  { id: "book",      label: "Read",       path: "M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5A2.5 2.5 0 0 0 6.5 22H20V2H6.5A2.5 2.5 0 0 0 4 4.5v15z" },
  { id: "meditation",label: "Meditate",   path: "M12 2a4 4 0 1 1 0 8 4 4 0 0 1 0-8zm0 14c-6 0-8 2-8 2v2h16v-2s-2-2-8-2z M8 16c0-2 1.5-3 4-3s4 1 4 3" },
  { id: "droplet",   label: "Hydrate",    path: "M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" },
  { id: "salad",     label: "Eat well",   path: "M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zm-1 7h2v5h-2zm0 7h2v2h-2z" },
  { id: "moon",      label: "Sleep",      path: "M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" },
  { id: "pencil",    label: "Journal",    path: "M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" },
  { id: "music",     label: "Practice",   path: "M9 18V5l12-2v13M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM21 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" },
  { id: "code",      label: "Code",       path: "M16 18l6-6-6-6M8 6l-6 6 6 6" },
  { id: "leaf",      label: "Nature",     path: "M17 8C8 10 5.9 16.17 3.82 22l2.06-.91C7 19.56 8.61 16.67 12 16 12 22 14 22 14 22s6-7 3-14z" },
  { id: "target",    label: "Focus",      path: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zm0-6a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm0-1.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z" },
  { id: "brain",     label: "Learn",      path: "M9.5 2A2.5 2.5 0 0 1 12 4.5V9a2.5 2.5 0 0 1-5 0V4.5A2.5 2.5 0 0 1 9.5 2zm5 0A2.5 2.5 0 0 1 17 4.5V9a2.5 2.5 0 0 1-5 0V4.5A2.5 2.5 0 0 1 14.5 2z M5 9.5A2.5 2.5 0 0 1 7.5 7H9v5H7.5A2.5 2.5 0 0 1 5 9.5zM19 9.5A2.5 2.5 0 0 0 16.5 7H15v5h1.5A2.5 2.5 0 0 0 19 9.5z" },
  { id: "bicycle",   label: "Cycle",      path: "M5 20a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm14 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM12 4h1l3 8H5l3-4m4-4L9 8m3-4a1 1 0 1 1 0-2 1 1 0 0 1 0 2z" },
  { id: "palette",   label: "Create",     path: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c.83 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.01-.23-.26-.38-.61-.38-.99 0-.83.67-1.5 1.5-1.5H16c2.76 0 5-2.24 5-5 0-4.42-4.03-8-9-8zm-5.5 9a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm3-4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm5 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm3 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3z" },
  { id: "sun",       label: "Morning",    path: "M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41M12 6a6 6 0 1 0 0 12A6 6 0 0 0 12 6z" },
  { id: "heart",     label: "Wellness",   path: "M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" },
  { id: "dollar",    label: "Finance",    path: "M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" },
  { id: "phone-off", label: "No screen",  path: "M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 2 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07M1 1l22 22M16.72 11.06A10.94 10.94 0 0 1 19 12.55M5 5a10.94 10.94 0 0 0-1.956 5.518M4.42 9.91A16 16 0 0 0 6.89 13" },
];

export const DEFAULT_ICON_ID = "target";

export function getIconById(id) {
  return HABIT_ICONS.find((i) => i.id === id) || HABIT_ICONS[0];
}

// Legacy emoji list kept for backward compat with old habits
export const EMOJIS = [
  "🏃", "💪", "📚", "🧘", "💧", "🥗", "😴", "✍️",
  "🎸", "🖥️", "🌿", "🎯", "🧠", "🏋️", "🚴", "🎨", "📝", "🌅",
];