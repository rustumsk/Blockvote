# Blockvote Frontend

The frontend is a React/Vite application for public visitors, voters, admins, and superadmins. It connects to the Blockvote backend API, displays election and result data, manages wallet-bound voting flows, and provides deployment support for Vercel.

## Stack

- React 19
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Socket.IO client
- ethers v6
- tsparticles for landing-page animation

## Directory Structure

```txt
frontend/
  public/                  Static public assets
  src/
    api/                   Typed backend API client
    components/
      auth/                Auth layout/status screens
      landing/             Landing page animation components
      layout/              Navbar, sidebar, footer
      routing/             Protected role routes
      shared/              Election, candidate, result display components
      ui/                  Buttons, inputs, modal, badges
      wallet/              Wallet connection UI
    context/               Auth context and session refresh
    lib/                   Toasts and Socket.IO result subscription
    pages/
      admin/               Admin dashboard, elections, voters, logs, reports, security
      auth/                Login, register, verify email
      public/              Public elections, published results, verify, legal/help
      voter/               Voter dashboard, elections, voting, receipts, profile
    utils/                 Wallet helper utilities
    App.tsx                Route map
    index.css              Global styles and Tailwind layers
    main.tsx               React entrypoint
  vercel.json              SPA rewrite for direct route links
```

## Scripts

```bash
npm run dev       # Start Vite dev server
npm run build     # Type-check and create production build
npm run preview   # Preview the production build locally
npm run lint      # Run ESLint
```

## Environment Variables

Local `.env`:

```txt
VITE_API_URL=http://localhost:5000
VITE_CONTRACT_ADDRESS=0x...
```

Production Vercel env:

```txt
VITE_API_URL=https://your-render-backend.onrender.com
VITE_CONTRACT_ADDRESS=0x...
```

Do not include `/api` in `VITE_API_URL`. The API client already appends `/api/...`.

Correct:

```txt
VITE_API_URL=https://blockvote-oik3.onrender.com
```

Wrong:

```txt
VITE_API_URL=https://blockvote-oik3.onrender.com/api
```

Vite env vars are baked at build time. If you change Vercel environment variables, redeploy the frontend.

## Route Groups

Public:

```txt
/
/login
/register
/verify-email
/elections
/published-elections
/elections/:id
/elections/:electionId/candidates/:candidateId
/verify
/terms
/privacy
/help
```

Voter:

```txt
/voter/dashboard
/voter/elections
/voter/published-results
/voter/elections/:id
/voter/elections/:id/vote
/voter/receipt
/voter/verify
/voter/profile
```

Admin:

```txt
/admin/dashboard
/admin/elections
/admin/elections/:id
/admin/voters
/admin/reports
/admin/logs
/admin/security
/admin/settings
```

Superadmin:

```txt
/admin/superadmin
```

## Auth and Session Behavior

The frontend stores:

```txt
blockvote_token
blockvote_user
```

in `localStorage`.

`AuthContext` refreshes `/api/auth/me` on load, on window focus, and on a short interval. This allows role/status changes to appear without forcing users to log out and log back in.

## Wallet Behavior

Registration requires a wallet address to bind identity early.

Voters do not need Sepolia ETH for backend-paid operations. The configured backend wallet pays gas where the backend submits transactions. The frontend still checks the active wallet against the user’s linked wallet for vote integrity.

## Results Behavior

- Public published results show global elections.
- Voter published results show global elections and the voter’s organization elections.
- Election detail pages show position-by-position tallies and published winners.
- Live result updates use Socket.IO through the same backend base URL.

## Vercel Deployment

Vercel settings:

```txt
Root Directory: frontend
Build Command: npm run build
Output Directory: dist
```

Required Vercel env:

```txt
VITE_API_URL=https://your-render-backend.onrender.com
VITE_CONTRACT_ADDRESS=0x...
```

`vercel.json` contains:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

This is required so direct browser links such as `/verify-email?token=...` and `/voter/elections/...` load the React app instead of returning Vercel `404: NOT_FOUND`.

## Backend CORS Pairing

After Vercel deploys, set the backend Render env:

```txt
FRONTEND_URL=https://your-vercel-app.vercel.app
```

If testing preview deployments, include multiple origins separated by commas:

```txt
FRONTEND_URL=https://main-app.vercel.app,https://preview-app.vercel.app
```

Then redeploy the backend.

## Common Issues

- Organizations missing on register: `VITE_API_URL` is missing/wrong or backend CORS `FRONTEND_URL` does not match.
- Email verification link returns Vercel 404: `vercel.json` rewrite is missing or not deployed.
- API calls go to Vercel instead of Render: `VITE_API_URL` is empty in Vercel env.
- Wallet vote fails: active wallet does not match the linked account wallet or contract env is wrong.
- Candidate photos fail: backend S3 env vars are missing.
