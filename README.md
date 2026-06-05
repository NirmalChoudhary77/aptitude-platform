# AptitudePro MERN Platform

A live MERN aptitude testing platform with a React/Vite frontend, Express API, MongoDB/Mongoose data layer, JWT auth, Gemini-assisted question generation, teacher exam operations, student attempts, results, analytics, solutions, and PYQ library.

## Local Development

Frontend:

```bash
npm install
npm run dev
```

Backend:

```bash
cd backend
npm install
npm run dev
```

The Vite dev server proxies `/api` to the Express backend. Set frontend overrides in `.env.local` only when needed:

```bash
VITE_API_BASE_URL=/api
```

## Backend Environment

Create `backend/.env`:

```bash
NODE_ENV=development
PORT=3001
MONGO_URI=mongodb://127.0.0.1:27017/aptitude-platform
JWT_SECRET=replace-with-a-long-secret
CLIENT_ORIGIN=http://localhost:5173
GEMINI_API_KEY=your-gemini-key
GEMINI_MODEL=gemini-2.5-flash
```

In production, `MONGO_URI` and `JWT_SECRET` are required. `GEMINI_API_KEY` is required for AI generation.

## Deployment

- Frontend: Vercel, build command `npm run build`, output directory `dist`.
- Frontend env: `VITE_API_BASE_URL=https://<render-backend-domain>/api`.
- Backend: Render Web Service, region Singapore, root `backend`, build command `npm install`, start command `npm start`.
- Backend env: `NODE_ENV=production`, `MONGO_URI`, `JWT_SECRET`, `CLIENT_ORIGIN=https://<vercel-domain>`, `GEMINI_API_KEY`.
- Database: MongoDB Atlas cluster in a South Asia-friendly region such as Singapore or Mumbai where available.

## Verification

```bash
npm run lint
npm run build
npm --prefix backend run test
```
