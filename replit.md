# GameDravo

A modern web-based gaming platform that aggregates and hosts HTML5 games from multiple catalogs (OnlineGames and GamePix). Features a premium interactive UI, user profiles, social features, and an admin backend.

## Tech Stack

- **Frontend**: React 19 + TypeScript, Tailwind CSS 4, Framer Motion, React Router 7
- **Backend**: Express.js (Node.js), PostgreSQL via Drizzle ORM
- **Auth**: Replit OIDC Auth (openid-client + passport)
- **AI**: Google Gemini AI (via Replit integration)

## Development

Start the app with the **Start application** workflow (runs `tsx server.ts` on port 5000).

Push database schema changes with:
```
npm run db:push
```

## User Preferences

- Keep existing code structure and conventions
