# Algorithms and Defense Notes

This file lists the important algorithms and rules used inside Blockvote.
These are useful to explain during a project defense.

## 1. Password Hashing

Where it happens:

- `backend/src/modules/auth/auth.service.ts`

Algorithm:

1. User enters a password.
2. Backend uses bcrypt with salt rounds.
3. Backend stores the hash, not the original password.
4. On login, bcrypt compares the entered password with the stored hash.

Defense note:

- If the database is leaked, raw passwords are not directly exposed.

## 2. JWT Authentication

Where it happens:

- `backend/src/utils/generateToken.ts`
- `backend/src/middleware/auth.ts`

Algorithm:

1. Backend creates a JWT after successful login.
2. Frontend stores the token in local storage.
3. Each protected API request sends `Authorization: Bearer <token>`.
4. Backend verifies the token.
5. Backend loads the user and attaches user info to the request.

Defense note:

- The token identifies the logged-in user without requiring login credentials on every request.

## 3. Role-Based Access Control

Where it happens:

- Backend middleware and services.
- Frontend `RequireRole` route guard.

Roles:

- `SUPERADMIN`: can manage global system settings and admin scopes.
- `ADMIN`: can manage elections and voters within assigned scope.
- `VOTER`: can vote in allowed elections.

Algorithm:

1. Request enters a protected route.
2. Backend authenticates the user.
3. Backend checks required role.
4. Service layer checks deeper rules such as organization scope.

Defense note:

- Frontend route protection improves user experience.
- Backend permission checks are the real security layer.

## 4. Wallet Address Normalization

Where it happens:

- `auth.service.ts`

Algorithm:

1. User submits a wallet address.
2. Backend trims it.
3. Backend uses `ethers.getAddress`.
4. The normalized checksum address is stored.

Defense note:

- This avoids duplicate wallet records caused by different letter casing.

## 5. Wallet Signature Login

Where it happens:

- `auth.service.ts`

Algorithm:

1. Backend creates a random nonce.
2. Nonce expires after 5 minutes.
3. User signs a message containing the wallet address and nonce.
4. Backend uses `ethers.verifyMessage` to recover the signing address.
5. Backend compares recovered address with the registered wallet.
6. Backend deletes the nonce after successful login.

Defense note:

- This proves wallet ownership.
- The short-lived nonce prevents replay attacks.
- The private key never leaves the wallet.

## 6. Election Status Sync

Where it happens:

- `elections.service.ts`
- `election-groups.service.ts`

Algorithm:

```txt
if current time < startDate:
  status = UPCOMING
else if current time > endDate:
  status = CLOSED
else:
  status = ACTIVE
```

Defense note:

- Election status is derived from time, so elections can automatically move from upcoming to active to closed.

## 7. Organization Scope Filtering

Where it happens:

- `elections.service.ts`
- `election-groups.service.ts`
- `users.service.ts`

Algorithm for voters:

1. Get the voter's organization.
2. Show global elections.
3. Show organization elections only if `organizationId` matches.

Algorithm for admins:

1. Superadmin can access all.
2. Admin can access organization elections only in assigned organization.
3. Admin can access global elections only when `canCreateGlobalElections` is true.

Defense note:

- This is what makes elections organization-scoped.

## 8. On-Chain Election ID Extraction

Where it happens:

- `elections.service.ts`
- `election-groups.service.ts`

Algorithm:

1. Backend sends `createElection` transaction to the contract.
2. Backend waits for the transaction receipt.
3. Backend filters logs from the voting contract address.
4. Backend parses logs using the contract ABI.
5. Backend searches for the `ElectionCreated` event.
6. Backend extracts `electionId`.
7. Backend stores it as `contractElectionId`.

Defense note:

- The local database record is connected to the exact on-chain election created by the transaction.

## 9. Candidate On-Chain Confirmation

Where it happens:

- `candidates.service.ts`

Algorithm:

1. Backend calls `addCandidate` on the contract.
2. Backend waits for the receipt.
3. Backend parses logs using the ABI.
4. Backend searches for `CandidateAdded`.
5. Backend stores the returned `candidateId` as `contractCandidateId`.

Defense note:

- A candidate is saved locally only after the contract confirms it.

## 10. Duplicate Vote Prevention

Where it happens:

- `backend/prisma/schema.prisma`
- `votes.service.ts`

Algorithm:

1. Before saving a vote, backend checks if a vote already exists for that user and election.
2. Database also enforces a unique pair:

```txt
@@unique([userId, electionId])
```

Defense note:

- The service check gives a friendly error.
- The database unique rule is the stronger final protection.

## 11. Vote Validity Checks

Where it happens:

- `votes.service.ts`

Algorithm:

Before recording a vote, backend checks:

1. User exists.
2. User status is `APPROVED`.
3. User has a wallet address.
4. Election exists.
5. Organization election matches the user's organization.
6. Election status is `ACTIVE`.
7. Candidate belongs to the election.
8. User has not voted in this election.

Defense note:

- A vote must pass identity, permission, election, candidate, and duplicate checks.

## 12. Vote Receipt Verification

Where it happens:

- `votes.service.ts`

Algorithm:

1. Search vote by transaction hash.
2. If found, return vote details.
3. Try to fetch the blockchain transaction receipt from the provider.
4. Return both database vote info and chain receipt when available.

Defense note:

- The transaction hash is the receipt that links the vote to a blockchain transaction.

## 13. Result Counting

Where it happens:

- `results.service.ts`

Algorithm:

1. Load election candidates.
2. Count votes for each candidate using Prisma relation counts.
3. Add all candidate vote counts for total votes.
4. Winner is the candidate with the highest vote count.
5. Ignore candidates with zero votes when choosing a winner.

Defense note:

- Results come from stored vote records, not from frontend calculations.

## 14. Turnout Percentage

Where it happens:

- `results.service.ts`

Formula:

```txt
turnoutPercentage = (totalVotes / approvedVoterCount) * 100
```

The result is rounded to one decimal place.

Defense note:

- This gives a quick participation metric.

## 15. Live Results Update

Where it happens:

- Backend `socket.ts`
- Frontend `resultsSocket.ts`
- Backend `votes.service.ts`

Algorithm:

1. Frontend joins a Socket.IO room for one election.
2. Voter casts vote.
3. Backend records vote.
4. Backend recalculates latest results.
5. Backend emits `results:update` to that election room.
6. Frontend receives update and refreshes displayed results.

Defense note:

- Only clients watching that election receive that election's result update.

## 16. Result Publication Rule

Where it happens:

- `results.service.ts`

Algorithm:

1. Admin requests result publication.
2. Backend checks if election status is `CLOSED`.
3. If closed, backend marks `resultsPublished` as true.
4. Backend saves `resultsPublishedAt`.

Defense note:

- Results can be counted anytime, but official publication is allowed only after closing.

## 17. Safe Delete with Transactions

Where it happens:

- `elections.service.ts`
- `election-groups.service.ts`
- `users.service.ts`

Algorithm:

1. Delete dependent records first, such as votes and candidates.
2. Delete the parent record.
3. Run the operations in a database transaction.

Defense note:

- A transaction prevents partial deletes if one operation fails.
