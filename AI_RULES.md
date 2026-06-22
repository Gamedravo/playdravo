# AI Rules

## Tech Stack
- Build the app with React and TypeScript.
- Use Vite as the development/build tooling for the frontend.
- Use React Router for routing, and keep route definitions in `src/App.tsx`.
- Keep all application source code inside the `src/` directory.
- Put pages in `src/pages/` and reusable components in `src/components/`.
- Use Tailwind CSS for layout, spacing, colors, typography, and responsive styling.
- Prefer shadcn/ui components for common UI primitives and patterns.
- Use `lucide-react` for icons.
- Keep the default/main page in `src/pages/Index.tsx` and update it whenever new visible components should appear.

## Library and Code Rules
- Use shadcn/ui components whenever they fit the requested UI; do not edit shadcn/ui source files directly.
- Create custom components in `src/components/` when shadcn/ui does not provide the exact behavior or layout needed.
- Style custom UI with Tailwind classes instead of separate CSS files unless global styling is truly required.
- Use React Router APIs for navigation and page routing rather than manual URL handling.
- Use TypeScript types for component props, data structures, and reusable logic.
- Use `lucide-react` icons instead of image-based icons or custom SVGs when an existing icon fits.
- Keep implementations simple and focused; avoid adding new dependencies unless the requested feature clearly requires them.
- Make sure new visible components are imported into a routed page, usually `src/pages/Index.tsx`, so they appear in the app preview.
