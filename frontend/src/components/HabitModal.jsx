import React, { useState, useEffect } from 'react';
import { EMOJIS, COLORS } from '../constants';

/**
 * Modal component for adding or editing habits
 */
export function HabitModal({ isOpen, habit, categories, onSave, onClose, onAddCategory }) {
  const [name, setName] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState(EMOJIS[0]);
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isAddingCategory, setIsAddingCategory] = useState(false);

  useEffect(() => {
    if (habit) {
      setName(habit.name);
      setSelectedEmoji(habit.emoji);
      setSelectedColor(habit.color);
      setSelectedCategory(habit.category || (categories.length > 0 ? categories[0] : ''));
    } else {
      setName('');
      setSelectedEmoji(EMOJIS[0]);
      setSelectedColor(COLORS[0]);
      setSelectedCategory(categories.length > 0 ? categories[0] : '');
    }
    setShowAddCategory(false);
    setNewCategoryName('');
  }, [habit, isOpen, categories]);

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

  const handleAddCategoryClick = () => {
    setShowAddCategory(true);
    setNewCategoryName('');
  };

  const handleCancelAddCategory = () => {
    setShowAddCategory(false);
    setNewCategoryName('');
  };

  const handleConfirmAddCategory = async () => {
    if (!newCategoryName.trim()) {
      return;
    }

    setIsAddingCategory(true);
    try {
      await onAddCategory(newCategoryName.trim());
      setSelectedCategory(newCategoryName.trim());
      setShowAddCategory(false);
      setNewCategoryName('');
    } catch (err) {
      // Error is handled by parent component
      console.error('Failed to add category:', err);
    } finally {
      setIsAddingCategory(false);
    }
  };

  const handleNewCategoryKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleConfirmAddCategory();
    } else if (e.key === 'Escape') {
      handleCancelAddCategory();
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
            {categories.map((cat) => (
              <button
                key={cat}
                className={`emoji-btn${cat === selectedCategory ? ' selected' : ''}`}
                onClick={() => setSelectedCategory(cat)}
                style={{ width: 'auto', padding: '0 12px', fontSize: '12px', fontFamily: 'var(--mono)' }}
              >
                {cat}
              </button>
            ))}
            <button
              className="emoji-btn"
              onClick={handleAddCategoryClick}
              style={{ width: 'auto', padding: '0 12px', fontSize: '12px', fontFamily: 'var(--mono)' }}
            >
              + Add New
            </button>
          </div>
          {showAddCategory && (
            <div style={{ marginTop: '8px', display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Category name"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                onKeyDown={handleNewCategoryKeyDown}
                autoFocus
                style={{ flex: 1 }}
              />
              <button
                className="btn-save"
                onClick={handleConfirmAddCategory}
                disabled={isAddingCategory || !newCategoryName.trim()}
                style={{ padding: '6px 12px' }}
              >
                {isAddingCategory ? 'Adding...' : 'Add'}
              </button>
              <button
                className="btn-cancel"
                onClick={handleCancelAddCategory}
                disabled={isAddingCategory}
                style={{ padding: '6px 12px' }}
              >
                Cancel
              </button>
            </div>
          )}
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
