# Main System Flows

This file explains the most important workflows in the system.

## 1. Registration Flow

1. User enters name, email, password, phone, wallet address, and organization.
2. Backend checks if the email already exists.
3. Backend normalizes the wallet address using ethers.
4. Backend checks if the wallet is already registered.
5. Backend hashes the password with bcrypt.
6. Backend creates the user as:
   - role: `VOTER`
   - status: `PENDING`
   - isVerified: `false`
7. Backend sends an email verification link.

Why this matters:

- Passwords are not stored as plain text.
- Wallet addresses are unique.
- Voters cannot vote immediately after registration.

## 2. Email Verification Flow

1. User opens the verification link.
2. Backend finds the matching verification token.
3. Backend marks the account as verified.
4. Backend clears the token so it cannot be reused.

Why this matters:

- Only verified email accounts can log in.
- The token is one-time use.

## 3. Login Flow

Email/password login:

1. Backend finds the user by email.
2. Backend compares the password with the bcrypt hash.
3. Backend checks if email is verified.
4. Backend returns a JWT token and user profile.

Wallet login:

1. Frontend requests a wallet login nonce.
2. Backend creates a short-lived nonce.
3. User signs a login message with the wallet.
4. Backend recovers the wallet address from the signature.
5. If the recovered address matches the registered wallet, backend returns a JWT.

Why this matters:

- Wallet login proves wallet ownership without sending the private key.
- The nonce prevents replaying old signatures.

## 4. Voter Approval Flow

1. Admin views pending voters.
2. Admin approves a voter.
3. Backend checks if the admin can manage that voter.
4. Backend checks if the voter has a wallet address.
5. Backend checks if the wallet is already approved on-chain.
6. If not approved, backend calls `approveVoter` on the smart contract.
7. Backend updates the voter status to `APPROVED`.

Why this matters:

- Approval is enforced both in the database and on-chain.
- Organization admins can only manage voters inside their organization.

## 5. Election Creation Flow

1. Admin or superadmin submits election details.
2. Backend checks role and scope permissions.
3. Backend converts start and end dates into Unix timestamps.
4. Backend calls `createElection` on the smart contract.
5. Backend reads the contract event logs to get `contractElectionId`.
6. Backend saves the election in PostgreSQL.

Why this matters:

- The app stores the local election record.
- The contract stores the on-chain election reference.
- Event parsing links the local database election to the blockchain election.

## 6. Election Group Flow

Election groups are used when one event has multiple positions.

Example:

```txt
Supreme Student Council Election
  - President
  - Vice President
  - Secretary
```

How it works:

1. Admin creates one election group.
2. Admin provides multiple position names.
3. Backend creates one on-chain election per position.
4. Backend creates one `ElectionGroup` record.
5. Backend creates multiple `Election` records under that group.

Why this matters:

- Each position has its own candidates and results.
- The group keeps related positions together in the UI.

## 7. Candidate Creation Flow

1. Admin adds a candidate to an upcoming election.
2. Backend checks that the election exists.
3. Backend only allows candidate creation while election status is `UPCOMING`.
4. Backend calls `addCandidate` on the smart contract.
5. Backend reads the `CandidateAdded` event to get `contractCandidateId`.
6. If a photo exists, backend uploads it to S3.
7. Backend saves the candidate in PostgreSQL.

Why this matters:

- Candidates are linked to both the database and contract.
- Candidates cannot be added after the election starts.

## 8. Voting Flow

1. Voter opens an active election.
2. Frontend calls vote preparation.
3. Backend checks:
   - user exists
   - user is `APPROVED`
   - wallet address exists
   - wallet is approved on-chain
4. User casts vote through the wallet/blockchain.
5. Frontend sends `electionId`, `candidateId`, and `txHash` to the backend.
6. Backend checks:
   - election exists
   - voter belongs to the correct organization if election is organization-scoped
   - election is `ACTIVE`
   - candidate belongs to the election
   - voter has not voted in that election yet
7. Backend stores the vote and transaction hash.
8. Backend recalculates results.
9. Backend emits live result update through Socket.IO.

Why this matters:

- The system prevents duplicate votes.
- The transaction hash acts as a public receipt.
- Results update live after the vote is recorded.

## 9. Result Flow

1. Backend counts votes per candidate.
2. Backend calculates total votes.
3. Backend chooses the candidate with the highest vote count as winner.
4. Backend calculates turnout percentage.
5. Admin can publish results only after election status is `CLOSED`.

Why this matters:

- Results are based on saved vote records.
- Publication is controlled so results are not official before the election closes.

## 10. Receipt Verification Flow

1. User enters or opens a transaction hash.
2. Backend searches the vote by `txHash`.
3. If found, backend returns vote details.
4. Backend also tries to fetch the blockchain transaction receipt.
5. Wallet address is masked before sending response.

Why this matters:

- Anyone can verify that a vote receipt exists.
- The app does not expose the full voter wallet in the response.
