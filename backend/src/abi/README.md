# Smart contract ABI

Place your compiled contract ABI here:

- **File:** `VotingSystem.json`
- **Full path:** `backend/src/abi/VotingSystem.json`

From Remix: Compilation Details → ABI → copy the JSON and save as `VotingSystem.json`.

`config/contract.ts` imports it as:

```ts
import VotingSystemABI from '../abi/VotingSystem.json'
```
