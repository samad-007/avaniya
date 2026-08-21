# Technical Specification: Next.js Runtime Migration to Bun 1.4 on Vercel

> **Location**: `docs/specs/bun-1.4-vercel-migration.md`  
> **Status**: Ready for Implementation  
> **Triage Label**: `ready-for-agent`

---

## Problem Statement

The Avaniya real estate asset and liquidity tracking engine generates data-dense financial models, multi-tab Excel workbooks with live `SUMIFS` formulas, multi-page audit PDFs, and MongoDB aggregations across commercial and personal properties. On traditional V8/Node.js serverless runtimes, cold starts and CPU-bound Excel/PDF document streaming can experience latency overhead. The team wants to leverage Bun 1.4's high-speed JavaScriptCore engine on Vercel without discarding the existing Next.js App Router architecture, breaking existing database connections, or forcing a risky multi-week rewrite.

---

## Solution

Enable Bun 1.4 as the first-class build and execution runtime on Vercel via a root deployment configuration (`vercel.json`). This ensures Next.js Server Components, App Router API Route Handlers, and serverless compute execute natively on Bun 1.4 while maintaining 100% mathematical precision and backward compatibility with local developer workflows.

---

## User Stories

1. As a super admin user, I want the Avaniya web application to boot with sub-second cold start latency on Vercel, so that I can immediately access real-time liquidity numbers without waiting for serverless container warmups.
2. As a real estate developer, I want multi-tab Excel (`.xlsx`) exports with live `SUMIFS` formulas to stream rapidly, so that my audit downloads finish without timing out.
3. As a financial auditor, I want multi-page Executive PDF statements to compile efficiently, so that I can export portfolio health records on demand.
4. As a tenant user, I want authentication and session verification (`/api/auth/me`) to validate JWT tokens swiftly on Bun's native Web Cryptography engine, so that dashboard navigation is instant.
5. As a developer, I want the codebase to maintain universal compatibility across both local Node.js/npm environments and remote Bun 1.4 deployments on Vercel, so that team members without local Bun binaries can develop seamlessly.
6. As a DevOps engineer, I want the Vercel deployment pipeline to automatically detect and run Bun 1.4 via `vercel.json`, so that deployment builds are reproducible and automated.
7. As a QA engineer, I want the financial formula engine test suite to run against all public calculation seams with 100% accuracy, so that no accounting regressions occur under the Bun runtime.

---

## Implementation Decisions

1. **Vercel Runtime Configuration**:
   - Establish `vercel.json` in the root repository directory declaring `"bunVersion": "1.4.x"`.
   - Explicitly declare the framework as `"nextjs"` and configure standard build and install commands.

2. **Package Script Compatibility**:
   - Maintain standard npm/bun-compatible lifecycle scripts in `package.json` (`build`, `dev`, `start`, `test`, `lint`) so both `npm run test` and `bun test` / `bun run test` execute the exact same test harnesses.

3. **Runtime Engine Compatibility Preservation**:
   - Keep standard Web Standard `Request` and `Response` patterns across all route handlers (`/api/transactions`, `/api/properties`, `/api/export/*`, `/api/auth/*`).
   - Preserve Mongoose Atlas connection caching and connection options across warm function invocations.

---

## Testing Decisions

1. **What Makes a Good Test**:
   - Tests must verify external mathematical and export behavior through public module interfaces, rather than testing runtime engine internals.
   - Assertions must compare computed portfolio outputs against worked spreadsheet examples from `Land_Business_Tracker.xlsx` and `New Apartment Expense Tracker.xlsx`.

2. **Modules Tested**:
   - Mathematical Formula Engine (`tests/formulaEngine.test.ts`): Commercial liquidity, property outlays, pending seller liabilities, personal milestone investments, and bank/cash reconciliations.
   - Document Export Engine: Verification that Excel `.xlsx`, PDF, and CSV streams generate valid byte arrays with zero circular formula errors.
   - Next.js Production Build: Full compilation verification via Next.js compiler.

3. **Prior Art**:
   - Existing automated suite at `tests/formulaEngine.test.ts` running via `tsx` / Node / Bun.

---

## Out of Scope

- Rewriting route handlers from Next.js App Router to `Bun.serve()` or standalone microframeworks (Elysia/Hono).
- Migrating database drivers away from Mongoose to custom native drivers.
- Changing frontend UI components, layouts, or visual dark theme tokens.

---

## Further Notes

- Vercel automatically manages Bun 1.4 patch updates within the `"1.4.x"` semver constraint.
- Local development continues to support standard `npm run dev` / `npm run test` or `bun dev` / `bun test` interchangeably.
