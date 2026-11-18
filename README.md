# Comunicação Inclusiva — Dashboard

The admin panel of Comunicação Inclusiva. Here the team manages the content the app shows: pictograms and SignWritings, the terms built from them, the boards that group terms and the phrases made from them, plus the users, roles and professions that can access it. The dashboard has no database of its own; every read and write goes to the [Comunicação Inclusiva API](https://github.com/PET-Saude-GAT-4/comunicacao-inclusiva-api).

## Requirements

- **Node 22.**
- **Yarn 4.** The repository ships its own Yarn binary (`.yarn/releases`), so any `yarn` on your machine runs the right version.
- **A running API.** By default the dashboard expects it at `http://localhost:8080`.

## Getting started

1. Start the API. In a clone of [comunicacao-inclusiva-api](https://github.com/PET-Saude-GAT-4/comunicacao-inclusiva-api), create its `.env` from `.env.example` (set `ADMIN_PASSWORD` there), then:

   ```bash
   yarn docker:dev            # API on http://localhost:8080, with PostgreSQL and Mailpit
   yarn prisma:migrate:dev    # create the tables
   yarn prisma:seed           # create the admin account, admin@admin.admin with ADMIN_PASSWORD
   ```

2. In this repository, install the dependencies and point the dashboard at the API:

   ```bash
   yarn install
   cp .env.local.example .env.local   # API_URL=http://localhost:8080
   ```

3. Run the development server, open [http://localhost:3000](http://localhost:3000) and log in with the admin account.

   ```bash
   yarn dev
   ```

## Commands

| Command | Does |
|---|---|
| `yarn dev` | Starts the development server on port 3000. |
| `yarn build` | Builds for production. Needs `API_URL` set. |
| `yarn start` | Serves the production build. |
| `yarn lint` | Runs ESLint. |
| `yarn format` | Formats every file with Prettier. |
| `yarn format:check` | Fails if a file is not formatted. |
| `yarn typecheck` | Type-checks the project (`tsc --noEmit`). |
| `yarn test` | Runs the Jest suite once. |
| `yarn test:watch` | Reruns the affected tests on save. |
| `yarn test:coverage` | Runs the suite and writes a report to `coverage/`. |

## Layout

| Folder | Holds |
|---|---|
| `src/app` | Routes (App Router): `(auth)` for the pages without a session, `(authenticated)` for the rest. |
| `src/proxy.ts` | Redirects by session and hides routes the user's role may not open. |
| `src/services` | Server actions, one file per domain — the only layer pages import. |
| `src/lib/api` | HTTP calls to the API, one file per domain, on top of `client.ts`. |
| `src/schemas` | zod schemas for forms. |
| `src/types` | API shapes and form states, one file per domain. |
| `src/components` | Shared UI components. |
| `src/hooks` | Client hooks (paginated lists, remote search, drag reordering…). |
| `src/config` | Route access, route display and navigation. |
| `src/utils` | Pure helpers and the session cookie. |
| `tests` | Support code for the Jest suite; the tests themselves sit in `__tests__` folders beside the code. |

## Documentation

- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — routes, the path from a form to the API, sessions, paginated lists, tests.
- [docs/UI.md](docs/UI.md) — design tokens, shared components and UI rules.
- [CHANGELOG.md](CHANGELOG.md) — what changed in each version.
- [AGENTS.md](AGENTS.md) — the rules for anyone, person or agent, writing code here.
- The domain vocabulary (board, phrase, term, interaction chain…) is in the API's [glossary](https://github.com/PET-Saude-GAT-4/comunicacao-inclusiva-api/blob/develop/docs/GLOSSARY.md).

## Contributing

- Branch from `develop` (`feat/…`, `fix/…`, `docs/…`, `chore/…`).
- Write commits as [Conventional Commits](https://www.conventionalcommits.org/) (`feat: …`, `fix: …`, `docs: …`).
- Open pull requests into `develop`. CI runs lint, format, types, test and build on each one, and all five must pass to merge.
- Code, comments, commits, issues and documentation are in English; text shown to users is in Portuguese.
