# AptitudePro

> A full-stack MERN assessment platform for building, scheduling, monitoring, and reviewing aptitude exams with a clean operations-grade interface.

![React](https://img.shields.io/badge/React-19-149eca?style=for-the-badge)
![Express](https://img.shields.io/badge/Express-5-111827?style=for-the-badge)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-16a34a?style=for-the-badge)
![Vite](https://img.shields.io/badge/Vite-7-f59e0b?style=for-the-badge)
![Gemini](https://img.shields.io/badge/Gemini-AI-2563eb?style=for-the-badge)

AptitudePro is built for two serious workflows:

- Teachers need a fast control room for question banks, AI-assisted exam creation, live monitoring, ranked results, analytics, and previous-year question sets.
- Students need a focused exam experience with clear instructions, timed attempts, performance history, summaries, and detailed solutions.

The app is now fully MERN: React + Vite on the frontend, Express on the backend, MongoDB Atlas through Mongoose, and JWT auth across role-based student and teacher workspaces.

## Highlights

- Clean Ops redesign with light-first dashboards, dense tables, crisp forms, and scan-friendly exam operations.
- Student and teacher role flows with JWT authentication.
- MongoDB-backed question bank, exams, submissions, analytics, results, solutions, and PYQ library.
- Gemini-powered question and exam generation from the backend.
- Live exam lifecycle: draft, scheduled, live, completed.
- Timed student attempt flow with one-submission enforcement.
- Teacher monitoring with submission polling and score distribution analytics.
- Vercel-ready frontend and Render-ready backend.

## Product Map

| Area | What it does |
| --- | --- |
| Auth | Register/login as student or teacher, persist JWT, restore session with `/auth/me` |
| Teacher Dashboard | Create, schedule, publish, monitor, complete, edit, and delete exams |
| Question Bank | Add, edit, delete, search, and AI-generate reusable aptitude questions |
| Exam Builder | Compose exams from bank questions, custom questions, or Gemini-generated sets |
| Live Monitor | Poll submissions, see average score, and close live exams |
| Results | Ranked student results with score and percentage |
| Analytics | Score distribution and question-level correctness |
| Student Dashboard | Available exams, past attempts, score trend, and topic accuracy |
| Exam Attempt | Timed MCQ interface with draft answer persistence |
| Summary & Solutions | Score breakdown and detailed answer explanations |
| PYQ Library | Mongo-backed previous-year question sets for browsing and teacher management |

## Stack

**Frontend**

- React 19
- Vite 7
- React Router 7
- Zustand
- Axios
- Tailwind CSS
- Recharts
- Lucide icons

**Backend**

- Node.js
- Express 5
- MongoDB Atlas
- Mongoose
- JWT
- bcryptjs
- Google Gemini via `@google/genai`

## Project Structure

```text
aptitude-platform/
  backend/
    config/          # environment and CORS config
    controllers/     # auth, exams, AI, PYQ, questions
    middleware/      # JWT and role guards
    models/          # Mongoose schemas
    routes/          # Express routes
    utils/           # shared backend helpers
    index.js         # API entrypoint
  src/
    api/             # Axios client
    components/      # shared UI and exam builder
    layouts/         # student and teacher shells
    pages/           # auth, student, teacher screens
    store/           # Zustand auth/exam state
    utils/           # frontend helpers
  vercel.json        # SPA routing for Vercel
```

## Local Setup

Install frontend dependencies:

```bash
npm install
```

Install backend dependencies:

```bash
cd backend
npm install
```

Create environment files from the examples:

```bash
copy .env.example .env.local
copy backend\.env.example backend\.env
```

Start the backend:

```bash
npm --prefix backend run dev
```

Start the frontend:

```bash
npm run dev
```

Local frontend: `http://localhost:5173`

Local backend health check: `http://localhost:3001/api/health`

## Environment

Frontend `.env.local`:

```bash
VITE_API_BASE_URL=/api
```

For a deployed frontend, point it at the Render API:

```bash
VITE_API_BASE_URL=https://your-render-service.onrender.com/api
```

Backend `backend/.env`:

```bash
NODE_ENV=development
PORT=3001
MONGO_URI=mongodb://127.0.0.1:27017/aptitude-platform
JWT_SECRET=replace-with-a-long-random-secret
CLIENT_ORIGIN=http://localhost:5173
GEMINI_API_KEY=your-gemini-key
GEMINI_MODEL=gemini-2.5-flash
```

Production backend requirements:

- `NODE_ENV=production`
- `MONGO_URI`
- `JWT_SECRET`
- `CLIENT_ORIGIN=https://your-vercel-domain.vercel.app`
- `GEMINI_API_KEY`

## Deployment

**Frontend: Vercel**

- Root directory: repository root
- Build command: `npm run build`
- Output directory: `dist`
- Environment variable: `VITE_API_BASE_URL=https://your-render-service.onrender.com/api`

**Backend: Render**

- Root directory: `backend`
- Build command: `npm install`
- Start command: `npm start`
- Recommended region: Singapore for South Asia latency
- Environment variables: use the production backend requirements above

**Database: MongoDB Atlas**

- Use a managed Atlas cluster
- Prefer Singapore or Mumbai where available
- Add the Render outbound access configuration required by Atlas
- Put the Atlas connection string in `MONGO_URI`

## Verification

Run these before pushing:

```bash
npm run lint
npm run build
npm --prefix backend run test
```

Current verification status:

- Frontend lint passes.
- Production build passes.
- Backend syntax check passes.

## API Overview

```text
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me

GET    /api/questions
POST   /api/questions
PUT    /api/questions/:id
DELETE /api/questions/:id

POST   /api/ai/generate-question
POST   /api/ai/generate-exam

GET    /api/exams/teacher
POST   /api/exams/teacher
GET    /api/exams/teacher/:id
PUT    /api/exams/teacher/:id
PUT    /api/exams/teacher/:id/status
DELETE /api/exams/teacher/:id
GET    /api/exams/teacher/:examId/analytics
GET    /api/exams/teacher/:examId/results

GET    /api/exams/student/available
GET    /api/exams/student/performance
GET    /api/exams/student/:id/attempt
POST   /api/exams/student/:id/submit
GET    /api/exams/student/:id/summary
GET    /api/exams/student/:id/solutions

GET    /api/pyq
POST   /api/pyq
PUT    /api/pyq/:id
DELETE /api/pyq/:id
```

## Notes

- AI generation is server-side only, so Gemini keys never touch the browser.
- Login/signup use the shared Axios client and automatically target the local backend during development.
- Vercel deep links are handled by `vercel.json`.
- Supabase has been removed; MongoDB is the single source of truth.
