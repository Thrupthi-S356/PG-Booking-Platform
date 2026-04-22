import React from 'react';

const variants = {
  primary: 'bg-brand-500 hover:bg-brand-400 text-white shadow-lg shadow-brand-500/25',
  secondary: 'bg-white/5 hover:bg-white/10 text-white border border-white/10 hover:border-white/20',
  danger: 'bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/20',
  success: 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/20',
  ghost: 'text-slate-300 hover:text-white hover:bg-white/5',
  outline: 'border border-brand-500/50 text-brand-400 hover:bg-brand-500/10',
};

const sizes = {
  sm: 'px-3 py-1.5 text-xs rounded-lg',
  md: 'px-5 py-2.5 text-sm rounded-xl',
  lg: 'px-7 py-3.5 text-base rounded-xl',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  loading = false,
  icon,
  disabled,
  ...props
}) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center gap-2 font-medium
        transition-all duration-200 active:scale-95
        disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100
        ${variants[variant]} ${sizes[size]} ${className}
      `}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : icon ? (
        <span className="shrink-0">{icon}</span>
      ) : null}
      {children}
    </button>
  );
}
