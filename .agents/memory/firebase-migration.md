---
name: Firebase to PostgreSQL migration
description: All Firebase/Firestore browser calls replaced with secure REST API through Express backend using Replit PostgreSQL
---

**What was done:** Replaced all Firebase/Firestore calls in App.tsx and component files with REST API calls via `src/lib/api.ts`.

**Backend:** `server/routes/api.ts` — full CRUD routes for: gameStats, gameRatings, gameMods, gameRequests, bugReports, contactMessages, gameReports, chatMessages.

**Schema:** `shared/models/auth.ts` has all new Drizzle ORM tables. Run `npm run db:push` after any schema changes.

**Auth:** Replit Auth replaces Firebase Auth. `src/hooks/useReplitAuth.ts` polls `/api/auth/user`. Login/logout via `/api/login` and `/api/logout`.

**Firebase stubs still present:** `src/firebase.ts`, `src/lib/authErrors.ts`, `src/lib/oauthSignIn.ts`, `src/lib/authEmailConfig.ts` — these are unused by the main app but left in place. They can be removed in a future cleanup.

**Why:** Replit migration guardrails require all external service calls (Firebase) to go through the secure backend. Browser-side Firebase SDK calls expose credentials and bypass server-side security.
