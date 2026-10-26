import React, { useState } from 'react';
import {
  Layers,
  CheckCircle2,
  Clock,
  FileCode2,
  Plus,
  Play,
  Terminal,
  ArrowUpRight,
  FlaskConical,
  Activity,
  AlertTriangle,
  Flame,
  Check
} from 'lucide-react';
import { useStudyData } from '../context/StudyDataContext';
import { useAuth } from '../context/AuthContext';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';

interface DashboardPageProps {
  onNavigate: (view: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const { profile } = useAuth();
  const {
    subjects,
    notes,
    tasks,
    sessions,
    auditLogs,
    toggleTaskStatus,
    addTask,
    addNote
  } = useStudyData();

  // Quick Task Modal
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskSubjectId, setTaskSubjectId] = useState(subjects[0]?.id || '');
  const [taskPriority, setTaskPriority] = useState<'low' | 'medium' | 'high' | 'critical'>('high');

  // Quick Scratchpad
  const [scratchTitle, setScratchTitle] = useState('');
  const [scratchContent, setScratchContent] = useState('');
  const [scratchSaved, setScratchSaved] = useState(false);

  // Computed metrics
  const totalHours = subjects.reduce((acc, s) => acc + s.completedHours, 0);
  const allTopics = subjects.flatMap(s => s.topics);
  const masteredTopics = allTopics.filter(t => t.masteryLevel === 'mastered');
  const pendingTasks = tasks.filter(t => t.status !== 'completed');
  const completedTasks = tasks.filter(t => t.status === 'completed');

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;
    await addTask({
      title: taskTitle.trim(),
      subjectId: taskSubjectId || subjects[0]?.id || 'general',
      dueDate: new Date(Date.now() + 86400000).toISOString(),
      priority: taskPriority,
      status: 'pending',
      estimatedMinutes: 45
    });
    setTaskTitle('');
    setTaskModalOpen(false);
  };

  const handleSaveScratchpad = async () => {
    if (!scratchTitle.trim() || !scratchContent.trim()) return;
    await addNote({
      title: scratchTitle.trim(),
      contentMarkdown: scratchContent.trim(),
      subjectId: subjects[0]?.id || 'sub-netsec',
      tags: ['quick-scratchpad', 'terminal'],
      isPinned: false
    });
    setScratchSaved(true);
    setTimeout(() => {
      setScratchTitle('');
      setScratchContent('');
      setScratchSaved(false);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / System Terminal Welcome */}
      <div className="bg-cyber-surface border border-cyber-border rounded-lg p-5 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-emerald-400 font-semibold tracking-wider">
                SESSION_ID: {profile?.handle || 'suku_sec'}#workstation
              </span>
              <span className="text-slate-600">//</span>
              <span className="font-mono text-xs text-slate-400">STATUS: WORKSTATION_ONLINE</span>
            </div>
            <h1 className="font-mono text-2xl font-bold tracking-tight text-slate-100 flex items-center gap-2">
              <span>COMMAND DASHBOARD</span>
              <span className="terminal-cursor" />
            </h1>
            <p className="text-xs text-slate-400">
              Personal cybersecurity curriculum, packet dissection labs, and spaced revision metrics.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              variant="secondary"
              size="sm"
              icon={<Play className="w-3.5 h-3.5" />}
              onClick={() => onNavigate('planner')}
            >
              LAUNCH FOCUS TIMER
            </Button>
            <Button
              variant="secondary"
              size="sm"
              icon={<Terminal className="w-3.5 h-3.5" />}
              onClick={() => onNavigate('ai-tutor')}
            >
              ASK AI TUTOR
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={<Plus className="w-3.5 h-3.5" />}
              onClick={() => setTaskModalOpen(true)}
            >
              NEW TASK
            </Button>
          </div>
        </div>
      </div>

      {/* Primary Telemetry Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-cyber-surface border border-cyber-border p-4 rounded-lg space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>ACTIVE_SUBJECTS</span>
            <Layers className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-2xl font-bold text-slate-100">{subjects.length}</span>
            <span className="font-mono text-xs text-slate-500">modules loaded</span>
          </div>
          <div className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
            <span>{allTopics.length} total technical topics</span>
          </div>
        </div>

        <div className="bg-cyber-surface border border-cyber-border p-4 rounded-lg space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>TOPIC_MASTERY</span>
            <CheckCircle2 className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-2xl font-bold text-cyan-400">
              {allTopics.length > 0 ? Math.round((masteredTopics.length / allTopics.length) * 100) : 0}%
            </span>
            <span className="font-mono text-xs text-slate-500">
              ({masteredTopics.length}/{allTopics.length} mastered)
            </span>
          </div>
          <div className="w-full bg-cyber-bg h-1.5 rounded-full overflow-hidden border border-cyber-border">
            <div
              className="bg-cyan-500 h-full transition-all duration-500"
              style={{
                width: `${allTopics.length > 0 ? (masteredTopics.length / allTopics.length) * 100 : 0}%`
              }}
            />
          </div>
        </div>

        <div className="bg-cyber-surface border border-cyber-border p-4 rounded-lg space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>STUDY_VELOCITY</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-2xl font-bold text-amber-400">{totalHours.toFixed(1)}h</span>
            <span className="font-mono text-xs text-slate-500">cumulative</span>
          </div>
          <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
            <Flame className="w-3 h-3 text-amber-400" />
            <span>{sessions.length} logged deep focus sprints</span>
          </div>
        </div>

        <div className="bg-cyber-surface border border-cyber-border p-4 rounded-lg space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>KNOWLEDGE_VAULT</span>
            <FileCode2 className="w-4 h-4 text-purple-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-2xl font-bold text-slate-100">{notes.length}</span>
            <span className="font-mono text-xs text-slate-500">markdown files</span>
          </div>
          <div className="text-[11px] font-mono text-purple-400 flex items-center gap-1">
            <span>{notes.filter(n => n.isPinned).length} priority pinned notes</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Tasks & Today's Schedule on Left, Scratchpad & Live Audit on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Task Checklist & Subject Progress */}
        <div className="lg:col-span-2 space-y-6">
          {/* Priority Task Checklist */}
          <div className="bg-cyber-surface border border-cyber-border rounded-lg overflow-hidden">
            <div className="px-4 py-3 bg-cyber-bg border-b border-cyber-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-emerald-400 font-semibold tracking-wider">
                  TODAY_TARGETS
                </span>
                <span className="text-[10px] font-mono text-slate-500">
                  [{pendingTasks.length} pending / {completedTasks.length} done]
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setTaskModalOpen(true)}
                icon={<Plus className="w-3.5 h-3.5 text-emerald-400" />}
              >
                Add Task
              </Button>
            </div>

            <div className="p-4 divide-y divide-cyber-border/60">
              {tasks.length === 0 ? (
                <div className="py-8 text-center text-xs font-mono text-slate-500">
                  NO_ACTIVE_TASKS // ALL OBJECTIVES COMPLETED
                </div>
              ) : (
                tasks.slice(0, 5).map(task => {
                  const subject = subjects.find(s => s.id === task.subjectId);
                  const isDone = task.status === 'completed';

                  const priorityStyles = {
                    critical: 'red',
                    high: 'amber',
                    medium: 'slate',
                    low: 'slate'
                  } as const;

                  return (
                    <div
                      key={task.id}
                      className="py-3 flex items-start justify-between gap-3 group transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <button
                          onClick={() => toggleTaskStatus(task.id)}
                          className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                            isDone
                              ? 'bg-emerald-600 border-emerald-500 text-black'
                              : 'border-slate-600 hover:border-emerald-400'
                          }`}
                        >
                          {isDone && <Check className="w-3 h-3 stroke-[3]" />}
                        </button>
                        <div className="space-y-1">
                          <p
                            className={`text-xs font-mono transition-colors ${
                              isDone ? 'line-through text-slate-500' : 'text-slate-200 group-hover:text-emerald-300'
                            }`}
                          >
                            {task.title}
                          </p>
                          <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500">
                            {subject && (
                              <span style={{ color: subject.color }}>{subject.code}</span>
                            )}
                            <span>•</span>
                            <span>{task.estimatedMinutes}m est</span>
                          </div>
                        </div>
                      </div>

                      <Badge variant={priorityStyles[task.priority]} size="sm">
                        {task.priority}
                      </Badge>
                    </div>
                  );
                })
              )}
            </div>

            <div className="px-4 py-2.5 bg-cyber-bg/50 border-t border-cyber-border flex justify-between items-center text-xs font-mono text-slate-400">
              <span>View full sprint schedule in Planner</span>
              <button
                onClick={() => onNavigate('planner')}
                className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
              >
                <span>OPEN_MATRIX</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Active Curriculum Modules Overview */}
          <div className="bg-cyber-surface border border-cyber-border rounded-lg overflow-hidden">
            <div className="px-4 py-3 bg-cyber-bg border-b border-cyber-border flex items-center justify-between">
              <span className="font-mono text-xs text-emerald-400 font-semibold tracking-wider">
                CURRICULUM_PIPELINE
              </span>
              <button
                onClick={() => onNavigate('subjects')}
                className="text-xs font-mono text-slate-400 hover:text-emerald-400 flex items-center gap-1"
              >
                <span>MANAGE_SUBJECTS</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {subjects.map(subject => {
                const completedTopics = subject.topics.filter(t => t.completed).length;
                const percent = subject.topics.length > 0
                  ? Math.round((completedTopics / subject.topics.length) * 100)
                  : 0;

                return (
                  <div
                    key={subject.id}
                    onClick={() => onNavigate('subjects')}
                    className="p-3 bg-cyber-bg border border-cyber-border hover:border-slate-700 rounded transition-all cursor-pointer space-y-2 group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono font-semibold" style={{ color: subject.color }}>
                        {subject.code}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">
                        {subject.completedHours}h / {subject.targetHours}h
                      </span>
                    </div>

                    <h2 className="text-xs font-mono font-medium text-slate-200 group-hover:text-emerald-400 truncate">
                      {subject.name}
                    </h2>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] font-mono text-slate-400">
                        <span>{completedTopics}/{subject.topics.length} topics</span>
                        <span>{percent}%</span>
                      </div>
                      <div className="w-full bg-cyber-card h-1 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{ width: `${percent}%`, backgroundColor: subject.color }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column (1 Col): Quick Scratchpad & Live Audit Stream */}
        <div className="space-y-6">
          {/* Quick Terminal Markdown Scratchpad */}
          <div className="bg-cyber-surface border border-cyber-border rounded-lg overflow-hidden">
            <div className="px-4 py-3 bg-cyber-bg border-b border-cyber-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCode2 className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-mono text-xs text-emerald-400 font-semibold tracking-wider">
                  QUICK_SCRATCHPAD
                </span>
              </div>
              {scratchSaved && (
                <span className="text-[10px] font-mono text-emerald-400 animate-pulse">
                  SAVED_TO_NOTES
                </span>
              )}
            </div>

            <div className="p-4 space-y-3">
              <input
                type="text"
                placeholder="Scratch note title..."
                value={scratchTitle}
                onChange={(e) => setScratchTitle(e.target.value)}
                className="w-full bg-cyber-bg border border-cyber-border focus:border-emerald-500 focus:outline-none rounded px-3 py-1.5 text-xs font-mono text-slate-200 placeholder-slate-600 transition-colors"
              />
              <textarea
                rows={5}
                placeholder="Capture quick exploit commands, memory offsets, or study bullets in markdown..."
                value={scratchContent}
                onChange={(e) => setScratchContent(e.target.value)}
                className="w-full bg-cyber-bg border border-cyber-border focus:border-emerald-500 focus:outline-none rounded p-3 text-xs font-mono text-slate-200 placeholder-slate-600 resize-none transition-colors"
              />
              <Button
                variant="secondary"
                size="sm"
                onClick={handleSaveScratchpad}
                disabled={!scratchTitle.trim() || !scratchContent.trim()}
                className="w-full justify-center"
              >
                SYNC INTO NOTES VAULT
              </Button>
            </div>
          </div>

          {/* Workstation Activity Stream / Audit Log */}
          <div className="bg-cyber-surface border border-cyber-border rounded-lg overflow-hidden">
            <div className="px-4 py-3 bg-cyber-bg border-b border-cyber-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-3.5 h-3.5 text-cyan-400" />
                <span className="font-mono text-xs text-cyan-400 font-semibold tracking-wider">
                  AUDIT_STREAM
                </span>
              </div>
              <span className="text-[10px] font-mono text-slate-500">REALTIME</span>
            </div>

            <div className="p-3 divide-y divide-cyber-border/40 font-mono text-[11px] max-h-64 overflow-y-auto">
              {auditLogs.slice(0, 6).map((log) => (
                <div key={log.id} className="py-2 space-y-0.5">
                  <div className="flex items-center justify-between">
                    <span className="text-emerald-400 font-medium">
                      {log.action}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-slate-400 truncate text-[10px]">
                    &gt; {log.target}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* New Task Modal */}
      <Modal
        isOpen={taskModalOpen}
        onClose={() => setTaskModalOpen(false)}
        title="SCHEDULE_STUDY_TASK"
        subtitle="Add to workstation sprint"
      >
        <form onSubmit={handleCreateTask} className="space-y-4">
          <div>
            <label className="block text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1.5">
              Task Directive / Objective
            </label>
            <input
              type="text"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              placeholder="e.g. Dissect BGP routing tables and analyze RPKI ROA ROVs"
              className="w-full bg-cyber-bg border border-cyber-border focus:border-emerald-500 focus:outline-none rounded px-3 py-2 text-xs font-mono text-slate-200 placeholder-slate-600"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1.5">
                Target Subject
              </label>
              <select
                value={taskSubjectId}
                onChange={(e) => setTaskSubjectId(e.target.value)}
                className="w-full bg-cyber-bg border border-cyber-border focus:border-emerald-500 focus:outline-none rounded px-3 py-2 text-xs font-mono text-slate-200"
              >
                {subjects.map(s => (
                  <option key={s.id} value={s.id}>{s.code} - {s.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1.5">
                Threat / Priority Level
              </label>
              <select
                value={taskPriority}
                onChange={(e) => setTaskPriority(e.target.value as any)}
                className="w-full bg-cyber-bg border border-cyber-border focus:border-emerald-500 focus:outline-none rounded px-3 py-2 text-xs font-mono text-slate-200"
              >
                <option value="low">LOW</option>
                <option value="medium">MEDIUM</option>
                <option value="high">HIGH</option>
                <option value="critical">CRITICAL</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setTaskModalOpen(false)}
            >
              CANCEL
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
            >
              COMMIT_TASK
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
