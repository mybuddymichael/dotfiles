import type {
	BashToolDetails,
	EditToolDetails,
	ExtensionAPI,
	FindToolDetails,
	GrepToolDetails,
	LsToolDetails,
	ReadToolDetails,
} from "@mariozechner/pi-coding-agent";
import {
	createBashToolDefinition,
	createEditToolDefinition,
	createFindToolDefinition,
	createGrepToolDefinition,
	createLsToolDefinition,
	createReadToolDefinition,
	createWriteToolDefinition,
	keyHint,
} from "@mariozechner/pi-coding-agent";
import {
	Container,
	type Component,
	truncateToWidth,
	visibleWidth,
	wrapTextWithAnsi,
} from "@mariozechner/pi-tui";
import { resolve } from "node:path";

type Theme = {
	bold(text: string): string;
	fg(
		color:
			| "text"
			| "accent"
			| "muted"
			| "dim"
			| "success"
			| "error"
			| "warning"
			| "toolTitle"
			| "toolOutput"
			| "bashMode"
			| "syntaxNumber"
			| "syntaxFunction"
			| "syntaxVariable"
			| "syntaxPunctuation",
		text: string,
	): string;
};

type RenderContext = {
	args: any;
	state: Record<string, unknown>;
	lastComponent?: Component;
	invalidate(): void;
	toolCallId: string;
	cwd: string;
	executionStarted: boolean;
	argsComplete: boolean;
	isPartial: boolean;
	expanded: boolean;
	showImages: boolean;
	isError: boolean;
};

type ToolResult<TDetails = unknown> = {
	content: Array<{ type: string; text?: string; data?: string; mimeType?: string }>;
	details?: TDetails;
};

type SpinnerState = {
	interval?: NodeJS.Timeout;
	expandedResultBody?: Component;
};

const SPINNER_INTERVAL_MS = 80;
const SPINNER_FRAMES = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"] as const;
const NBSP = "\u00A0";
const WRAPPABLE_PATH_SEPARATOR = "/ ";
const WRAPPABLE_GREP_SEPARATOR = "| ";

const toolCache = new Map<string, ReturnType<typeof createBuiltInDefinitions>>();

class WrappedStatusText implements Component {
	private marker: string;
	private label: string;

	constructor(marker = "", label = "") {
		this.marker = marker;
		this.label = label;
	}

	setParts(marker: string, label: string): void {
		this.marker = marker;
		this.label = label;
	}

	render(width: number): string[] {
		const safeWidth = Math.max(1, Math.floor(width));
		const firstPrefix = `${this.marker} `;
		const continuationPrefix = " ".repeat(Math.max(0, visibleWidth(firstPrefix)));
		const firstContentWidth = Math.max(1, safeWidth - visibleWidth(firstPrefix));
		const continuationContentWidth = Math.max(1, safeWidth - visibleWidth(continuationPrefix));
		const firstPass = wrapTextWithAnsi(this.label, firstContentWidth);
		const firstChunk = restoreWrappedSpacing(firstPass[0] ?? "");
		const remainder = firstPass.slice(1).join(" ").trim();
		const continuationChunks = remainder.length > 0
			? wrapTextWithAnsi(remainder, continuationContentWidth).map(restoreWrappedSpacing)
			: [];
		const lines = [
			`${firstPrefix}${truncateToWidth(firstChunk, firstContentWidth, "", true)}`,
			...continuationChunks.map((chunk) => (
				`${continuationPrefix}${truncateToWidth(chunk, continuationContentWidth, "", true)}`
			)),
		];
		return lines.map((line) => truncateToWidth(restoreWrappedSpacing(line), safeWidth, "", true));
	}

	invalidate(): void {}
}

class TruncatedPreviewText implements Component {
	private text: string;
	private maxLines: number;
	private indent: string;
	private leadingBlankLine: boolean;
	private overflowLineFormatter?: (hiddenLineCount: number) => string;

	constructor(
		text = "",
		maxLines = 3,
		indent = "",
		leadingBlankLine = false,
		overflowLineFormatter?: (hiddenLineCount: number) => string,
	) {
		this.text = text;
		this.maxLines = maxLines;
		this.indent = indent;
		this.leadingBlankLine = leadingBlankLine;
		this.overflowLineFormatter = overflowLineFormatter;
	}

	setParts(
		text: string,
		maxLines = this.maxLines,
		indent = this.indent,
		leadingBlankLine = this.leadingBlankLine,
		overflowLineFormatter = this.overflowLineFormatter,
	): void {
		this.text = text;
		this.maxLines = maxLines;
		this.indent = indent;
		this.leadingBlankLine = leadingBlankLine;
		this.overflowLineFormatter = overflowLineFormatter;
	}

	render(width: number): string[] {
		const safeWidth = Math.max(1, Math.floor(width));
		const lines: string[] = [];
		const sourceLines = this.text.split("\n");
		const indentWidth = visibleWidth(this.indent);
		const contentWidth = Math.max(1, safeWidth - indentWidth);
		let hiddenLineCount = 0;

		for (let index = 0; index < sourceLines.length; index++) {
			const wrapped = wrapTextWithAnsi(sourceLines[index] ?? "", contentWidth);
			const chunks = wrapped.length > 0 ? wrapped : [""];
			for (let chunkIndex = 0; chunkIndex < chunks.length; chunkIndex++) {
				const chunk = chunks[chunkIndex] ?? "";
				if (lines.length >= this.maxLines) {
					hiddenLineCount += chunks.length - chunkIndex;
					hiddenLineCount += sourceLines
						.slice(index + 1)
						.reduce((count, sourceLine) => {
							const wrappedLine = wrapTextWithAnsi(sourceLine ?? "", contentWidth);
							return count + Math.max(1, wrappedLine.length);
						}, 0);
					break;
				}
				lines.push(truncateToWidth(`${this.indent}${chunk}`, safeWidth, "", true));
			}
			if (hiddenLineCount > 0) break;
		}

		if (hiddenLineCount > 0 && this.overflowLineFormatter) {
			lines.push(truncateToWidth(this.overflowLineFormatter(hiddenLineCount), safeWidth, "", true));
		}

		const renderedLines = trimBlankLines(lines);
		return this.leadingBlankLine && renderedLines.length > 0 ? ["", ...renderedLines] : renderedLines;
	}

	invalidate(): void {}
}

class IndentedComponent implements Component {
	private child?: Component;
	private indent: string;

	constructor(child?: Component, indent = "  ") {
		this.child = child;
		this.indent = indent;
	}

	setParts(child?: Component, indent = this.indent): void {
		this.child = child;
		this.indent = indent;
	}

	render(width: number): string[] {
		if (!this.child) return [];
		const safeWidth = Math.max(1, Math.floor(width));
		const indentWidth = visibleWidth(this.indent);
		const childWidth = Math.max(1, safeWidth - indentWidth);
		return this.child
			.render(childWidth)
			.map((line) => truncateToWidth(`${this.indent}${line}`, safeWidth, "", true));
	}

	invalidate(): void {
		this.child?.invalidate?.();
	}
}

function createBuiltInDefinitions(cwd: string) {
	return {
		read: createReadToolDefinition(cwd),
		write: createWriteToolDefinition(cwd),
		edit: createEditToolDefinition(cwd),
		bash: createBashToolDefinition(cwd),
		grep: createGrepToolDefinition(cwd),
		find: createFindToolDefinition(cwd),
		ls: createLsToolDefinition(cwd),
	};
}

function getBuiltInDefinitions(cwd: string) {
	let definitions = toolCache.get(cwd);
	if (!definitions) {
		definitions = createBuiltInDefinitions(cwd);
		toolCache.set(cwd, definitions);
	}
	return definitions;
}

function stripAtPrefix(value: string): string {
	return value.startsWith("@") ? value.slice(1) : value;
}

function toFullPath(inputPath: string | undefined, cwd: string, fallback = cwd): string {
	const raw = stripAtPrefix((inputPath || fallback).trim());
	return resolve(cwd, raw || ".");
}

function formatReadRange(offset?: number, limit?: number): string {
	if (offset === undefined && limit === undefined) return "";
	const start = offset ?? 1;
	if (limit === undefined) return `:${start}`;
	const end = start + Math.max(0, limit - 1);
	return `:${start}-${end}`;
}

function compactText(text: string | undefined): string {
	if (!text) return "";
	return text.replace(/\s+/g, " ").trim();
}


function formatPathForWrapping(path: string): string {
	return path.replaceAll("/", WRAPPABLE_PATH_SEPARATOR);
}

function formatGrepPatternForWrapping(pattern: string): string {
	return pattern.replaceAll("|", WRAPPABLE_GREP_SEPARATOR);
}

function restoreWrappedSpacing(text: string): string {
	return text
		.replaceAll(WRAPPABLE_PATH_SEPARATOR, "/")
		.replaceAll(WRAPPABLE_GREP_SEPARATOR, "|");
}

function formatToolLabel(theme: Theme, toolName: string, details: string): string {
	return `${theme.fg("toolTitle", theme.bold(toolName))}${NBSP}${details}`;
}

function formatPathLabel(theme: Theme, toolName: string, path: string): string {
	return formatToolLabel(theme, toolName, theme.fg("syntaxFunction", formatPathForWrapping(path)));
}

function formatGrepLabel(theme: Theme, pattern: string | undefined, path: string, glob?: string): string {
	const query = theme.fg("syntaxNumber", theme.bold(formatGrepPatternForWrapping(compactText(pattern))));
	const location = theme.fg("muted", `in${NBSP}${formatPathForWrapping(path)}${glob ? ` (${compactText(glob)})` : ""}`);
	return formatToolLabel(theme, "Grep", `${query} ${location}`);
}

function formatReadLabel(theme: Theme, path: string): string {
	return formatPathLabel(theme, "Read", path);
}

function formatListLabel(theme: Theme, path: string): string {
	return formatPathLabel(theme, "List", path);
}

function formatEditLabel(theme: Theme, path: string): string {
	return formatPathLabel(theme, "Edit", path);
}

function formatFindLabel(theme: Theme, pattern: string | undefined, path: string): string {
	const query = theme.fg("syntaxVariable", theme.bold(compactText(pattern)));
	const location = theme.fg("syntaxPunctuation", `in${NBSP}${formatPathForWrapping(path)}`);
	return formatToolLabel(theme, "Find", `${query} ${location}`);
}

function formatBashLabel(theme: Theme, command: string | undefined): string {
	return formatToolLabel(theme, "Run", theme.fg("bashMode", compactText(command)));
}

function startSpinner(context: RenderContext): void {
	const state = context.state as SpinnerState;
	if (state.interval) return;
	state.interval = setInterval(() => context.invalidate(), SPINNER_INTERVAL_MS);
}

function stopSpinner(context: RenderContext): void {
	const state = context.state as SpinnerState;
	if (!state.interval) return;
	clearInterval(state.interval);
	state.interval = undefined;
}

function spinnerFrame(): string {
	const index = Math.floor(Date.now() / SPINNER_INTERVAL_MS) % SPINNER_FRAMES.length;
	return SPINNER_FRAMES[index] ?? SPINNER_FRAMES[0];
}

function statusPrefix(theme: Theme, context: RenderContext): string {
	if (context.isPartial) {
		startSpinner(context);
		return theme.fg("accent", spinnerFrame());
	}

	stopSpinner(context);
	return context.isError ? theme.fg("error", "✕") : theme.fg("success", "✓");
}

function oneLine(theme: Theme, context: RenderContext, label: string): WrappedStatusText {
	const component = context.lastComponent instanceof WrappedStatusText
		? context.lastComponent
		: new WrappedStatusText();
	component.setParts(statusPrefix(theme, context), label);
	return component;
}

function emptyComponent(context: RenderContext): Container {
	const component = context.lastComponent instanceof Container ? context.lastComponent : new Container();
	component.clear();
	return component;
}

function containerComponent(context: RenderContext): Container {
	const component = context.lastComponent instanceof Container ? context.lastComponent : new Container();
	component.clear();
	return component;
}

function previewComponent(
	text: string,
	context: RenderContext,
	maxLines = 3,
	indent = "",
	leadingBlankLine = false,
	overflowLineFormatter?: (hiddenLineCount: number) => string,
): TruncatedPreviewText {
	const component = context.lastComponent instanceof TruncatedPreviewText
		? context.lastComponent
		: new TruncatedPreviewText();
	component.setParts(text, maxLines, indent, leadingBlankLine, overflowLineFormatter);
	return component;
}

function indentedComponent(
	child: Component | undefined,
	context: RenderContext,
	indent = "  ",
): IndentedComponent {
	const component = context.lastComponent instanceof IndentedComponent
		? context.lastComponent
		: new IndentedComponent();
	component.setParts(child, indent);
	return component;
}

function renderExpandedResultWithHeader<TDetails>(
	theme: Theme,
	context: RenderContext,
	label: string,
	renderBuiltInResult: (builtInContext: RenderContext) => Component | undefined,
): Container {
	const component = containerComponent(context);
	component.addChild(oneLine(theme, { ...context, lastComponent: undefined }, label));
	const state = context.state as SpinnerState;
	const builtInContext: RenderContext = { ...context, lastComponent: state.expandedResultBody };
	const body = renderBuiltInResult(builtInContext) ?? emptyComponent({ ...context, lastComponent: undefined });
	state.expandedResultBody = body;
	component.addChild(indentedComponent(body, { ...context, lastComponent: undefined }));
	return component;
}

function trimBlankLines(lines: string[]): string[] {
	let start = 0;
	let end = lines.length;
	while (start < end && (lines[start] ?? "").trim().length === 0) start++;
	while (end > start && (lines[end - 1] ?? "").trim().length === 0) end--;
	return lines.slice(start, end);
}

function expandHint(theme: Theme): string {
	return theme.fg("dim", `(${keyHint("app.tools.expand", "to expand")})`);
}

function appendExpandHint(theme: Theme, label: string): string {
	return `${label}${NBSP}${expandHint(theme)}`;
}

function countDiffChanges(diff: string | undefined): { additions: number; removals: number } | undefined {
	if (!diff) return undefined;
	let additions = 0;
	let removals = 0;
	for (const line of diff.split("\n")) {
		if (line.startsWith("+") && !line.startsWith("+++")) additions++;
		if (line.startsWith("-") && !line.startsWith("---")) removals++;
	}
	return { additions, removals };
}

function extractTextContent(result: ToolResult | undefined): string {
	return result?.content
		.map((part) => part.type === "text" ? part.text ?? "" : "")
		.join("")
		.trim() ?? "";
}

function cleanBashOutput(result: ToolResult<BashToolDetails> | undefined): string {
	const output = extractTextContent(result)
		.replace(/\r\n?/g, "\n")
		.replace(/\n?exit code:\s*-?\d+\s*$/i, "")
		.trim();
	return output === "(no output)" ? "" : output;
}

export default function toolOneLineExtension(pi: ExtensionAPI): void {

	pi.registerTool({
		...getBuiltInDefinitions(process.cwd()).read,
		renderShell: "self",
		async execute(toolCallId, params, signal, onUpdate, ctx) {
			return getBuiltInDefinitions(ctx.cwd).read.execute(toolCallId, params, signal, onUpdate, ctx);
		},
		renderCall(args, theme, context) {
			const readTheme = theme as Theme;
			if (!context.isPartial) return emptyComponent(context as RenderContext);
			const path = `${toFullPath(args.path, context.cwd)}${formatReadRange(args.offset, args.limit)}`;
			return oneLine(readTheme, context as RenderContext, formatReadLabel(readTheme, path));
		},
		renderResult(result, options, theme, context) {
			const readContext = context as RenderContext;
			if (options.isPartial) return emptyComponent(readContext);
			const readTheme = theme as Theme;
			const path = `${toFullPath(context.args.path, context.cwd)}${formatReadRange(context.args.offset, context.args.limit)}`;
			if (!options.expanded) return oneLine(readTheme, readContext, formatReadLabel(readTheme, path));
			stopSpinner(readContext);
			return renderExpandedResultWithHeader(readTheme, readContext, formatReadLabel(readTheme, path), (builtInContext) => (
				getBuiltInDefinitions(context.cwd).read.renderResult?.(
					result as ToolResult<ReadToolDetails>,
					options,
					theme,
					builtInContext,
				)
			));
		},
	});

	pi.registerTool({
		...getBuiltInDefinitions(process.cwd()).write,
		renderShell: "self",
		async execute(toolCallId, params, signal, onUpdate, ctx) {
			return getBuiltInDefinitions(ctx.cwd).write.execute(toolCallId, params, signal, onUpdate, ctx);
		},
		renderCall(args, theme, context) {
			const writeTheme = theme as Theme;
			if (!context.isPartial) return emptyComponent(context as RenderContext);
			return oneLine(
				writeTheme,
				context as RenderContext,
				formatPathLabel(writeTheme, "Write", toFullPath(args.path, context.cwd)),
			);
		},
		renderResult(result, options, theme, context) {
			const writeContext = context as RenderContext;
			if (options.isPartial) return emptyComponent(writeContext);
			const writeTheme = theme as Theme;
			const label = formatPathLabel(writeTheme, "Write", toFullPath(context.args.path, context.cwd));
			if (!options.expanded) {
				return oneLine(writeTheme, writeContext, label);
			}
			stopSpinner(writeContext);
			return renderExpandedResultWithHeader(writeTheme, writeContext, label, (builtInContext) => (
				getBuiltInDefinitions(context.cwd).write.renderResult?.(
					result as ToolResult,
					options,
					theme,
					builtInContext,
				)
			));
		},
	});

	pi.registerTool({
		...getBuiltInDefinitions(process.cwd()).edit,
		renderShell: "self",
		async execute(toolCallId, params, signal, onUpdate, ctx) {
			return getBuiltInDefinitions(ctx.cwd).edit.execute(toolCallId, params, signal, onUpdate, ctx);
		},
		renderCall(args, theme, context) {
			const editTheme = theme as Theme;
			if (!context.isPartial) return emptyComponent(context as RenderContext);
			return oneLine(
				editTheme,
				context as RenderContext,
				formatEditLabel(editTheme, toFullPath(args.path, context.cwd)),
			);
		},
		renderResult(result, options, theme, context) {
			const editContext = context as RenderContext;
			if (options.isPartial) return emptyComponent(editContext);
			stopSpinner(editContext);
			const editTheme = theme as Theme;
			const label = formatEditLabel(editTheme, toFullPath(context.args.path, context.cwd));
			if (!options.expanded) {
				const component = containerComponent(editContext);
				component.addChild(oneLine(editTheme, editContext, appendExpandHint(editTheme, label)));
				const changes = countDiffChanges((result as ToolResult<EditToolDetails>).details?.diff);
				if (changes) {
					component.addChild(
						previewComponent(
							`${editTheme.fg("success", `  +${changes.additions}`)}${editTheme.fg("dim", " / ")}${editTheme.fg("error", `-${changes.removals}`)}`,
							editContext,
							1,
						),
					);
				}
				return component;
			}
			return renderExpandedResultWithHeader(editTheme, editContext, label, (builtInContext) => (
				getBuiltInDefinitions(context.cwd).edit.renderResult?.(
					result as ToolResult<EditToolDetails>,
					options,
					theme,
					builtInContext,
				)
			));
		},
	});

	pi.registerTool({
		...getBuiltInDefinitions(process.cwd()).bash,
		renderShell: "self",
		async execute(toolCallId, params, signal, onUpdate, ctx) {
			return getBuiltInDefinitions(ctx.cwd).bash.execute(toolCallId, params, signal, onUpdate, ctx);
		},
		renderCall(args, theme, context) {
			const bashTheme = theme as Theme;
			if (!context.isPartial) return emptyComponent(context as RenderContext);
			return oneLine(
				bashTheme,
				context as RenderContext,
				formatBashLabel(bashTheme, args.command),
			);
		},
		renderResult(result, options, theme, context) {
			const bashContext = context as RenderContext;
			if (options.isPartial) return emptyComponent(bashContext);
			stopSpinner(bashContext);
			const bashTheme = theme as Theme;
			const label = formatBashLabel(bashTheme, context.args.command);
			if (!options.expanded) {
				const component = containerComponent(bashContext);
				const output = cleanBashOutput(result as ToolResult<BashToolDetails>);
				component.addChild(oneLine(bashTheme, bashContext, appendExpandHint(bashTheme, label)));
				if (output.length > 0) {
					component.addChild(
						previewComponent(
							output
								.split("\n")
								.map((line) => bashTheme.fg("toolOutput", line))
								.join("\n"),
							bashContext,
							10,
							"  ",
							true,
							(hiddenLineCount) => bashTheme.fg("dim", `  +${hiddenLineCount} more`),
						),
					);
				}
				return component;
			}
			return renderExpandedResultWithHeader(bashTheme, bashContext, label, (builtInContext) => (
				getBuiltInDefinitions(context.cwd).bash.renderResult?.(
					result as ToolResult<BashToolDetails>,
					options,
					theme,
					builtInContext,
				)
			));
		},
	});

	pi.registerTool({
		...getBuiltInDefinitions(process.cwd()).grep,
		renderShell: "self",
		async execute(toolCallId, params, signal, onUpdate, ctx) {
			return getBuiltInDefinitions(ctx.cwd).grep.execute(toolCallId, params, signal, onUpdate, ctx);
		},
		renderCall(args, theme, context) {
			const grepTheme = theme as Theme;
			if (!context.isPartial) return emptyComponent(context as RenderContext);
			const path = toFullPath(args.path, context.cwd);
			return oneLine(
				grepTheme,
				context as RenderContext,
				formatGrepLabel(grepTheme, args.pattern, path, args.glob),
			);
		},
		renderResult(result, options, theme, context) {
			const grepContext = context as RenderContext;
			if (options.isPartial) return emptyComponent(grepContext);
			const grepTheme = theme as Theme;
			const path = toFullPath(context.args.path, context.cwd);
			const label = formatGrepLabel(grepTheme, context.args.pattern, path, context.args.glob);
			if (!options.expanded) {
				return oneLine(grepTheme, grepContext, label);
			}
			stopSpinner(grepContext);
			return renderExpandedResultWithHeader(grepTheme, grepContext, label, (builtInContext) => (
				getBuiltInDefinitions(context.cwd).grep.renderResult?.(
					result as ToolResult<GrepToolDetails>,
					options,
					theme,
					builtInContext,
				)
			));
		},
	});

	pi.registerTool({
		...getBuiltInDefinitions(process.cwd()).find,
		renderShell: "self",
		async execute(toolCallId, params, signal, onUpdate, ctx) {
			return getBuiltInDefinitions(ctx.cwd).find.execute(toolCallId, params, signal, onUpdate, ctx);
		},
		renderCall(args, theme, context) {
			const findTheme = theme as Theme;
			if (!context.isPartial) return emptyComponent(context as RenderContext);
			return oneLine(
				findTheme,
				context as RenderContext,
				formatFindLabel(findTheme, args.pattern, toFullPath(args.path, context.cwd)),
			);
		},
		renderResult(result, options, theme, context) {
			const findContext = context as RenderContext;
			if (options.isPartial) return emptyComponent(findContext);
			const findTheme = theme as Theme;
			const label = formatFindLabel(findTheme, context.args.pattern, toFullPath(context.args.path, context.cwd));
			if (!options.expanded) {
				return oneLine(findTheme, findContext, label);
			}
			stopSpinner(findContext);
			return renderExpandedResultWithHeader(findTheme, findContext, label, (builtInContext) => (
				getBuiltInDefinitions(context.cwd).find.renderResult?.(
					result as ToolResult<FindToolDetails>,
					options,
					theme,
					builtInContext,
				)
			));
		},
	});

	pi.registerTool({
		...getBuiltInDefinitions(process.cwd()).ls,
		renderShell: "self",
		async execute(toolCallId, params, signal, onUpdate, ctx) {
			return getBuiltInDefinitions(ctx.cwd).ls.execute(toolCallId, params, signal, onUpdate, ctx);
		},
		renderCall(args, theme, context) {
			const lsTheme = theme as Theme;
			if (!context.isPartial) return emptyComponent(context as RenderContext);
			return oneLine(lsTheme, context as RenderContext, formatListLabel(lsTheme, toFullPath(args.path, context.cwd)));
		},
		renderResult(result, options, theme, context) {
			const lsContext = context as RenderContext;
			if (options.isPartial) return emptyComponent(lsContext);
			const lsTheme = theme as Theme;
			const label = formatListLabel(lsTheme, toFullPath(context.args.path, context.cwd));
			if (!options.expanded) {
				return oneLine(lsTheme, lsContext, label);
			}
			stopSpinner(lsContext);
			return renderExpandedResultWithHeader(lsTheme, lsContext, label, (builtInContext) => (
				getBuiltInDefinitions(context.cwd).ls.renderResult?.(
					result as ToolResult<LsToolDetails>,
					options,
					theme,
					builtInContext,
				)
			));
		},
	});
}
