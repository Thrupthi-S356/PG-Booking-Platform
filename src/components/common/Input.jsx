import React from 'react';

export default function Input({
  label,
  error,
  icon,
  className = '',
  containerClassName = '',
  ...props
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${containerClassName}`}>
      {label && (
        <label className="text-sm font-medium text-slate-300">{label}</label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            {icon}
          </div>
        )}
        <input
          {...props}
          className={`
            w-full bg-white/5 border rounded-xl px-4 py-3 text-white placeholder-slate-500
            focus:outline-none focus:ring-2 transition-all text-sm
            ${icon ? 'pl-10' : ''}
            ${error
              ? 'border-red-500/50 focus:ring-red-500/30'
              : 'border-white/10 focus:border-brand-500/50 focus:ring-brand-500/20'
            }
            ${className}
          `}
        />
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
