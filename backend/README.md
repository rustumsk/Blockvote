# Blockvote Backend

The backend is an Express API that manages authentication, users, organizations, elections, candidates, votes, results, blockchain access, Socket.IO live result updates, email verification, and optional S3 candidate photo storage.

## Stack

- Node.js + Express
- TypeScript
- Prisma 7 with PostgreSQL
- Socket.IO
- ethers v6
- Nodemailer
- AWS S3 SDK

## Directory Structure

```txt
backend/
  prisma/
    schema.prisma          Database schema
    migrations/            Prisma migrations used by production deploys
  src/
    abi/                   VotingSystem contract ABI
    bootstrap/             Startup tasks, including superadmin creation
    config/                Database, CORS, contract, mailer, S3 config
    middleware/            Auth, role guards, upload, error handling
    modules/
      auth/                Register, login, email verification, wallet auth/profile
      candidates/          Candidate CRUD and candidate photo serving
      election-groups/     Multi-position election groups
      elections/           Single election/position access and contract sync
      organizations/       Organization listing/creation
      results/             Tally, publish, and vote logs
      users/               Voter/admin management and superadmin scope changes
      votes/               Vote receipt recording and my-votes access
    utils/                 JWT and email helpers
    index.ts               Express app entrypoint
    socket.ts              Socket.IO server
```

## Scripts

```bash
npm run dev            # Start local dev server with ts-node-dev
npm run build          # Compile TypeScript into dist/
npm start              # Run compiled production server
npm run render-build   # Install, generate Prisma, deploy migrations, build
npm run db:migrate     # Create/apply local migrations
npm run db:generate    # Generate Prisma client
npm run db:studio      # Open Prisma Studio
```

`npm run dev` does not automatically run migrations. Run migrations separately when schema changes.

## Required Environment Variables

```txt
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE
JWT_SECRET=long-random-secret
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173
CONTRACT_ADDRESS=0x...
RPC_URL=https://...
PRIVATE_KEY=backend-wallet-private-key
SUPERADMIN_EMAIL=superadmin@example.com
SUPERADMIN_PASSWORD=strong-password
```

Optional:

```txt
SUPERADMIN_NAME=Super Admin
DATABASE_SSL=true
```

Use `DATABASE_SSL=true` for hosted PostgreSQL providers that require SSL, especially external Render PostgreSQL URLs.

## Email Verification Environment

Registration sends verification emails through Nodemailer. Configure these when email verification is required:

```txt
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your-email@example.com
MAIL_PASS=your-app-password
MAIL_FROM=Blockvote <your-email@example.com>
```

For Gmail, use an app password, not the normal account password.

**Render free web services** block outbound SMTP (ports 25, 465, 587), which shows up as `ETIMEDOUT` / `CONN` in logs. Either upgrade to a paid instance or send mail over HTTPS:

```txt
RESEND_API_KEY=re_xxxxxxxx
# Optional if MAIL_FROM is already a domain verified in Resend:
# RESEND_FROM=Blockvote <verify@yourdomain.com>
```

When `RESEND_API_KEY` is set, verification email uses the [Resend](https://resend.com) API instead of SMTP (`MAIL_HOST` is ignored for that path). Verify your sending domain (or use Resend’s onboarding sender per their docs).

## S3 Candidate Photo Environment

Candidate photo upload is optional. If an admin uploads a candidate photo, these must be configured:

```txt
AWS_REGION=ap-southeast-1
AWS_S3_BUCKET=your-bucket
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
```

The IAM user should allow:

```txt
s3:PutObject
s3:GetObject
```

If S3 is not configured, create candidates without photos.

## API Routes

Base path:

```txt
/api
```

Public/basic:

```txt
GET  /api/health
GET  /api/organizations
GET  /api/elections
GET  /api/election-groups
GET  /api/election-groups/:id
GET  /api/election-groups/:id/results
GET  /api/results/:electionId
GET  /api/elections/:id
GET  /api/elections/:electionId/candidates
GET  /api/elections/:electionId/candidates/:candidateId/photo
```

Auth:

```txt
POST   /api/auth/register
GET    /api/auth/verify-email
POST   /api/auth/login
GET    /api/auth/me
PATCH  /api/auth/profile
PATCH  /api/auth/wallet
DELETE /api/auth/account
POST   /api/auth/wallet/nonce
POST   /api/auth/wallet/login
GET    /api/auth/wallet/status
```

Authenticated voter/admin:

```txt
GET  /api/elections/mine
GET  /api/election-groups/mine
GET  /api/votes/me
POST /api/votes
```

Admin:

```txt
GET    /api/users
PATCH  /api/users/:id/approve
PATCH  /api/users/:id/reject
PATCH  /api/users/:id/revoke
DELETE /api/users/:id
GET    /api/elections/manage
POST   /api/elections
DELETE /api/elections/:id
POST   /api/elections/:id/sync-contract
GET    /api/election-groups/manage
POST   /api/election-groups
DELETE /api/election-groups/:id
POST   /api/results/:electionId/publish
GET    /api/results/:electionId/logs
POST   /api/elections/:electionId/candidates
```

Superadmin:

```txt
POST  /api/organizations
PATCH /api/users/:id/role-scope
```

## Database

Prisma models:

- `User`
- `Organization`
- `ElectionGroup`
- `Election`
- `Candidate`
- `Vote`

Local migration workflow:

```bash
npm run db:migrate
npm run db:generate
```

Production migration workflow is included in `render-build`:

```bash
npx prisma migrate deploy
```

## Blockchain Notes

The backend uses:

```txt
CONTRACT_ADDRESS
RPC_URL
PRIVATE_KEY
```

The private key belongs to the backend transaction wallet. It needs Sepolia ETH for gas. Regular voters do not need Sepolia ETH for backend-submitted operations, although the frontend voting flow still binds the user to their wallet identity.

The contract ABI lives in:

```txt
src/abi/VotingSystem.json
```

## Render Deployment

Render service settings:

```txt
Root Directory: backend
Build Command: npm run render-build
Start Command: npm start
```

Do not set `PORT`; Render injects it automatically and the backend reads `process.env.PORT`.

If the database is in a different Render account, use the External Database URL.

## Production Checks

After deploy, open:

```txt
https://your-render-service.onrender.com/api/health
```

Expected response:

```json
{
  "status": "ok",
  "message": "Blockvote API running"
}
```

Common errors:

- `P1010 User was denied access`: wrong PostgreSQL user/password/database or stale `DATABASE_URL`.
- `S3 upload is not configured`: candidate photo was uploaded but AWS env vars are missing.
- `Contract not configured`: missing `CONTRACT_ADDRESS`, `RPC_URL`, or `PRIVATE_KEY`.
- CORS blocked: `FRONTEND_URL` does not match the deployed frontend origin.
