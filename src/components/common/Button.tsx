import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  loading = false,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-mono font-medium rounded transition-all duration-150 focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed select-none';

  const variantStyles = {
    primary: 'bg-emerald-600 hover:bg-emerald-500 text-black border border-emerald-400 font-semibold shadow-sm active:translate-y-px',
    secondary: 'bg-cyber-surface hover:bg-cyber-card text-emerald-400 border border-cyber-border hover:border-emerald-500/50',
    danger: 'bg-red-950/40 hover:bg-red-900/60 text-red-400 border border-red-800/80',
    ghost: 'bg-transparent hover:bg-cyber-card text-slate-400 hover:text-slate-200 border border-transparent'
  };

  const sizeStyles = {
    sm: 'text-xs px-2.5 py-1.5 gap-1.5',
    md: 'text-xs px-3.5 py-2 gap-2',
    lg: 'text-sm px-4 py-2.5 gap-2.5'
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        icon && <span className="shrink-0">{icon}</span>
      )}
      <span>{children}</span>
    </button>
  );
};
