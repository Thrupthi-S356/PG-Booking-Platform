import React from 'react';
import { SlidersHorizontal, X } from 'lucide-react';
import { cities, amenityOptions } from '../../data/mockData';
import Button from './Button';

export default function FilterPanel({ filters, onChange, onReset }) {
  const update = (key, val) => onChange({ ...filters, [key]: val });

  const toggleAmenity = (a) => {
    const cur = filters.amenities || [];
    update('amenities', cur.includes(a) ? cur.filter(x => x !== a) : [...cur, a]);
  };

  return (
    <div className="glass rounded-2xl border border-white/5 p-5 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-white font-semibold">
          <SlidersHorizontal size={16} className="text-brand-400" />
          Filters
        </div>
        <button onClick={onReset} className="text-xs text-slate-400 hover:text-brand-400 flex items-center gap-1 transition-colors">
          <X size={12} /> Reset
        </button>
      </div>

      {/* City */}
      <div>
        <label className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2 block">City</label>
        <select
          value={filters.city || ''}
          onChange={e => update('city', e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500/50 appearance-none"
        >
          <option value="">All Cities</option>
          {cities.map(c => <option key={c} value={c} className="bg-slate-900">{c}</option>)}
        </select>
      </div>

      {/* Price Range */}
      <div>
        <label className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2 block">Price Range</label>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Min"
            value={filters.minPrice || ''}
            onChange={e => update('minPrice', e.target.value)}
            className="w-1/2 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500/50 placeholder-slate-600"
          />
          <input
            type="number"
            placeholder="Max"
            value={filters.maxPrice || ''}
            onChange={e => update('maxPrice', e.target.value)}
            className="w-1/2 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500/50 placeholder-slate-600"
          />
        </div>
      </div>

      {/* Gender */}
      <div>
        <label className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2 block">Gender Preference</label>
        <div className="grid grid-cols-3 gap-2">
          {['all', 'male', 'female', 'coed'].map(t => (
            <button
              key={t}
              onClick={() => update('type', t === 'all' ? '' : t)}
              className={`py-2 rounded-xl text-xs font-medium capitalize transition-all border ${
                (filters.type || '') === (t === 'all' ? '' : t)
                  ? 'bg-brand-500/20 border-brand-500/50 text-brand-400'
                  : 'bg-white/5 border-white/5 text-slate-400 hover:border-white/20'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Amenities */}
      <div>
        <label className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2 block">Amenities</label>
        <div className="space-y-2">
          {amenityOptions.map(a => (
            <label key={a} className="flex items-center gap-2.5 cursor-pointer group">
              <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                (filters.amenities || []).includes(a)
                  ? 'bg-brand-500 border-brand-500'
                  : 'border-white/20 group-hover:border-brand-500/50'
              }`} onClick={() => toggleAmenity(a)}>
                {(filters.amenities || []).includes(a) && (
                  <svg viewBox="0 0 10 8" className="w-2.5 h-2" fill="none">
                    <path d="M1 4l3 3 5-6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
              <span className="text-sm text-slate-300 group-hover:text-white transition-colors">{a}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
