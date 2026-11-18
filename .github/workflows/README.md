# CI

## What runs, and when

[`ci.yml`](ci.yml) runs five jobs: `lint`, `format`, `types`, `test` and `build`. Their names are the required status checks of `main` and `develop`, so renaming a job breaks branch protection.

- **On every pull request into `develop` or `main`.** All five must pass to merge. A new push to the pull request cancels its run in progress.
- **On every push to `develop` or `main`**, that is, after every merge. Two pull requests can each pass against an older `develop` and still break it together; this run is what shows it. Each merge gets its own run, and none of them is cancelled.

The steps every job shares (Corepack, Node from `.nvmrc`, `yarn install`) live in the composite action [`../actions/setup`](../actions/setup/action.yml).

## Why actions are pinned to a commit

Every external action is referenced by a full 40-character commit SHA, with its version as a comment:

```yaml
- uses: actions/checkout@11d5960a326750d5838078e36cf38b85af677262 # v4.4.0
```

A tag such as `v4` can be moved to another commit by whoever controls the action's repository, which would change the code that runs in the required checks without any change here. A commit SHA cannot move.

The repository enforces this: Settings → Actions → General → _Require actions to be pinned to a full-length commit SHA_. A workflow that references an external action by tag fails to start. Local actions (`uses: ./.github/actions/setup`) are not affected.

## Who updates the pins

Dependabot, configured in [`../dependabot.yml`](../dependabot.yml). Once a week it checks the actions used here and in `.github/actions/setup`, and opens a pull request into `develop` that moves the SHA and the version comment together, with a `ci:` commit. That pull request goes through the same CI as any other; review the action's release notes before merging it.

To add an action by hand, look up the commit of the release tag (`git ls-remote --tags https://github.com/<owner>/<action>.git`) and write it in the same form.
