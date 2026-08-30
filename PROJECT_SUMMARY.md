# MedAi — Project Summary

## What we have built till now

**MedAi** is a full-stack **educational medicine information assistant** we have built (explicitly not clinical decision support). Users search a curated medicine database and ask grounded questions; answers come from **Google Gemini**, constrained to MongoDB medicine records and/or a **PDF knowledge base** via optional ChromaDB RAG.

Beyond the original chat MVP in the README, we have expanded the codebase into **role-based portals** for patients, doctors, and admins, plus clinical tools, triage, reminders, and KB upload.

Sample domain data we seeded is India-branded OTC/Rx education (e.g. Dolo 650, Pan 40, Azithral).

---

## Tech stack we are using

- **Frontend:** React 18, Vite 5, React Router 6, Tailwind CSS 3, react-markdown, Web Speech API
- **Backend:** Node.js (ESM), Express 4, Helmet, CORS, rate-limit, express-validator, multer
- **Auth:** JWT + bcrypt; legacy admin path via `X-Admin-Secret`
- **Data:** MongoDB + Mongoose (MongoMemoryServer fallback in non-prod); ChromaDB for vector RAG
- **AI:** Gemini (`gemini-2.5-flash`), LangChain splitters + Gemini embeddings
- **Layout:** Root + `frontend/` + `backend/` + `database/` + `docs/` (not a Turborepo monorepo)

---

## Architecture we have in place

```
Browser (Vite :5173)
  └─ proxy /api → Express (:5000)
        ├─ Auth (JWT RBAC: doctor | patient | admin)
        ├─ Chat → medicine match → agent router → Gemini
        │         └─ optional RAG: ChromaDB chunks from uploaded PDF
        ├─ Medicines CRUD (public search + admin secret)
        ├─ Tools (interactions, dose calc, CKD/liver stubs)
        ├─ Patient features (my medicines, reminders, triage, Rx upload)
        ├─ Doctor (patient list)
        └─ Analytics (admin)
MongoDB: users, medicines, chats, feedback, prescriptions, reminders, patient meds
ChromaDB (:8000): PDF chunk embeddings (optional; falls back to Mongo medicine JSON)
```

**Chat path we built:** sanitize + injection check → greeting short-circuit → match medicines → intent router (drug_info / interaction / dosage / safety / triage) → RAG+Gemini if Chroma has coverage, else Gemini over medicine JSON → template fallback on failure. Responses include confidence, sources, agent label, follow-ups.

**Entry points:** `backend/server.js`, `frontend/src/App.jsx`, `frontend/src/services/api.js`, `backend/services/geminiService.js`, `backend/services/ragService.js`

---

## Features we have implemented

### Solid / demo-ready

- Public chat: search, filters, session history, markdown, voice, theme, recent searches
- Grounded Q&A with anti-hallucination prompts and fallbacks
- Medicine catalog + seed of 7 samples (`database/sample-medicines.json`); auto-seed on boot
- Admin medicine CRUD (secret header) + JSON bulk upload
- JWT auth + demo users (`doctor@` / `patient@` / `admin@medai.com`)
- **Patient portal:** chat, My Medicines, reminders, Rx upload UI, triage, tips, settings/i18n
- **Doctor portal:** clinical chat, patient list, interaction checker, dose calculator, CKD quick action
- **Admin dashboard:** KPIs, analytics UI, users, PDF KB upload
- RAG: PDF → chunk → embed → Chroma; admin `/api/upload-kb`
- Explainability UI (confidence + sources), feedback, chat export, help page, patient onboarding

### Partial / stub (still on our backlog)

- Prescription OCR: filename/regex stub (not real vision)
- “Multi-agent”: keyword router only, not separate agent runs
- Analytics: some real counts; several KPIs hard-coded
- HIPAA / AES-256: UI copy only
- Integrations page: “Coming soon”
- `ArchitecturePage.jsx` exists but is not wired in routes
- README + `docs/API.md` lag behind actual APIs (auth, tools, triage, RAG, portals)
- `node-cron` unused — reminders are CRUD, not scheduled push

---

## Data model we use (Mongo)

| Model | Role |
|-------|------|
| User | email, passwordHash, role, prefs/profile |
| Medicine | name, uses, dosage, warnings, interactions, FAQ, etc. |
| ChatSession / ChatFeedback | history + thumbs |
| InAppReminder / PatientMedicine | schedules and patient↔med links |
| Prescription | upload metadata |

**API mounts we expose:** `/api/auth`, `/chat`, `/medicines`, `/admin`, `/tools`, `/reminders`, `/feedback`, `/profile`, `/reports`, `/analytics`, `/prescriptions`, `/triage`, `/my-medicines`, `/doctor`, `/upload-kb`

---

## Where we stand (maturity)

We have a **feature-rich educational MVP / demo** — not production-clinical yet.

- Chat + portals: demo-ready with seed data and in-memory Mongo fallback
- RAG: optional; degrades to Mongo JSON without Chroma
- Clinical tools: educational only (not validated medical engines)
- Ops/docs thin; compliance claims ahead of what we have implemented

---

## Directory map

```
MedAi/
├── README.md, package.json, dolo650_knowledge_base.pdf
├── docs/API.md
├── database/          # sample-medicines.json, seed.js
├── backend/           # server, models, routes, services (Gemini/RAG/tools)
└── frontend/src/      # pages, portals, chat, contexts, hooks, api.js
```

---

## Bottom line

Till now, we have built a **Gemini-grounded medicine Q&A product** with working public chat, JWT role portals (patient / doctor / admin), optional PDF RAG, and educational clinical utilities — a **demo-ready MVP** where our docs and a few clinical/compliance surfaces still trail the code.
