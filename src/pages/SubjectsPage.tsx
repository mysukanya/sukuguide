import React, { useState } from 'react';
import {
  Layers,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  Circle,
  Clock,
  BookOpen,
  ChevronDown,
  ChevronRight,
  FolderPlus,
  Sparkles
} from 'lucide-react';
import { useStudyData } from '../context/StudyDataContext';
import { Subject, Topic, MasteryLevel } from '../types';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';

interface SubjectsPageProps {
  onNavigateToNotes: (subjectId: string, topicId?: string) => void;
}

export const SubjectsPage: React.FC<SubjectsPageProps> = ({ onNavigateToNotes }) => {
  const {
    subjects,
    addSubject,
    deleteSubject,
    addTopic,
    toggleTopicCompletion,
    updateTopic,
    deleteTopic
  } = useStudyData();

  const [expandedSubjects, setExpandedSubjects] = useState<Record<string, boolean>>(
    subjects.reduce((acc, s) => ({ ...acc, [s.id]: true }), {})
  );

  // Modals state
  const [subjectModalOpen, setSubjectModalOpen] = useState(false);
  const [topicModalOpen, setTopicModalOpen] = useState(false);
  const [activeSubjectForTopic, setActiveSubjectForTopic] = useState<string>('');

  // Form states for new Subject
  const [subName, setSubName] = useState('');
  const [subCode, setSubCode] = useState('');
  const [subDesc, setSubDesc] = useState('');
  const [subColor, setSubColor] = useState('#10b981');
  const [subTargetHours, setSubTargetHours] = useState('30');

  // Form states for new Topic
  const [topicTitle, setTopicTitle] = useState('');
  const [topicDifficulty, setTopicDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');
  const [topicMastery, setTopicMastery] = useState<MasteryLevel>('learning');

  const toggleExpand = (id: string) => {
    setExpandedSubjects(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subName.trim() || !subCode.trim()) return;

    await addSubject({
      name: subName.trim(),
      code: subCode.trim().toUpperCase(),
      description: subDesc.trim(),
      color: subColor,
      targetHours: Number(subTargetHours) || 30
    });

    setSubName('');
    setSubCode('');
    setSubDesc('');
    setSubjectModalOpen(false);
  };

  const handleOpenAddTopic = (subjectId: string) => {
    setActiveSubjectForTopic(subjectId);
    setTopicTitle('');
    setTopicModalOpen(true);
  };

  const handleCreateTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topicTitle.trim() || !activeSubjectForTopic) return;

    await addTopic(activeSubjectForTopic, {
      title: topicTitle.trim(),
      difficulty: topicDifficulty,
      masteryLevel: topicMastery
    });

    setTopicTitle('');
    setTopicModalOpen(false);
  };

  const masteryVariants = {
    novice: 'slate',
    learning: 'amber',
    proficient: 'cyan',
    mastered: 'green'
  } as const;

  const difficultyColors = {
    beginner: 'text-emerald-400',
    intermediate: 'text-amber-400',
    advanced: 'text-red-400'
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 font-mono text-xs text-emerald-400 mb-1">
            <Layers className="w-4 h-4" />
            <span>KNOWLEDGE_TAXONOMY // CURRICULUM</span>
          </div>
          <h1 className="font-mono text-xl sm:text-2xl font-bold text-slate-100">
            SUBJECTS & TOPICS DIRECTORY
          </h1>
          <p className="text-xs text-slate-400">
            Structured hierarchy of cybersecurity domains, difficulty ratings, and mastery progression.
          </p>
        </div>

        <Button
          variant="primary"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => setSubjectModalOpen(true)}
        >
          CREATE_SUBJECT
        </Button>
      </div>

      {/* Subjects & Topics Tree */}
      <div className="space-y-4">
        {subjects.length === 0 ? (
          <div className="p-12 text-center bg-cyber-surface border border-cyber-border rounded-lg space-y-3">
            <Layers className="w-8 h-8 text-slate-600 mx-auto" />
            <p className="font-mono text-xs text-slate-400">NO_MODULES_DETECTED</p>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setSubjectModalOpen(true)}
            >
              Initialize First Subject
            </Button>
          </div>
        ) : (
          subjects.map((subject) => {
            const isExpanded = expandedSubjects[subject.id] ?? true;
            const completedTopics = subject.topics.filter(t => t.completed).length;
            const topicProgress = subject.topics.length > 0
              ? Math.round((completedTopics / subject.topics.length) * 100)
              : 0;

            return (
              <div
                key={subject.id}
                className="bg-cyber-surface border border-cyber-border rounded-lg overflow-hidden transition-all"
              >
                {/* Subject Header Bar */}
                <div className="p-4 bg-cyber-surface/90 border-b border-cyber-border/80 flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => toggleExpand(subject.id)}
                      className="mt-0.5 p-1 text-slate-400 hover:text-emerald-400 transition-colors"
                      aria-label="Expand/collapse topic group"
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </button>

                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className="font-mono text-xs font-bold px-2 py-0.5 rounded border"
                          style={{
                            color: subject.color,
                            borderColor: `${subject.color}40`,
                            backgroundColor: `${subject.color}15`
                          }}
                        >
                          {subject.code}
                        </span>
                        <h2 className="font-mono text-base font-semibold text-slate-100">
                          {subject.name}
                        </h2>
                      </div>
                      <p className="text-xs text-slate-400 mt-1 max-w-2xl">
                        {subject.description}
                      </p>
                    </div>
                  </div>

                  {/* Right: Progress & Actions */}
                  <div className="flex items-center gap-3 sm:gap-4 pl-8 md:pl-0">
                    <div className="text-right">
                      <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
                        <span>{completedTopics}/{subject.topics.length} topics</span>
                        <span className="text-emerald-400 font-semibold">{topicProgress}%</span>
                      </div>
                      <div className="w-28 bg-cyber-bg h-1.5 rounded-full overflow-hidden mt-1 border border-cyber-border">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${topicProgress}%`, backgroundColor: subject.color }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 border-l border-cyber-border pl-3">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleOpenAddTopic(subject.id)}
                        icon={<FolderPlus className="w-3.5 h-3.5" />}
                      >
                        Add Topic
                      </Button>
                      <button
                        onClick={() => deleteSubject(subject.id)}
                        className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-950/30 rounded border border-transparent transition-colors"
                        title="Delete Subject"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Sub-Topics List */}
                {isExpanded && (
                  <div className="p-4 bg-cyber-bg/40 divide-y divide-cyber-border/40">
                    {subject.topics.length === 0 ? (
                      <div className="py-6 text-center text-xs font-mono text-slate-500">
                        NO_TOPICS_YET // Click &quot;Add Topic&quot; to define curriculum concepts.
                      </div>
                    ) : (
                      subject.topics.map((topic) => (
                        <div
                          key={topic.id}
                          className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                        >
                          <div className="flex items-start sm:items-center gap-3">
                            <button
                              onClick={() => toggleTopicCompletion(topic.id)}
                              className={`mt-0.5 sm:mt-0 p-0.5 rounded transition-colors ${
                                topic.completed
                                  ? 'text-emerald-400'
                                  : 'text-slate-600 hover:text-slate-400'
                              }`}
                              title={topic.completed ? 'Completed' : 'Mark completed'}
                            >
                              {topic.completed ? (
                                <CheckCircle2 className="w-4 h-4 fill-emerald-950" />
                              ) : (
                                <Circle className="w-4 h-4" />
                              )}
                            </button>

                            <div>
                              <span
                                className={`font-mono text-xs transition-colors ${
                                  topic.completed ? 'line-through text-slate-500' : 'text-slate-200 group-hover:text-emerald-300'
                                }`}
                              >
                                {topic.title}
                              </span>

                              <div className="flex items-center gap-2 mt-0.5 text-[10px] font-mono text-slate-500">
                                <span className={difficultyColors[topic.difficulty]}>
                                  [{topic.difficulty.toUpperCase()}]
                                </span>
                                {topic.lastStudied && (
                                  <>
                                    <span>•</span>
                                    <span>Last: {new Date(topic.lastStudied).toLocaleDateString()}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Right Controls: Mastery selector, Notes shortcut, Delete */}
                          <div className="flex items-center gap-2.5 pl-7 sm:pl-0">
                            {/* Mastery Level Dropdown */}
                            <select
                              value={topic.masteryLevel}
                              onChange={(e) => updateTopic(topic.id, { masteryLevel: e.target.value as MasteryLevel })}
                              className="bg-cyber-surface border border-cyber-border rounded px-2 py-1 text-[11px] font-mono text-slate-300 focus:outline-none focus:border-emerald-500 cursor-pointer"
                            >
                              <option value="novice">NOVICE</option>
                              <option value="learning">LEARNING</option>
                              <option value="proficient">PROFICIENT</option>
                              <option value="mastered">MASTERED</option>
                            </select>

                            <Badge variant={masteryVariants[topic.masteryLevel]} size="sm">
                              {topic.masteryLevel}
                            </Badge>

                            {/* View Notes */}
                            <button
                              onClick={() => onNavigateToNotes(subject.id, topic.id)}
                              className="px-2 py-1 bg-cyber-surface hover:bg-cyber-card border border-cyber-border rounded text-[11px] font-mono text-slate-300 hover:text-emerald-400 flex items-center gap-1 transition-colors"
                              title="Browse notes for this topic"
                            >
                              <BookOpen className="w-3 h-3 text-slate-500" />
                              <span>{topic.notesCount} notes</span>
                            </button>

                            <button
                              onClick={() => deleteTopic(topic.id)}
                              className="p-1 text-slate-600 hover:text-red-400 rounded transition-colors"
                              title="Delete topic"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* New Subject Modal */}
      <Modal
        isOpen={subjectModalOpen}
        onClose={() => setSubjectModalOpen(false)}
        title="INITIALIZE_SUBJECT_MODULE"
        subtitle="Cybersecurity curriculum catalog"
      >
        <form onSubmit={handleCreateSubject} className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-1">
              <label className="block text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1.5">
                Module Code
              </label>
              <input
                type="text"
                value={subCode}
                onChange={(e) => setSubCode(e.target.value)}
                placeholder="SEC-501"
                className="w-full bg-cyber-bg border border-cyber-border focus:border-emerald-500 focus:outline-none rounded px-3 py-2 text-xs font-mono text-slate-200"
                required
              />
            </div>
            <div className="col-span-2">
              <label className="block text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1.5">
                Subject Name
              </label>
              <input
                type="text"
                value={subName}
                onChange={(e) => setSubName(e.target.value)}
                placeholder="Binary Exploitation & Buffer Overflows"
                className="w-full bg-cyber-bg border border-cyber-border focus:border-emerald-500 focus:outline-none rounded px-3 py-2 text-xs font-mono text-slate-200"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1.5">
              Subject Overview / Syllabus Description
            </label>
            <textarea
              rows={3}
              value={subDesc}
              onChange={(e) => setSubDesc(e.target.value)}
              placeholder="Stack frames, shellcode injection, ASLR/DEP bypasses, ROP chains..."
              className="w-full bg-cyber-bg border border-cyber-border focus:border-emerald-500 focus:outline-none rounded p-3 text-xs font-mono text-slate-200"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1.5">
                Color Tag Accent
              </label>
              <input
                type="color"
                value={subColor}
                onChange={(e) => setSubColor(e.target.value)}
                className="w-full h-9 bg-cyber-bg border border-cyber-border rounded cursor-pointer p-1"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1.5">
                Target Study Hours
              </label>
              <input
                type="number"
                value={subTargetHours}
                onChange={(e) => setSubTargetHours(e.target.value)}
                min="5"
                max="200"
                className="w-full bg-cyber-bg border border-cyber-border focus:border-emerald-500 focus:outline-none rounded px-3 py-2 text-xs font-mono text-slate-200"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setSubjectModalOpen(false)}
            >
              CANCEL
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
            >
              SAVE_SUBJECT
            </Button>
          </div>
        </form>
      </Modal>

      {/* New Topic Modal */}
      <Modal
        isOpen={topicModalOpen}
        onClose={() => setTopicModalOpen(false)}
        title="ADD_CURRICULUM_TOPIC"
        subtitle="Granular concept node"
      >
        <form onSubmit={handleCreateTopic} className="space-y-4">
          <div>
            <label className="block text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1.5">
              Topic Concept Title
            </label>
            <input
              type="text"
              value={topicTitle}
              onChange={(e) => setTopicTitle(e.target.value)}
              placeholder="e.g. Return-Oriented Programming (ROP) Gadget Discovery"
              className="w-full bg-cyber-bg border border-cyber-border focus:border-emerald-500 focus:outline-none rounded px-3 py-2 text-xs font-mono text-slate-200"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1.5">
                Difficulty Ceiling
              </label>
              <select
                value={topicDifficulty}
                onChange={(e) => setTopicDifficulty(e.target.value as any)}
                className="w-full bg-cyber-bg border border-cyber-border focus:border-emerald-500 focus:outline-none rounded px-3 py-2 text-xs font-mono text-slate-200"
              >
                <option value="beginner">BEGINNER</option>
                <option value="intermediate">INTERMEDIATE</option>
                <option value="advanced">ADVANCED</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1.5">
                Initial Mastery Level
              </label>
              <select
                value={topicMastery}
                onChange={(e) => setTopicMastery(e.target.value as any)}
                className="w-full bg-cyber-bg border border-cyber-border focus:border-emerald-500 focus:outline-none rounded px-3 py-2 text-xs font-mono text-slate-200"
              >
                <option value="novice">NOVICE</option>
                <option value="learning">LEARNING</option>
                <option value="proficient">PROFICIENT</option>
                <option value="mastered">MASTERED</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setTopicModalOpen(false)}
            >
              CANCEL
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
            >
              COMMIT_TOPIC
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
