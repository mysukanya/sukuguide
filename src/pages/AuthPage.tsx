import React, { useState } from 'react';
import { ShieldCheck, Terminal, KeyRound, Mail, User, AlertCircle, ArrowRight, Lock, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { isSupabaseConfigured } from '../lib/supabase';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';

export const AuthPage: React.FC = () => {
  const { signIn, signUp, enterDemoMode } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [handle, setHandle] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    if (!isLogin && (!handle || !fullName)) {
      setError('Please fill in your security handle and full name.');
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        const res = await signIn(email, password);
        if (res.error) setError(res.error);
      } else {
        const res = await signUp(email, password, handle, fullName);
        if (res.error) {
          setError(res.error);
        } else {
          setSuccess('Account created! If email confirmation is enabled on your Supabase project, check your inbox.');
        }
      }
    } catch (err: any) {
      setError(err?.message || 'Authentication error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cyber-bg bg-grid-cyber flex flex-col justify-center items-center px-4 py-8">
      {/* Workstation Frame */}
      <div className="w-full max-w-md bg-cyber-surface border border-cyber-border rounded-lg shadow-cyber-card overflow-hidden">
        {/* Terminal Title Bar */}
        <div className="px-4 py-3 bg-cyber-bg border-b border-cyber-border flex items-center justify-between select-none">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500/70" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" />
            </div>
            <div className="h-3 w-px bg-cyber-border mx-1" />
            <div className="flex items-center gap-1.5 font-mono text-xs text-emerald-400">
              <Terminal className="w-3.5 h-3.5" />
              <span>auth_daemon // {isLogin ? 'user_login' : 'new_identity'}</span>
            </div>
          </div>
          <Badge variant={isSupabaseConfigured ? 'green' : 'amber'} size="sm">
            {isSupabaseConfigured ? 'SUPABASE_READY' : 'OFFLINE_READY'}
          </Badge>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          {/* Header branding */}
          <div className="space-y-1 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 mb-2">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h1 className="font-mono text-xl font-bold tracking-wider text-slate-100">
              SUKUGUIDE
            </h1>
            <p className="text-xs font-mono text-slate-400">
              Hacker-inspired Personal Study Station & Knowledge Vault
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex p-1 bg-cyber-bg border border-cyber-border rounded">
            <button
              type="button"
              onClick={() => { setIsLogin(true); setError(null); }}
              className={`flex-1 py-1.5 text-xs font-mono rounded transition-all ${
                isLogin ? 'bg-cyber-card text-emerald-400 font-semibold border border-cyber-border' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              [LOGIN]
            </button>
            <button
              type="button"
              onClick={() => { setIsLogin(false); setError(null); }}
              className={`flex-1 py-1.5 text-xs font-mono rounded transition-all ${
                !isLogin ? 'bg-cyber-card text-emerald-400 font-semibold border border-cyber-border' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              [CREATE_ACCOUNT]
            </button>
          </div>

          {/* Error & Success Banners */}
          {error && (
            <div className="p-3 bg-red-950/50 border border-red-800/80 rounded flex items-start gap-2.5 text-xs font-mono text-red-300">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 bg-emerald-950/50 border border-emerald-800/80 rounded flex items-start gap-2.5 text-xs font-mono text-emerald-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{success}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <div>
                  <label className="block text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1.5">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Sukanya Roy"
                      className="w-full bg-cyber-bg border border-cyber-border focus:border-emerald-500 focus:outline-none rounded px-3 pl-9 py-2 text-xs font-mono text-slate-200 placeholder-slate-600 transition-colors"
                      required={!isLogin}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1.5">
                    Terminal Handle (UID Alias)
                  </label>
                  <div className="relative">
                    <span className="font-mono text-xs text-slate-500 absolute left-3 top-2">@</span>
                    <input
                      type="text"
                      value={handle}
                      onChange={(e) => setHandle(e.target.value)}
                      placeholder="suku_sec"
                      className="w-full bg-cyber-bg border border-cyber-border focus:border-emerald-500 focus:outline-none rounded px-3 pl-8 py-2 text-xs font-mono text-slate-200 placeholder-slate-600 transition-colors"
                      required={!isLogin}
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@security.edu"
                  className="w-full bg-cyber-bg border border-cyber-border focus:border-emerald-500 focus:outline-none rounded px-3 pl-9 py-2 text-xs font-mono text-slate-200 placeholder-slate-600 transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1.5">
                Passphrase
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-cyber-bg border border-cyber-border focus:border-emerald-500 focus:outline-none rounded px-3 pl-9 py-2 text-xs font-mono text-slate-200 placeholder-slate-600 transition-colors"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              loading={loading}
              className="w-full justify-center"
              icon={<ArrowRight className="w-4 h-4" />}
            >
              {isLogin ? 'AUTHENTICATE_SESSION' : 'REGISTER_IDENTITY'}
            </Button>
          </form>

          {/* Instant 1-Click Guest / Demo Mode Button */}
          <div className="relative pt-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-cyber-border" />
            </div>
            <div className="relative flex justify-center text-[10px] font-mono uppercase">
              <span className="bg-cyber-surface px-2 text-slate-500">
                OR BYPASS WITH DEMO MODE
              </span>
            </div>
          </div>

          <Button
            type="button"
            variant="secondary"
            onClick={enterDemoMode}
            className="w-full justify-center text-xs text-amber-400 border-amber-800/60 hover:border-amber-500/80"
            icon={<Lock className="w-3.5 h-3.5" />}
          >
            LAUNCH TERMINAL DEMO SESSION
          </Button>

          {/* Security & RLS Note */}
          <div className="p-3 bg-cyber-bg/60 border border-cyber-border rounded text-[11px] font-mono text-slate-500 space-y-1">
            <div className="flex items-center gap-1.5 text-slate-400 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>SECURITY ARCHITECTURE</span>
            </div>
            <p>
              Supabase Row Level Security (RLS) protects all user records. AI features run via serverless functions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
