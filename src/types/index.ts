export type MasteryLevel = 'novice' | 'learning' | 'proficient' | 'mastered';
export type Priority = 'low' | 'medium' | 'high' | 'critical';
export type TaskStatus = 'pending' | 'in_progress' | 'completed';

export interface Profile {
  id: string;
  email: string;
  handle: string; // e.g. "root@sukuguide" or "suku_sec"
  fullName: string;
  terminalTheme: 'matrix-emerald' | 'amber-terminal' | 'cyber-slate';
  bio?: string;
  createdAt: string;
}

export interface Topic {
  id: string;
  subjectId: string;
  title: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  masteryLevel: MasteryLevel;
  notesCount: number;
  completed: boolean;
  lastStudied?: string;
}

export interface Subject {
  id: string;
  name: string;
  code: string; // e.g. "SEC-401", "NET-204"
  description: string;
  color: string;
  targetHours: number;
  completedHours: number;
  topics: Topic[];
  createdAt: string;
}

export interface Note {
  id: string;
  subjectId: string;
  topicId?: string;
  title: string;
  contentMarkdown: string;
  tags: string[];
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StudyTask {
  id: string;
  subjectId: string;
  title: string;
  description?: string;
  dueDate: string;
  priority: Priority;
  status: TaskStatus;
  estimatedMinutes: number;
}

export interface QuizQuestion {
  id: string;
  question: string;
  codeSnippet?: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  category: string;
}

export interface Quiz {
  id: string;
  subjectId: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  questions: QuizQuestion[];
  bestScore?: number;
  attemptsCount: number;
  lastAttemptAt?: string;
}

export interface StudySession {
  id: string;
  subjectId: string;
  subjectName: string;
  durationMinutes: number;
  type: 'reading' | 'notes' | 'quiz_lab' | 'deep_focus';
  completedAt: string;
}

export interface AuditLog {
  id: string;
  action: string;
  target: string;
  timestamp: string;
  status: 'SUCCESS' | 'WARN' | 'INFO';
}

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  mode?: 'concept' | 'cve_analysis' | 'quiz' | 'cheat_sheet';
}
