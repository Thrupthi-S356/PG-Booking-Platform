import React from 'react';
import { Star } from 'lucide-react';

export default function StarRating({ rating, reviews, size = 'sm' }) {
  const s = size === 'lg' ? 18 : 14;
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        {[1,2,3,4,5].map(i => (
          <Star
            key={i}
            size={s}
            className={i <= Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'text-slate-600'}
          />
        ))}
      </div>
      <span className={`font-semibold text-amber-400 ${size === 'lg' ? 'text-base' : 'text-sm'}`}>{rating}</span>
      {reviews && <span className="text-slate-500 text-xs">({reviews} reviews)</span>}
    </div>
  );
}
