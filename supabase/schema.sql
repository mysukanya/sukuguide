-- ====================================================================
-- SUKUGUIDE DATABASE SCHEMA & ROW LEVEL SECURITY (RLS) POLICIES
-- PostgreSQL / Supabase
-- ====================================================================

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    handle TEXT NOT NULL UNIQUE DEFAULT 'student_sec',
    full_name TEXT DEFAULT '',
    terminal_theme TEXT DEFAULT 'matrix-emerald',
    bio TEXT DEFAULT 'Cybersecurity & Systems student workstation',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" 
    ON public.profiles FOR SELECT 
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
    ON public.profiles FOR UPDATE 
    USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" 
    ON public.profiles FOR INSERT 
    WITH CHECK (auth.uid() = id);

-- 2. Subjects Table
CREATE TABLE IF NOT EXISTS public.subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    code TEXT NOT NULL,
    description TEXT DEFAULT '',
    color TEXT DEFAULT '#10b981',
    target_hours NUMERIC DEFAULT 30,
    completed_hours NUMERIC DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own subjects" 
    ON public.subjects FOR ALL 
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 3. Topics Table
CREATE TABLE IF NOT EXISTS public.topics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    difficulty TEXT DEFAULT 'intermediate',
    mastery_level TEXT DEFAULT 'learning',
    notes_count INT DEFAULT 0,
    completed BOOLEAN DEFAULT FALSE,
    last_studied TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own topics" 
    ON public.topics FOR ALL 
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 4. Notes Table
CREATE TABLE IF NOT EXISTS public.notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    topic_id UUID REFERENCES public.topics(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    content_markdown TEXT NOT NULL DEFAULT '',
    tags TEXT[] DEFAULT '{}',
    is_pinned BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own notes" 
    ON public.notes FOR ALL 
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 5. Tasks Table
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    due_date TIMESTAMPTZ NOT NULL,
    priority TEXT DEFAULT 'medium',
    status TEXT DEFAULT 'pending',
    estimated_minutes INT DEFAULT 45,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own tasks" 
    ON public.tasks FOR ALL 
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 6. Quizzes Table
CREATE TABLE IF NOT EXISTS public.quizzes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    difficulty TEXT DEFAULT 'medium',
    questions_json JSONB NOT NULL DEFAULT '[]'::jsonb,
    best_score NUMERIC DEFAULT 0,
    attempts_count INT DEFAULT 0,
    last_attempt_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own quizzes" 
    ON public.quizzes FOR ALL 
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 7. Study Sessions Table
CREATE TABLE IF NOT EXISTS public.study_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
    subject_name TEXT NOT NULL,
    duration_minutes INT NOT NULL,
    type TEXT DEFAULT 'reading',
    completed_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own study sessions" 
    ON public.study_sessions FOR ALL 
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 8. Audit Logs Table
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    target TEXT NOT NULL,
    status TEXT DEFAULT 'SUCCESS',
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own audit logs" 
    ON public.audit_logs FOR ALL 
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Function and trigger to auto-create profile on Supabase auth.users INSERT
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, handle, full_name)
  VALUES (
    new.id, 
    new.email, 
    COALESCE(new.raw_user_meta_data->>'handle', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'full_name', '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
