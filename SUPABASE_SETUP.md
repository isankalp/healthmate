# SETUP: Supabase Configuration

Follow these steps to set up your Supabase project for HealthMate.

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign in or create an account
3. Click "New Project"
4. Fill in:
   - **Project name**: `healthmate`
   - **Database password**: Save this securely
   - **Region**: Choose closest to you
5. Wait for project to initialize (~2 minutes)

## Step 2: Get API Credentials

In your Supabase project dashboard:

1. Go to **Settings** → **API**
2. Copy:
   - **Project URL** → `SUPABASE_URL`
   - **anon public key** → `VITE_SUPABASE_ANON_KEY` (frontend)
   - **service_role_key** → `SUPABASE_SERVICE_ROLE_KEY` (backend)

## Step 3: Initialize Database Schema

**Option A: Using Supabase SQL Editor (Recommended)**

1. In Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy & paste contents of: `backend/migrations/001_initial_schema.sql`
4. Click **Run**
5. Wait for schema to be created

**Option B: Using Supabase CLI**

```bash
cd backend
supabase link --project-ref your-project-ref
supabase db push
```

## Step 4: Set Environment Variables

**Frontend** (`.env.local`):
```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_BASE_URL=http://localhost:3000
```

**Backend** (`.env`):
```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
OPENAI_API_KEY=your-api-key (leave blank for now)
RESEND_API_KEY=your-resend-key (leave blank for now)
ADMIN_EMAIL=yadavsankalp09@gmail.com
JWT_SECRET=your-jwt-secret-min-32-chars
NODE_ENV=development
PORT=3000
```

## Step 5: Verify Connection

```bash
cd backend
npm run type-check
```

If no errors, you're ready to start development!

## Optional: Configure pgvector for RAG (Later)

When you reach Phase 4 (Chatbot), enable pgvector:

1. In Supabase SQL Editor, run:
```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

2. Test with:
```sql
SELECT vector_type_send('1.0, 2.0, 3.0'::vector);
```

## Support

- Supabase Docs: https://supabase.com/docs
- Issue with credentials? Check Supabase Settings → API
- Schema errors? Manually run SQL in SQL Editor
