# MURI Workspace Rules

Ensure all agents (including Antigravity) follow these coding conventions when contributing to the MURI codebase:

## Coding Conventions
1. **Strict TypeScript**: Ensure type annotations are fully explicit; avoid `any` wherever possible.
2. **File Naming**:
   - UI Components: Use `PascalCase.tsx` (e.g., `Button.tsx`).
   - Utilities, Helpers, Hooks: Use `camelCase.ts` (e.g., `supabaseClient.ts`, `useTheme.ts`).
3. **Styling**: Use Tailwind CSS variables defined in `@/app/globals.css` to respect the eco-friendly sustainability color theme (emerald green primary accents).
4. **Clean Code**: Keep components reusable and small. Avoid features modular files outside `src/components`, `src/hooks`, and `src/lib`.
