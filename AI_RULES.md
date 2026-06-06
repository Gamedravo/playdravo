# AI Rules

## Tech Stack
- React 19 with TypeScript is the primary frontend stack.
- Vite 6 powers development and production builds.
- React Router DOM 7 handles client-side routing; keep route definitions centralized in `src/App.tsx`.
- Tailwind CSS 4 is the styling system; prefer utility classes over custom CSS.
- Firebase is used for authentication and client-side Firebase integrations.
- Express is used for the production Node server and server-side delivery needs.
- `lucide-react` provides icons throughout the app.
- `react-helmet-async` manages page metadata and SEO tags.
- `sonner` is the toast/notification library.
- Source code lives in `src/`, with pages in `src/pages/`, components in `src/components/`, hooks in `src/hooks/`, and shared utilities in `src/lib/` or `src/utils/`.

## Library and Implementation Rules
- Use TypeScript for all application code and keep types explicit at public boundaries such as props, utility exports, and context values.
- Use React Router for navigation and links; avoid hard browser navigations unless leaving the app.
- Use Tailwind CSS for layout, spacing, color, typography, responsive behavior, and component styling.
- Use existing components from `src/components/` before creating new ones; place reusable UI in `src/components/` and page-specific screens in `src/pages/`.
- Use `lucide-react` for icons instead of inline SVGs or additional icon packages.
- Use `sonner` for user-facing toast messages and avoid adding another toast library.
- Use Firebase helpers from the existing Firebase/auth modules rather than initializing Firebase in multiple places.
- Use `react-helmet-async` or the existing SEO component for page titles, descriptions, canonical URLs, and structured metadata.
- Keep data transformation, curation, and shared business logic in `src/lib/` or `src/utils/`; keep React components focused on rendering and interaction.
- Do not introduce new dependencies unless an existing library cannot reasonably solve the problem.
