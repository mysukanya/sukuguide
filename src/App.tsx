import React, { useState } from 'react';
import { useAuth, AuthProvider } from './context/AuthContext';
import { StudyDataProvider } from './context/StudyDataContext';
import { Layout } from './components/layout/Layout';
import { AuthPage } from './pages/AuthPage';
import { DashboardPage } from './pages/DashboardPage';
import { SubjectsPage } from './pages/SubjectsPage';
import { NotesPage } from './pages/NotesPage';
import { AITutorPage } from './pages/AITutorPage';
import { QuizPage } from './pages/QuizPage';
import { PlannerPage } from './pages/PlannerPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { SettingsPage } from './pages/SettingsPage';
import { Terminal, Shield } from 'lucide-react';

const MainApp: React.FC = () => {
  const { user, loading } = useAuth();
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [notesFilterState, setNotesFilterState] = useState<{ subjectId?: string; topicId?: string }>({});

  if (loading) {
    return (
      <div className="min-h-screen bg-cyber-bg flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-sm bg-cyber-surface border border-cyber-border rounded-lg p-6 font-mono text-xs text-slate-300 space-y-3 shadow-cyber-card">
          <div className="flex items-center gap-2 text-emerald-400">
            <Terminal className="w-4 h-4 animate-spin" />
            <span className="font-bold tracking-wider">BOOTSTRAPPING_SUKUGUIDE</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Checking session integrity, loading cryptographic storage engines...
          </p>
          <div className="w-full bg-cyber-bg h-1 rounded-full overflow-hidden border border-cyber-border">
            <div className="bg-emerald-500 h-full w-2/3 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  const handleNavigateToNotes = (subjectId: string, topicId?: string) => {
    setNotesFilterState({ subjectId, topicId });
    setCurrentView('notes');
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardPage onNavigate={setCurrentView} />;
      case 'subjects':
        return <SubjectsPage onNavigateToNotes={handleNavigateToNotes} />;
      case 'notes':
        return (
          <NotesPage
            initialSubjectId={notesFilterState.subjectId}
            initialTopicId={notesFilterState.topicId}
          />
        );
      case 'ai-tutor':
        return <AITutorPage />;
      case 'quiz':
        return <QuizPage />;
      case 'planner':
        return <PlannerPage />;
      case 'analytics':
        return <AnalyticsPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <DashboardPage onNavigate={setCurrentView} />;
    }
  };

  return (
    <Layout currentView={currentView} onNavigate={setCurrentView}>
      {renderCurrentView()}
    </Layout>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <StudyDataProvider>
        <MainApp />
      </StudyDataProvider>
    </AuthProvider>
  );
}
