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
	ToolExecutionComponent,
	createBashToolDefinition,
	createEditToolDefinition,
	createFindToolDefinition,
	createGrepToolDefinition,
	createLsToolDefinition,
	createReadToolDefinition,
	createWriteToolDefinition,
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
			| "toolOutput",
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

type CollapsedPatchableToolExecutionPrototype = {
	render(width: number): string[];
	expanded?: boolean;
	hideComponent?: boolean;
	callRendererComponent?: Component;
	resultRendererComponent?: Component;
	contentText?: Component;
	contentBox?: Component;
	__toolOneLineOriginalRender?: (width: number) => string[];
	__toolOneLinePatched?: boolean;
	__toolOneLinePatchVersion?: number;
};

type SpinnerState = {
	interval?: NodeJS.Timeout;
};

const PATCH_VERSION = 2;
const SPINNER_INTERVAL_MS = 80;
const SPINNER_FRAMES = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"] as const;
const ANSI_COLOR_3 = "\x1b[33m";
const ANSI_COLOR_5 = "\x1b[35m";
const ANSI_COLOR_6 = "\x1b[36m";
const ANSI_COLOR_7 = "\x1b[37m";
const ANSI_COLOR_4 = "\x1b[34m";
const ANSI_COLOR_8 = "\x1b[38;5;8m";
const ANSI_RESET_FG = "\x1b[39m";
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

function color3Bold(theme: Theme, text: string): string {
	return `${ANSI_COLOR_3}${theme.bold(text)}${ANSI_RESET_FG}`;
}

function color7Bold(theme: Theme, text: string): string {
	return `${ANSI_COLOR_7}${theme.bold(text)}${ANSI_RESET_FG}`;
}

function color4(text: string): string {
	return `${ANSI_COLOR_4}${text}${ANSI_RESET_FG}`;
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
	return `${color7Bold(theme, toolName)}${NBSP}${details}`;
}

function formatPathLabel(theme: Theme, toolName: string, path: string): string {
	return formatToolLabel(theme, toolName, color4(formatPathForWrapping(path)));
}

function formatGrepLabel(theme: Theme, pattern: string | undefined, path: string, glob?: string): string {
	const query = `${ANSI_COLOR_5}${theme.bold(formatGrepPatternForWrapping(compactText(pattern)))}${ANSI_RESET_FG}`;
	const location = `${ANSI_COLOR_8}in${NBSP}${formatPathForWrapping(path)}${glob ? ` (${compactText(glob)})` : ""}${ANSI_RESET_FG}`;
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
	const query = color3Bold(theme, compactText(pattern));
	const location = `${ANSI_COLOR_8}in${NBSP}${formatPathForWrapping(path)}${ANSI_RESET_FG}`;
	return formatToolLabel(theme, "Find", `${query} ${location}`);
}

function formatBashLabel(theme: Theme, command: string | undefined): string {
	return formatToolLabel(theme, "Run", `${ANSI_COLOR_6}${compactText(command)}${ANSI_RESET_FG}`);
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

function trimBlankLines(lines: string[]): string[] {
	let start = 0;
	let end = lines.length;
	while (start < end && (lines[start] ?? "").trim().length === 0) start++;
	while (end > start && (lines[end - 1] ?? "").trim().length === 0) end--;
	return lines.slice(start, end);
}

function renderCollapsedLines(component: Component | undefined, width: number): string[] | undefined {
	if (!component) return undefined;
	try {
		const safeWidth = Math.max(1, width);
		const lines = trimBlankLines(component.render(safeWidth));
		return lines.length > 0 ? lines.map((line) => truncateToWidth(line, safeWidth, "", true)) : undefined;
	} catch {
		return undefined;
	}
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


function patchToolExecutionPrototype(): void {
	const prototype = ToolExecutionComponent.prototype as unknown as CollapsedPatchableToolExecutionPrototype;
	if (typeof prototype.render !== "function") return;

	if (
		prototype.__toolOneLinePatched
		&& prototype.__toolOneLinePatchVersion === PATCH_VERSION
		&& typeof prototype.__toolOneLineOriginalRender === "function"
	) {
		return;
	}

	if (!prototype.__toolOneLineOriginalRender) {
		prototype.__toolOneLineOriginalRender = prototype.render;
	}

	const originalRender = prototype.__toolOneLineOriginalRender;
	if (!originalRender) return;

	prototype.render = function renderToolExecutionOneLine(width: number): string[] {
		if (this.hideComponent) return [];
		if (this.expanded) return originalRender.call(this, width);

		const safeWidth = Math.max(1, Math.floor(width));
		const lines = renderCollapsedLines(this.resultRendererComponent, safeWidth)
			?? renderCollapsedLines(this.callRendererComponent, safeWidth)
			?? renderCollapsedLines(this.contentText, safeWidth)
			?? renderCollapsedLines(this.contentBox, safeWidth)
			?? [];

		return lines.length > 0 ? ["", ...lines] : [];
	};

	prototype.__toolOneLinePatched = true;
	prototype.__toolOneLinePatchVersion = PATCH_VERSION;
}

export default function toolOneLineExtension(pi: ExtensionAPI): void {
	patchToolExecutionPrototype();

	pi.on("session_start", async () => {
		patchToolExecutionPrototype();
	});

	pi.on("before_agent_start", async () => {
		patchToolExecutionPrototype();
	});

	pi.registerTool({
		...getBuiltInDefinitions(process.cwd()).read,
		async execute(toolCallId, params, signal, onUpdate, ctx) {
			return getBuiltInDefinitions(ctx.cwd).read.execute(toolCallId, params, signal, onUpdate, ctx);
		},
		renderCall(args, theme, context) {
			const readTheme = theme as Theme;
			const path = `${toFullPath(args.path, context.cwd)}${formatReadRange(args.offset, args.limit)}`;
			return oneLine(readTheme, context as RenderContext, formatReadLabel(readTheme, path));
		},
		renderResult(result, options, theme, context) {
			if (!options.expanded) {
				const readTheme = theme as Theme;
				const path = `${toFullPath(context.args.path, context.cwd)}${formatReadRange(context.args.offset, context.args.limit)}`;
				return oneLine(readTheme, context as RenderContext, formatReadLabel(readTheme, path));
			}
			stopSpinner(context as RenderContext);
			return getBuiltInDefinitions(context.cwd).read.renderResult?.(
				result as ToolResult<ReadToolDetails>,
				options,
				theme,
				context,
			) ?? emptyComponent(context as RenderContext);
		},
	});

	pi.registerTool({
		...getBuiltInDefinitions(process.cwd()).write,
		async execute(toolCallId, params, signal, onUpdate, ctx) {
			return getBuiltInDefinitions(ctx.cwd).write.execute(toolCallId, params, signal, onUpdate, ctx);
		},
		renderCall(args, theme, context) {
			const writeTheme = theme as Theme;
			return oneLine(
				writeTheme,
				context as RenderContext,
				formatPathLabel(writeTheme, "Write", toFullPath(args.path, context.cwd)),
			);
		},
		renderResult(result, options, theme, context) {
			if (!options.expanded) {
				const writeTheme = theme as Theme;
				return oneLine(
					writeTheme,
					context as RenderContext,
					formatPathLabel(writeTheme, "Write", toFullPath(context.args.path, context.cwd)),
				);
			}
			stopSpinner(context as RenderContext);
			return getBuiltInDefinitions(context.cwd).write.renderResult?.(
				result as ToolResult,
				options,
				theme,
				context,
			) ?? emptyComponent(context as RenderContext);
		},
	});

	pi.registerTool({
		...getBuiltInDefinitions(process.cwd()).edit,
		async execute(toolCallId, params, signal, onUpdate, ctx) {
			return getBuiltInDefinitions(ctx.cwd).edit.execute(toolCallId, params, signal, onUpdate, ctx);
		},
		renderCall(args, theme, context) {
			const editTheme = theme as Theme;
			return oneLine(
				editTheme,
				context as RenderContext,
				formatEditLabel(editTheme, toFullPath(args.path, context.cwd)),
			);
		},
		renderResult(result, options, theme, context) {
			stopSpinner(context as RenderContext);
			const builtInResult = getBuiltInDefinitions(context.cwd).edit.renderResult?.(
				result as ToolResult<EditToolDetails>,
				options,
				theme,
				context,
			);
			if (!options.expanded) {
				const component = context.lastComponent instanceof Container
					? context.lastComponent
					: new Container();
				component.clear();
				const editTheme = theme as Theme;
				component.addChild(
					oneLine(
						editTheme,
						context as RenderContext,
						formatEditLabel(editTheme, toFullPath(context.args.path, context.cwd)),
					),
				);
				if (builtInResult) component.addChild(builtInResult);
				return component;
			}
			return builtInResult ?? emptyComponent(context as RenderContext);
		},
	});

	pi.registerTool({
		...getBuiltInDefinitions(process.cwd()).bash,
		async execute(toolCallId, params, signal, onUpdate, ctx) {
			return getBuiltInDefinitions(ctx.cwd).bash.execute(toolCallId, params, signal, onUpdate, ctx);
		},
		renderCall(args, theme, context) {
			const bashTheme = theme as Theme;
			return oneLine(
				bashTheme,
				context as RenderContext,
				formatBashLabel(bashTheme, args.command),
			);
		},
		renderResult(result, options, theme, context) {
			if (!options.expanded) {
				const bashTheme = theme as Theme;
				const component = context.lastComponent instanceof Container
					? context.lastComponent
					: new Container();
				const output = cleanBashOutput(result as ToolResult<BashToolDetails>);
				component.clear();
				component.addChild(
					oneLine(
						bashTheme,
						context as RenderContext,
						formatBashLabel(bashTheme, context.args.command),
					),
				);
				if (output.length > 0) {
					component.addChild(
						previewComponent(
							output
								.split("\n")
								.map((line) => bashTheme.fg("toolOutput", line))
								.join("\n"),
							context as RenderContext,
							10,
							"  ",
							true,
							(hiddenLineCount) => bashTheme.fg("dim", `  +${hiddenLineCount} more`),
						),
					);
				}
				return component;
			}
			stopSpinner(context as RenderContext);
			return getBuiltInDefinitions(context.cwd).bash.renderResult?.(
				result as ToolResult<BashToolDetails>,
				options,
				theme,
				context,
			) ?? emptyComponent(context as RenderContext);
		},
	});

	pi.registerTool({
		...getBuiltInDefinitions(process.cwd()).grep,
		async execute(toolCallId, params, signal, onUpdate, ctx) {
			return getBuiltInDefinitions(ctx.cwd).grep.execute(toolCallId, params, signal, onUpdate, ctx);
		},
		renderCall(args, theme, context) {
			const grepTheme = theme as Theme;
			const path = toFullPath(args.path, context.cwd);
			return oneLine(
				grepTheme,
				context as RenderContext,
				formatGrepLabel(grepTheme, args.pattern, path, args.glob),
			);
		},
		renderResult(result, options, theme, context) {
			if (!options.expanded) {
				const grepTheme = theme as Theme;
				const path = toFullPath(context.args.path, context.cwd);
				return oneLine(
					grepTheme,
					context as RenderContext,
					formatGrepLabel(grepTheme, context.args.pattern, path, context.args.glob),
				);
			}
			stopSpinner(context as RenderContext);
			return getBuiltInDefinitions(context.cwd).grep.renderResult?.(
				result as ToolResult<GrepToolDetails>,
				options,
				theme,
				context,
			) ?? emptyComponent(context as RenderContext);
		},
	});

	pi.registerTool({
		...getBuiltInDefinitions(process.cwd()).find,
		async execute(toolCallId, params, signal, onUpdate, ctx) {
			return getBuiltInDefinitions(ctx.cwd).find.execute(toolCallId, params, signal, onUpdate, ctx);
		},
		renderCall(args, theme, context) {
			const findTheme = theme as Theme;
			return oneLine(
				findTheme,
				context as RenderContext,
				formatFindLabel(findTheme, args.pattern, toFullPath(args.path, context.cwd)),
			);
		},
		renderResult(result, options, theme, context) {
			if (!options.expanded) {
				const findTheme = theme as Theme;
				return oneLine(
					findTheme,
					context as RenderContext,
					formatFindLabel(findTheme, context.args.pattern, toFullPath(context.args.path, context.cwd)),
				);
			}
			stopSpinner(context as RenderContext);
			return getBuiltInDefinitions(context.cwd).find.renderResult?.(
				result as ToolResult<FindToolDetails>,
				options,
				theme,
				context,
			) ?? emptyComponent(context as RenderContext);
		},
	});

	pi.registerTool({
		...getBuiltInDefinitions(process.cwd()).ls,
		async execute(toolCallId, params, signal, onUpdate, ctx) {
			return getBuiltInDefinitions(ctx.cwd).ls.execute(toolCallId, params, signal, onUpdate, ctx);
		},
		renderCall(args, theme, context) {
			const lsTheme = theme as Theme;
			return oneLine(lsTheme, context as RenderContext, formatListLabel(lsTheme, toFullPath(args.path, context.cwd)));
		},
		renderResult(result, options, theme, context) {
			if (!options.expanded) {
				const lsTheme = theme as Theme;
				return oneLine(lsTheme, context as RenderContext, formatListLabel(lsTheme, toFullPath(context.args.path, context.cwd)));
			}
			stopSpinner(context as RenderContext);
			return getBuiltInDefinitions(context.cwd).ls.renderResult?.(
				result as ToolResult<LsToolDetails>,
				options,
				theme,
				context,
			) ?? emptyComponent(context as RenderContext);
		},
	});
}
