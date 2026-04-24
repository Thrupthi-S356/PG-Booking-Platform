import React from 'react';
import { Star } from 'lucide-react';

export default function StarRating({ rating, reviews, size = 'sm' }) {
  const s = size === 'lg' ? 18 : 14;
  const safeRating = Number(rating) || 0;
  const rounded = Math.round(safeRating);

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map(i => (
          <Star
            key={i}
            size={s}
            style={{
              fill: i <= rounded ? '#fbbf24' : 'transparent',
              color: i <= rounded ? '#fbbf24' : '#475569',
            }}
          />
        ))}
      </div>
      {safeRating > 0 && (
        <span style={{ color: '#fbbf24' }} className={`font-semibold ${size === 'lg' ? 'text-base' : 'text-sm'}`}>
          {safeRating.toFixed(1)}
        </span>
      )}
      {reviews > 0 && (
        <span className="text-slate-500 text-xs">({reviews} reviews)</span>
      )}
    </div>
  );
}