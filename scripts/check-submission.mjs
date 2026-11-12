// Pre-submission guard for Obsidian's automated marketplace review.
//
// This library ships no plugin of its own, but its source is bundled into store
// plugins, so it must meet the same review rules. Checks the ones the local
// eslint plugin (eslint-plugin-obsidianmd) does NOT cover but the online
// developer-dashboard preview scan enforces. The manifest, bundle and
// styles.css checks the plugins run are left out: a library has none of those
// files. This is a PRE-FILTER; each consuming plugin's preview scan is the gate.
//
// Exits non-zero on any finding so it can chain into `npm run lint` and CI.

import { readdirSync, readFileSync } from "node:fs";
import ts from "typescript";

const findings = [];

// Forbid suppressing any obsidianmd/* lint rule. Obsidian's developer-dashboard
// scan rejects disabling its rules, and local eslint cannot report its own
// suppressions (an `// eslint-disable obsidianmd/...` reads as zero local errors
// but fails the dashboard), so this guard scans source for them and fails the
// build. Comply with the rule (rename, restructure) instead of disabling it.
const CODE_EXT = /\.(ts|mts|cts|tsx|js|mjs|cjs)$/;
const SKIP_DIRS = new Set(["node_modules", ".git", "coverage", "scripts"]);
// Anchored to a comment opener (// or /*) so prose that merely mentions
// "eslint-disable" is not flagged; eslint only honors directives at a comment's start.
const DISABLE_OBSIDIANMD = /(?:\/\/|\/\*)\s*eslint-disable(?:-next-line|-line)?[^\n]*\bobsidianmd\//;
// Every eslint directive comment must carry a `-- description` (the dashboard
// enforces eslint-comments/require-description, which local eslint does not). A
// directive line is compliant only if it also contains a `--` separator.
const ESLINT_DIRECTIVE = /(?:\/\/|\/\*)\s*eslint-(?:disable|enable)(?:-next-line|-line)?\b/;

// Regex lookbehind. `(?<=` and `(?<!` are a PARSE error in JavaScriptCore before
// iOS 16.4, not a runtime one: an affected phone fails to load the plugin at all
// rather than mis-handling one note. Plugins that are not desktop-only ship to
// those devices, and esbuild targets es2018, which does not downlevel lookbehind,
// so one written in source ships verbatim. eslint-plugin-obsidianmd has a
// regex-lookbehind rule, but it is not in the `recommended` preset this repo
// uses, so nothing else in the lint chain catches it; this scan does.
//
// Named capture groups are `(?<name>` and are fine, so only the two lookbehind
// forms match.
const LOOKBEHIND = /\(\?<[=!]/;
const LOOKBEHIND_WHY =
	"regex lookbehind is a parse error in JavaScriptCore before iOS 16.4, so the plugin will not load at all on those devices. Rewrite the pattern as a scan.";

// Type-asserting to Window (`as Window` or `as unknown as Window`) silences the
// type system around a global instead of using Obsidian's activeWindow /
// activeDocument or proper typing. A past PR had exactly this assertion approved
// by an AI reviewer even though the repo bans it; the dashboard scan cannot see
// it, so encode it here as a deterministic gate. Comment lines are blanked
// (uses `code`), so the ban documented in a comment is not itself flagged.
const WINDOW_ASSERT = /\bas\s+(?:unknown\s+as\s+)?Window\b/;
const WINDOW_ASSERT_WHY =
	"do not type-assert to Window (`as Window`); use Obsidian's activeWindow / activeDocument or proper typing instead.";

function* walkCode(dir) {
	for (const entry of readdirSync(dir, { withFileTypes: true })) {
		const path = `${dir}/${entry.name}`;
		if (entry.isDirectory()) {
			if (!SKIP_DIRS.has(entry.name)) yield* walkCode(path);
		} else if (CODE_EXT.test(entry.name)) {
			yield path;
		}
	}
}

// Comments blanked, line numbers preserved. The two eslint-directive rules
// above READ comments and so want the raw line; the lookbehind and
// Window-assertion scans must not, or they flag a comment that quotes the
// banned syntax to explain the ban (e.g. this file).
function withoutComments(source) {
	return source
		.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "))
		.split(/\r?\n/)
		.map((line) => line.replace(/\/\/.*$/, ""));
}

for (const file of walkCode(".")) {
	const source = readFileSync(file, "utf8");
	const lines = source.split(/\r?\n/);
	const code = withoutComments(source);
	lines.forEach((line, index) => {
		const where = `${file.replace(/^\.\//, "")}:${index + 1}`;
		if (DISABLE_OBSIDIANMD.test(line)) {
			findings.push(`${where}: do not eslint-disable an obsidianmd/* rule; comply with it (rename or restructure) instead.`);
		}
		if (ESLINT_DIRECTIVE.test(line) && !line.includes("--")) {
			findings.push(`${where}: eslint directive comment needs a "-- description" explaining why it is necessary.`);
		}
		if (LOOKBEHIND.test(code[index] ?? "")) {
			findings.push(`${where}: ${LOOKBEHIND_WHY}`);
		}
		if (WINDOW_ASSERT.test(code[index] ?? "")) {
			findings.push(`${where}: ${WINDOW_ASSERT_WHY}`);
		}
	});
}

// Obsidian's re-exported `moment`, used without a cast. obsidian.d.ts takes its
// types from the `moment` package, which the developer-dashboard scan does not
// install (it installs production dependencies only), so moment is `any` there
// and the scan reports no-unsafe-call, no-unsafe-member-access and
// no-unsafe-return. Local lint resolves the package, so neither eslint nor
// typecheck:marketplace can see it; this scan does. Either use the built-in
// Date and Intl APIs (toLocaleTimeString or Intl.DateTimeFormat, with
// getLanguage() from obsidian for the app's locale), or go through the cast
// `(moment as unknown as typeof import('moment'))`, which pins moment's own type
// at that boundary. The `unknown` step is required from TypeScript 6, which types
// obsidian.d.ts's `import * as Moment` re-export as a non-callable namespace. Type positions such as `moment.Moment` or `typeof moment` are fine.
// Shipped source only: tests never reach the scan. Caught by the plumbline 0.8.0
// scan.
//
// Parsed and name-resolved with the TypeScript compiler rather than matched
// with patterns, so an aliased or namespace import is followed, strings and
// comments are never mistaken for code, and a local `moment` (a parameter, a
// method) that shadows the import is not reported.
const TEST_DIR = /(?:^|\/)(?:__tests__|__mocks__)\//;
const TEST_FILE = /\.test\.[cm]?[jt]sx?$/;
const MOMENT_WHY =
	"moment from obsidian is `any` in the marketplace scan. Use Date and Intl (with getLanguage()), or go through `(moment as unknown as typeof import('moment'))`.";

// `... as typeof import('moment')`. Sanctioned only when what it casts is moment
// itself, optionally through `as unknown` (checked by the caller): casting a
// call's RESULT leaves the call unsafe.
// `moment as unknown` -> `moment`, so the TypeScript 6 form of the cast matches.
function skipUnknownCast(node) {
	const inner = ts.skipParentheses(node);
	return ts.isAsExpression(inner) &&
		inner.type.kind === ts.SyntaxKind.UnknownKeyword
		? ts.skipParentheses(inner.expression)
		: inner;
}

function isMomentCastType(node) {
	return (
		ts.isAsExpression(node) &&
		ts.isImportTypeNode(node.type) &&
		node.type.isTypeOf === true &&
		ts.isLiteralTypeNode(node.type.argument) &&
		ts.isStringLiteral(node.type.argument.literal) &&
		node.type.argument.literal.text === "moment"
	);
}

for (const file of walkCode(".")) {
	if (TEST_DIR.test(file) || TEST_FILE.test(file)) continue;
	const text = readFileSync(file, "utf8");
	if (!text.includes("moment")) continue;
	// One file, nothing resolved: enough for the checker to bind each name to
	// its declaration in this file, which is all the shadowing test needs.
	const program = ts.createProgram([file], {
		allowJs: true,
		noResolve: true,
		noLib: true,
		types: [],
	});
	const source = program.getSourceFile(file);
	if (!source) continue;
	const checker = program.getTypeChecker();
	// The import declarations that bind moment, or bind an `import * as obs`.
	const momentImports = new Set();
	const namespaceImports = new Set();
	for (const statement of source.statements) {
		if (
			!ts.isImportDeclaration(statement) ||
			!ts.isStringLiteral(statement.moduleSpecifier) ||
			statement.moduleSpecifier.text !== "obsidian" ||
			!statement.importClause ||
			statement.importClause.isTypeOnly
		) {
			continue;
		}
		const bindings = statement.importClause.namedBindings;
		if (bindings && ts.isNamespaceImport(bindings)) {
			namespaceImports.add(bindings);
		} else if (bindings) {
			for (const element of bindings.elements) {
				if (!element.isTypeOnly && (element.propertyName ?? element.name).text === "moment") {
					momentImports.add(element);
				}
			}
		}
	}
	if (momentImports.size === 0 && namespaceImports.size === 0) continue;
	// Whether an identifier refers to one of `declarations`, not to a local
	// that happens to share its name.
	const refersTo = (identifier, declarations) => {
		// `{ moment }` is a property whose VALUE is the variable of that name.
		const symbol =
			ts.isShorthandPropertyAssignment(identifier.parent) && identifier.parent.name === identifier
				? checker.getShorthandAssignmentValueSymbol(identifier.parent)
				: checker.getSymbolAtLocation(identifier);
		return (symbol?.declarations ?? []).some((declaration) => declarations.has(declaration));
	};
	const isNamespace = (expression) => {
		const inner = ts.skipParentheses(expression);
		return ts.isIdentifier(inner) && refersTo(inner, namespaceImports);
	};
	// An expression that IS Obsidian's moment: the imported name, or `obs.moment`
	// / `obs["moment"]` / `(obs).moment` on a namespace import.
	const isMoment = (node) =>
		(ts.isIdentifier(node) && refersTo(node, momentImports)) ||
		(ts.isPropertyAccessExpression(node) && node.name.text === "moment" && isNamespace(node.expression)) ||
		(ts.isElementAccessExpression(node) &&
			ts.isStringLiteralLike(node.argumentExpression) &&
			node.argumentExpression.text === "moment" &&
			isNamespace(node.expression));
	// `extends moment()` is a runtime expression even though the compiler
	// classes its node as a type; `implements` and interface `extends` are not.
	const isTypeOnly = (node) =>
		ts.isTypeNode(node) &&
		!(
			ts.isExpressionWithTypeArguments(node) &&
			ts.isHeritageClause(node.parent) &&
			node.parent.token === ts.SyntaxKind.ExtendsKeyword &&
			ts.isClassLike(node.parent.parent)
		);
	const report = (node) => {
		const line = source.getLineAndCharacterOfPosition(node.getStart(source)).line + 1;
		findings.push(`${file.replace(/^\.\//, "")}:${line}: ${MOMENT_WHY}`);
	};
	const visit = (node) => {
		// Imports declare the name, casts are the sanctioned use, and a type
		// position is erased before the scan's type checks run.
		if (
			ts.isImportDeclaration(node) ||
			isTypeOnly(node) ||
			(isMomentCastType(node) && isMoment(skipUnknownCast(node.expression)))
		) {
			return;
		}
		if (isMoment(node)) {
			report(node);
			return;
		}
		// `const { moment } = obs` pulls it out of a namespace import.
		if (
			ts.isBindingElement(node) &&
			ts.isObjectBindingPattern(node.parent) &&
			ts.isVariableDeclaration(node.parent.parent) &&
			node.parent.parent.initializer &&
			isNamespace(node.parent.parent.initializer) &&
			(node.propertyName ?? node.name).getText(source) === "moment"
		) {
			report(node);
			return;
		}
		ts.forEachChild(node, visit);
	};
	visit(source);
}

if (findings.length > 0) {
	console.error("Submission pre-check failed:");
	for (const finding of findings) console.error(`  - ${finding}`);
	console.error("");
	console.error("This is a pre-filter only. Run the Obsidian developer-dashboard preview scan");
	console.error("on the release commit for the authoritative result.");
	process.exit(1);
}

console.log("Submission pre-check passed (pre-filter only; the developer-dashboard preview scan is the authoritative gate).");
