import React, { useState, useEffect } from 'react';
import {
  CalendarClock,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Clock,
  Check,
  Plus,
  Flame,
  Calendar,
  Layers,
  Sparkles
} from 'lucide-react';
import { useStudyData } from '../context/StudyDataContext';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';

export const PlannerPage: React.FC = () => {
  const { subjects, tasks, sessions, toggleTaskStatus, addTask, logStudySession } = useStudyData();

  // Pomodoro Focus Timer State
  const [timerMinutes, setTimerMinutes] = useState(25);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [selectedSubjectId, setSelectedSubjectId] = useState(subjects[0]?.id || '');
  const [timerMode, setTimerMode] = useState<'focus' | 'break'>('focus');

  // New task form state
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'low' | 'medium' | 'high' | 'critical'>('high');

  useEffect(() => {
    let interval: any = null;
    if (isActive) {
      interval = setInterval(() => {
        if (timerSeconds > 0) {
          setTimerSeconds(prev => prev - 1);
        } else if (timerMinutes > 0) {
          setTimerMinutes(prev => prev - 1);
          setTimerSeconds(59);
        } else {
          // Timer finished
          setIsActive(false);
          handleTimerCompleted();
        }
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, timerMinutes, timerSeconds]);

  const handleTimerCompleted = async () => {
    if (timerMode === 'focus') {
      const targetSub = subjects.find(s => s.id === selectedSubjectId);
      await logStudySession({
        subjectId: selectedSubjectId || subjects[0]?.id || 'sub-netsec',
        subjectName: targetSub?.name || 'General Focus Session',
        durationMinutes: 25,
        type: 'deep_focus'
      });
      alert('Focus Sprint Complete! Logged 25m session to workstation profile.');
      setTimerMode('break');
      setTimerMinutes(5);
      setTimerSeconds(0);
    } else {
      setTimerMode('focus');
      setTimerMinutes(25);
      setTimerSeconds(0);
    }
  };

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = (mins = 25, mode: 'focus' | 'break' = 'focus') => {
    setIsActive(false);
    setTimerMode(mode);
    setTimerMinutes(mins);
    setTimerSeconds(0);
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    await addTask({
      title: newTaskTitle.trim(),
      subjectId: selectedSubjectId || subjects[0]?.id || 'general',
      dueDate: new Date(Date.now() + 86400000).toISOString(),
      priority: newTaskPriority,
      status: 'pending',
      estimatedMinutes: 45
    });
    setNewTaskTitle('');
  };

  // Spaced Repetition items
  const spacedRevisionItems = [
    {
      topic: 'TCP Handshake & Flags',
      interval: 'Interval 1 (1d)',
      status: 'DUE_TODAY',
      difficulty: 'Intermediate',
      recommendedAction: 'Quick quiz test'
    },
    {
      topic: 'cgroups v2 Resource Limiting',
      interval: 'Interval 2 (3d)',
      status: 'TOMORROW',
      difficulty: 'Hard',
      recommendedAction: 'Hands-on lab'
    },
    {
      topic: 'IMDSv2 vs IMDSv1 SSRF',
      interval: 'Interval 3 (7d)',
      status: 'IN_3_DAYS',
      difficulty: 'Intermediate',
      recommendedAction: 'Flashcard review'
    },
    {
      topic: 'ECDH & Curve25519 Math',
      interval: 'Interval 4 (14d)',
      status: 'NEXT_WEEK',
      difficulty: 'Advanced',
      recommendedAction: 'Theory reread'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div>
        <div className="flex items-center gap-2 font-mono text-xs text-emerald-400 mb-1">
          <CalendarClock className="w-4 h-4" />
          <span>SPACED_PLANNER // FOCUS_ENGINE</span>
        </div>
        <h1 className="font-mono text-xl sm:text-2xl font-bold text-slate-100">
          STUDY PLANNER & REVISION MATRIX
        </h1>
        <p className="text-xs text-slate-400">
          High-focus Pomodoro timer, spaced repetition schedule, and tactical sprint goals.
        </p>
      </div>

      {/* Main Grid: Pomodoro Focus Station + Spaced Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (5 Cols): Terminal Focus Timer */}
        <div className="lg:col-span-5 bg-cyber-surface border border-cyber-border rounded-lg p-6 flex flex-col justify-between shadow-cyber-card space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-cyber-border">
              <span className="font-mono text-xs text-emerald-400 font-semibold tracking-wider">
                DEEP_FOCUS_STATION
              </span>
              <Badge variant={isActive ? 'green' : 'slate'} pulse={isActive} size="sm">
                {isActive ? 'SPRINT_ACTIVE' : 'STANDBY'}
              </Badge>
            </div>

            {/* Subject Selector */}
            <div>
              <label className="block text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1.5">
                Target Subject Sprint
              </label>
              <select
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
                disabled={isActive}
                className="w-full bg-cyber-bg border border-cyber-border focus:border-emerald-500 focus:outline-none rounded px-3 py-2 text-xs font-mono text-slate-200"
              >
                {subjects.map(s => (
                  <option key={s.id} value={s.id}>{s.code} - {s.name}</option>
                ))}
              </select>
            </div>

            {/* Mode Switcher */}
            <div className="flex p-1 bg-cyber-bg border border-cyber-border rounded">
              <button
                type="button"
                onClick={() => resetTimer(25, 'focus')}
                className={`flex-1 py-1.5 text-xs font-mono rounded transition-colors ${
                  timerMode === 'focus' ? 'bg-cyber-card text-emerald-400 font-semibold border border-cyber-border' : 'text-slate-400'
                }`}
              >
                FOCUS (25M)
              </button>
              <button
                type="button"
                onClick={() => resetTimer(5, 'break')}
                className={`flex-1 py-1.5 text-xs font-mono rounded transition-colors ${
                  timerMode === 'break' ? 'bg-cyber-card text-cyan-400 font-semibold border border-cyber-border' : 'text-slate-400'
                }`}
              >
                BREAK (5M)
              </button>
            </div>

            {/* Digital Monospace Timer Display */}
            <div className="py-8 bg-cyber-bg border border-cyber-border rounded-lg text-center space-y-2">
              <div className="font-mono text-5xl sm:text-6xl font-bold tracking-widest text-emerald-400 select-none">
                {String(timerMinutes).padStart(2, '0')}:{String(timerSeconds).padStart(2, '0')}
              </div>
              <p className="font-mono text-xs text-slate-500 uppercase tracking-widest">
                {timerMode === 'focus' ? 'CYBER_SECURITY_SPRINT' : 'TACTICAL_PAUSE'}
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3">
            <Button
              variant={isActive ? 'danger' : 'primary'}
              size="lg"
              className="flex-1"
              icon={isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              onClick={toggleTimer}
            >
              {isActive ? 'HALT_SPRINT' : 'INITIATE_SPRINT'}
            </Button>

            <Button
              variant="secondary"
              size="lg"
              icon={<RotateCcw className="w-4 h-4" />}
              onClick={() => resetTimer(timerMode === 'focus' ? 25 : 5, timerMode)}
              title="Reset Timer"
            >
              RESET
            </Button>
          </div>
        </div>

        {/* Right Column (7 Cols): Spaced Repetition Matrix & Task Pipeline */}
        <div className="lg:col-span-7 space-y-6">
          {/* Spaced Repetition Matrix */}
          <div className="bg-cyber-surface border border-cyber-border rounded-lg overflow-hidden">
            <div className="px-4 py-3 bg-cyber-bg border-b border-cyber-border flex items-center justify-between">
              <span className="font-mono text-xs text-emerald-400 font-semibold tracking-wider">
                SPACED_REPETITION_MATRIX
              </span>
              <span className="text-[10px] font-mono text-slate-500">
                EBBINGHAUS_ALGORITHM
              </span>
            </div>

            <div className="p-4 divide-y divide-cyber-border/40">
              {spacedRevisionItems.map((item, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between gap-3 text-xs font-mono">
                  <div className="space-y-0.5">
                    <p className="text-slate-200 font-semibold">{item.topic}</p>
                    <div className="flex items-center gap-2 text-[10px] text-slate-500">
                      <span>{item.interval}</span>
                      <span>•</span>
                      <span className="text-slate-400">{item.recommendedAction}</span>
                    </div>
                  </div>

                  <Badge
                    variant={item.status === 'DUE_TODAY' ? 'amber' : 'slate'}
                    size="sm"
                  >
                    {item.status}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Sprint Objective Tasks */}
          <div className="bg-cyber-surface border border-cyber-border rounded-lg overflow-hidden">
            <div className="px-4 py-3 bg-cyber-bg border-b border-cyber-border flex items-center justify-between">
              <span className="font-mono text-xs text-emerald-400 font-semibold tracking-wider">
                ACTIVE_SPRINT_OBJECTIVES
              </span>
              <span className="text-[10px] font-mono text-slate-500">
                {tasks.filter(t => t.status !== 'completed').length} PENDING
              </span>
            </div>

            <div className="p-4 space-y-3">
              <form onSubmit={handleCreateTask} className="flex gap-2">
                <input
                  type="text"
                  placeholder="New study directive..."
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="flex-1 bg-cyber-bg border border-cyber-border focus:border-emerald-500 focus:outline-none rounded px-3 py-2 text-xs font-mono text-slate-200 placeholder-slate-600"
                />
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  icon={<Plus className="w-3.5 h-3.5" />}
                >
                  ADD
                </Button>
              </form>

              <div className="divide-y divide-cyber-border/40 pt-1">
                {tasks.map(task => {
                  const isDone = task.status === 'completed';
                  return (
                    <div key={task.id} className="py-2.5 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <button
                          onClick={() => toggleTaskStatus(task.id)}
                          className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                            isDone ? 'bg-emerald-600 border-emerald-500 text-black' : 'border-slate-600'
                          }`}
                        >
                          {isDone && <Check className="w-3 h-3 stroke-[3]" />}
                        </button>
                        <span className={`text-xs font-mono ${isDone ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                          {task.title}
                        </span>
                      </div>
                      <Badge variant={task.priority === 'critical' ? 'red' : 'slate'} size="sm">
                        {task.priority}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
