# obsidian-recording-importer-core

Shared TypeScript code for Obsidian plugins that import recordings (summaries,
transcripts and attachments) from a recording service into a vault. It holds the
parts every importer needs: the recording model, the note writer, the import
runner, the vault index, managed note blocks and auto-sync scheduling. Each
service plugin supplies its own client and a `ServiceProfile` that names its
frontmatter keys, markers and links.

This is not an Obsidian plugin. It has no manifest and cannot be installed in a
vault. It is a library that plugins bundle.

## Using it

The package ships TypeScript source, not built JavaScript. A plugin depends on
a tagged release through git:

```json
"dependencies": {
	"obsidian-recording-importer-core": "github:ckelsoe/obsidian-recording-importer-core#v0.1.0"
}
```

The plugin's own bundler (esbuild) compiles the source into its `main.js`. The
plugin must also provide `obsidian`, `@codemirror/state` and `@codemirror/view`,
which every Obsidian plugin already has.

```ts
import { NoteWriter, type ServiceProfile } from 'obsidian-recording-importer-core';
```

To upgrade, change the tag and run `npm install`. The changes in each release
are listed in [CHANGELOG.md](CHANGELOG.md).

## License

[MIT](LICENSE)
