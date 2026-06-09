# PROJECT: HealthMate — Personal Health Companion

**Version**: 1.0  
**Status**: Pre-Phase-0 (Planning)  
**Last Updated**: 2026-06-09  

---

## VISION

A unified, context-aware health companion that combines daily metric logging, goal setting, AI chat with persistent user context, and AI-generated weekly summaries to drive consistent daily engagement and long-term retention for individual health trackers.

---

## SUCCESS METRICS (Month 3 Target)

| Metric | Target | How Measured |
|--------|--------|--------------|
| Total registered users | 5,000 | User registration events |
| Monthly returning users (MAU) | 2,000 | Monthly active user tracking |
| Daily health log completion | ≥40% of DAU | Health record save events per user per day |
| Chatbot engagement | ≥50% of registered users | Chat session start events |
| Weekly summary views | ≥30% of WAU | Summary view events |
| Onboarding checklist completion | ≥85% of profile completers | Funnel tracking: goal + health + chat |
| Auth flow completion | ≥85% of signup starters | OTP → password → profile → home |
| Home page load time (p95) | <2 seconds | Server latency monitoring |

---

## SCOPE

### In Scope

**Authentication & Profile**
- Smart login/signup: email → OTP (10min, 3 attempts max) → password → profile setup → home
- Returning user: email → password → home
- Forgot password: OTP → new password
- Password change (authenticated)
- Mandatory profile setup: Full Name, DOB (locked), Weight, Height, unit preference
- Profile edit: all fields except DOB and Email (immutable)

**Health Logging**
- Daily records: BP (Systolic, Diastolic, Pulse), Weight, Weakness (free text), Calories
- One record per user per day; re-save overwrites
- Records locked at midnight IST (UTC+5:30)
- Editable within same calendar day

**Goals**
- Yearly, Monthly, Daily goals: Title + Target + Notes
- Editable at any time; updates overwrite (no history retained)

**Weekly Summary**
- Structured charts: BP (line), Weight (line), Weakness & Calories (bars)
- AI narrative: last 7 days of health records + active goals sent to OpenAI
- Empty state if no records for the week

**Chatbot**
- GPT-4o powered
- Persistent user-level context: profile + goals + rolling 3-session summary
- Session boundary: 2 minutes inactivity
- One active conversation at a time; second chat auto-saves first
- History: indefinitely retained, resumable, manually deletable
- Context object updated on session end; prepended to every API request as system context

**Home Page**
- Personalized welcome
- Onboarding checklist (first-time users): Set Goal, Log Health, Start Chat
- Goals section, Today's Health Records CTA, Weekly Summary, Chatbot CTA

**Admin Panel** (yadavsankalp09@gmail.com only)
- Knowledge Base: max 20 entries, Title + Body + Active/Inactive toggle
- RAG retrieval: top-3 active entries per query
- Agent Role & Intention config: system prompt tuning
- OpenAI API key management (admin profile)
- Entries can be edited in place or deleted

### Out of Scope

- Caregiver & coach roles (future phase)
- Mobile app (web-only MVP)
- Health data compliance (HIPAA, DPDP, GDPR)
- Email change post-registration
- DOB edit post-onboarding
- Multiple admin accounts
- OpenAI API rate limiting or cost controls
- File upload for knowledge base
- Wearable integrations (Apple Health, Google Fit)
- Goal history/archival
- Retroactive unit conversion

---

## ASSUMPTIONS & RISKS

**Critical**
- ⚠️ **RAG Performance**: Supabase pgvector used for MVP. If performance degrades at scale, migration to dedicated vector DB (Pinecone, Weaviate) required.
- ⚠️ **API Costs**: OpenAI GPT-4o usage is variable with no cost cap. Financial risk at scale.
- ⚠️ **Session Context Loss**: Context object rebuilt from DB on each message. No session persistence across browser reloads.

**Product**
- Admin is single hardcoded account (yadavsankalp09@gmail.com); no admin creation flow
- DOB locked post-onboarding; no edit path
- Email immutable post-registration
- If API key not configured: chatbot CTA disabled with tooltip; charts render with static placeholder

**Technical**
- All timestamp logic uses IST (UTC+5:30)
- Unit preference change does not retroactively convert historical records
- Health records stored with original unit label
- Chat history indefinitely retained (no archival policy)

---

## TECH STACK

| Layer | Technology |
|-------|------------|
| Frontend | React 18, Vite, TypeScript, TailwindCSS |
| Backend | Node.js, Express, TypeScript |
| Database | Supabase (PostgreSQL + pgvector) |
| Auth | Supabase Auth (email + password) |
| AI | OpenAI GPT-4o API |
| Email | Resend (OTP delivery) |
| Deployment | TBD (Vercel for frontend, Railway/Fly.io for backend) |

---

## USER PERSONAS

**End User (Individual Health Tracker)**
- Goal: Log daily metrics, set goals, receive contextual AI insights, review weekly patterns
- Pain: No lightweight tool combines logging + goals + AI chat + weekly review

**Admin (Single Account)**
- Goal: Configure AI knowledge base, tune agent behavior, manage OpenAI key
- Pain: Can't update AI behavior without code deployment

---

## ROADMAP OUTLINE

(Detailed breakdown in ROADMAP.md)

1. **Phase 0: Core Auth & Profile**
   - Smart login/signup flow with OTP
   - Mandatory profile setup
   - Profile edit screen

2. **Phase 1: Daily Health Logging**
   - Health record schema & API
   - Daily logging UI
   - Record locking at midnight IST

3. **Phase 2: Goals & Home Dashboard**
   - Goals CRUD
   - Home page layout
   - Onboarding checklist

4. **Phase 3: Weekly Summary & Charts**
   - Chart rendering (BP, Weight, Weakness, Calories)
   - AI narrative generation
   - Empty states

5. **Phase 4: Chatbot & Context Persistence**
   - Session management
   - Context object rebuilding
   - RAG integration
   - Chat history UI

6. **Phase 5: Admin Panel**
   - Knowledge base CRUD
   - Agent config
   - API key management

7. **Phase 6: Polish, Testing & Launch**
   - E2E testing
   - Performance tuning
   - Security review
   - Analytics instrumentation

---

## TEAM & ROLES

- **Solo builder**: Implementation, testing, deployment
- **Admin (yadavsankalp09@gmail.com)**: Configuration only

---

## NEXT STEP

→ Proceed to ROADMAP.md for phase breakdown and milestones
