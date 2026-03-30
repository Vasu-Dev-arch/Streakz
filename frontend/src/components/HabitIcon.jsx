import React from 'react';
import { getIconById } from '../constants';

/**
 * Renders a habit icon. Supports both new SVG icons and legacy emoji.
 *
 * Props:
 *   iconId  — id from HABIT_ICONS
 *   emoji   — fallback legacy emoji string
 *   size    — px size (default 20)
 *   color   — stroke color (default currentColor)
 *   style   — additional styles
 */
export function HabitIcon({ iconId, emoji, size = 20, color = 'currentColor', style = {} }) {
  // If we have a valid iconId, render SVG
  if (iconId) {
    const icon = getIconById(iconId);
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ flexShrink: 0, ...style }}
        aria-label={icon.label}
      >
        <path d={icon.path} />
      </svg>
    );
  }

  // Fallback to emoji for legacy habits
  if (emoji) {
    return (
      <span
        style={{ fontSize: size * 0.9, lineHeight: 1, flexShrink: 0, ...style }}
        aria-label="habit icon"
      >
        {emoji}
      </span>
    );
  }

  // Default empty icon
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ flexShrink: 0, opacity: 0.3, ...style }}
    >
      <circle cx="12" cy="12" r="10" />
    </svg>
  );
}
