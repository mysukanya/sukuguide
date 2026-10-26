import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'green' | 'amber' | 'cyan' | 'red' | 'slate' | 'outline';
  size?: 'sm' | 'md';
  pulse?: boolean;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'green',
  size = 'sm',
  pulse = false,
  className = ''
}) => {
  const variantStyles = {
    green: 'bg-emerald-950/60 text-emerald-400 border-emerald-800/80',
    amber: 'bg-amber-950/60 text-amber-400 border-amber-800/80',
    cyan: 'bg-cyan-950/60 text-cyan-400 border-cyan-800/80',
    red: 'bg-red-950/60 text-red-400 border-red-800/80',
    slate: 'bg-slate-900 text-slate-400 border-slate-700/60',
    outline: 'bg-transparent text-slate-300 border-slate-800'
  };

  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 tracking-wider',
    md: 'text-xs px-2.5 py-1 tracking-wider'
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono uppercase font-medium rounded-sm border ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {pulse && (
        <span className="w-1.5 h-1.5 rounded-full bg-current status-pulse" />
      )}
      {children}
    </span>
  );
};
