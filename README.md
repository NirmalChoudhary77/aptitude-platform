# AptitudePro

> A clean MERN platform for creating, running, monitoring, and reviewing aptitude exams.

![React](https://img.shields.io/badge/React-19-149eca?style=flat-square)
![Express](https://img.shields.io/badge/Express-5-111827?style=flat-square)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-16a34a?style=flat-square)
![Vite](https://img.shields.io/badge/Vite-7-f59e0b?style=flat-square)
![Gemini](https://img.shields.io/badge/Gemini-AI-2563eb?style=flat-square)

AptitudePro gives teachers a sharp exam-operations workspace and students a focused test-taking experience. It supports AI-assisted question generation, live exam monitoring, ranked results, analytics, detailed solutions, and previous-year question sets.

## What It Does

- Role-based student and teacher login
- MongoDB-backed question bank, exams, submissions, results, analytics, and PYQ sets
- Gemini-powered question and exam generation
- Exam lifecycle: draft, scheduled, live, completed
- Timed student attempts with one-submission enforcement
- Teacher dashboards for live monitoring, rankings, and score distribution
- Student dashboards for available exams, attempt history, summaries, and solutions

## Stack

| Layer | Tools |
| --- | --- |
| Frontend | React, Vite, Tailwind CSS, Zustand, Axios, Recharts |
| Backend | Node.js, Express, Mongoose, JWT, bcryptjs |
| Database | MongoDB Atlas |
| AI | Google Gemini via `@google/genai` |
| Deploy | Vercel frontend, Render backend |

## Quick Start

```bash
npm install
npm --prefix backend install
copy .env.example .env.local
copy backend\.env.example backend\.env
```

Run the API:

```bash
npm --prefix backend run dev
```

Run the app:

```bash
npm run dev
```

Frontend: `http://localhost:5173`

API health: `http://localhost:3001/api/health`

## Environment

Frontend `.env.local`:

```bash
VITE_API_BASE_URL=/api
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

## Deploy

**Vercel**

- Build: `npm run build`
- Output: `dist`
- Env: `VITE_API_BASE_URL=https://your-render-service.onrender.com/api`

**Render**

- Root: `backend`
- Build: `npm install`
- Start: `npm start`
- Env: `NODE_ENV`, `MONGO_URI`, `JWT_SECRET`, `CLIENT_ORIGIN`, `GEMINI_API_KEY`

## Verify

```bash
npm run lint
npm run build
npm --prefix backend run test
```

## Notes

- Supabase has been removed.
- MongoDB is the single source of truth.
- Gemini keys stay server-side.
- Vercel deep links are handled by `vercel.json`.
