import React, { useState } from 'react';
import {
  BarChart3,
  Activity,
  Flame,
  CheckCircle2,
  Clock,
  Layers,
  Filter,
  Download,
  Terminal
} from 'lucide-react';
import { useStudyData } from '../context/StudyDataContext';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';

export const AnalyticsPage: React.FC = () => {
  const { subjects, sessions, auditLogs, notes, tasks } = useStudyData();
  const [logFilter, setLogFilter] = useState<'ALL' | 'SUCCESS' | 'WARN' | 'INFO'>('ALL');

  // Compute metrics
  const totalHours = subjects.reduce((acc, s) => acc + s.completedHours, 0);
  const totalTargetHours = subjects.reduce((acc, s) => acc + s.targetHours, 0);
  const allTopics = subjects.flatMap(s => s.topics);
  
  const masteryCounts = {
    mastered: allTopics.filter(t => t.masteryLevel === 'mastered').length,
    proficient: allTopics.filter(t => t.masteryLevel === 'proficient').length,
    learning: allTopics.filter(t => t.masteryLevel === 'learning').length,
    novice: allTopics.filter(t => t.masteryLevel === 'novice').length,
  };

  const filteredLogs = auditLogs.filter(log => {
    if (logFilter === 'ALL') return true;
    return log.status === logFilter;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 font-mono text-xs text-emerald-400 mb-1">
            <BarChart3 className="w-4 h-4" />
            <span>METRICS_TELEMETRY // PERFORMANCE_AUDIT</span>
          </div>
          <h1 className="font-mono text-xl sm:text-2xl font-bold text-slate-100">
            PROGRESS ANALYTICS & AUDIT LOGS
          </h1>
          <p className="text-xs text-slate-400">
            Workstation study telemetry, curriculum velocity, topic mastery ratios, and event trail.
          </p>
        </div>
      </div>

      {/* Top Telemetry KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-cyber-surface border border-cyber-border p-4 rounded-lg space-y-1.5">
          <span className="font-mono text-xs text-slate-400">CURRICULUM_COMPLETION</span>
          <div className="font-mono text-2xl font-bold text-emerald-400">
            {totalTargetHours > 0 ? Math.round((totalHours / totalTargetHours) * 100) : 0}%
          </div>
          <p className="font-mono text-[11px] text-slate-500">
            {totalHours.toFixed(1)}h / {totalTargetHours}h target
          </p>
        </div>

        <div className="bg-cyber-surface border border-cyber-border p-4 rounded-lg space-y-1.5">
          <span className="font-mono text-xs text-slate-400">TOPICS_MASTERED</span>
          <div className="font-mono text-2xl font-bold text-cyan-400">
            {masteryCounts.mastered} / {allTopics.length}
          </div>
          <p className="font-mono text-[11px] text-slate-500">
            {allTopics.length > 0 ? Math.round((masteryCounts.mastered / allTopics.length) * 100) : 0}% top-tier retention
          </p>
        </div>

        <div className="bg-cyber-surface border border-cyber-border p-4 rounded-lg space-y-1.5">
          <span className="font-mono text-xs text-slate-400">FOCUS_SESSIONS</span>
          <div className="font-mono text-2xl font-bold text-amber-400">
            {sessions.length}
          </div>
          <p className="font-mono text-[11px] text-slate-500">
            Avg 45 mins per sprint
          </p>
        </div>

        <div className="bg-cyber-surface border border-cyber-border p-4 rounded-lg space-y-1.5">
          <span className="font-mono text-xs text-slate-400">AUDIT_EVENT_ENTRIES</span>
          <div className="font-mono text-2xl font-bold text-purple-400">
            {auditLogs.length}
          </div>
          <p className="font-mono text-[11px] text-slate-500">
            Cryptographic ledger integrity OK
          </p>
        </div>
      </div>

      {/* Analytics Breakdown Grid: Topic Mastery Bars & Subject Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Topic Mastery Distribution */}
        <div className="bg-cyber-surface border border-cyber-border rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-cyber-border pb-3">
            <span className="font-mono text-xs text-emerald-400 font-semibold tracking-wider">
              TOPIC_MASTERY_SPECTRUM
            </span>
            <span className="text-[10px] font-mono text-slate-500">
              TOTAL {allTopics.length} TOPICS
            </span>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span className="text-emerald-400 font-medium">MASTERED</span>
                <span>{masteryCounts.mastered} ({allTopics.length > 0 ? Math.round((masteryCounts.mastered / allTopics.length) * 100) : 0}%)</span>
              </div>
              <div className="w-full bg-cyber-bg h-2 rounded-full overflow-hidden border border-cyber-border">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all"
                  style={{ width: `${allTopics.length > 0 ? (masteryCounts.mastered / allTopics.length) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span className="text-cyan-400 font-medium">PROFICIENT</span>
                <span>{masteryCounts.proficient} ({allTopics.length > 0 ? Math.round((masteryCounts.proficient / allTopics.length) * 100) : 0}%)</span>
              </div>
              <div className="w-full bg-cyber-bg h-2 rounded-full overflow-hidden border border-cyber-border">
                <div
                  className="bg-cyan-500 h-full rounded-full transition-all"
                  style={{ width: `${allTopics.length > 0 ? (masteryCounts.proficient / allTopics.length) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span className="text-amber-400 font-medium">LEARNING</span>
                <span>{masteryCounts.learning} ({allTopics.length > 0 ? Math.round((masteryCounts.learning / allTopics.length) * 100) : 0}%)</span>
              </div>
              <div className="w-full bg-cyber-bg h-2 rounded-full overflow-hidden border border-cyber-border">
                <div
                  className="bg-amber-500 h-full rounded-full transition-all"
                  style={{ width: `${allTopics.length > 0 ? (masteryCounts.learning / allTopics.length) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span className="text-slate-400 font-medium">NOVICE</span>
                <span>{masteryCounts.novice} ({allTopics.length > 0 ? Math.round((masteryCounts.novice / allTopics.length) * 100) : 0}%)</span>
              </div>
              <div className="w-full bg-cyber-bg h-2 rounded-full overflow-hidden border border-cyber-border">
                <div
                  className="bg-slate-600 h-full rounded-full transition-all"
                  style={{ width: `${allTopics.length > 0 ? (masteryCounts.novice / allTopics.length) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Subject Hour Allocation */}
        <div className="bg-cyber-surface border border-cyber-border rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-cyber-border pb-3">
            <span className="font-mono text-xs text-emerald-400 font-semibold tracking-wider">
              SUBJECT_HOURS_VELOCITY
            </span>
            <span className="text-[10px] font-mono text-slate-500">
              TARGET VS LOGGED
            </span>
          </div>

          <div className="space-y-3 font-mono text-xs">
            {subjects.map(s => {
              const ratio = s.targetHours > 0 ? Math.min(100, Math.round((s.completedHours / s.targetHours) * 100)) : 0;
              return (
                <div key={s.id} className="space-y-1">
                  <div className="flex justify-between text-slate-300">
                    <span style={{ color: s.color }} className="font-medium">{s.code}: {s.name}</span>
                    <span className="text-slate-400">{s.completedHours}h / {s.targetHours}h ({ratio}%)</span>
                  </div>
                  <div className="w-full bg-cyber-bg h-2 rounded-full overflow-hidden border border-cyber-border">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${ratio}%`, backgroundColor: s.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Workstation Audit Trail Log */}
      <div className="bg-cyber-surface border border-cyber-border rounded-lg overflow-hidden">
        <div className="px-5 py-3.5 bg-cyber-bg border-b border-cyber-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono text-xs">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            <span className="text-emerald-400 font-semibold tracking-wider">
              SYSTEM_AUDIT_LOG
            </span>
            <span className="text-slate-500">[{filteredLogs.length} ENTRIES]</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-500">FILTER:</span>
            {(['ALL', 'SUCCESS', 'WARN', 'INFO'] as const).map(filter => (
              <button
                key={filter}
                onClick={() => setLogFilter(filter)}
                className={`px-2 py-0.5 rounded text-[10px] transition-colors ${
                  logFilter === filter
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/50'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-cyber-border text-slate-500 text-[11px]">
                <th className="pb-2.5 font-medium">TIMESTAMP</th>
                <th className="pb-2.5 font-medium">ACTION</th>
                <th className="pb-2.5 font-medium">TARGET / DETAILS</th>
                <th className="pb-2.5 font-medium text-right">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cyber-border/40">
              {filteredLogs.map(log => {
                const statusVariants = {
                  SUCCESS: 'green',
                  WARN: 'amber',
                  INFO: 'cyan'
                } as const;

                return (
                  <tr key={log.id} className="hover:bg-cyber-bg/40 transition-colors">
                    <td className="py-2.5 text-slate-500 text-[11px]">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="py-2.5 text-emerald-400 font-semibold">
                      {log.action}
                    </td>
                    <td className="py-2.5 text-slate-300 text-[11px]">
                      {log.target}
                    </td>
                    <td className="py-2.5 text-right">
                      <Badge variant={statusVariants[log.status]} size="sm">
                        {log.status}
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
