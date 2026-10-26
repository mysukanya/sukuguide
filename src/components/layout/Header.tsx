import React, { useState, useEffect } from 'react';
import { Shield, Cpu, Activity, Database, Menu, Terminal, Clock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { isSupabaseConfigured } from '../../lib/supabase';
import { Badge } from '../common/Badge';

interface HeaderProps {
  currentView: string;
  onToggleMobileNav: () => void;
  onNavigate: (view: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentView, onToggleMobileNav, onNavigate }) => {
  const { profile, isGuest } = useAuth();
  const [time, setTime] = useState<string>('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-14 bg-cyber-surface/90 border-b border-cyber-border backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 select-none">
      {/* Left: Mobile Nav Toggle + Workstation Path */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileNav}
          className="md:hidden p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-cyber-card rounded border border-cyber-border"
          aria-label="Toggle navigation"
        >
          <Menu className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 font-mono text-xs text-slate-400">
          <Terminal className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-emerald-500 font-semibold">{profile?.handle || 'sukuguide'}</span>
          <span className="text-slate-600">@</span>
          <span className="text-slate-400 hidden sm:inline">workstation:~$</span>
          <span className="text-slate-300 font-medium">/{currentView}</span>
        </div>
      </div>

      {/* Right: Workstation telemetry & status badges */}
      <div className="flex items-center gap-2.5 sm:gap-4">
        {/* System Clock */}
        <div className="hidden lg:flex items-center gap-1.5 font-mono text-xs text-slate-400 px-2 py-1 bg-cyber-bg rounded border border-cyber-border">
          <Clock className="w-3.5 h-3.5 text-slate-500" />
          <span>{time} UTC</span>
        </div>

        {/* Database Status */}
        <div className="hidden sm:flex items-center gap-1.5">
          {isSupabaseConfigured ? (
            <Badge variant="green" pulse>
              <Database className="w-3 h-3" />
              <span>SUPABASE_CONNECTED</span>
            </Badge>
          ) : (
            <Badge variant="amber" pulse>
              <Database className="w-3 h-3" />
              <span>LOCAL_CACHE_MODE</span>
            </Badge>
          )}
        </div>

        {/* System Health */}
        <div className="hidden md:flex items-center gap-1.5">
          <Badge variant="green">
            <Activity className="w-3 h-3" />
            <span>SYS_OK</span>
          </Badge>
        </div>

        {/* User Alias Pill */}
        <button
          onClick={() => onNavigate('settings')}
          className="flex items-center gap-2 px-2.5 py-1 bg-cyber-bg hover:bg-cyber-card border border-cyber-border hover:border-emerald-500/40 rounded transition-all group"
        >
          <div className="w-5 h-5 rounded-full bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center font-mono text-[10px] text-emerald-400 font-bold">
            {(profile?.handle || 'S')[0].toUpperCase()}
          </div>
          <span className="font-mono text-xs text-slate-300 group-hover:text-emerald-400 hidden sm:inline">
            {profile?.handle || 'suku_sec'}
          </span>
          {isGuest && (
            <span className="text-[10px] font-mono bg-amber-950/80 text-amber-400 px-1.5 rounded border border-amber-800/60">
              DEMO
            </span>
          )}
        </button>
      </div>
    </header>
  );
};
