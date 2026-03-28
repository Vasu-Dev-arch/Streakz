import React from 'react';
import { CATEGORIES } from '../constants';

/**
 * Category filter component for filtering habits by category
 */
export function CategoryFilter({ activeCategory, onCategoryChange }) {
  const categories = ['All', ...CATEGORIES];

  return (
    <div className="category-filter">
      {categories.map((cat) => (
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
