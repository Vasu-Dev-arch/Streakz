import React, { useState, useEffect } from 'react';
import { HABIT_ICONS, COLORS, DEFAULT_ICON_ID, DAY_LETTERS, EMOJIS } from '../constants';
import { HabitIcon } from './HabitIcon';

const DAY_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function HabitModal({ isOpen, habit, categories, onSave, onClose, onAddCategory }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedIcon, setSelectedIcon] = useState(DEFAULT_ICON_ID);
  const [selectedEmoji, setSelectedEmoji] = useState('');
  const [useEmojis, setUseEmojis] = useState(false);
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [frequencyType, setFrequencyType] = useState('daily');
  const [daysOfWeek, setDaysOfWeek] = useState([]);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isAddingCategory, setIsAddingCategory] = useState(false);

  useEffect(() => {
    if (habit) {
      setName(habit.name || '');
      setDescription(habit.description || '');
      setSelectedIcon(habit.icon || DEFAULT_ICON_ID);
      setSelectedEmoji(habit.emoji || '');
      setUseEmojis(!!habit.emoji);
      setSelectedColor(habit.color || COLORS[0]);
      setSelectedCategory(habit.category || (categories.length > 0 ? categories[0] : ''));
      setFrequencyType(habit.frequencyType || 'daily');
      setDaysOfWeek(habit.daysOfWeek || []);
    } else {
      setName('');
      setDescription('');
      setSelectedIcon(DEFAULT_ICON_ID);
      setSelectedEmoji('');
      setUseEmojis(false);
      setSelectedColor(COLORS[0]);
      setSelectedCategory(categories.length > 0 ? categories[0] : '');
      setFrequencyType('daily');
      setDaysOfWeek([]);
    }
    setShowAddCategory(false);
    setNewCategoryName('');
  }, [habit, isOpen, categories]);

  const toggleDay = (dayIndex) => {
    setDaysOfWeek((prev) =>
      prev.includes(dayIndex) ? prev.filter((d) => d !== dayIndex) : [...prev, dayIndex]
    );
  };

  const handleSave = () => {
    if (!name.trim()) return;
    if (frequencyType === 'weekly' && daysOfWeek.length === 0) return;

    onSave({
      name: name.trim(),
      description: description.trim(),
      icon: useEmojis ? '' : selectedIcon,
      emoji: useEmojis ? selectedEmoji : '',
      color: selectedColor,
      category: selectedCategory,
      frequencyType,
      daysOfWeek: frequencyType === 'daily' ? [] : daysOfWeek,
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') handleSave();
    else if (e.key === 'Escape') onClose();
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
    if (!newCategoryName.trim()) return;
    setIsAddingCategory(true);
    try {
      await onAddCategory(newCategoryName.trim());
      setSelectedCategory(newCategoryName.trim());
      setShowAddCategory(false);
      setNewCategoryName('');
    } catch (err) {
      console.error('Failed to add category:', err);
    } finally {
      setIsAddingCategory(false);
    }
  };

  const handleNewCategoryKeyDown = (e) => {
    if (e.key === 'Enter') handleConfirmAddCategory();
    else if (e.key === 'Escape') handleCancelAddCategory();
  };

  if (!isOpen) return null;

  const isWeekly = frequencyType === 'weekly';
  const canSave = name.trim() && (!isWeekly || daysOfWeek.length > 0);

  return (
    <div className="modal-overlay open" onClick={onClose}>
      <div className="modal habit-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-title">{habit ? 'Edit habit' : 'New habit'}</div>

        {/* Name */}
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
            maxLength={100}
          />
        </div>

        {/* Description */}
        <div className="form-group">
          <label className="form-label">Description <span style={{ color: 'var(--text3)', fontWeight: 400 }}>(optional)</span></label>
          <textarea
            className="form-input"
            placeholder="What does this habit involve? Why does it matter?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            maxLength={500}
            style={{ resize: 'none', fontFamily: 'var(--sans)', fontSize: '14px', lineHeight: 1.5 }}
          />
        </div>

        {/* Icon/Emoji picker tabs */}
        <div className="form-group">
          <label className="form-label">Icon</label>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
            <button
              type="button"
              onClick={() => setUseEmojis(false)}
              style={{
                flex: 1,
                padding: '8px 12px',
                borderRadius: '8px',
                border: `1px solid ${!useEmojis ? 'var(--accent)' : 'var(--border)'}`,
                background: !useEmojis ? 'rgba(124, 106, 247, 0.15)' : 'transparent',
                color: !useEmojis ? 'var(--accent2)' : 'var(--text2)',
                fontFamily: 'var(--sans)',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              Icons
            </button>
            <button
              type="button"
              onClick={() => setUseEmojis(true)}
              style={{
                flex: 1,
                padding: '8px 12px',
                borderRadius: '8px',
                border: `1px solid ${useEmojis ? 'var(--accent)' : 'var(--border)'}`,
                background: useEmojis ? 'rgba(124, 106, 247, 0.15)' : 'transparent',
                color: useEmojis ? 'var(--accent2)' : 'var(--text2)',
                fontFamily: 'var(--sans)',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              Emojis
            </button>
          </div>

          {useEmojis ? (
            <div
              className="icon-picker"
              style={{
                maxHeight: '300px',
                overflowY: 'auto',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
              }}
            >
              {EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  className={`icon-btn${emoji === selectedEmoji ? ' selected' : ''}`}
                  onClick={() => setSelectedEmoji(emoji)}
                  style={{ fontSize: '20px' }}
                  aria-label={emoji}
                  aria-pressed={emoji === selectedEmoji}
                >
                  {emoji}
                </button>
              ))}
            </div>
          ) : (
            <div
              className="icon-picker"
              style={{
                maxHeight: '300px',
                overflowY: 'auto',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
              }}
            >
              {HABIT_ICONS.map((icon) => (
                <button
                  key={icon.id}
                  type="button"
                  className={`icon-btn${icon.id === selectedIcon ? ' selected' : ''}`}
                  onClick={() => setSelectedIcon(icon.id)}
                  title={icon.label}
                  aria-label={icon.label}
                  aria-pressed={icon.id === selectedIcon}
                >
                  <HabitIcon iconId={icon.id} size={18} color={icon.id === selectedIcon ? selectedColor : 'currentColor'} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Color */}
        <div className="form-group">
          <label className="form-label">Color</label>
          <div className="color-picker">
            {COLORS.map((color) => (
              <div
                key={color}
                className={`color-swatch${color === selectedColor ? ' selected' : ''}`}
                style={{ background: color }}
                onClick={() => setSelectedColor(color)}
                role="radio"
                aria-checked={color === selectedColor}
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && setSelectedColor(color)}
              />
            ))}
          </div>
        </div>

        {/* Category */}
        <div className="form-group">
          <label className="form-label">Category</label>
          <div className="emoji-picker">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                className={`emoji-btn${cat === selectedCategory ? ' selected' : ''}`}
                onClick={() => setSelectedCategory(cat)}
                style={{ width: 'auto', padding: '0 12px', fontSize: '12px', fontFamily: 'var(--mono)' }}
              >
                {cat}
              </button>
            ))}
            <button
              type="button"
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
                style={{ padding: '6px 12px', minHeight: '36px' }}
              >
                {isAddingCategory ? '…' : 'Add'}
              </button>
              <button
                className="btn-cancel"
                onClick={handleCancelAddCategory}
                disabled={isAddingCategory}
                style={{ padding: '6px 12px', minHeight: '36px' }}
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* Frequency */}
        <div className="form-group">
          <label className="form-label">Frequency</label>
          <div className="frequency-options">
            <label className={`frequency-radio${frequencyType === 'daily' ? ' active' : ''}`}>
              <input
                type="radio"
                name="frequency"
                value="daily"
                checked={frequencyType === 'daily'}
                onChange={() => setFrequencyType('daily')}
              />
              <span className="frequency-label-text">
                <span className="frequency-label-title">Every day</span>
                <span className="frequency-label-sub">Daily habit</span>
              </span>
            </label>
            <label className={`frequency-radio${frequencyType === 'weekly' ? ' active' : ''}`}>
              <input
                type="radio"
                name="frequency"
                value="weekly"
                checked={frequencyType === 'weekly'}
                onChange={() => setFrequencyType('weekly')}
              />
              <span className="frequency-label-text">
                <span className="frequency-label-title">Specific days</span>
                <span className="frequency-label-sub">Choose days of the week</span>
              </span>
            </label>
          </div>

          {isWeekly && (
            <div className="days-picker">
              {DAY_LETTERS.map((letter, i) => (
                <button
                  key={i}
                  type="button"
                  className={`day-btn${daysOfWeek.includes(i) ? ' selected' : ''}`}
                  onClick={() => toggleDay(i)}
                  aria-label={DAY_FULL[i]}
                  aria-pressed={daysOfWeek.includes(i)}
                  title={DAY_FULL[i]}
                >
                  {letter}
                </button>
              ))}
            </div>
          )}

          {isWeekly && daysOfWeek.length === 0 && (
            <p style={{ fontSize: '11px', color: 'var(--red)', marginTop: '6px', fontFamily: 'var(--mono)' }}>
              Select at least one day
            </p>
          )}
        </div>

        <div className="modal-actions">
          <button className="btn-cancel" onClick={onClose} type="button">Cancel</button>
          <button
            className="btn-save"
            onClick={handleSave}
            type="button"
            disabled={!canSave}
            style={{ opacity: canSave ? 1 : 0.5, cursor: canSave ? 'pointer' : 'not-allowed' }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}