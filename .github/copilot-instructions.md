# Copilot instructions for obsidian-recording-importer-core

## What this repository is

A TypeScript library shared by the Obsidian recording-importer plugins (Plaud Importer and Comu Importer). It is not an Obsidian plugin. It has no `manifest.json`, no `main.js` and no build step.

- It ships TypeScript source. `package.json` points `main`, `types` and `exports` at `src/index.ts`.
- Plugins depend on a tagged release through git, for example `github:ckelsoe/obsidian-recording-importer-core#v0.2.0`. Each plugin's esbuild compiles the source into its own `main.js`.
- `obsidian`, `@codemirror/state` and `@codemirror/view` are peer dependencies. The consuming plugin provides them.
- Each plugin supplies a `ServiceProfile` (`src/service-profile.ts`) and a `ServiceErrorPolicy` (`src/import-core.ts`). These carry every service name, key prefix, link and error class.
- Main modules: `note-writer.ts` (`NoteWriter`), `import-runner.ts` (`runImport`), `import-core.ts`, `vault-index.ts`, `managed-block.ts`, `managed-marker-view.ts`, `auto-sync.ts`, `auto-sync-runner.ts`.
- `src/index.ts` is the whole public surface.

## Build, lint, test

```bash
npx tsc --noEmit        # strict type-check
npm run lint            # eslint (zero warnings), prettier --check, submission pre-check, marketplace type-check
npm test                # Vitest
npm run knip            # unused files, exports and dependencies
npm run type-coverage   # at least 99%
```

All must pass. There is no `build` script: the consumers build.

## Hard rules

- Never `eslint-disable` an `obsidianmd/*` rule. This code ships inside marketplace plugins and is scanned with them.
- No `as any`. No non-null assertions (`x!`); tests use `at()` / `defined()` from `__tests__/helpers/checked.ts`.
- No regex lookbehind (`(?<=`, `(?<!`). It stops every consuming plugin loading on iOS before 16.4.
- No bare `moment` imported from `obsidian`. Use `Date`/`Intl`.
- No `innerHTML`/`outerHTML` writes, no inline styles, no `document.createElement`. Popout-safe DOM only.
- No Node built-ins. The consuming plugins run on mobile.
- Writes to an existing note use `vault.process(file, fn)`, never `read` then `modify`.
- Tests use `vi.*`, not `jest.*`. Never remove, skip or weaken a test to make CI pass.
- No em dashes in prose or comments. README is public: no CI or release internals.

## Library-specific pitfalls

- Nothing service-specific belongs in new code. Service names, keys, links, messages and error classes come through `ServiceProfile` and `ServiceErrorPolicy`.
- Never hard-code a frontmatter key, marker or tag. Derive it from `profile.keyPrefix`, as `managedMarkers` does.
- Names derived from `keyPrefix` are stored in users' notes. A change to how they are built breaks every existing note for every service.
- New `ServiceProfile` fields are optional and default to the current behavior. `protectUnownedNotes` and `keepLeadingSummaryHeading` are the pattern. A required field or a changed default is a breaking change for every consumer.
- Export a new name from `src/index.ts` only when a plugin imports it. knip flags unused exports.
- Removing or renaming an export breaks consumers on their next tag bump. Note it in `CHANGELOG.md`.
- No `prepare` script. It would run in every plugin that installs this package from git. The pre-commit hook installs through `npm run hooks`.
- A plugin must never commit a `file:` or `link:` dependency on this package. Pin a released tag.
- Code inside the managed block helpers edits only the region between the markers. User text outside them must survive.
- Every `CHANGELOG.md` change goes under `## [Unreleased]`.
