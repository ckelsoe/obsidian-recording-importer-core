// The public surface: exactly the names the plugins import from the shared
// modules. Add a name here only when a consumer needs it.

export {
	INITIAL_AUTO_SYNC_STATE,
	coerceIntervalMinutes,
	nextAutoSyncState,
	tickOutcomeForCategory,
	type AutoSyncState,
} from './auto-sync';
export { runAutoSyncTick } from './auto-sync-runner';
export {
	BufferedDebugLogger,
	NoopDebugLogger,
	type DebugLogger,
	type DebugEvent,
} from './debug-logger';
export {
	PAGE_SIZE,
	buildSourceFilter,
	categoryAllowsReauth,
	classifyError,
	filterListView,
	filterVisibleRecordings,
	formatDate,
	formatDuration,
	formatErrorForClipboard,
	formatImportNotice,
	isUpdateAvailable,
	mergeRecordings,
	tallyImportResults,
	type ArtifactSelection,
	type DuplicateDecisionChoice,
	type ErrorCategory,
	type ErrorClassification,
	type ImportModalOptions,
	type ImportResult,
	type ImportTally,
	type ImportViewStatePatch,
	type ListViewFilter,
	type ServiceErrorPolicy,
} from './import-core';
export {
	runImport,
	type FolderResolver,
	type ImportDebugLog,
	type AttachmentPipeline,
	type ImportRunDeps,
	type ImportRunObserver,
} from './import-runner';
export { createSequentialPageFetcher } from './list-paging';
export {
	managedMarkers,
	transformManagedBody,
	type ManagedMarkers,
	locateManagedBlock,
	managedBodyRegion,
	spliceManagedBlock,
	wrapManagedBody,
} from './managed-block';
export { hideManagedMarkers } from './managed-marker-view';
export {
	planMigration,
	type MigrationHeal,
	type MigrationPlan,
} from './migration-plan';
export {
	DEFAULT_NOTE_NAME_TEMPLATE,
	NoteWriter,
	NoteWriterError,
	TEMPLATE_PREVIEW_DATE,
	TEMPLATE_PREVIEW_DATETIME,
	TEMPLATE_PREVIEW_FOLDER,
	TEMPLATE_PREVIEW_TITLE,
	TRANSCRIPT_FILE_NAME,
	buildNoteName,
	effectiveCaptureOffsetMinutes,
	extractSpeakers,
	findTranscriptFoldLine,
	formatDatetime,
	formatDurationHoursMinutes,
	formatLocalDateTime,
	isTranscriptPlacement,
	isValidNoteNameTemplate,
	isValidReplacementChar,
	migrateLegacyDateTemplate,
	previewNoteFileName,
	renameRecordingNote,
	renderCustomFrontmatterPreview,
	resolveSubfolder,
	sanitizeFilename,
	zoneOffsetMinutes,
	type CustomFrontmatterRow,
	type DuplicatePolicy,
	type DuplicatePromptCallback,
	type RenameFileFn,
	type TagMode,
	type TranscriptPlacement,
	type DuplicatePromptDecision,
	type FileLike,
	type FolderLike,
	type NoteWriterOptions,
	type VaultLike,
	type WriteOutcome,
} from './note-writer';
export type {
	AdditionalSummary,
	AttachmentAsset,
	Chapter,
	ConsumerNote,
	Recording,
	RecordingArtifacts,
	RecordingId,
	RecordingMark,
	RecordingPage,
	RecordingSource,
	Summary,
	Transcript,
	TranscriptSegment,
} from './recording-model';
export type { ServiceProfile } from './service-profile';
export {
	SHORT_LIFETIME_HOURS,
	WARN_LEAD_SHORT_MS,
	clampTimerDelayMs,
	sessionExpiryDecision,
	MAX_TIMER_DELAY_MS,
	MIN_TIMER_DELAY_MS,
} from './session-expiry';
export { trimChars, trimTrailingChars } from './text-trim';
export {
	buildImportedIndex,
	buildImportedIndexWithColdCheck,
	findImportedNote,
	outputFolderCacheIsCold,
	recordingAmbiguousKeys,
	type ImportedIndex,
	type ImportedRecord,
} from './vault-index';
