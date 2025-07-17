# supply-block-chain Project File Overview and TypeScript Migration Guide

## Project Structure Overview

### Frontend (React) - JavaScript files to convert to TypeScript

- `src/`
  - `src/setupTests.js`
    - Sets up testing environment with `jest-dom` custom matchers for DOM assertions.
    - Can be renamed to `setupTests.ts` or `setupTests.tsx` and updated for TypeScript.
  
  - `src/context/Web3Context.js`
    - React context provider that manages Web3 connection, Ethereum provider, signer, and contract instance.
    - Handles wallet connection, network switching, and contract interaction.
    - This file is a key part of the frontend UI logic interacting with blockchain.

  - Other React components (not shown in context but typically in `src/components/` or `src/pages/`)
    - All `.js` or `.jsx` files that define UI components should be renamed to `.tsx`.
    - Add appropriate TypeScript typings for props, state, and hooks.

### Blockchain / Smart Contract Deployment Logic - Keep in JavaScript

- `ignition/modules/Lock.js`
  - Uses Hardhat Ignition to define a deployment module for the `Lock` smart contract.
  - Contains blockchain deployment parameters and contract instantiation.
  - This file is part of the backend/deployment logic and **should NOT be converted to TypeScript**.
  - Keep this file as JavaScript to avoid interfering with deployment scripts.

### Configuration and Metadata

- `config.json`
  - Contains network ID, contract address, and other configuration constants used by frontend and backend.
  - Typically JSON, no TypeScript conversion needed.

- `README.md`
  - Documentation for the project.
  - No conversion needed.

---

## Recommended TypeScript Migration Plan for Frontend

1. **Install TypeScript and React types**

```bash
npm install --save typescript @types/node @types/react @types/react-dom @types/jest
```

2. **Rename frontend JavaScript files**

- `src/setupTests.js` → `src/setupTests.ts`
- `src/context/Web3Context.js` → `src/context/Web3Context.tsx`
- All other React `.js` or `.jsx` files in `src/` → `.tsx`

3. **Add `tsconfig.json`**

Create a `tsconfig.json` in the root with appropriate React settings (see example below).

4. **Add TypeScript typings**

- Define interfaces/types for React props, state, and context values.
- Add return types and parameter types for functions.
- Use `ethers` TypeScript types for provider, signer, and contract.

5. **Keep blockchain deployment files unchanged**

- Do NOT rename or convert `ignition/modules/Lock.js`.
- Keep deployment logic in JavaScript to avoid breaking Hardhat Ignition tooling.

---

## Example `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx"
  },
  "include": ["src"]
}
```

---

## Summary

| File/Folder                 | Purpose                                         | TypeScript Migration Recommendation          |
|----------------------------|------------------------------------------------|----------------------------------------------|
| `src/setupTests.js`         | Jest DOM testing setup                          | Rename to `.ts` and add typings              |            |
| Other React components      | UI components                                  | Rename `.js/.jsx` to `.tsx` and add typings  |
| `ignition/modules/Lock.js`  | Smart contract deployment module (Hardhat)    | **Keep as JavaScript, do NOT convert**        |
| `config.json`               | Configuration constants                         | No change needed                              |
| `README.md`                 | Documentation                                  | No change needed                              |

---

DO NOT CHANGE ANY FILES IN /SCRIPTS FOLDER KEEP THEM IN JAVASCRIPT.