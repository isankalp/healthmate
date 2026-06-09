-- HealthMate Database Schema (Supabase)
-- Migration: Initial schema setup

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  dob DATE,
  weight DECIMAL,
  height DECIMAL,
  unit_preference TEXT DEFAULT 'metric',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Health records table
CREATE TABLE health_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  record_date DATE NOT NULL,
  systolic_bp INT,
  diastolic_bp INT,
  pulse_rate INT,
  weight DECIMAL,
  weakness TEXT,
  calories_intake INT,
  unit_preference TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, record_date)
);

-- Goals table
CREATE TABLE goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  goal_type TEXT NOT NULL CHECK (goal_type IN ('yearly', 'monthly', 'daily')),
  title TEXT NOT NULL,
  target TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, goal_type)
);

-- Chat sessions table
CREATE TABLE chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_start TIMESTAMP DEFAULT NOW(),
  session_end TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  context_snapshot JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Chat messages table
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Knowledge base table
CREATE TABLE knowledge_base (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  embedding vector(1536),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Admin config table
CREATE TABLE admin_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_email TEXT NOT NULL UNIQUE,
  openai_api_key TEXT,
  agent_role TEXT,
  agent_intention TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_health_records_user_date ON health_records(user_id, record_date);
CREATE INDEX idx_goals_user_type ON goals(user_id, goal_type);
CREATE INDEX idx_chat_sessions_user ON chat_sessions(user_id);
CREATE INDEX idx_chat_messages_session ON chat_messages(session_id);
CREATE INDEX idx_knowledge_base_active ON knowledge_base(is_active);

-- Enable pgvector extension (for embeddings)
CREATE EXTENSION IF NOT EXISTS vector;
