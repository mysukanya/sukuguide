# SukuGuide // Cybersecurity Personal Study Workstation

> A practical, hacker-inspired personal study guide and knowledge workstation built with React, TypeScript, Tailwind CSS, Supabase, and Netlify Functions.

[![Status](https://img.shields.io/badge/Security-RLS%20Enforced-emerald)](#)
[![Stack](https://img.shields.io/badge/Stack-React%2018%20%7C%20Vite%20%7C%20Tailwind-cyan)](#)
[![Deployment](https://img.shields.io/badge/Deploy-Netlify%20Ready-00ad9f)](#)

---

## 1. Visual Aesthetics & Philosophy

SukuGuide is engineered to resemble a cybersecurity workstation or Linux terminal dashboard:
- **Near-black and charcoal palette** (`#080c10`, `#0d1318`, `#121820`).
- **Muted phosphor green accents** (`#10b981`), amber warning tags (`#f59e0b`), cyan telemetry badges.
- **Monospace typography** (`JetBrains Mono`, `Fira Code`) for headings, command prompts, and technical tags.
- **Readable modern sans-serif typography** (`Inter`) for notes and body text.
- **Thin borders and subtle separators**, avoiding garish neon gradients, holograms, or fake code rain.

---

## 2. Main Capabilities & Pages

1. **Terminal Authentication (`/auth`)**:
   - Supabase email/password authentication.
   - **One-click Terminal Demo Mode** for testing without pre-configured database keys.
   - Profile management with security handle aliases (`@suku_sec`).

2. **Command Dashboard (`/dashboard`)**:
   - High-level workstation telemetry (Active subjects, topic mastery %, study velocity, notes count).
   - Priority task checklist with instant completion toggles.
   - Quick Markdown Scratchpad for on-the-fly exploit command capture.
   - Real-time audit stream.

3. **Subjects & Topics Directory (`/subjects`)**:
   - Subject code classification (`SEC-301`, `SYS-402`, etc.) with customizable target study hours.
   - Granular topic tree with difficulty pills (`BEGINNER`, `INTERMEDIATE`, `ADVANCED`).
   - Mastery level progression (`NOVICE` -> `LEARNING` -> `PROFICIENT` -> `MASTERED`).

4. **Notes Knowledge Base (`/notes`)**:
   - Split Markdown editor and formatted preview.
   - Syntax-highlighted code blocks and technical callouts.
   - Tag taxonomy and subject filtering.
   - One-click `.md` note file export.

5. **AI Study Tutor Console (`/ai-tutor`)**:
   - Interactive terminal conversation REPL.
   - Preset cybersecurity directives (TLS Handshake, cgroups v2, IMDSv2 SSRF, Stack Canaries).
   - Secure serverless gateway preventing client-side key exposure.
   - Intelligent local cybersecurity domain fallback engine.

6. **Quiz & Practice Lab (`/quiz`)**:
   - Hands-on multiple-choice questions with BPF filters, packet math, and syscall code snippets.
   - Immediate feedback and technical explanations.
   - Automatic score logging into study sessions.

7. **Study Planner & Revision Matrix (`/planner`)**:
   - Interactive Pomodoro Focus Timer (25m sprint / 5m tactical break) with automatic session logging.
   - Spaced Repetition Matrix based on the Ebbinghaus forgetting curve (1d, 3d, 7d, 14d, 30d).
   - Sprint task scheduler.

8. **Progress Analytics & Audit Logs (`/analytics`)**:
   - Subject hours velocity tracking against targets.
   - Topic mastery spectrum distribution charts.
   - Filterable workstation event ledger (`SUCCESS`, `WARN`, `INFO`).

9. **Settings & Backup (`/settings`)**:
   - Profile alias, name, and bio customizations.
   - Supabase connection latency ping tester.
   - JSON workspace data export, restore, and factory reset.

---

## 3. Technology Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, Lucide React icons
- **Database & Auth**: Supabase (PostgreSQL, Row Level Security)
- **AI Gateway**: Netlify Serverless Functions (`netlify/functions/ai-tutor.ts`)
- **Hosting**: Netlify (`netlify.toml` + `public/_redirects` SPA rewrite)

---

## 4. Local Development Setup

### Prerequisites
- Node.js `v18+` or `v20+` or `v24+`
- npm `v9+` or `v11+`

### Installation
```bash
# 1. Clone repository
git clone https://github.com/your-username/sukuguide.git
cd sukuguide

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env
# Edit .env with your Supabase credentials if available (or use Demo Mode)

# 4. Start local development server
npm run dev
```

---

## 5. Supabase Setup & Row Level Security (RLS)

1. Create a project at [Supabase](https://supabase.com).
2. Open the **SQL Editor** in the Supabase Dashboard.
3. Paste and run the complete schema script located at:
   ```text
   supabase/schema.sql
   ```
4. Copy your **Project URL** and **Anon Public Key** from `Project Settings > API` into your `.env`:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
   ```
5. All tables (`profiles`, `subjects`, `topics`, `notes`, `tasks`, `quizzes`, `study_sessions`, `audit_logs`) are isolated by `auth.uid() = user_id` RLS policies.

---

## 6. Secure Server-Side AI Integration

- All AI provider keys (`AI_API_KEY`, `GEMINI_API_KEY`, etc.) are consumed exclusively inside `netlify/functions/ai-tutor.ts`.
- **Never prefix AI provider secret keys with `VITE_`**, ensuring they are never exposed in browser bundles or client network requests.
- When deploying to Netlify, set the key under:
  `Netlify Dashboard > Site configuration > Environment variables > AI_API_KEY`.

---

## 7. Deployment Instructions (Netlify)

1. Push your repository to GitHub.
2. In the Netlify dashboard, click **Add new site > Import an existing project**.
3. Select your repository.
4. Netlify will auto-detect settings from `netlify.toml`:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
   - **Functions directory:** `netlify/functions`
5. Add your environment variables in Netlify site settings:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `AI_API_KEY`
6. Click **Deploy Site**.
   *Note: Single Page App (SPA) routing is pre-configured via `public/_redirects` and `netlify.toml`.*
