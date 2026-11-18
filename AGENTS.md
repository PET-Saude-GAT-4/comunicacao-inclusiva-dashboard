<!-- Next.js manages the block below; Prettier must not touch it. -->
<!-- prettier-ignore-start -->
<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->
<!-- prettier-ignore-end -->

# SAP — Suporte Assistivo ao Paciente (dashboard)

The admin panel of SAP (Suporte Assistivo ao Paciente). It has no database: every read and write goes to the API at `API_URL`. Setup is in [README.md](README.md).

## Toolchain

- Next.js 16 (App Router), React 19, Tailwind CSS 4, zod 4, TypeScript.
- Node 22 and Yarn 4 (the binary is vendored in `.yarn/releases`; use `yarn`, never `npm` or `npx`).
- Jest with React Testing Library and jsdom.

| Command              | Does                                                                                |
| -------------------- | ----------------------------------------------------------------------------------- |
| `yarn dev`           | Starts the development server on port 3000.                                         |
| `yarn build`         | Builds for production. Set `API_URL` first: images are allowed only from that host. |
| `yarn lint`          | Runs ESLint.                                                                        |
| `yarn format`        | Formats every file with Prettier.                                                   |
| `yarn format:check`  | Fails if a file is not formatted.                                                   |
| `yarn typecheck`     | Generates Next's route types and type-checks the project.                           |
| `yarn test`          | Runs the Jest suite once.                                                           |
| `yarn test:watch`    | Reruns the affected tests on save.                                                  |
| `yarn test:coverage` | Runs the suite and writes a report to `coverage/`.                                  |

## Architecture in brief

A form goes page → server action (`src/services/<domain>.ts`, `"use server"`) → API layer (`src/lib/api/<domain>.ts`) → `apiFetch` (`src/lib/api/client.ts`). Pages import only server actions. The session is an httpOnly cookie read on the server. `src/proxy.ts` redirects by session and hides routes by role. Lists are paged and searched on the server. The details, and the reasons behind them, are in [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## What to get right

- **`src/proxy.ts` is Next 16's middleware.** Do not create a `middleware.ts`.
- **The token never reaches the browser.** Only server actions and `src/lib/api` talk to the API; client components call a server action, never `fetch`.
- **`apiFetch` is the only place that calls `fetch`.** It adds the base URL, the token and the error handling, and logs the user out on a 401.
- **Copy the login page** (`src/app/(auth)/login`, `src/services/auth.ts`, `src/lib/api/auth.ts`) when adding a form, rather than inventing a variant. Call `redirect()` outside the `try`, since it works by throwing.
- **Role access lives in one table**, `ROUTE_ACCESS` in `src/config/route-access.ts`. A new restricted route goes there, not in a page check.
- **Never load a whole collection.** List pages use `usePaginatedList`; pickers and modals use `useRemoteSearch`.
- **Pictograms and SignWritings render through `Thumbnail`**, never `next/image` or `<img>` directly. See [docs/UI.md](docs/UI.md).
- **Language.** Code, comments, commits, issues and docs are in English. Everything the user sees, zod messages included, is in Portuguese. Show the user a Portuguese message picked by status code, never the API's own error text.
- **Tests** go in a `__tests__` folder beside the file they cover (`src/utils/__tests__/board.test.ts`), support code in `tests/`, and no test makes a real HTTP call: mock `@/lib/api/client` or `@/lib/api/<domain>`.
- **Each page under `docs/` answers one question.** Whoever opens a page, person or agent, is after one answer and has to read the whole page to find it. When an edit makes a page answer a second question, or brings it to about 400 lines, split it by topic in the same pull request and add the new page to [Where to look next](#where-to-look-next). Pages the pull request does not touch stay as they are.

## Linting and formatting

For every file you create or change:

1. Run `yarn lint --fix` on the changed files and fix what remains by hand. Leave no ESLint error behind, TypeScript rules included.
2. Run `yarn prettier --write` on the changed files. The style is `.prettierrc`, shared with the API and the app.
3. Before opening a pull request, run `yarn lint`, `yarn format:check`, `yarn typecheck`, `yarn test` and `yarn build`. CI runs the same five checks on every pull request into `develop` or `main`, and all five must pass to merge.

## Where to look next

- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — routes, forms to the API, session, paginated lists, tests.
- [docs/UI.md](docs/UI.md) — design tokens, shared components, UI rules.
- [CHANGELOG.md](CHANGELOG.md) — add an `[Unreleased]` entry for every user-visible change.
- The API's [glossary](https://github.com/PET-Saude-GAT-4/comunicacao-inclusiva-api/blob/develop/docs/GLOSSARY.md) — the domain vocabulary.
