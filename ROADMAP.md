# ROADMAP: HealthMate v1.0

**Timeline**: 12 weeks (3 months)  
**Status**: Not started  
**Success Criteria**: 2,000 MAU, ≥40% daily log completion rate  

---

## PHASE BREAKDOWN

### Phase 0: Auth & Profile (Weeks 1-2)
**Goal**: Establish foundational auth system and mandatory profile setup.

**Delivers**
- Email-based signup with OTP verification (10min expiry, 3 attempts)
- Password creation flow
- Mandatory profile setup gate (Full Name, DOB, Weight, Height, unit preference)
- Returning user login (email → password)
- Forgot password flow (OTP → new password)
- Password change (authenticated users)
- Profile view & edit (all fields editable except DOB, Email)

**Success Criteria**
- Auth flow completion rate ≥85%
- No auth-related errors in logs
- Profile setup blocks home page access correctly

---

### Phase 1: Daily Health Logging (Weeks 3-4)
**Goal**: Enable users to log daily health metrics with record management.

**Delivers**
- Health record schema (BP, Weight, Weakness, Calories) with user + date + unit constraints
- REST API endpoints: POST/GET/PUT/DELETE health records
- Daily logging UI: form with optional fields, re-save overwrites logic
- Record locking at midnight IST: read-only enforcement
- Edit UI: only accessible within same calendar day
- Past records view

**Success Criteria**
- ≥40% of DAU log at least one health field
- No data loss on re-save within same day
- Records correctly lock at midnight IST

---

### Phase 2: Goals & Home Dashboard (Weeks 5-6)
**Goal**: Enable goal setting and personalized home experience.

**Delivers**
- Goals schema (Yearly, Monthly, Daily: Title + Target + Notes)
- REST API endpoints: POST/GET/PUT/DELETE goals
- Goals CRUD UI (create, view, edit, delete)
- Home page layout: welcome message, onboarding checklist, goals, health CTA, weekly summary, chat CTA
- Onboarding checklist: Set Goal, Log Health, Start Chat (auto-hides on completion)
- First-time user detection & checklist display
- Goal display in home page & context preparation for AI

**Success Criteria**
- ≥85% of profile completers complete onboarding checklist within 7 days
- Goals editable and updates immediate
- Home page loads in <2 seconds

---

### Phase 3: Weekly Summary & Charts (Weeks 7-8)
**Goal**: Provide visual insights into weekly health patterns.

**Delivers**
- Weekly summary data aggregation API (last 7 days of records)
- Chart rendering: Systolic/Diastolic/Pulse (line), Weight (line), Weakness & Calories (bar)
- Empty states: per-chart messaging
- AI narrative generation: send last 7 days + active goals to OpenAI
- AI narrative placeholder if no API key configured: "AI insights will appear once the system is configured"
- AI narrative placeholder if no records: "Log your health this week to unlock your AI summary"
- Weekly summary view page
- Charts render regardless of API key status; narrative conditional

**Success Criteria**
- ≥30% of WAU view weekly summary
- Charts render in <1 second
- AI narrative generates within 3 seconds (after API call)

---

### Phase 4: Chatbot & Context Persistence (Weeks 9-10)
**Goal**: Deploy GPT-4o chatbot with session management and persistent context.

**Delivers**
- Session table: user_id, session_start, session_end, is_active
- Context object: Full Name, Age, Weight, Height, unit preference, active goals (all 3 periods), rolling 3-session summary
- Session boundary: 2-minute inactivity timer (backend-triggered)
- Context rebuild on session end: regenerate rolling summary from last 3 session transcripts
- Chat API endpoint: POST /api/chat/message (prepends context to system prompt)
- Session auto-save on new conversation: end active session, display "Your previous conversation was saved"
- Chat history UI: list conversations, resumable (loads context + transcript)
- Manual conversation deletion
- One active conversation at a time: UI enforcement

**Success Criteria**
- ≥50% of registered users initiate at least one chat session
- Session boundary triggers correctly at 2 minutes inactivity
- Context object accurate and up-to-date
- Chat response latency <5 seconds (p95)

---

### Phase 5: Admin Panel (Weeks 11)
**Goal**: Enable admin (yadavsankalp09@gmail.com) to manage AI behavior and knowledge base.

**Delivers**
- Knowledge Base table: entry_id, title, body, is_active, created_at, updated_at
- Knowledge Base CRUD UI: max 20 entries, create/edit/delete/toggle active
- Knowledge Base API: endpoints for CRUD
- RAG integration in chat API: retrieve top-3 active KB entries per user query
- Agent Role & Intention config UI: system prompt tuning variables (stored in DB)
- OpenAI API key management: admin-only profile section (add, view, remove API key)
- Admin role detection: check user email against hardcoded admin list
- Admin panel access control: 403 if not admin

**Success Criteria**
- Admin can configure KB without engineering intervention
- RAG retrieval returns top-3 relevant entries
- Chat quality improves with KB context
- API key change takes effect within 1 minute

---

### Phase 6: Polish, Testing & Launch (Week 12)
**Goal**: Ensure quality, security, and readiness for user acquisition.

**Delivers**
- E2E test suite: auth, logging, goals, summary, chat, admin flows
- Unit tests: utility functions, schema validation, context building
- Performance audit: home page, charts, chat response latency
- Security review: API key handling, OTP expiry, session timeout, SQL injection
- Error handling: graceful degradation when API key missing, network errors
- Analytics instrumentation: registration, login, health log, chat, summary view events
- Bug fixes from testing phase
- Deployment setup: frontend (Vercel), backend (Railway/Fly.io), Supabase project
- Launch checklist: monitoring, error tracking, rate limiting for API calls (post-MVP advisory)

**Success Criteria**
- 0 HIGH severity bugs in security review
- All critical paths covered by E2E tests
- Home page p95 load time <2 seconds
- Monitoring & alerting configured
- Ready for user acquisition campaign

---

## MILESTONES

| Milestone | Phases | End Date | Key Deliverable |
|-----------|--------|----------|-----------------|
| M1: Auth & Logging Foundation | 0–1 | Week 4 | Users can sign up, set profile, log daily health |
| M2: User Experience | 2–3 | Week 8 | Home page, goals, weekly summary visible |
| M3: AI Integration | 4–5 | Week 11 | Chatbot live, admin can manage KB |
| M4: Launch Ready | 6 | Week 12 | Full E2E testing, monitoring, deployment |

---

## RISK MITIGATION

| Risk | Impact | Mitigation |
|------|--------|-----------|
| API key not configured | Chat unavailable | Disable chat CTA, show tooltip, render static placeholders |
| OpenAI API costs spike | Financial loss | No rate limiting MVP; advisory for cost monitoring post-launch |
| pgvector performance | Chat latency | Monitor RAG query time; plan vector DB migration if >500ms |
| Session context loss | User frustration | Document 2-min inactivity limit in FAQ; persist context to DB |
| IST timezone bugs | Wrong record locking | Comprehensive timezone testing before launch; use fixed IST offset |

---

## NEXT STEP

→ Execute Phase 0 planning (gsd-plan-phase Phase 0: Auth & Profile)
