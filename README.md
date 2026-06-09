# HealthMate — Personal Health Companion

[![Status](https://img.shields.io/badge/status-pre--launch-blue)]()
[![License](https://img.shields.io/badge/license-MIT-green)]()

## Overview

HealthMate is an AI-powered personal health companion that combines daily metric logging, goal tracking, contextual chat, and weekly pattern insights in a single, lightweight application.

**Target**: 2,000 monthly returning users by Month 3, with ≥40% daily health log completion rate.

---

## Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account (free tier OK)
- OpenAI API key (optional for MVP demo)

### Setup

#### 1. Clone and Install

```bash
# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

#### 2. Environment Setup

**Frontend** (`.env.local`):
```bash
cp frontend/.env.example frontend/.env.local
# Edit with your Supabase credentials
```

**Backend** (`.env`):
```bash
cp backend/.env.example backend/.env
# Edit with your credentials
```

#### 3. Start Development Servers

**Terminal 1: Frontend**
```bash
cd frontend
npm run dev
# Runs on http://localhost:5173
```

**Terminal 2: Backend**
```bash
cd backend
npm run dev
# Runs on http://localhost:3000
```

---

## Project Structure

```
.
├── .github/
│   └── copilot-instructions.md    # Copilot configuration
├── .planning/
│   └── (GSD planning artifacts)
├── frontend/                        # React 18 + Vite + TypeScript
│   ├── src/
│   ├── index.html
│   ├── vite.config.ts
│   └── package.json
├── backend/                         # Express + TypeScript
│   ├── src/
│   ├── migrations/                 # Database migrations
│   └── package.json
├── PROJECT.md                       # Product vision & requirements
├── ROADMAP.md                       # Phase breakdown & milestones
└── README.md                        # This file
```

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, Vite, TypeScript, TailwindCSS |
| Backend | Node.js, Express, TypeScript |
| Database | Supabase (PostgreSQL + pgvector) |
| Auth | Supabase Auth + OTP |
| AI | OpenAI GPT-4o API |
| Email | Resend (transactional) |

---

## Feature Roadmap

### Phase 0: Auth & Profile (Weeks 1-2)
- [x] Planning
- [ ] Smart login/signup with OTP
- [ ] Mandatory profile setup gate
- [ ] Profile edit screen

### Phase 1: Daily Health Logging (Weeks 3-4)
- [ ] Health record schema & CRUD API
- [ ] Daily logging UI
- [ ] Record locking at midnight IST

### Phase 2: Goals & Home Dashboard (Weeks 5-6)
- [ ] Goals CRUD
- [ ] Home page layout
- [ ] Onboarding checklist

### Phase 3: Weekly Summary & Charts (Weeks 7-8)
- [ ] Chart rendering (BP, Weight, Calories, Weakness)
- [ ] AI narrative generation
- [ ] Empty state handling

### Phase 4: Chatbot & Context (Weeks 9-10)
- [ ] Session management
- [ ] RAG integration
- [ ] Chat history UI

### Phase 5: Admin Panel (Week 11)
- [ ] Knowledge base CRUD
- [ ] Agent configuration
- [ ] API key management

### Phase 6: Testing & Launch (Week 12)
- [ ] E2E testing
- [ ] Security review
- [ ] Performance optimization
- [ ] Analytics instrumentation

---

## Key Assumptions & Risks

### Critical

⚠️ **RAG Performance**: Uses Supabase pgvector for MVP. If performance degrades, migration to Pinecone or Weaviate required.

⚠️ **API Costs**: OpenAI GPT-4o usage is variable with no cost cap. Financial risk at scale.

⚠️ **Single Admin**: Admin is hardcoded (yadavsankalp09@gmail.com). No admin creation flow.

### Product

- DOB locked post-onboarding (no edit path)
- Email immutable post-registration
- Health data compliance (HIPAA, DPDP, GDPR) out of scope for MVP
- No OpenAI rate limiting or cost controls in MVP

### Technical

- All timestamps use IST (UTC+5:30)
- Unit preference change does not retroactively convert historical records
- Session context maintained at user level, not session level
- Chat history indefinitely retained (no archival policy)

---

## Development Notes

### Key Conventions

- TypeScript strict mode throughout
- API responses: `{ success: boolean, data: T, error?: string }`
- Environment variables: frontend (.env.local), backend (.env)
- Single admin: yadavsankalp09@gmail.com

### Database Migrations

Run migrations via Supabase CLI:
```bash
cd backend
supabase migration up
```

Or manually execute SQL in Supabase dashboard:
```
backend/migrations/001_initial_schema.sql
```

### Code Quality

```bash
# Frontend
cd frontend
npm run lint          # ESLint
npm run type-check    # TypeScript

# Backend
cd backend
npm run lint          # ESLint
npm run type-check    # TypeScript
```

---

## Planning & Design

See `.planning/` directory for:
- **PROJECT.md**: Product vision, scope, success metrics
- **ROADMAP.md**: Phase breakdown, milestones, risks
- **Phase plans**: Detailed execution plans for each phase (GSD workflow)

---

## Deployment

TBD after Phase 6. Recommendations:
- **Frontend**: Vercel
- **Backend**: Railway or Fly.io
- **Database**: Supabase (managed PostgreSQL)

---

## Support & Contributing

This is a solo project in active development. For contributions, see `.planning/` for contributor guidelines (TBD).

---

## License

MIT License — See LICENSE file for details.

---

**Questions?** See PROJECT.md for detailed product context and assumptions.
