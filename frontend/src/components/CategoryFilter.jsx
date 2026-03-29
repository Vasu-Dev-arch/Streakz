import React from 'react';

/**
 * Category filter component for filtering habits by category
 */
export function CategoryFilter({ activeCategory, onCategoryChange, categories = [] }) {
  const allCategories = ['All', ...categories];

  return (
    <div className="category-filter">
      {allCategories.map((cat) => (
        <button
          key={cat}
          className={`category-btn${activeCategory === cat ? ' active' : ''}`}
          onClick={() => onCategoryChange(cat)}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
