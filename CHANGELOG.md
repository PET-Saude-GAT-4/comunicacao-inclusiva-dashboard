# Changelog

All notable changes to the dashboard are recorded here.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project uses [Semantic Versioning](https://semver.org/spec/v2.0.0.html). New entries go under `[Unreleased]`, written from the conventional-commit subjects of the changes being merged.

## [Unreleased]

### Added

- **README and AGENTS.md.** A README that takes a new contributor from a fresh clone to a running dashboard, a committed `.env.local.example`, and an AGENTS.md with the project's rules (replacing `.agents/rules`).
- **CI.** Every pull request into `develop` or `main` runs lint, format, types, test and build, each as a required check, and the same five run again on `develop` and `main` after every merge. Prettier formats the codebase (`yarn format`, `yarn format:check`), and `yarn typecheck` type-checks the project, Next's route types included. Node 22 is pinned in `.nvmrc`.

## [0.1.0] - 2026-11-17

The first tagged release, summarising what the dashboard offers today. The Painel de Controle (`/dashboard`), Configurações (`/settings`) and Ajuda (`/help`) pages are still placeholders.

### Added

- **Accounts.** Log in with email and password; set a password from an invitation link, and resend the invitation from the login page when the account is not yet confirmed; recover a forgotten password by email.
- **Access by role.** `super_admin`, `admin` and `viewer` see only the routes their role allows; any other route answers as not found. An expired session returns to the login page.
- **Navigation.** A collapsible side panel grouping pages into drawers, with header tabs or pill tabs to switch between a group's pages.
- **Library.** Every role can browse published boards (common or emergency) and phrases listed in the library, with search and a board type filter, and open read-only views of each.
- **Boards.** Create boards, choose and change their type, add, remove and reorder terms, and publish or unpublish them. Super admins see each board's author.
- **Phrases.** Build a phrase as an ordered sequence of terms, set its visibility (draft, hidden, listed in the library), and author its interactions.
- **Interaction chains.** Create, edit and remove the chains a board or a phrase triggers.
- **Pictograms, SignWritings and terms.** Upload pictograms and SignWritings, combine them into terms, and see each part badged with the terms that use it.
- **Management.** Invite and remove users, and create and remove roles, professions and specialities.
- **Lists.** Every list is paged and searched on the server, with page, search and filters kept in the URL; pickers search the server and load more as they scroll.
- **Documentation.** `docs/ARCHITECTURE.md`, `docs/UI.md` and this changelog.
- **Tests.** A Jest and React Testing Library suite (`yarn test`) covering the form schemas, the helpers in `src/utils` and the shared image components.

[Unreleased]: https://github.com/PET-Saude-GAT-4/comunicacao-inclusiva-dashboard/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/PET-Saude-GAT-4/comunicacao-inclusiva-dashboard/releases/tag/v0.1.0
