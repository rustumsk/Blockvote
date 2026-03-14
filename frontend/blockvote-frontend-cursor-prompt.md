# Cursor Prompt — Blockvote Complete Frontend UI (No Logic)

## Project Overview
Build the complete frontend UI for a blockchain-based voting web app called **Blockvote**.
This is a React + Vite + TypeScript project using Tailwind CSS.
No backend integration. No wallet logic. No API calls. Static UI only for now.
All buttons, forms, and interactions are UI-only with no functionality attached yet.

---

## Tech Stack
- React + Vite + TypeScript
- Tailwind CSS (utility classes only, no custom config needed)
- React Router DOM (for page navigation)
- Lucide React (for icons)
- No state management library needed yet

---

## Design System

### Colors
```
Background:     #0a0f1a  (deep navy black)
Surface/Card:   #0f1929  (slightly lighter navy)
Border:         #1a2a3a  (subtle dark border)
Accent:         #00d4c8  (teal/cyan — primary brand color)
Accent Hover:   #00b5aa
Accent Glow:    rgba(0, 212, 200, 0.15)
Text Primary:   #ffffff
Text Secondary: #8899aa
Text Muted:     #556677
```

### Typography
- Font: Inter (import from Google Fonts)
- Headings: font-bold, white
- Body: text-secondary
- Labels: text-muted, uppercase, tracking-wide, text-xs

### Component Styles
- **Primary Button**: bg-[#00d4c8] text-black font-semibold px-6 py-2.5 rounded-lg hover:bg-[#00b5aa] transition
- **Outline Button**: border border-white/20 text-white px-6 py-2.5 rounded-lg hover:border-[#00d4c8] hover:text-[#00d4c8] transition
- **Card**: bg-[#0f1929] border border-[#1a2a3a] rounded-xl p-6 hover:border-[#00d4c8]/30 transition
- **Input**: bg-[#0f1929] border border-[#1a2a3a] rounded-lg px-4 py-3 text-white placeholder-[#556677] focus:border-[#00d4c8] focus:outline-none w-full
- **Badge ACTIVE**: bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded-full
- **Badge UPCOMING**: bg-yellow-500/20 text-yellow-400 text-xs px-2 py-1 rounded-full
- **Badge CLOSED**: bg-gray-500/20 text-gray-400 text-xs px-2 py-1 rounded-full
- **Badge PENDING**: bg-yellow-500/20 text-yellow-400 text-xs px-2 py-1 rounded-full
- **Badge APPROVED**: bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded-full

### Teal Glow Effect (use sparingly on key elements)
```css
box-shadow: 0 0 30px rgba(0, 212, 200, 0.15);
```

---

## Project Structure
```
src/
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   ├── Sidebar.tsx        ← admin & voter dashboard sidebar
│   │   └── Footer.tsx
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Badge.tsx
│   │   ├── Input.tsx
│   │   └── Modal.tsx
│   └── shared/
│       ├── ElectionCard.tsx
│       ├── CandidateCard.tsx
│       └── StatsCard.tsx
├── pages/
│   ├── LandingPage.tsx
│   ├── auth/
│   │   ├── LoginPage.tsx
│   │   └── RegisterPage.tsx
│   ├── voter/
│   │   ├── VoterDashboard.tsx
│   │   ├── ElectionsPage.tsx
│   │   ├── VotePage.tsx
│   │   ├── ReceiptPage.tsx
│   │   └── VerifyPage.tsx
│   └── admin/
│       ├── AdminDashboard.tsx
│       ├── ManageElectionsPage.tsx
│       ├── ManageVotersPage.tsx
│       ├── ElectionDetailPage.tsx
│       └── BlockchainLogsPage.tsx
└── App.tsx                    ← all routes defined here
```

---

## Pages — Detailed Specifications

---

### 1. LandingPage.tsx
The landing page already exists with this design — **replicate it exactly**:
- Full viewport dark background with teal radial gradient glow (left side)
- Navbar: BLOCKVOTE logo (white square icon + bold text), "How it works" nav link, "Connect Wallet" outline button, "Register" teal filled button
- Hero: Large headline "Secure. Transparent. Tamper-Proof Voting." — bold white, large text
- Subheadline: "a blockchain-based automated voting system built for honest and verifiable elections." — muted gray
- Two CTA buttons: "Connect Wallet" (dark filled) and "Explore" (outline)
- Below the fold (scrolled to when Explore is clicked), add these sections:

**Section A — How It Works**
Three horizontal steps connected by a dashed line:
- Step 1: Shield icon — "Register & Get Approved" — Register and wait for admin approval
- Step 2: Vote/check icon — "Cast Your Vote" — Cast one vote securely on the blockchain
- Step 3: Search icon — "Verify Your Vote" — Verify anytime using your transaction hash
Each step has a teal circle number, icon, title, and description.

**Section B — Why Blockvote?**
Three feature cards in a row with teal glow border on hover:
- Lock icon — "Secure" — Cryptographic security with decentralized validation
- Eye icon — "Transparent" — Every vote publicly recorded on an immutable ledger
- CheckCircle icon — "Verifiable" — Track your vote anytime using your transaction receipt

**Section C — CTA Banner**
Full width dark section with subtle teal gradient:
- Headline: "Ready to participate in a fairer election?"
- Two buttons: "Connect Wallet" (teal filled) and "Register Now" (outline white)

---

### 2. LoginPage.tsx
- Centered card on dark background with teal glow
- BLOCKVOTE logo at top of card
- Title: "Welcome Back"
- Subtitle: "Sign in to your account"
- Email input
- Password input with show/hide toggle
- "Sign In" teal button (full width)
- "Don't have an account? Register" link
- Divider "or"
- "Connect Wallet" outline button with MetaMask fox icon (use inline SVG or img)
- Link back to landing page

---

### 3. RegisterPage.tsx
- Same centered card layout as login
- Title: "Create Account"
- Subtitle: "Join Blockvote to participate in elections"
- Full Name input
- Email input
- Phone Number input
- Password input with show/hide toggle
- Confirm Password input
- Checkbox: "I agree to the Terms and Privacy Policy"
- "Create Account" teal button (full width)
- "Already have an account? Sign in" link
- Note below button: "Your account will be reviewed and approved by an admin before you can vote."

---

### 4. VoterDashboard.tsx
Layout: Left sidebar + main content area

**Sidebar:**
- BLOCKVOTE logo at top
- Nav items with icons:
  - Dashboard (home icon) — active state = teal text + teal left border
  - Elections (vote icon)
  - My Votes (receipt icon)
  - Verify Vote (search icon)
  - Profile (user icon)
- Bottom: wallet address display (truncated: 0x1234...5678) + disconnect button

**Main Content:**
- Header: "Welcome back, [Name]" + wallet address chip
- Status banner if account is PENDING: yellow warning — "Your account is pending admin approval. You cannot vote until approved."
- Stats row (4 cards):
  - Active Elections: 2
  - Elections Voted: 1
  - Upcoming Elections: 3
  - My Vote Receipts: 1
- Section: "Active Elections" — show 2-3 ElectionCard components
- Section: "Recent Activity" — simple list of recent votes with tx hash (truncated)

---

### 5. ElectionsPage.tsx (Voter)
- Header: "Elections" + search input
- Filter tabs: All | Active | Upcoming | Closed
- Grid of ElectionCard components (show 6 dummy cards)
- Each ElectionCard shows:
  - Election title
  - Description (truncated)
  - Status badge (ACTIVE / UPCOMING / CLOSED)
  - Start & end date
  - Candidate count
  - "View Election" button (if UPCOMING or CLOSED)
  - "Vote Now" teal button (if ACTIVE and hasn't voted)
  - "Voted ✓" green badge (if already voted)

---

### 6. VotePage.tsx
- Header: election title + back button
- Election info: description, end time countdown (static text), total candidates
- Section: "Select a Candidate"
- Grid of CandidateCard components (show 3-4 dummy candidates):
  - Candidate name
  - Short description
  - Radio-style selection (clicking card highlights it with teal border + glow)
- "Cast Vote" teal button (disabled until a candidate is selected)
- Warning text: "This action is irreversible. Your vote will be recorded on the blockchain."
- MetaMask icon next to button with text "Your wallet will be prompted to sign this transaction."

---

### 7. ReceiptPage.tsx
- Centered layout
- Large green checkmark icon with glow
- Title: "Vote Successfully Cast!"
- Subtitle: "Your vote has been recorded on the blockchain"
- Receipt card:
  - Election: [name]
  - Candidate: [name]
  - Wallet: 0x1234...5678
  - Transaction Hash: 0xabcd...efgh (with copy icon)
  - Timestamp: March 5, 2026 10:30 AM
  - Block Number: #4829102
- Two buttons: "Verify My Vote" (teal) and "Back to Elections" (outline)
- Note: "Save your transaction hash to verify your vote at any time."

---

### 8. VerifyPage.tsx
- Centered card layout
- Title: "Verify Your Vote"
- Subtitle: "Enter your transaction hash to confirm your vote was recorded"
- Large input: "Enter transaction hash (0x...)"
- "Verify" teal button
- Below (show as static result card):
  - Green verified badge
  - Election name
  - Candidate voted for
  - Wallet address
  - Timestamp
  - Block confirmation count
- Note: "Anyone can verify any vote using its transaction hash. This ensures full transparency."

---

### 9. AdminDashboard.tsx
Layout: Left sidebar (admin version) + main content

**Admin Sidebar:**
- BLOCKVOTE logo + "Admin Panel" label
- Nav items:
  - Dashboard
  - Elections
  - Voters
  - Blockchain Logs
  - Settings
- Bottom: admin wallet address + role badge "ADMIN"

**Main Content:**
- Header: "Admin Dashboard"
- Stats row (4 cards):
  - Total Elections: 5
  - Active Elections: 2
  - Total Voters: 128
  - Pending Approvals: 7
- Section: "Pending Voter Approvals" — table with columns: Name, Email, Wallet, Registered, Actions (Approve / Reject buttons)
- Section: "Active Elections" — 2-3 ElectionCard components with "Manage" button

---

### 10. ManageElectionsPage.tsx (Admin)
- Header: "Manage Elections" + "Create Election" teal button
- Filter tabs: All | Active | Upcoming | Closed
- Table view of elections:
  - Columns: Title, Status, Start Date, End Date, Candidates, Total Votes, Actions
  - Actions: View | Edit | Pause button
- "Create Election" Modal (show as visible on page for design purposes):
  - Title input
  - Description textarea
  - Start Date + Time picker (input type datetime-local)
  - End Date + Time picker
  - "Add Candidates" section — list with "Add Candidate" button
  - Each candidate row: Name input + Description input + remove icon
  - "Create Election" teal button + "Cancel" outline button

---

### 11. ManageVotersPage.tsx (Admin)
- Header: "Manage Voters" + search input
- Filter tabs: All | Pending | Approved | Rejected
- Table:
  - Columns: Name, Email, Wallet Address, Status, Registered Date, Actions
  - Actions per row: Approve (green) / Reject (red) / Revoke (gray)
- Pending voters highlighted with subtle yellow row background

---

### 12. BlockchainLogsPage.tsx (Admin)
- Header: "Blockchain Transaction Logs"
- Filter: by election dropdown + search by tx hash
- Table:
  - Columns: Tx Hash (truncated + copy icon), Election, Candidate, Voter Wallet (truncated), Timestamp, Block
  - Each row has "View on Etherscan" external link icon
- Summary card at top: Total Transactions, Last Block Synced, Contract Address

---

## Shared Components

### ElectionCard.tsx
```
Dark card, teal glow on hover
- Status badge top right
- Election title (bold white)
- Description (muted, 2 lines truncated)
- Row: calendar icon + start/end date
- Row: users icon + candidate count
- Action button (varies by status and role)
```

### CandidateCard.tsx
```
Dark card with radio selection behavior (CSS only)
- Candidate name (bold)
- Description (muted)
- Selected state: teal border + subtle teal background glow
```

### StatsCard.tsx
```
Dark card
- Icon (teal)
- Large number (white, bold)
- Label (muted)
- Optional: subtle trend indicator
```

---

## Routing (App.tsx)
```
/                         → LandingPage
/login                    → LoginPage
/register                 → RegisterPage
/voter/dashboard          → VoterDashboard
/voter/elections          → ElectionsPage
/voter/elections/:id/vote → VotePage
/voter/receipt            → ReceiptPage
/voter/verify             → VerifyPage
/admin/dashboard          → AdminDashboard
/admin/elections          → ManageElectionsPage
/admin/voters             → ManageVotersPage
/admin/logs               → BlockchainLogsPage
```

---

## Important Notes for Cursor
- All data is **hardcoded/dummy** — no API calls, no hooks, no state logic beyond basic UI toggles (like show/hide password, selected candidate highlight)
- Use **Lucide React** for all icons
- Use **Inter font** from Google Fonts
- Every page must use the established dark design system — no white backgrounds anywhere
- Sidebar should be **fixed left**, main content scrollable
- All forms are static — no onSubmit logic
- Mobile responsiveness is **not required** — desktop only for now
- Keep all components in their respective files as per the project structure above
- Use **dummy data inline** in each page (no separate data files needed)
- MetaMask logo: use this SVG inline where needed — the orange fox head icon
