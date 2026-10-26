import React from 'react';
import {
  LayoutDashboard,
  Layers,
  FileCode2,
  Terminal,
  FlaskConical,
  CalendarClock,
  BarChart3,
  Settings,
  LogOut,
  ShieldCheck,
  Cpu,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useStudyData } from '../../context/StudyDataContext';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  mobileOpen,
  onCloseMobile
}) => {
  const { signOut, isGuest, profile } = useAuth();
  const { subjects, notes, tasks } = useStudyData();

  const totalTopics = subjects.reduce((acc, s) => acc + s.topics.length, 0);
  const pendingTasks = tasks.filter(t => t.status !== 'completed').length;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: null },
    { id: 'subjects', label: 'Subjects & Topics', icon: Layers, badge: `${subjects.length}` },
    { id: 'notes', label: 'Notes Repository', icon: FileCode2, badge: `${notes.length}` },
    { id: 'ai-tutor', label: 'AI Study Tutor', icon: Terminal, badge: 'READY' },
    { id: 'quiz', label: 'Quiz & Practice Lab', icon: FlaskConical, badge: null },
    { id: 'planner', label: 'Planner & Matrix', icon: CalendarClock, badge: pendingTasks > 0 ? `${pendingTasks} DUE` : null },
    { id: 'analytics', label: 'Analytics & Logs', icon: BarChart3, badge: null },
    { id: 'settings', label: 'Settings & Storage', icon: Settings, badge: null },
  ];

  const handleSelect = (id: string) => {
    onNavigate(id);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 md:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed md:sticky top-0 left-0 h-screen w-64 bg-cyber-bg border-r border-cyber-border flex flex-col justify-between z-50 transition-transform duration-200 ease-in-out md:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Top: Logo & Workstation Branding */}
        <div>
          <div className="h-14 px-4 border-b border-cyber-border flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded bg-emerald-950/80 border border-emerald-500/50 flex items-center justify-center text-emerald-400">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <div className="flex items-center gap-1 font-mono text-sm font-bold tracking-wider text-slate-100">
                  <span>SUKUGUIDE</span>
                  <span className="text-[10px] text-emerald-400 font-semibold px-1 bg-emerald-950/60 border border-emerald-800/60 rounded">
                    v2.4
                  </span>
                </div>
                <p className="text-[10px] font-mono text-slate-500 tracking-tight">SEC_STUDY_STATION</p>
              </div>
            </div>

            <button
              onClick={onCloseMobile}
              className="md:hidden p-1 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-widest text-slate-500 font-semibold">
              // WORKSTATION_SUBSYSTEMS
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded text-xs font-mono transition-all group ${
                    isActive
                      ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/40 font-medium'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-cyber-surface border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-emerald-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                        isActive
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : item.badge.includes('DUE')
                          ? 'bg-amber-950/80 text-amber-400 border border-amber-800/60'
                          : 'bg-cyber-card text-slate-400 border border-cyber-border'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom: Hardware telemetry & Log out */}
        <div className="p-3 border-t border-cyber-border space-y-3">
          {/* Workstation Snapshot Card */}
          <div className="p-2.5 bg-cyber-surface border border-cyber-border rounded text-[11px] font-mono space-y-1.5">
            <div className="flex items-center justify-between text-slate-400">
              <span className="flex items-center gap-1.5 text-slate-500">
                <Cpu className="w-3 h-3 text-emerald-500" />
                <span>LOAD</span>
              </span>
              <span className="text-emerald-400">0.14 0.22 0.08</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-slate-500">KNOWLEDGE_INDEX</span>
              <span className="text-slate-300">{totalTopics} topics</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-slate-500">ACCESS_MODE</span>
              <span className={isGuest ? 'text-amber-400' : 'text-emerald-400'}>
                {isGuest ? 'DEMO_SESSION' : 'SECURE_AUTH'}
              </span>
            </div>
          </div>

          {/* User info & Disconnect */}
          <div className="flex items-center justify-between pt-1">
            <div className="truncate pr-2">
              <div className="font-mono text-xs text-slate-200 truncate">
                {profile?.fullName || profile?.handle || 'User'}
              </div>
              <div className="font-mono text-[10px] text-slate-500 truncate">
                {profile?.email || 'authenticated'}
              </div>
            </div>

            <button
              onClick={signOut}
              title="Disconnect session"
              className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-950/30 rounded border border-transparent hover:border-red-900/60 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
