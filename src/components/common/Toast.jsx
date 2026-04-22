import React from 'react';
import { CheckCircle, Info, AlertCircle, X } from 'lucide-react';

const icons = {
  success: <CheckCircle size={18} className="text-emerald-400" />,
  error: <AlertCircle size={18} className="text-red-400" />,
  info: <Info size={18} className="text-brand-400" />,
};

const colors = {
  success: 'border-emerald-500/30 bg-emerald-500/10',
  error: 'border-red-500/30 bg-red-500/10',
  info: 'border-brand-500/30 bg-brand-500/10',
};

export default function Toast({ message, type = 'info' }) {
  return (
    <div className={`
      fixed top-20 right-4 z-[100] flex items-center gap-3
      px-4 py-3 rounded-xl border glass-dark max-w-sm
      animate-slide-up shadow-2xl
      ${colors[type]}
    `}>
      {icons[type]}
      <p className="text-sm text-white font-medium">{message}</p>
    </div>
  );
}
