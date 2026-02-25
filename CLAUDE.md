# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server (port 3000)
npm run build        # Production build (clears .next cache)
npm run type-check   # TypeScript type checking
npm run lint         # ESLint on src/
npm run lint:fix     # ESLint with auto-fix
npm run format:fix   # Prettier format + lint fix
```

There is no test runner configured in this project.

## Architecture Overview

This is a Brazilian occupational health & safety (SST) management SaaS platform. It is a Next.js app with a dual-codebase structure: legacy code in `src/` and a newer migration in `src/@v2/`.

**Core tech stack:** Next.js 16 + React 19, TypeScript (strict), MUI v5, Redux Toolkit + React Query v5, Firebase auth, Axios, React Hook Form + Yup, Emotion/styled-components.

### Page Routing

Pages use the `.page.tsx` extension (configured in `next.config.js`). Main routes are under `src/pages/dashboard/empresas/[companyId]/` with sub-routes for all major features: `hierarquia/`, `riscos/`, `exames/`, `cat/`, `esocial/`, `formularios/`, `documentos/`, `plano-de-acao/`, etc.

### State Management

Three layers of state:
1. **Redux** — global UI state (modals, sidebar, tree operations, unsaved changes). Store slices in `src/store/reducers/`.
2. **React Query (TanStack)** — all server/API state. Custom hooks in `src/core/services/hooks/`.
3. **Context API** — `AuthContext` (auth state + Firebase) and `SidebarContext`.

Redux Persist is used to cache document state across reloads.

### Authentication

Firebase OAuth (Google) + JWT cookies (`nextauth.token`, `nextauth.refreshToken`). The Axios instance in `src/core/services/api.ts` handles automatic token refresh on 401 responses. Auth logic lives in `src/core/contexts/AuthContext.tsx`.

### Component Structure

Atomic design pattern: `atoms` → `molecules` → `organisms`. Complex business logic lives in organism components. Modals are rendered via a portal in the layout (`src/layouts/default/modal/`) and opened/closed via Redux dispatch.

### Data Fetching Pattern

Custom hooks wrap React Query:
- Queries: `useQuery*` naming in `src/core/services/hooks/`
- Mutations: `useMut*` naming in same directory
- API client factory in `src/core/services/apiClient.ts`

### Layout Structure

`src/layouts/default/` — top-level layout with providers (Redux, React Query, Auth, Theme, Snackbar), global loading screen, modal portal, and KBar command palette.

`src/layouts/dashboard/` — authenticated dashboard layout with sidebar and header.

### `@v2` Migration

`src/@v2/` is an in-progress refactor. It contains its own `components/`, `services/`, `hooks/`, `forms/`, `context/`, `types/`, `models/`, and `pages/` directories. New features should prefer `@v2/` patterns when possible.

### TypeScript Imports

`tsconfig.json` sets `baseUrl: "src"`, so imports resolve from `src/` without relative paths (e.g., `import { X } from 'core/services/api'`).

### Polyfills

`src/polyfills/` contains React 19 compatibility patches (specifically `findDOMNode` for draft-js). This is imported first in `src/pages/_app.page.tsx`.

## Key Conventions

- **Styling:** Emotion CSS-in-JS + MUI theming. Use MUI's `sx` prop or `styled()` from `@emotion/styled`.
- **Forms:** React Hook Form + Yup validation schemas. Form schemas live in `src/core/utils/`.
- **Enums:** Route names, modal names, and API endpoints are defined as enums in `src/core/enums/`.
- **Dates:** Day.js with Portuguese (`pt-br`) locale.
- **Brazilian utilities:** `br-utils` package for CPF/CNPJ/CEP formatting.
