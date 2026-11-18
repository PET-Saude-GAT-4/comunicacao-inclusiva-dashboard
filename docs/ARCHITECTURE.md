# Architecture

How the dashboard is put together, and the conventions that keep new code consistent with what is already there. It covers what reading a single file will not tell you; the code itself is the reference for the details.

For the domain vocabulary (board, phrase, term, interaction chain…), see the API's [glossary](https://github.com/PET-Saude-GAT-4/comunicacao-inclusiva-api/blob/develop/docs/GLOSSARY.md).

## Stack

Next.js 16 (App Router) with React 19, Tailwind CSS 4, zod 4 and Yarn 4. The dashboard has no database of its own: every read and write goes to the API at `API_URL`.

## Routes

`src/app` has two route groups. The groups do not show in the URL; each exists only to give its pages their own layout.

| Group             | Pages                                                                                                                                               | Layout                                                                                            |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `(auth)`          | `/login`, `/reset-password`, `/invitation/accept`                                                                                                   | A centred card on the primary colour. No session needed.                                          |
| `(authenticated)` | everything else (`/dashboard`, `/library`, `/boards`, `/phrases`, `/pictograms`, `/sign-writings`, `/terms`, `/management/*`, `/settings`, `/help`) | `Sidebar` + `Header` around the page. It reads the session and redirects to `/login` without one. |

`src/app/page.tsx` only redirects, to `/dashboard` or `/login`.

### What `src/proxy.ts` guards

`proxy.ts` is Next 16's name for what used to be `middleware.ts`. It runs before every page request, apart from Next's static assets, any path with a file extension and any path starting with `api` (the matcher has no slash after it, so `/api-keys` would be skipped too), and does three things:

1. **Public paths with a session** (`/`, `/login`, `/invitation/accept`, `/reset-password`) redirect to `/dashboard`.
2. **Any other path without a session** redirects to `/login`.
3. **A path the session's role may not open** is _rewritten_ to the 404 page, not redirected, so a viewer cannot tell an admin-only route from one that does not exist.

The role rules live in one table, `ROUTE_ACCESS` in `src/config/route-access.ts`. The most specific matching prefix wins, and a route missing from the table is open to any logged-in user. The proxy only checks that the cookie parses and carries a token. Whether the token is still valid is the API's call; see the 401 handling below.

Navigation reads from the same table, so a link is hidden exactly when the proxy would refuse its route:

- `src/config/routes.tsx` — title, subtitle and icon of each top-level route.
- `src/config/navigation.tsx` — the side panel's order and grouping: plain links, and groups that open as a drawer and also drive the page's header tabs or `PillTabs`.

## From a form to the API

Every form follows the same three layers. **The login page is the reference implementation**; copy it rather than inventing a variant.

```
src/app/(auth)/login/page.tsx     "use client" — useActionState(login)
        │  FormData
        ▼
src/services/auth.ts              "use server" — validate, call, translate errors
        │  typed arguments
        ▼
src/lib/api/auth.ts               one function per endpoint, on top of apiFetch
        │
        ▼
src/lib/api/client.ts             apiFetch — URL, headers, token, errors
```

**Page.** A client component calls `useActionState(action, undefined)` and renders `state.errors.<field>[0]` under each input and `state.message` for the form as a whole. `pending` disables the submit button.

**Server action (`src/services/<domain>.ts`).** It is marked `"use server"` and is the only layer pages import. It:

1. validates the `FormData` with the domain's zod schema (`safeParse`). On failure it returns `{ errors: flattenError(error).fieldErrors }`, so the messages come straight from the schema;
2. calls `src/lib/api/<domain>.ts`;
3. turns an `ApiError` into a message in Portuguese, picked by `status` (401, 403, 409…). The API's own text is in English and meant for developers, so it is not shown as is;
4. calls `redirect()` _outside_ the `try`. `redirect` works by throwing, and a `catch` around it would swallow it.

Actions that are not forms (delete, publish, reorder…) return `ActionResult` (`{ success, error? }` in `src/types/common.ts`) and call `revalidatePath` on success.

**API layer (`src/lib/api/<domain>.ts`).** It knows only paths, methods and response shapes. It unwraps the response (`{ pictogram }` → the pictogram) and throws when an endpoint that must return a body returns none.

**`apiFetch`.** It is the only place that calls `fetch`. It:

- prefixes `process.env.API_URL`;
- sends `Authorization: Bearer <token>` from the session cookie;
- sets `Content-Type: application/json`, except for `FormData` bodies (file uploads), where the browser has to set the multipart boundary;
- on a **401** from anything outside `/auth/*`, deletes the session and redirects to `/login`. An expired token therefore logs the user out from wherever they are, while a wrong password on `/auth/login` stays an ordinary error for the action to show;
- throws `ApiError(status, body)` for any other non-2xx response, and returns `undefined` for an empty body.

### Session

`src/utils/session.ts` is `server-only`. The session is one httpOnly cookie, `auth-token`, holding `SessionPayload` (`token`, `uuid`, `email`, `role`) as JSON for 24 hours, and `secure` in production. Pages and client code that need the current user call `getSessionUser()` from `src/services/auth.ts`, which leaves the token out.

### Where things live

| Folder           | Holds                                                                                                                                                         |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/types`      | One file per domain: API shapes (`*Output`, `*ListItem`), form states (`*FormState`), and `common.ts` (`ActionResult`, `ListQuery`, `PageMeta`, `Paginated`). |
| `src/schemas`    | zod schemas for forms, with the user-facing messages in Portuguese.                                                                                           |
| `src/services`   | Server actions, one file per domain.                                                                                                                          |
| `src/lib/api`    | HTTP calls, one file per domain, plus `client.ts`.                                                                                                            |
| `src/utils`      | Pure helpers (`board.ts`, `phrase-visibility.ts`, `term.ts`, `text.ts`) and `session.ts`.                                                                     |
| `src/hooks`      | Client hooks: lists, drag reordering, author lookups, unsaved-changes guard.                                                                                  |
| `src/config`     | Route access, route display and navigation.                                                                                                                   |
| `src/components` | Shared UI (see [UI.md](UI.md)). Components used only inside the logged-in area sit in `src/app/(authenticated)/components`.                                   |

## Paginated lists

The API pages every list: `?page=&pageSize=&q=` plus per-endpoint filters, built by `listQueryString` in `src/lib/api/client.ts`. It answers with the items under the resource's own key and a `meta` beside them, which `Paginated<K, T>` types (`Paginated<"pictograms", PictogramListItem>`). Nothing loads a whole collection: search happens on the server.

There are two hooks, for two situations:

- **`usePaginatedList`** — a list page (`/pictograms`, `/boards`, `/management/users`…). Page, search and filters live **in the URL**, so a reload, a shared link or the back button returns to the same view. It owns the selection and drops it whenever the view changes, so a bulk delete never reaches rows the user can no longer see. It reads `useSearchParams`, so the page wraps its content in `<Suspense>`. It is rendered with `ListToolbar`, then `Table` or a card grid with `ListStatus`, then `Pagination`.
- **`useRemoteSearch`** — a list inside a picker or a modal (`AssetPicker`, `BoardPicker`, `PhrasePicker`, `TermPicker`). State stays in the component, pages are **appended** as the user scrolls (`InfiniteList`), and a new search starts again from page 1. Because the API pages by offset, the next request starts from the number of items on screen, so removing one does not skip the item that moves up.

The page fetches through the domain's server action (`getPictogramPage` in `src/services/pictograms.ts`), so the token never reaches the browser.

## Tests

Jest, with Next's built-in config (`next/jest`), React Testing Library and jsdom. Configuration is in `jest.config.ts`.

- **Where a test goes.** In a `__tests__` folder beside the file it covers, named after it: `src/utils/board.ts` is tested by `src/utils/__tests__/board.test.ts`. Jest only looks for tests there.
- **Support code** lives under `tests/`, outside `src`, and is imported through the `@test/` alias. `tests/unit/setup.ts` loads the `jest-dom` matchers for every suite; `tests/unit/zod.ts` turns a zod result into the per-field messages a form would show. This is the same layout as the API and the app.
- `next/jest` stubs styles, images, `next/font` and `server-only`, and the `@/` alias resolves as it does in the app.
- **No test makes a real HTTP call.** Code that reaches the API is tested with the API layer mocked: `jest.mock("@/lib/api/client")` and a mocked `apiFetch`, or `jest.mock("@/lib/api/<domain>")` when testing a server action. Server-only modules that read the request mock `next/headers` (see `src/utils/__tests__/session.test.ts`).
- jsdom has no layout. A component test checks the mechanism (classes, inline sizes, roles), not measured pixels.

| Command              | Does                                          |
| -------------------- | --------------------------------------------- |
| `yarn test`          | Runs the suite once.                          |
| `yarn test:watch`    | Reruns the affected tests on save.            |
| `yarn test:coverage` | Runs once and writes a report to `coverage/`. |
