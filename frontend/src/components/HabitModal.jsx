import React, { useState, useEffect } from 'react';
import { EMOJIS, COLORS, CATEGORIES } from '../constants';

/**
 * Modal component for adding or editing habits
 */
export function HabitModal({ isOpen, habit, onSave, onClose }) {
  const [name, setName] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState(EMOJIS[0]);
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0]);

  useEffect(() => {
    if (habit) {
      setName(habit.name);
      setSelectedEmoji(habit.emoji);
      setSelectedColor(habit.color);
      setSelectedCategory(habit.category || CATEGORIES[0]);
    } else {
      setName('');
      setSelectedEmoji(EMOJIS[0]);
      setSelectedColor(COLORS[0]);
      setSelectedCategory(CATEGORIES[0]);
    }
  }, [habit, isOpen]);

  const handleSave = () => {
    if (!name.trim()) {
      return;
    }

    onSave({
      name: name.trim(),
      emoji: selectedEmoji,
      color: selectedColor,
      category: selectedCategory,
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay open" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-title">{habit ? 'Edit habit' : 'New habit'}</div>
        
        <div className="form-group">
          <label className="form-label">Name</label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g. Morning run"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
          />
        </div>
        
        <div className="form-group">
          <label className="form-label">Icon</label>
          <div className="emoji-picker">
            {EMOJIS.map((emoji) => (
              <button
                key={emoji}
                className={`emoji-btn${emoji === selectedEmoji ? ' selected' : ''}`}
                onClick={() => setSelectedEmoji(emoji)}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
        
        <div className="form-group">
          <label className="form-label">Color</label>
          <div className="color-picker">
            {COLORS.map((color) => (
              <div
                key={color}
                className={`color-swatch${color === selectedColor ? ' selected' : ''}`}
                style={{ background: color }}
                onClick={() => setSelectedColor(color)}
              ></div>
            ))}
          </div>
        </div>
        
        <div className="form-group">
          <label className="form-label">Category</label>
          <div className="emoji-picker">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                className={`emoji-btn${cat === selectedCategory ? ' selected' : ''}`}
                onClick={() => setSelectedCategory(cat)}
                style={{ width: 'auto', padding: '0 12px', fontSize: '12px', fontFamily: 'var(--mono)' }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
        
        <div className="modal-actions">
          <button className="btn-cancel" onClick={onClose}>
            Cancel
          </button>
          <button className="btn-save" onClick={handleSave}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
