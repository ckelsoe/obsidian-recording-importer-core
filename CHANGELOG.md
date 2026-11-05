# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0] - 2026-11-04

### Added

- Initial extraction of the service-neutral modules from the Plaud Importer
  plugin: the recording model, `ServiceProfile`, import core and runner, note
  writer, managed blocks and their editor view, vault index, stable keys, debug
  logger, auto-sync and its runner, session-expiry decisions, list paging and
  migration planning.
- `src/index.ts`, the public entry point, exporting the names the plugins use.
- `folderToken(profile)`: the folder template token, `{{<keyPrefix>-folder}}`,
  so each service fills its own token in subfolder and frontmatter templates.
- The modules' tests, run against a test copy of the Plaud profile, and a
  contract test that drives a second, non-Plaud service end to end.
