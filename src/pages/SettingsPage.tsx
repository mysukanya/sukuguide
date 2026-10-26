import React, { useState } from 'react';
import {
  Settings,
  Database,
  User,
  ShieldCheck,
  Download,
  Upload,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  KeyRound,
  Terminal,
  Save
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useStudyData } from '../context/StudyDataContext';
import { isSupabaseConfigured, testSupabaseConnection } from '../lib/supabase';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';

export const SettingsPage: React.FC = () => {
  const { profile, updateProfile, isGuest } = useAuth();
  const { exportAllDataJSON, importDataJSON, resetToDefaultData } = useStudyData();

  // Profile form state
  const [handle, setHandle] = useState(profile?.handle || 'suku_sec');
  const [fullName, setFullName] = useState(profile?.fullName || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [terminalTheme, setTerminalTheme] = useState(profile?.terminalTheme || 'matrix-emerald');
  const [profileSaved, setProfileSaved] = useState(false);

  // Supabase test state
  const [testingConnection, setTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; latencyMs?: number; error?: string } | null>(null);

  // Import JSON state
  const [importText, setImportText] = useState('');
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile({
      handle: handle.trim(),
      fullName: fullName.trim(),
      bio: bio.trim(),
      terminalTheme: terminalTheme as any
    });
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2000);
  };

  const handleTestDatabase = async () => {
    setTestingConnection(true);
    setTestResult(null);
    const res = await testSupabaseConnection();
    setTestResult(res);
    setTestingConnection(false);
  };

  const handleExportBackup = () => {
    const jsonStr = exportAllDataJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sukuguide-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = () => {
    if (!importText.trim()) return;
    const ok = importDataJSON(importText);
    if (ok) {
      setImportStatus('Data backup successfully restored!');
      setImportText('');
    } else {
      setImportStatus('Failed to parse JSON backup. Validate format.');
    }
    setTimeout(() => setImportStatus(null), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Top Header */}
      <div>
        <div className="flex items-center gap-2 font-mono text-xs text-emerald-400 mb-1">
          <Settings className="w-4 h-4" />
          <span>WORKSTATION_CONFIG // SYSTEM_PREFERENCES</span>
        </div>
        <h1 className="font-mono text-xl sm:text-2xl font-bold text-slate-100">
          SETTINGS & WORKSTATION STORAGE
        </h1>
        <p className="text-xs text-slate-400">
          Configure security handle, Supabase PostgreSQL persistence, export backups, and theme.
        </p>
      </div>

      {/* Section 1: User Profile & Security Handle */}
      <div className="bg-cyber-surface border border-cyber-border rounded-lg overflow-hidden shadow-cyber-card">
        <div className="px-5 py-3.5 bg-cyber-bg border-b border-cyber-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-emerald-400" />
            <span className="font-mono text-xs text-emerald-400 font-semibold tracking-wider">
              OPERATOR_IDENTITY
            </span>
          </div>
          {isGuest && (
            <Badge variant="amber" size="sm">DEMO_GUEST_ACCOUNT</Badge>
          )}
        </div>

        <form onSubmit={handleSaveProfile} className="p-5 sm:p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1.5">
                Security Handle (Terminal Alias)
              </label>
              <div className="relative">
                <span className="font-mono text-xs text-slate-500 absolute left-3 top-2.5">@</span>
                <input
                  type="text"
                  value={handle}
                  onChange={(e) => setHandle(e.target.value)}
                  className="w-full bg-cyber-bg border border-cyber-border focus:border-emerald-500 focus:outline-none rounded px-3 pl-8 py-2 text-xs font-mono text-slate-100"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1.5">
                Full Display Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Sukanya (Security Researcher)"
                className="w-full bg-cyber-bg border border-cyber-border focus:border-emerald-500 focus:outline-none rounded px-3 py-2 text-xs font-mono text-slate-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1.5">
              Workstation Focus & Bio
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Primary areas of research and study objectives..."
              className="w-full bg-cyber-bg border border-cyber-border focus:border-emerald-500 focus:outline-none rounded p-3 text-xs font-mono text-slate-100"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            {profileSaved && (
              <span className="text-xs font-mono text-emerald-400 flex items-center gap-1.5 animate-pulse">
                <CheckCircle2 className="w-4 h-4" />
                <span>PROFILE_UPDATED_SUCCESSFULLY</span>
              </span>
            )}
            <div className="ml-auto">
              <Button
                type="submit"
                variant="primary"
                size="md"
                icon={<Save className="w-3.5 h-3.5" />}
              >
                SAVE_CHANGES
              </Button>
            </div>
          </div>
        </form>
      </div>

      {/* Section 2: Supabase Storage Integration & Telemetry */}
      <div className="bg-cyber-surface border border-cyber-border rounded-lg overflow-hidden shadow-cyber-card">
        <div className="px-5 py-3.5 bg-cyber-bg border-b border-cyber-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-400" />
            <span className="font-mono text-xs text-emerald-400 font-semibold tracking-wider">
              SUPABASE_POSTGRES_LINK
            </span>
          </div>
          <Badge variant={isSupabaseConfigured ? 'green' : 'amber'} size="sm">
            {isSupabaseConfigured ? 'ENABLED' : 'UNCONFIGURED_LOCAL_FALLBACK'}
          </Badge>
        </div>

        <div className="p-5 sm:p-6 space-y-4 font-mono text-xs">
          <p className="text-slate-300 leading-relaxed text-[11px]">
            SukuGuide communicates with Supabase PostgreSQL to synchronize notes, topics, subjects, tasks, and audit logs. Personal records are guarded under Row Level Security policies (RLS).
          </p>

          <div className="p-3 bg-cyber-bg border border-cyber-border rounded space-y-1 text-[11px]">
            <div className="flex justify-between text-slate-400">
              <span>CONFIG_STATUS:</span>
              <span className={isSupabaseConfigured ? 'text-emerald-400' : 'text-amber-400'}>
                {isSupabaseConfigured ? 'VITE_SUPABASE_URL DETECTED' : 'MISSING_ENV_VARS'}
              </span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>STORAGE_FALLBACK:</span>
              <span className="text-slate-300">ACTIVE (Indexed Browser Storage)</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              size="sm"
              loading={testingConnection}
              icon={<RefreshCw className="w-3.5 h-3.5" />}
              onClick={handleTestDatabase}
            >
              PING_DATABASE_ENDPOINT
            </Button>
          </div>

          {testResult && (
            <div className={`p-3 rounded border text-xs ${
              testResult.success
                ? 'bg-emerald-950/50 border-emerald-800 text-emerald-300'
                : 'bg-amber-950/50 border-amber-800 text-amber-300'
            }`}>
              <div className="font-semibold mb-1">
                {testResult.success ? 'PING_SUCCESS' : 'CONNECTION_REPORT'}
              </div>
              <div>{testResult.error || `Latency: ${testResult.latencyMs}ms. Database connection established.`}</div>
            </div>
          )}
        </div>
      </div>

      {/* Section 3: Data Export, Import & Reset */}
      <div className="bg-cyber-surface border border-cyber-border rounded-lg overflow-hidden shadow-cyber-card">
        <div className="px-5 py-3.5 bg-cyber-bg border-b border-cyber-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Download className="w-4 h-4 text-emerald-400" />
            <span className="font-mono text-xs text-emerald-400 font-semibold tracking-wider">
              DATA_PORTABILITY_&_RESTORE
            </span>
          </div>
        </div>

        <div className="p-5 sm:p-6 space-y-5">
          <div className="flex flex-wrap gap-3">
            <Button
              variant="secondary"
              size="md"
              icon={<Download className="w-3.5 h-3.5" />}
              onClick={handleExportBackup}
            >
              EXPORT_DATA_JSON
            </Button>

            <Button
              variant="danger"
              size="md"
              icon={<RefreshCw className="w-3.5 h-3.5" />}
              onClick={() => {
                if (window.confirm('Reset all workstation data to pristine cybersecurity starter pack?')) {
                  resetToDefaultData();
                }
              }}
            >
              RESTORE_PRISTINE_DEFAULTS
            </Button>
          </div>

          {/* Import JSON */}
          <div className="space-y-2 pt-2 border-t border-cyber-border">
            <label className="block text-[11px] font-mono text-slate-400 uppercase tracking-wider">
              Import Workspace JSON Backup
            </label>
            <textarea
              rows={3}
              placeholder="Paste raw exported SukuGuide JSON here..."
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              className="w-full bg-cyber-bg border border-cyber-border focus:border-emerald-500 focus:outline-none rounded p-3 text-xs font-mono text-slate-200"
            />
            {importStatus && (
              <p className="text-xs font-mono text-emerald-400">{importStatus}</p>
            )}
            <Button
              variant="secondary"
              size="sm"
              icon={<Upload className="w-3.5 h-3.5" />}
              disabled={!importText.trim()}
              onClick={handleImportBackup}
            >
              IMPORT_BACKUP
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
