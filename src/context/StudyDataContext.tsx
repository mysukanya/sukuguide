import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Subject, Topic, Note, StudyTask, Quiz, StudySession, AuditLog } from '../types';
import { INITIAL_SUBJECTS, INITIAL_NOTES, INITIAL_TASKS, INITIAL_QUIZZES, INITIAL_SESSIONS, INITIAL_AUDIT_LOGS } from '../lib/defaultData';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from './AuthContext';

interface StudyDataContextType {
  subjects: Subject[];
  notes: Note[];
  tasks: StudyTask[];
  quizzes: Quiz[];
  sessions: StudySession[];
  auditLogs: AuditLog[];
  loading: boolean;
  
  // Subject actions
  addSubject: (subject: Omit<Subject, 'id' | 'createdAt' | 'topics' | 'completedHours'>) => Promise<void>;
  updateSubject: (id: string, updates: Partial<Subject>) => Promise<void>;
  deleteSubject: (id: string) => Promise<void>;
  
  // Topic actions
  addTopic: (subjectId: string, topic: Omit<Topic, 'id' | 'subjectId' | 'notesCount' | 'completed'>) => Promise<void>;
  updateTopic: (id: string, updates: Partial<Topic>) => Promise<void>;
  toggleTopicCompletion: (id: string) => Promise<void>;
  deleteTopic: (id: string) => Promise<void>;
  
  // Note actions
  addNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateNote: (id: string, updates: Partial<Note>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  toggleNotePin: (id: string) => Promise<void>;
  
  // Task actions
  addTask: (task: Omit<StudyTask, 'id'>) => Promise<void>;
  updateTask: (id: string, updates: Partial<StudyTask>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleTaskStatus: (id: string) => Promise<void>;
  
  // Quiz actions
  recordQuizAttempt: (quizId: string, score: number) => Promise<void>;
  
  // Session actions
  logStudySession: (session: Omit<StudySession, 'id' | 'completedAt'>) => Promise<void>;
  
  // Logging
  appendAuditLog: (action: string, target: string, status?: 'SUCCESS' | 'WARN' | 'INFO') => void;
  
  // Reset / Import
  resetToDefaultData: () => void;
  exportAllDataJSON: () => string;
  importDataJSON: (jsonStr: string) => boolean;
}

const StudyDataContext = createContext<StudyDataContextType | undefined>(undefined);

export const StudyDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, isGuest } = useAuth();
  const [subjects, setSubjects] = useState<Subject[]>(INITIAL_SUBJECTS);
  const [notes, setNotes] = useState<Note[]>(INITIAL_NOTES);
  const [tasks, setTasks] = useState<StudyTask[]>(INITIAL_TASKS);
  const [quizzes, setQuizzes] = useState<Quiz[]>(INITIAL_QUIZZES);
  const [sessions, setSessions] = useState<StudySession[]>(INITIAL_SESSIONS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);
  const [loading, setLoading] = useState(false);

  // Load local storage initial state
  useEffect(() => {
    const localSubjects = localStorage.getItem('sukuguide_subjects');
    const localNotes = localStorage.getItem('sukuguide_notes');
    const localTasks = localStorage.getItem('sukuguide_tasks');
    const localQuizzes = localStorage.getItem('sukuguide_quizzes');
    const localSessions = localStorage.getItem('sukuguide_sessions');
    const localLogs = localStorage.getItem('sukuguide_logs');

    if (localSubjects) setSubjects(JSON.parse(localSubjects));
    if (localNotes) setNotes(JSON.parse(localNotes));
    if (localTasks) setTasks(JSON.parse(localTasks));
    if (localQuizzes) setQuizzes(JSON.parse(localQuizzes));
    if (localSessions) setSessions(JSON.parse(localSessions));
    if (localLogs) setAuditLogs(JSON.parse(localLogs));

    // If Supabase is connected and user is logged in, pull from cloud
    if (!isGuest && isSupabaseConfigured && user) {
      loadSupabaseData(user.id);
    }
  }, [user, isGuest]);

  // Sync state helpers
  const saveLocal = (
    newSubs = subjects,
    newNts = notes,
    newTsks = tasks,
    newQzs = quizzes,
    newSess = sessions,
    newLgs = auditLogs
  ) => {
    localStorage.setItem('sukuguide_subjects', JSON.stringify(newSubs));
    localStorage.setItem('sukuguide_notes', JSON.stringify(newNts));
    localStorage.setItem('sukuguide_tasks', JSON.stringify(newTsks));
    localStorage.setItem('sukuguide_quizzes', JSON.stringify(newQzs));
    localStorage.setItem('sukuguide_sessions', JSON.stringify(newSess));
    localStorage.setItem('sukuguide_logs', JSON.stringify(newLgs));
  };

  const loadSupabaseData = async (_userId: string) => {
    setLoading(true);
    try {
      const { data: subData } = await supabase.from('subjects').select('*, topics(*)');
      const { data: notesData } = await supabase.from('notes').select('*');
      const { data: tasksData } = await supabase.from('tasks').select('*');
      const { data: quizzesData } = await supabase.from('quizzes').select('*');

      if (subData && subData.length > 0) {
        const formattedSubs: Subject[] = subData.map((s: any) => ({
          id: s.id,
          name: s.name,
          code: s.code,
          description: s.description || '',
          color: s.color || '#10b981',
          targetHours: Number(s.target_hours) || 30,
          completedHours: Number(s.completed_hours) || 0,
          createdAt: s.created_at,
          topics: (s.topics || []).map((t: any) => ({
            id: t.id,
            subjectId: t.subject_id,
            title: t.title,
            difficulty: t.difficulty,
            masteryLevel: t.mastery_level,
            notesCount: t.notes_count || 0,
            completed: t.completed,
            lastStudied: t.last_studied
          }))
        }));
        setSubjects(formattedSubs);
      }

      if (notesData && notesData.length > 0) {
        const formattedNotes: Note[] = notesData.map((n: any) => ({
          id: n.id,
          subjectId: n.subject_id,
          topicId: n.topic_id,
          title: n.title,
          contentMarkdown: n.content_markdown,
          tags: n.tags || [],
          isPinned: n.is_pinned,
          createdAt: n.created_at,
          updatedAt: n.updated_at
        }));
        setNotes(formattedNotes);
      }

      if (tasksData && tasksData.length > 0) {
        const formattedTasks: StudyTask[] = tasksData.map((t: any) => ({
          id: t.id,
          subjectId: t.subject_id,
          title: t.title,
          description: t.description,
          dueDate: t.due_date,
          priority: t.priority,
          status: t.status,
          estimatedMinutes: t.estimated_minutes
        }));
        setTasks(formattedTasks);
      }

      if (quizzesData && quizzesData.length > 0) {
        const formattedQuizzes: Quiz[] = quizzesData.map((q: any) => ({
          id: q.id,
          subjectId: q.subject_id,
          title: q.title,
          description: q.description,
          difficulty: q.difficulty,
          questions: q.questions_json,
          bestScore: q.best_score,
          attemptsCount: q.attempts_count,
          lastAttemptAt: q.last_attempt_at
        }));
        setQuizzes(formattedQuizzes);
      }
    } catch (err) {
      console.warn('Supabase fetch failed, continuing with local data:', err);
    } finally {
      setLoading(false);
    }
  };

  const appendAuditLog = (action: string, target: string, status: 'SUCCESS' | 'WARN' | 'INFO' = 'SUCCESS') => {
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      action,
      target,
      timestamp: new Date().toISOString(),
      status
    };
    const updated = [newLog, ...auditLogs].slice(0, 30);
    setAuditLogs(updated);
    saveLocal(subjects, notes, tasks, quizzes, sessions, updated);
  };

  // SUBJECT ACTIONS
  const addSubject = async (data: Omit<Subject, 'id' | 'createdAt' | 'topics' | 'completedHours'>) => {
    const newSub: Subject = {
      ...data,
      id: `sub-${Date.now()}`,
      completedHours: 0,
      createdAt: new Date().toISOString(),
      topics: []
    };
    const updated = [newSub, ...subjects];
    setSubjects(updated);
    saveLocal(updated);
    appendAuditLog('SUBJECT_CREATED', `${newSub.code}: ${newSub.name}`, 'SUCCESS');

    if (!isGuest && isSupabaseConfigured && user) {
      await supabase.from('subjects').insert({
        id: newSub.id,
        user_id: user.id,
        name: newSub.name,
        code: newSub.code,
        description: newSub.description,
        color: newSub.color,
        target_hours: newSub.targetHours
      });
    }
  };

  const updateSubject = async (id: string, updates: Partial<Subject>) => {
    const updated = subjects.map(s => s.id === id ? { ...s, ...updates } : s);
    setSubjects(updated);
    saveLocal(updated);
    appendAuditLog('SUBJECT_UPDATED', `Subject ID ${id}`, 'INFO');

    if (!isGuest && isSupabaseConfigured && user) {
      await supabase.from('subjects').update(updates).eq('id', id);
    }
  };

  const deleteSubject = async (id: string) => {
    const target = subjects.find(s => s.id === id);
    const updated = subjects.filter(s => s.id !== id);
    setSubjects(updated);
    saveLocal(updated);
    appendAuditLog('SUBJECT_DELETED', target?.name || id, 'WARN');

    if (!isGuest && isSupabaseConfigured && user) {
      await supabase.from('subjects').delete().eq('id', id);
    }
  };

  // TOPIC ACTIONS
  const addTopic = async (subjectId: string, topicData: Omit<Topic, 'id' | 'subjectId' | 'notesCount' | 'completed'>) => {
    const newTopic: Topic = {
      ...topicData,
      id: `top-${Date.now()}`,
      subjectId,
      notesCount: 0,
      completed: false
    };

    const updated = subjects.map(s => {
      if (s.id === subjectId) {
        return { ...s, topics: [...s.topics, newTopic] };
      }
      return s;
    });

    setSubjects(updated);
    saveLocal(updated);
    appendAuditLog('TOPIC_ADDED', `${newTopic.title}`, 'SUCCESS');

    if (!isGuest && isSupabaseConfigured && user) {
      await supabase.from('topics').insert({
        id: newTopic.id,
        user_id: user.id,
        subject_id: subjectId,
        title: newTopic.title,
        difficulty: newTopic.difficulty,
        mastery_level: newTopic.masteryLevel
      });
    }
  };

  const updateTopic = async (id: string, updates: Partial<Topic>) => {
    const updated = subjects.map(s => ({
      ...s,
      topics: s.topics.map(t => t.id === id ? { ...t, ...updates } : t)
    }));
    setSubjects(updated);
    saveLocal(updated);

    if (!isGuest && isSupabaseConfigured && user) {
      await supabase.from('topics').update(updates).eq('id', id);
    }
  };

  const toggleTopicCompletion = async (id: string) => {
    let completedState = false;
    let topicTitle = '';
    const updated = subjects.map(s => ({
      ...s,
      topics: s.topics.map(t => {
        if (t.id === id) {
          completedState = !t.completed;
          topicTitle = t.title;
          return {
            ...t,
            completed: completedState,
            masteryLevel: completedState ? 'mastered' : t.masteryLevel,
            lastStudied: new Date().toISOString()
          };
        }
        return t;
      })
    }));

    setSubjects(updated);
    saveLocal(updated);
    appendAuditLog(
      completedState ? 'TOPIC_COMPLETED' : 'TOPIC_REOPENED',
      topicTitle,
      'SUCCESS'
    );

    if (!isGuest && isSupabaseConfigured && user) {
      await supabase.from('topics').update({ completed: completedState }).eq('id', id);
    }
  };

  const deleteTopic = async (id: string) => {
    const updated = subjects.map(s => ({
      ...s,
      topics: s.topics.filter(t => t.id !== id)
    }));
    setSubjects(updated);
    saveLocal(updated);
    appendAuditLog('TOPIC_DELETED', `Topic ID ${id}`, 'WARN');

    if (!isGuest && isSupabaseConfigured && user) {
      await supabase.from('topics').delete().eq('id', id);
    }
  };

  // NOTE ACTIONS
  const addNote = async (noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newNote: Note = {
      ...noteData,
      id: `note-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const updated = [newNote, ...notes];
    setNotes(updated);

    // Update topic notesCount
    if (newNote.topicId) {
      setSubjects(prev => prev.map(s => ({
        ...s,
        topics: s.topics.map(t => t.id === newNote.topicId ? { ...t, notesCount: t.notesCount + 1 } : t)
      })));
    }

    saveLocal(subjects, updated);
    appendAuditLog('NOTE_CREATED', newNote.title, 'SUCCESS');

    if (!isGuest && isSupabaseConfigured && user) {
      await supabase.from('notes').insert({
        id: newNote.id,
        user_id: user.id,
        subject_id: newNote.subjectId,
        topic_id: newNote.topicId || null,
        title: newNote.title,
        content_markdown: newNote.contentMarkdown,
        tags: newNote.tags,
        is_pinned: newNote.isPinned
      });
    }
  };

  const updateNote = async (id: string, updates: Partial<Note>) => {
    const updated = notes.map(n => n.id === id ? { ...n, ...updates, updatedAt: new Date().toISOString() } : n);
    setNotes(updated);
    saveLocal(subjects, updated);
    appendAuditLog('NOTE_UPDATED', updates.title || `Note ${id}`, 'INFO');

    if (!isGuest && isSupabaseConfigured && user) {
      await supabase.from('notes').update({
        ...updates,
        updated_at: new Date().toISOString()
      }).eq('id', id);
    }
  };

  const deleteNote = async (id: string) => {
    const target = notes.find(n => n.id === id);
    const updated = notes.filter(n => n.id !== id);
    setNotes(updated);
    saveLocal(subjects, updated);
    appendAuditLog('NOTE_PURGED', target?.title || id, 'WARN');

    if (!isGuest && isSupabaseConfigured && user) {
      await supabase.from('notes').delete().eq('id', id);
    }
  };

  const toggleNotePin = async (id: string) => {
    const note = notes.find(n => n.id === id);
    if (!note) return;
    await updateNote(id, { isPinned: !note.isPinned });
  };

  // TASK ACTIONS
  const addTask = async (taskData: Omit<StudyTask, 'id'>) => {
    const newTask: StudyTask = {
      ...taskData,
      id: `task-${Date.now()}`
    };
    const updated = [newTask, ...tasks];
    setTasks(updated);
    saveLocal(subjects, notes, updated);
    appendAuditLog('TASK_SCHEDULED', newTask.title, 'INFO');

    if (!isGuest && isSupabaseConfigured && user) {
      await supabase.from('tasks').insert({
        id: newTask.id,
        user_id: user.id,
        subject_id: newTask.subjectId,
        title: newTask.title,
        due_date: newTask.dueDate,
        priority: newTask.priority,
        status: newTask.status,
        estimated_minutes: newTask.estimatedMinutes
      });
    }
  };

  const updateTask = async (id: string, updates: Partial<StudyTask>) => {
    const updated = tasks.map(t => t.id === id ? { ...t, ...updates } : t);
    setTasks(updated);
    saveLocal(subjects, notes, updated);

    if (!isGuest && isSupabaseConfigured && user) {
      await supabase.from('tasks').update(updates).eq('id', id);
    }
  };

  const deleteTask = async (id: string) => {
    const updated = tasks.filter(t => t.id !== id);
    setTasks(updated);
    saveLocal(subjects, notes, updated);
    appendAuditLog('TASK_REMOVED', `Task ${id}`, 'WARN');

    if (!isGuest && isSupabaseConfigured && user) {
      await supabase.from('tasks').delete().eq('id', id);
    }
  };

  const toggleTaskStatus = async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    const nextStatus = task.status === 'completed' ? 'pending' : 'completed';
    await updateTask(id, { status: nextStatus });
    appendAuditLog(nextStatus === 'completed' ? 'TASK_COMPLETED' : 'TASK_REOPENED', task.title, 'SUCCESS');
  };

  // QUIZ ACTIONS
  const recordQuizAttempt = async (quizId: string, score: number) => {
    const updated = quizzes.map(q => {
      if (q.id === quizId) {
        const newBest = Math.max(q.bestScore || 0, score);
        return {
          ...q,
          bestScore: newBest,
          attemptsCount: q.attemptsCount + 1,
          lastAttemptAt: new Date().toISOString()
        };
      }
      return q;
    });
    setQuizzes(updated);
    saveLocal(subjects, notes, tasks, updated);
    appendAuditLog('QUIZ_ATTEMPT_LOGGED', `Score: ${score}% on ${quizId}`, 'SUCCESS');

    if (!isGuest && isSupabaseConfigured && user) {
      const q = updated.find(x => x.id === quizId);
      if (q) {
        await supabase.from('quizzes').update({
          best_score: q.bestScore,
          attempts_count: q.attemptsCount,
          last_attempt_at: q.lastAttemptAt
        }).eq('id', quizId);
      }
    }
  };

  // STUDY SESSIONS
  const logStudySession = async (sess: Omit<StudySession, 'id' | 'completedAt'>) => {
    const newSession: StudySession = {
      ...sess,
      id: `sess-${Date.now()}`,
      completedAt: new Date().toISOString()
    };
    const updatedSess = [newSession, ...sessions];
    setSessions(updatedSess);

    // Update subject hours
    const updatedSubs = subjects.map(s => {
      if (s.id === sess.subjectId) {
        return {
          ...s,
          completedHours: Number((s.completedHours + (sess.durationMinutes / 60)).toFixed(1))
        };
      }
      return s;
    });
    setSubjects(updatedSubs);
    saveLocal(updatedSubs, notes, tasks, quizzes, updatedSess);
    appendAuditLog('FOCUS_SESSION_LOGGED', `${sess.durationMinutes}m focus in ${sess.subjectName}`, 'SUCCESS');

    if (!isGuest && isSupabaseConfigured && user) {
      await supabase.from('study_sessions').insert({
        id: newSession.id,
        user_id: user.id,
        subject_id: newSession.subjectId,
        subject_name: newSession.subjectName,
        duration_minutes: newSession.durationMinutes,
        type: newSession.type
      });
    }
  };

  // RESET & EXPORT UTILITIES
  const resetToDefaultData = () => {
    setSubjects(INITIAL_SUBJECTS);
    setNotes(INITIAL_NOTES);
    setTasks(INITIAL_TASKS);
    setQuizzes(INITIAL_QUIZZES);
    setSessions(INITIAL_SESSIONS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    saveLocal(INITIAL_SUBJECTS, INITIAL_NOTES, INITIAL_TASKS, INITIAL_QUIZZES, INITIAL_SESSIONS, INITIAL_AUDIT_LOGS);
    appendAuditLog('WORKSPACE_RESET', 'Restored pristine cybersecurity starter kit', 'WARN');
  };

  const exportAllDataJSON = () => {
    return JSON.stringify({
      version: '1.0',
      exportedAt: new Date().toISOString(),
      subjects,
      notes,
      tasks,
      quizzes,
      sessions,
      auditLogs
    }, null, 2);
  };

  const importDataJSON = (jsonStr: string): boolean => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed.subjects && parsed.notes) {
        setSubjects(parsed.subjects);
        setNotes(parsed.notes);
        if (parsed.tasks) setTasks(parsed.tasks);
        if (parsed.quizzes) setQuizzes(parsed.quizzes);
        if (parsed.sessions) setSessions(parsed.sessions);
        if (parsed.auditLogs) setAuditLogs(parsed.auditLogs);
        saveLocal(parsed.subjects, parsed.notes, parsed.tasks || [], parsed.quizzes || [], parsed.sessions || [], parsed.auditLogs || []);
        appendAuditLog('DATA_IMPORTED', 'External JSON backup imported successfully', 'SUCCESS');
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  return (
    <StudyDataContext.Provider
      value={{
        subjects,
        notes,
        tasks,
        quizzes,
        sessions,
        auditLogs,
        loading,
        addSubject,
        updateSubject,
        deleteSubject,
        addTopic,
        updateTopic,
        toggleTopicCompletion,
        deleteTopic,
        addNote,
        updateNote,
        deleteNote,
        toggleNotePin,
        addTask,
        updateTask,
        deleteTask,
        toggleTaskStatus,
        recordQuizAttempt,
        logStudySession,
        appendAuditLog,
        resetToDefaultData,
        exportAllDataJSON,
        importDataJSON
      }}
    >
      {children}
    </StudyDataContext.Provider>
  );
};

export const useStudyData = () => {
  const context = useContext(StudyDataContext);
  if (!context) {
    throw new Error('useStudyData must be used within a StudyDataProvider');
  }
  return context;
};
