import React, { useEffect } from 'react';
import { X, Terminal } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'md'
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthStyles = {
    sm: 'max-w-md',
    md: 'max-w-xl',
    lg: 'max-w-3xl',
    xl: 'max-w-5xl'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        className={`relative w-full ${maxWidthStyles[maxWidth]} bg-cyber-surface border border-cyber-border rounded-md shadow-cyber-card overflow-hidden z-10`}
      >
        {/* Terminal Header Bar */}
        <div className="flex items-center justify-between px-4 py-3 bg-cyber-bg border-b border-cyber-border select-none">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500/70" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" />
            </div>
            <div className="h-3.5 w-px bg-cyber-border mx-1" />
            <div className="flex items-center gap-1.5 text-xs font-mono text-emerald-400">
              <Terminal className="w-3.5 h-3.5 text-emerald-500" />
              <span className="font-semibold tracking-wide">{title}</span>
            </div>
            {subtitle && (
              <span className="text-[11px] font-mono text-slate-500 hidden sm:inline">
                // {subtitle}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-red-400 hover:bg-red-950/30 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 max-h-[80vh] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};
