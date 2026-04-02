export const COLORS = [
  "#5b4cc4",
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

export const HABIT_ICONS = [
   { id: "walk",      label: "Walk",       category: "fitness",    path: "M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" },
  { id: "stretch",   label: "Stretch",   category: "wellness",   path: "M5 12h14M12 5l7 7-7 7" },

  { id: "book",      label: "Read",       category: "study",      path: "M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5A2.5 2.5 0 0 0 6.5 22H20V2H6.5A2.5 2.5 0 0 0 4 4.5v15z" },
  { id: "pencil",    label: "Write",      category: "study",      path: "M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" },
  { id: "school",    label: "Study",      category: "study",      path: "M22 10v6M2 10l10-5 10 5-10 5zM6 12v5c0 2 2 3 6 3s6-1 6-3v-5" },
 
  { id: "code",      label: "Code",       category: "productivity", path: "M16 18l6-6-6-6M8 6l-6 6 6 6" },
  { id: "briefcase", label: "Work",       category: "productivity", path: "M20 7h-4V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2H4a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2zM10 5h4v2h-4V5z" },
  { id: "target",    label: "Goals",      category: "productivity", path: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zm0-6a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm0-1.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z" },
  { id: "check",     label: "Complete",   category: "productivity", path: "M20 6L9 17l-5-5" },
  { id: "calendar",  label: "Schedule",   category: "productivity", path: "M19 4H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zM16 2v4M8 2v4M3 10h18" },
  { id: "trending",  label: "Progress",   category: "productivity", path: "M23 6l-9.5 9.5-5-5L1 18" },

  { id: "meditation",label: "Meditate",   category: "wellness",   path: "M12 2a4 4 0 1 1 0 8 4 4 0 0 1 0-8zm0 14c-6 0-8 2-8 2v2h16v-2s-2-2-8-2z M8 16c0-2 1.5-3 4-3s4 1 4 3" },
  { id: "heart",     label: "Wellness",  category: "wellness",   path: "M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" },
  { id: "droplet",   label: "Hydrate",    category: "wellness",   path: "M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" },
  { id: "moon",      label: "Sleep",      category: "wellness",   path: "M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" },
  { id: "sun",       label: "Morning",   category: "wellness",   path: "M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41M12 6a6 6 0 1 0 0 12A6 6 0 0 0 12 6z" },
  
  { id: "palette",   label: "Art",        category: "creative",  path: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c.83 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.01-.23-.26-.38-.61-.38-.99 0-.83.67-1.5 1.5-1.5H16c2.76 0 5-2.24 5-5 0-4.42-4.03-8-9-8zm-5.5 9a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm3-4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm5 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm3 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3z" },
  { id: "music",     label: "Music",      category: "creative",  path: "M9 18V5l12-2v13M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM21 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" },
  { id: "camera",    label: "Photo",      category: "creative",  path: "M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2zM12 13a5 5 0 1 0 0-10 5 5 0 0 0 0 10z" },
  { id: "game",      label: "Gaming",     category: "creative",  path: "M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16zM12 13.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z" },
  { id: "pen",       label: "Design",     category: "creative",  path: "M12 19l7-7 3 3-7 7-3-3zM18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5zM2 2l5.5 5.5" },

  { id: "leaf",      label: "Nature",     category: "lifestyle",  path: "M17 8C8 10 5.9 16.17 3.82 22l2.06-.91C7 19.56 8.61 16.67 12 16 12 22 14 22 14 22s6-7 3-14z" },
  { id: "home",      label: "Home",       category: "lifestyle",  path: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM9 22V12h6v10" },
   { id: "dollar",    label: "Finance",    category: "lifestyle",  path: "M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" },
  { id: "gift",      label: "Reward",     category: "lifestyle",  path: "M20 12v10H4V12M2 7h20v5H2zM12 22V7M12 7H8M12 7h4" },
  { id: "star",      label: "Favorite",    category: "lifestyle",  path: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" },
  { id: "coffee",    label: "Coffee",     category: "lifestyle",  path: "M18 8h1a4 4 0 0 1 0 8h-1M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8zM6 1v3M10 1v3M14 1v3" },
];

export const DEFAULT_ICON_ID = "target";

export function getIconById(id) {
  return HABIT_ICONS.find((i) => i.id === id) || HABIT_ICONS[0];
}

// Legacy emoji list kept for backward compat with old habits
export const EMOJIS = [
  "🏃", "💪", "📚", "🧘", "💧", "🥗", "😴", "✍️",
  "🎸", "🖥️", "🌿", "🎯", "🧠", "🏋️", "🚴", "🎨", "📝", "🌅",
  "🍎", "🥤", "🧹", "📖", "💊", "🦷", "🛌", "🚶", "⏰",
];