# Cursor Prompt — Blockvote Complete Backend

## Project Overview
Build the complete REST API backend for a blockchain-based voting web app called **Blockvote**.
- Express + TypeScript
- PostgreSQL with Prisma ORM
- JWT authentication (access token only)
- Nodemailer for email verification
- ethers.js v6 for smart contract interaction
- No frontend integration yet — backend only

---

## Tech Stack & Dependencies
```bash
npm install express cors dotenv bcryptjs jsonwebtoken nodemailer ethers @prisma/client
npm install -D typescript ts-node-dev @types/express @types/cors @types/bcryptjs @types/jsonwebtoken @types/nodemailer prisma
```

---

## Project Structure
```
backend/
├── src/
│   ├── config/
│   │   ├── db.ts              # Prisma client singleton
│   │   ├── contract.ts        # ethers.js contract instance
│   │   └── mailer.ts          # Nodemailer transporter
│   ├── middleware/
│   │   ├── auth.ts            # JWT verify middleware
│   │   ├── role.ts            # role guard (ADMIN / VOTER)
│   │   └── errorHandler.ts    # global error handler
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.routes.ts
│   │   │   ├── auth.controller.ts
│   │   │   └── auth.service.ts
│   │   ├── users/
│   │   │   ├── users.routes.ts
│   │   │   ├── users.controller.ts
│   │   │   └── users.service.ts
│   │   ├── elections/
│   │   │   ├── elections.routes.ts
│   │   │   ├── elections.controller.ts
│   │   │   └── elections.service.ts
│   │   ├── candidates/
│   │   │   ├── candidates.routes.ts
│   │   │   ├── candidates.controller.ts
│   │   │   └── candidates.service.ts
│   │   ├── votes/
│   │   │   ├── votes.routes.ts
│   │   │   ├── votes.controller.ts
│   │   │   └── votes.service.ts
│   │   └── results/
│   │       ├── results.routes.ts
│   │       ├── results.controller.ts
│   │       └── results.service.ts
│   ├── utils/
│   │   ├── generateToken.ts
│   │   └── sendEmail.ts
│   └── index.ts               # entry point
├── prisma/
│   └── schema.prisma
├── .env
├── tsconfig.json
└── package.json
```

---

## Environment Variables (.env)
```env
# Server
PORT=5000
NODE_ENV=development

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/blockvote"

# JWT
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=7d

# Nodemailer (use Gmail SMTP or any provider)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your_email@gmail.com
MAIL_PASS=your_app_password
MAIL_FROM="Blockvote <your_email@gmail.com>"

# Blockchain
CONTRACT_ADDRESS=your_deployed_contract_address
RPC_URL=https://sepolia.infura.io/v3/your_infura_key
PRIVATE_KEY=your_admin_wallet_private_key
```

---

## Prisma Schema (prisma/schema.prisma)
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id            String    @id @default(uuid())
  name          String
  email         String    @unique
  password      String
  phone         String?
  role          Role      @default(VOTER)
  status        Status    @default(PENDING)
  walletAddress String?   @unique
  isVerified    Boolean   @default(false)
  verifyToken   String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  votes         Vote[]
}

model Election {
  id          String          @id @default(uuid())
  title       String
  description String
  startDate   DateTime
  endDate     DateTime
  status      ElectionStatus  @default(UPCOMING)
  contractElectionId Int?     // the ID on the smart contract
  createdAt   DateTime        @default(now())
  updatedAt   DateTime        @updatedAt
  candidates  Candidate[]
  votes       Vote[]
}

model Candidate {
  id                  String   @id @default(uuid())
  name                String
  description         String?
  electionId          String
  contractCandidateId Int?     // the ID on the smart contract
  createdAt           DateTime @default(now())
  election            Election @relation(fields: [electionId], references: [id])
  votes               Vote[]
}

model Vote {
  id          String    @id @default(uuid())
  userId      String
  electionId  String
  candidateId String
  txHash      String    @unique
  createdAt   DateTime  @default(now())
  user        User      @relation(fields: [userId], references: [id])
  election    Election  @relation(fields: [electionId], references: [id])
  candidate   Candidate @relation(fields: [candidateId], references: [id])

  @@unique([userId, electionId])
}

enum Role           { ADMIN VOTER }
enum Status         { PENDING APPROVED REJECTED }
enum ElectionStatus { UPCOMING ACTIVE CLOSED PAUSED }
```

---

## tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
```

---

## index.ts (Entry Point)
```typescript
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { errorHandler } from './middleware/errorHandler'
import authRoutes from './modules/auth/auth.routes'
import userRoutes from './modules/users/users.routes'
import electionRoutes from './modules/elections/elections.routes'
import candidateRoutes from './modules/candidates/candidates.routes'
import voteRoutes from './modules/votes/votes.routes'
import resultRoutes from './modules/results/results.routes'

dotenv.config()

const app = express()

app.use(cors())
app.use(express.json())

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/elections', electionRoutes)
app.use('/api/candidates', candidateRoutes)
app.use('/api/votes', voteRoutes)
app.use('/api/results', resultRoutes)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Blockvote API running' })
})

app.use(errorHandler)

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
```

---

## config/db.ts
```typescript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
export default prisma
```

---

## config/contract.ts
```typescript
import { ethers } from 'ethers'
import VotingSystemABI from '../abi/VotingSystem.json'

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL)
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, provider)

export const contract = new ethers.Contract(
  process.env.CONTRACT_ADDRESS!,
  VotingSystemABI,
  wallet
)

export { provider }
```

> After deploying on Remix, copy the ABI and save it as `src/abi/VotingSystem.json`

---

## config/mailer.ts
```typescript
import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: Number(process.env.MAIL_PORT),
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
})

export default transporter
```

---

## middleware/auth.ts
```typescript
import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

export interface AuthRequest extends Request {
  user?: { id: string; role: string }
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return res.status(401).json({ message: 'No token provided' })

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string; role: string }
    req.user = decoded
    next()
  } catch {
    return res.status(401).json({ message: 'Invalid token' })
  }
}
```

---

## middleware/role.ts
```typescript
import { Response, NextFunction } from 'express'
import { AuthRequest } from './auth'

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Admin access required' })
  }
  next()
}

export const requireApprovedVoter = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user?.role !== 'VOTER') {
    return res.status(403).json({ message: 'Voter access required' })
  }
  next()
}
```

---

## middleware/errorHandler.ts
```typescript
import { Request, Response, NextFunction } from 'express'

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack)
  res.status(500).json({ message: err.message || 'Internal server error' })
}
```

---

## utils/generateToken.ts
```typescript
import jwt from 'jsonwebtoken'

export const generateToken = (id: string, role: string): string => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  } as jwt.SignOptions)
}
```

---

## utils/sendEmail.ts
```typescript
import transporter from '../config/mailer'

export const sendVerificationEmail = async (email: string, token: string) => {
  const verifyUrl = `http://localhost:5000/api/auth/verify-email?token=${token}`

  await transporter.sendMail({
    from: process.env.MAIL_FROM,
    to: email,
    subject: 'Verify your Blockvote account',
    html: `
      <h2>Welcome to Blockvote</h2>
      <p>Click the link below to verify your email address:</p>
      <a href="${verifyUrl}" style="
        background:#00d4c8;
        color:black;
        padding:12px 24px;
        border-radius:8px;
        text-decoration:none;
        font-weight:bold;
      ">Verify Email</a>
      <p>This link expires in 24 hours.</p>
    `,
  })
}
```

---

## API Endpoints — Full Specification

---

### AUTH MODULE

#### POST /api/auth/register
- Body: `{ name, email, password, phone? }`
- Hash password with bcrypt (rounds: 10)
- Generate random verifyToken (crypto.randomUUID)
- Save user with status PENDING, isVerified false
- Send verification email via Nodemailer
- Response: `{ message: "Verification email sent" }`

#### GET /api/auth/verify-email?token=xxx
- Find user by verifyToken
- Set isVerified = true, clear verifyToken
- Response: `{ message: "Email verified successfully" }`

#### POST /api/auth/login
- Body: `{ email, password }`
- Check user exists + password matches (bcrypt.compare)
- Check isVerified = true (reject if not)
- Generate JWT with { id, role }
- Response: `{ token, user: { id, name, email, role, status, walletAddress } }`

#### GET /api/auth/me
- Protected route (authenticate middleware)
- Response: current user object (no password)

#### PATCH /api/auth/wallet
- Protected route
- Body: `{ walletAddress }`
- Save wallet address to user record
- Response: updated user

---

### USERS MODULE (Admin only)

#### GET /api/users
- Protected + requireAdmin
- Query params: `status` (PENDING / APPROVED / REJECTED), `search`
- Response: paginated list of users (no passwords)

#### GET /api/users/:id
- Protected + requireAdmin
- Response: single user details

#### PATCH /api/users/:id/approve
- Protected + requireAdmin
- Set user status = APPROVED
- Call smart contract: `contract.approveVoter(walletAddress)`
- Response: `{ message: "Voter approved" }`

#### PATCH /api/users/:id/reject
- Protected + requireAdmin
- Set user status = REJECTED
- Response: `{ message: "Voter rejected" }`

#### PATCH /api/users/:id/revoke
- Protected + requireAdmin
- Set user status = PENDING
- Call smart contract: `contract.revokeVoter(walletAddress)`
- Response: `{ message: "Voter revoked" }`

---

### ELECTIONS MODULE

#### GET /api/elections
- Public route
- Query params: `status` (UPCOMING / ACTIVE / CLOSED)
- Sync election status based on current time before returning
- Response: list of elections with candidate count

#### GET /api/elections/:id
- Public route
- Response: single election with candidates

#### POST /api/elections
- Protected + requireAdmin
- Body: `{ title, description, startDate, endDate }`
- Save to PostgreSQL
- Call smart contract: `contract.createElection(title, description, startTimestamp, endTimestamp)`
- Save returned contractElectionId to DB
- Response: created election

#### PATCH /api/elections/:id
- Protected + requireAdmin
- Body: `{ title?, description?, status? }`
- If status change, call: `contract.updateElectionStatus(contractElectionId, status)`
- Response: updated election

#### POST /api/elections/:id/sync
- Protected + requireAdmin
- Call: `contract.syncElectionStatus(contractElectionId)`
- Update DB status to match
- Response: `{ status: updated status }`

---

### CANDIDATES MODULE

#### GET /api/elections/:electionId/candidates
- Public route
- Response: list of candidates for the election

#### POST /api/elections/:electionId/candidates
- Protected + requireAdmin
- Body: `{ name, description? }`
- Check election status is UPCOMING
- Save to PostgreSQL
- Call smart contract: `contract.addCandidate(contractElectionId, name, description)`
- Save returned contractCandidateId to DB
- Response: created candidate

---

### VOTES MODULE

#### POST /api/votes
- Protected + authenticate
- Body: `{ electionId, candidateId }`
- Checks:
  - User status = APPROVED
  - User has walletAddress linked
  - Election status = ACTIVE
  - User has not already voted in this election (DB check)
- Call smart contract: `contract.castVote(contractElectionId, contractCandidateId)`
- Wait for transaction confirmation
- Save vote to PostgreSQL with txHash
- Response: `{ message: "Vote cast", txHash, receipt }`

#### GET /api/votes/my
- Protected + authenticate
- Response: list of all votes by current user (with election + candidate info)

#### GET /api/votes/verify/:txHash
- Public route
- Look up vote in DB by txHash
- Also call provider to get transaction receipt from blockchain
- Response: `{ verified: true, election, candidate, wallet, timestamp, blockNumber }`

---

### RESULTS MODULE

#### GET /api/results/:electionId
- Public route
- Call smart contract: `contract.getResults(contractElectionId)`
- If election is CLOSED, also call: `contract.getWinner(contractElectionId)`
- Merge with DB candidate names
- Response: `{ candidates: [{ name, voteCount }], winner?, totalVotes }`

#### GET /api/results/:electionId/logs
- Protected + requireAdmin
- Query DB for all votes in election
- Include txHash, candidateId, timestamp
- Response: list of transaction logs

---

## Smart Contract Integration Notes

After deploying on Remix IDE to Sepolia:
1. Copy the full ABI from Remix (Compilation Details → ABI)
2. Save as `src/abi/VotingSystem.json`
3. Copy the deployed contract address
4. Paste into .env as CONTRACT_ADDRESS

Key contract functions used by backend:
```
contract.approveVoter(walletAddress)
contract.approveVotersBatch([walletAddresses])
contract.revokeVoter(walletAddress)
contract.createElection(title, description, startTimestamp, endTimestamp)
contract.addCandidate(contractElectionId, name, description)
contract.updateElectionStatus(contractElectionId, status)
contract.syncElectionStatus(contractElectionId)
contract.castVote(contractElectionId, contractCandidateId)
contract.getResults(contractElectionId)
contract.getWinner(contractElectionId)
contract.hasVoted(walletAddress, contractElectionId)
contract.getVoteRecord(walletAddress, contractElectionId)
```

Note: All contract write functions (approve, vote, create) cost gas.
The backend wallet (PRIVATE_KEY in .env) must have Sepolia ETH.
Get free Sepolia ETH from: https://sepoliafaucet.com

---

## Package.json Scripts
```json
{
  "scripts": {
    "dev": "ts-node-dev --respawn --transpile-only src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "db:migrate": "prisma migrate dev",
    "db:generate": "prisma generate",
    "db:studio": "prisma studio"
  }
}
```

---

## Implementation Notes for Cursor
- Every controller function must be wrapped in try/catch
- All contract calls must await transaction confirmation before saving to DB
- Never expose passwords in any response
- Use async/await throughout — no callbacks
- Validate all request bodies before processing
- Return consistent response format: `{ message, data }` or `{ message, error }`
- contractElectionId and contractCandidateId are the uint256 IDs 
  returned from the smart contract — always store these in DB alongside 
  the UUID primary keys
- The smart contract uses timestamps in seconds — 
  convert JS Date to seconds: Math.floor(date.getTime() / 1000)
