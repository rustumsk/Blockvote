# Blockvote

Blockvote is a web-based voting system with role-based dashboards, organization-scoped elections, voter registration and approval, blockchain-backed vote receipts, live/published results, and administrative audit views.

The project is organized as a small monorepo:

```txt
Blockvote/
  backend/     Express + Prisma API, PostgreSQL data layer, blockchain/S3/mail integrations
  frontend/    React + Vite client for public, voter, admin, and superadmin flows
  blockchain/  Smart contract workspace placeholder
```

## Main Features

- Email/password and wallet-based authentication
- Email verification and admin voter approval
- Organization management and organization-scoped elections
- Election groups with multiple positions, such as President and Vice President
- Candidate creation with optional S3-hosted photos
- Wallet-bound voting with blockchain transaction receipts
- Live vote tally and official published results
- Public election/result viewing for global elections
- Authenticated voter result archive for organization elections
- Admin dashboards, reports, blockchain logs, and security overview
- Superadmin role and organization scope management

## Tech Stack

- Frontend: React, TypeScript, Vite, Tailwind CSS, Socket.IO client, ethers
- Backend: Node.js, Express, TypeScript, Prisma 7, PostgreSQL, Socket.IO, ethers
- Storage/integrations: Render PostgreSQL, AWS S3, SMTP mail, Sepolia RPC
- Deployment: Render for backend, Vercel for frontend

## Local Development

Install dependencies in each app:

```bash
cd backend
npm install

cd ../frontend
npm install
```

Start the backend:

```bash
cd backend
npm run dev
```

Start the frontend:

```bash
cd frontend
npm run dev
```

By default, the local frontend should use:

```txt
VITE_API_URL=http://localhost:5000
```

The backend runs on:

```txt
http://localhost:5000
```

Health check:

```txt
GET /api/health
```

## Environment Overview

Backend environment is stored in `backend/.env` locally and Render environment variables in production.

Frontend environment is stored in `frontend/.env` locally and Vercel environment variables in production.

Do not commit real secrets. If credentials were exposed in a chat, screenshot, or repository, rotate them.

## Deployment Summary

Backend on Render:

```txt
Root Directory: backend
Build Command: npm run render-build
Start Command: npm start
```

Frontend on Vercel:

```txt
Root Directory: frontend
Build Command: npm run build
Output Directory: dist
```

Production frontend env:

```txt
VITE_API_URL=https://your-render-backend.onrender.com
VITE_CONTRACT_ADDRESS=0x...
```

Production backend env must include:

```txt
DATABASE_URL=postgresql://...
JWT_SECRET=...
FRONTEND_URL=https://your-vercel-app.vercel.app
CONTRACT_ADDRESS=0x...
RPC_URL=https://...
PRIVATE_KEY=...
SUPERADMIN_EMAIL=...
SUPERADMIN_PASSWORD=...
```

See the app-specific READMEs for the full environment list.

## App Documentation

- Backend documentation: [backend/README.md](./backend/README.md)
- Frontend documentation: [frontend/README.md](./frontend/README.md)
- Blockchain workspace notes: [blockchain/README.md](./blockchain/README.md)

## Common Production Notes

- Voters do not need Sepolia ETH. The backend wallet pays gas for backend-submitted transactions.
- The backend wallet configured by `PRIVATE_KEY` needs enough Sepolia ETH for election/candidate/admin chain operations.
- Vite environment variables are baked at build time. Change Vercel env vars, then redeploy.
- `VITE_API_URL` must not include `/api`; the frontend client adds `/api/...`.
- Render `DATABASE_URL` should use an external DB URL if the database is in another Render account.
- Candidate photos require S3 env vars. Creating candidates without photos does not require S3.

## Useful Commands

Backend:

```bash
npm run dev
npm run build
npm start
npm run db:migrate
npm run db:generate
```

Frontend:

```bash
npm run dev
npm run build
npm run preview
npm run lint
```
