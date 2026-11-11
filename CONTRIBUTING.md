# Contributing to obsidian-recording-importer-core

## Development setup

1. Clone the repo and install dependencies:
   ```bash
   npm install
   ```
2. Install the pre-commit hook once per clone:
   ```bash
   npm run hooks
   ```
   The hook runs `npm run lint` and a full type-check before each commit. It is
   not installed on `npm install`, because a `prepare` script would also run in
   every plugin that installs this package from git.

## Quality gates

Before opening a pull request, run:

```bash
npx tsc --noEmit        # strict type-check
npm run lint            # ESLint (eslint-plugin-obsidianmd), Prettier, submission pre-checks
npm test                # Vitest
npm run knip            # unused files, exports and dependencies
npm run type-coverage   # at least 99%
```

## Working on a plugin and this library together

Link your local clone into the plugin:

```bash
cd obsidian-recording-importer-core && npm link
cd ../<plugin> && npm link obsidian-recording-importer-core
```

Run `npm install` in the plugin to go back to the pinned tag. Never commit a
`file:` or `link:` dependency on this package in a plugin: it builds on your
machine and breaks everywhere else. Release a tag here and pin that instead.

## Coding conventions

- TypeScript strict mode is on. Never use `as any`.
- Nothing service-specific belongs here. Service names, keys, links and error
  classes come from the plugin through `ServiceProfile` and
  `ServiceErrorPolicy`.
- Export a new name from `src/index.ts` only when a plugin needs it.
- No regex lookbehind (`(?<=`, `(?<!`): it stops a plugin loading on iOS before
  16.4. `npm run lint` checks for it.

## Submitting a pull request

1. Create a feature branch off `main`.
2. Add an entry under `## [Unreleased]` in `CHANGELOG.md`.
3. Open a PR against `main`. CI must be green.
