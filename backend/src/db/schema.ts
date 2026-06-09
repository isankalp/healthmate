// Database schema initialization for Supabase

export const schema = {
  users: `
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    dob DATE,
    weight DECIMAL,
    height DECIMAL,
    unit_preference TEXT DEFAULT 'metric',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  `,
  
  health_records: `
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
  `,
  
  goals: `
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    goal_type TEXT NOT NULL CHECK (goal_type IN ('yearly', 'monthly', 'daily')),
    title TEXT NOT NULL,
    target TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, goal_type)
  `,
  
  chat_sessions: `
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_start TIMESTAMP DEFAULT NOW(),
    session_end TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    context_snapshot JSONB,
    created_at TIMESTAMP DEFAULT NOW()
  `,
  
  chat_messages: `
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
  `,
  
  knowledge_base: `
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    embedding vector(1536),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  `,
  
  admin_config: `
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_email TEXT NOT NULL UNIQUE,
    openai_api_key TEXT,
    agent_role TEXT,
    agent_intention TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  `,
}
