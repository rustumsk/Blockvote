# Directory Guide

This explains what each important directory is for.

## Root Directory

```txt
Blockvote/
  backend/
  blockchain/
  frontend/
  docs/
  README.md
```

- `backend`: server-side API, database access, authentication, role checks, blockchain calls, email, S3 upload, and live result socket events.
- `frontend`: user interface for public pages, voters, admins, and superadmins.
- `blockchain`: notes and suggested structure for smart contract code. Current runtime ABI is still inside the backend.
- `docs`: simple project documentation for inner workings and defense notes.

## Backend

```txt
backend/src/
  abi/
  bootstrap/
  config/
  middleware/
  modules/
  utils/
  index.ts
  socket.ts
```

- `index.ts`: starts the Express server, registers API routes, initializes Socket.IO, and ensures the superadmin exists.
- `socket.ts`: creates the Socket.IO server and sends live election result updates.
- `abi`: contains the voting contract ABI used by ethers.
- `bootstrap`: startup helpers, mainly superadmin creation.
- `config`: database, CORS, contract, mailer, and S3 setup.
- `middleware`: authentication, role checks, uploads, and error handling.
- `modules`: main business logic grouped by feature.
- `utils`: helper functions like JWT generation and email sending.

## Backend Modules

```txt
backend/src/modules/
  auth/
  candidates/
  election-groups/
  elections/
  organizations/
  results/
  users/
  votes/
```

- `auth`: registration, email verification, login, wallet login, profile update, and wallet update.
- `users`: admin voter management, approval, rejection, revocation, deletion, and admin scope assignment.
- `organizations`: organization list and creation.
- `elections`: single-position election creation, listing, deletion, status syncing, and contract ID syncing.
- `election-groups`: grouped elections with multiple positions, such as President and Vice President.
- `candidates`: candidate list, candidate creation, on-chain candidate registration, and candidate photo access.
- `votes`: vote preparation, vote recording, my votes, and receipt verification.
- `results`: vote tally, winner calculation, publication, and election logs.

Each module usually has:

- `*.routes.ts`: URL endpoints.
- `*.controller.ts`: reads request data and sends responses.
- `*.service.ts`: contains the actual business rules.

## Backend Prisma

```txt
backend/prisma/
  schema.prisma
  migrations/
```

- `schema.prisma`: database models and relationships.
- `migrations`: database changes over time.

Main models:

- `User`: voter, admin, or superadmin account.
- `Organization`: group/school/department scope.
- `Election`: one voting contest or one position inside a group.
- `ElectionGroup`: collection of positions under one election event.
- `Candidate`: candidate under an election.
- `Vote`: saved vote receipt with `txHash`.

## Frontend

```txt
frontend/src/
  api/
  components/
  context/
  lib/
  pages/
  utils/
  App.tsx
  main.tsx
```

- `App.tsx`: declares all public, voter, admin, and superadmin routes.
- `main.tsx`: starts the React app.
- `api`: API client functions used by pages/components.
- `components`: reusable UI, layout, routing, wallet, and shared display components.
- `context`: global auth state using React context.
- `lib`: helper libraries such as Socket.IO results subscription and toast messages.
- `pages`: complete screens for landing, auth, public pages, voter pages, and admin pages.
- `utils`: small frontend helpers, including wallet helpers.

## Blockchain

```txt
blockchain/
  README.md
```

This is currently a placeholder workspace. The deployed contract ABI used at runtime is in:

```txt
backend/src/abi/VotingSystem.json
```

The backend connects to the contract using:

- `CONTRACT_ADDRESS`
- `RPC_URL`
- `PRIVATE_KEY`

The frontend must use the same deployed contract address through:

- `VITE_CONTRACT_ADDRESS`
