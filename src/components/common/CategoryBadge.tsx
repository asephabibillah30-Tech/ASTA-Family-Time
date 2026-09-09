import React from 'react';
import type { CategoryType } from '../../types/game';
import { CATEGORIES } from '../../data/cards';

interface CategoryBadgeProps {
  category: CategoryType;
  size?: 'sm' | 'md' | 'lg';
  showEmoji?: boolean;
}

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({
  category,
  size = 'md',
  showEmoji = true,
}) => {
  const info = CATEGORIES[category] || CATEGORIES.expression;

  const sizeClasses = {
    sm: 'text-xs px-2.5 py-0.5 gap-1',
    md: 'text-sm px-3.5 py-1 gap-1.5 font-bold',
    lg: 'text-base px-4 py-1.5 gap-2 font-extrabold',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border shadow-sm transition-all duration-200 ${info.badgeBg} ${sizeClasses[size]}`}
    >
      {showEmoji && <span className="text-base">{info.emoji}</span>}
      <span className="tracking-wide uppercase">{info.name}</span>
    </span>
  );
};
