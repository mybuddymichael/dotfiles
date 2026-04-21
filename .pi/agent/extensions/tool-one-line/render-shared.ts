import type {
	BashToolDetails,
	EditToolDetails,
	ExtensionAPI,
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
import { Type } from "@sinclair/typebox";
import {
	Container,
	type Component,
	Spacer,
	truncateToWidth,
	visibleWidth,
	wrapTextWithAnsi,
} from "@mariozechner/pi-tui";
import { resolve } from "node:path";
import { cleanBashOutput, type ToolResult } from "./bash-output.ts";

export type Theme = {
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
			| "syntaxPunctuation"
			| "thinkingText",
		text: string,
	): string;
};

export type RenderContext = {
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

export type SpinnerState = {
	interval?: NodeJS.Timeout;
	expandedResultBody?: Component;
};

export type BuiltInDefinitions = ReturnType<typeof createBuiltInDefinitions>;
export type BuiltInToolName = keyof BuiltInDefinitions;
export type ToolRenderOptions = { isPartial: boolean; expanded: boolean };

type LabelBuilder = (args: any, theme: Theme, cwd: string) => string;
type CollapsedIntentResultRenderer = (
	result: any,
	theme: Theme,
	context: RenderContext,
	label: string,
	intent: string | undefined,
) => Component;

type CollapsedStandardResultRenderer = (
	result: any,
	theme: Theme,
	context: RenderContext,
	label: string,
) => Component;

type ExpandedStandardResultPreparer = (result: any, context: RenderContext) => void;

const SPINNER_INTERVAL_MS = 80;
const SPINNER_FRAMES = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"] as const;
const NBSP = "\u00A0";
const WRAPPABLE_PATH_SEPARATOR = "/ ";
const WRAPPABLE_GREP_SEPARATOR = "| ";

const toolCache = new Map<string, ReturnType<typeof createBuiltInDefinitions>>();
export const intentProperty = Type.String({
	description:
		"Short note explaining why this tool call helps accomplish the current task. Always populate this field.",
});

export class WrappedStatusText implements Component {
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

export class TruncatedPreviewText implements Component {
	private text: string;
	private maxLines: number;
	private indent: string;
	private leadingBlankLine: boolean;
	private overflowLineFormatter?: (hiddenLineCount: number) => string;
	private tail: boolean;
	private blankLineBeforeOverflow: boolean;

	constructor(
		text = "",
		maxLines = 3,
		indent = "",
		leadingBlankLine = false,
		overflowLineFormatter?: (hiddenLineCount: number) => string,
		tail = false,
		blankLineBeforeOverflow = false,
	) {
		this.text = text;
		this.maxLines = maxLines;
		this.indent = indent;
		this.leadingBlankLine = leadingBlankLine;
		this.overflowLineFormatter = overflowLineFormatter;
		this.tail = tail;
		this.blankLineBeforeOverflow = blankLineBeforeOverflow;
	}

	setParts(
		text: string,
		maxLines = this.maxLines,
		indent = this.indent,
		leadingBlankLine = this.leadingBlankLine,
		overflowLineFormatter = this.overflowLineFormatter,
		tail = this.tail,
		blankLineBeforeOverflow = this.blankLineBeforeOverflow,
	): void {
		this.text = text;
		this.maxLines = maxLines;
		this.indent = indent;
		this.leadingBlankLine = leadingBlankLine;
		this.overflowLineFormatter = overflowLineFormatter;
		this.tail = tail;
		this.blankLineBeforeOverflow = blankLineBeforeOverflow;
	}

	render(width: number): string[] {
		const safeWidth = Math.max(1, Math.floor(width));
		const sourceLines = this.text.split("\n");
		const indentWidth = visibleWidth(this.indent);
		const contentWidth = Math.max(1, safeWidth - indentWidth);
		const wrappedChunks = sourceLines.flatMap((sourceLine) => {
			const wrapped = wrapTextWithAnsi(sourceLine ?? "", contentWidth);
			return (wrapped.length > 0 ? wrapped : [""]).map((chunk) => (
				truncateToWidth(`${this.indent}${chunk}`, safeWidth, "", true)
			));
		});
		const hiddenLineCount = Math.max(0, wrappedChunks.length - this.maxLines);
		const visibleChunks = this.tail
			? wrappedChunks.slice(Math.max(0, wrappedChunks.length - this.maxLines))
			: wrappedChunks.slice(0, this.maxLines);
		const lines = [...visibleChunks];

		if (hiddenLineCount > 0 && this.overflowLineFormatter) {
			if (this.blankLineBeforeOverflow && lines.length > 0) lines.push("");
			lines.push(truncateToWidth(this.overflowLineFormatter(hiddenLineCount), safeWidth, "", true));
		}

		const renderedLines = trimBlankLines(lines);
		return this.leadingBlankLine && renderedLines.length > 0 ? ["", ...renderedLines] : renderedLines;
	}

	invalidate(): void {}
}

export class IndentedComponent implements Component {
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

export function createBuiltInDefinitions(cwd: string) {
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

export function getBuiltInDefinitions(cwd: string) {
	let definitions = toolCache.get(cwd);
	if (!definitions) {
		definitions = createBuiltInDefinitions(cwd);
		toolCache.set(cwd, definitions);
	}
	return definitions;
}

export function stripAtPrefix(value: string): string {
	return value.startsWith("@") ? value.slice(1) : value;
}

export function toFullPath(inputPath: string | undefined, cwd: string, fallback = cwd): string {
	const raw = stripAtPrefix((inputPath || fallback).trim());
	return resolve(cwd, raw || ".");
}

export function formatReadRange(offset?: number, limit?: number): string {
	if (offset === undefined && limit === undefined) return "";
	const start = offset ?? 1;
	if (limit === undefined) return `:${start}`;
	const end = start + Math.max(0, limit - 1);
	return `:${start}-${end}`;
}

export function compactText(text: string | undefined): string {
	if (!text) return "";
	return text.replace(/\s+/g, " ").trim();
}

export function formatPathForWrapping(path: string): string {
	return path.replaceAll("/", WRAPPABLE_PATH_SEPARATOR);
}

export function formatGrepPatternForWrapping(pattern: string): string {
	return pattern.replaceAll("|", WRAPPABLE_GREP_SEPARATOR);
}

export function restoreWrappedSpacing(text: string): string {
	return text
		.replaceAll(WRAPPABLE_PATH_SEPARATOR, "/")
		.replaceAll(WRAPPABLE_GREP_SEPARATOR, "|");
}

export function formatToolLabel(theme: Theme, toolName: string, details: string): string {
	return `${theme.fg("toolTitle", theme.bold(toolName))}${NBSP}${details}`;
}

export function formatPathLabel(theme: Theme, toolName: string, path: string): string {
	return formatToolLabel(theme, toolName, theme.fg("syntaxFunction", formatPathForWrapping(path)));
}

export function formatGrepLabel(theme: Theme, pattern: string | undefined, path: string, glob?: string): string {
	const query = theme.fg("syntaxNumber", theme.bold(formatGrepPatternForWrapping(compactText(pattern))));
	const location = theme.fg("muted", `in${NBSP}${formatPathForWrapping(path)}${glob ? ` (${compactText(glob)})` : ""}`);
	return formatToolLabel(theme, "Grep", `${query} ${location}`);
}

export function formatFindLabel(theme: Theme, pattern: string | undefined, path: string): string {
	const query = theme.fg("syntaxVariable", theme.bold(compactText(pattern)));
	const location = theme.fg("syntaxPunctuation", `in${NBSP}${formatPathForWrapping(path)}`);
	return formatToolLabel(theme, "Find", `${query} ${location}`);
}

export function formatBashLabel(theme: Theme, command: string | undefined): string {
	return formatToolLabel(theme, "Run", theme.fg("bashMode", compactText(command)));
}

export function withIntentParameters<T extends Record<string, any>>(parameters: T): T {
	return {
		...parameters,
		properties: {
			...(parameters.properties ?? {}),
			intent: intentProperty,
		},
		required: [...new Set([...(parameters.required ?? []), "intent"])],
	} as T;
}

export function prepareArgumentsWithIntent(args: unknown): Record<string, unknown> {
	if (!args || typeof args !== "object") return { intent: "Intent not provided" };
	const input = args as Record<string, unknown>;
	if (typeof input.intent === "string" && input.intent.trim().length > 0) return input;
	return { ...input, intent: "Intent not provided" };
}

export function stripIntent<T extends Record<string, unknown>>(args: T): Omit<T, "intent"> {
	const { intent: _intent, ...rest } = args;
	return rest;
}

export function formatIntent(theme: Theme, intent: string | undefined): string {
	const value = compactText(intent);
	if (!value) return "";
	return theme.fg("thinkingText", value);
}

export function renderToolWithIntent(
	theme: Theme,
	context: RenderContext,
	label: string,
	intent: string | undefined,
): Component {
	const formattedIntent = formatIntent(theme, intent);
	if (!formattedIntent) return oneLine(theme, context, label);
	const component = resetContainer(context);
	component.addChild(
		previewComponent(
			formattedIntent,
			{ ...context, lastComponent: undefined },
			4,
			"  ",
		),
	);
	component.addChild(new Spacer(1));
	component.addChild(oneLine(theme, { ...context, lastComponent: undefined }, label));
	return component;
}

export function startSpinner(context: RenderContext): void {
	const state = context.state as SpinnerState;
	if (state.interval) return;
	state.interval = setInterval(() => context.invalidate(), SPINNER_INTERVAL_MS);
}

export function stopSpinner(context: RenderContext): void {
	const state = context.state as SpinnerState;
	if (!state.interval) return;
	clearInterval(state.interval);
	state.interval = undefined;
}

export function spinnerFrame(): string {
	const index = Math.floor(Date.now() / SPINNER_INTERVAL_MS) % SPINNER_FRAMES.length;
	return SPINNER_FRAMES[index] ?? SPINNER_FRAMES[0];
}

export function statusPrefix(theme: Theme, context: RenderContext): string {
	if (context.isPartial) {
		startSpinner(context);
		return theme.fg("accent", spinnerFrame());
	}

	stopSpinner(context);
	return context.isError ? theme.fg("error", "✕") : theme.fg("success", "✓");
}

export function oneLine(theme: Theme, context: RenderContext, label: string): WrappedStatusText {
	const component = context.lastComponent instanceof WrappedStatusText
		? context.lastComponent
		: new WrappedStatusText();
	component.setParts(statusPrefix(theme, context), label);
	return component;
}

export function resetContainer(context: RenderContext): Container {
	const component = context.lastComponent instanceof Container ? context.lastComponent : new Container();
	component.clear();
	return component;
}

export function previewComponent(
	text: string,
	context: RenderContext,
	maxLines = 3,
	indent = "",
	leadingBlankLine = false,
	overflowLineFormatter?: (hiddenLineCount: number) => string,
	tail = false,
	blankLineBeforeOverflow = false,
): TruncatedPreviewText {
	const component = context.lastComponent instanceof TruncatedPreviewText
		? context.lastComponent
		: new TruncatedPreviewText();
	component.setParts(text, maxLines, indent, leadingBlankLine, overflowLineFormatter, tail, blankLineBeforeOverflow);
	return component;
}

export function indentedComponent(
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

export function renderExpandedResultWithHeader(
	theme: Theme,
	context: RenderContext,
	label: string,
	renderBuiltInResult: (builtInContext: RenderContext) => Component | undefined,
	intent?: string,
): Container {
	const component = resetContainer(context);
	component.addChild(renderToolWithIntent(theme, { ...context, lastComponent: undefined }, label, intent));
	const state = context.state as SpinnerState;
	const builtInContext: RenderContext = { ...context, lastComponent: state.expandedResultBody };
	const body = renderBuiltInResult(builtInContext) ?? resetContainer({ ...context, lastComponent: undefined });
	state.expandedResultBody = body;
	component.addChild(indentedComponent(body, { ...context, lastComponent: undefined }));
	return component;
}

export function renderPartialCallLine(theme: Theme, context: RenderContext, label: string): Component {
	if (!context.isPartial) return resetContainer(context);
	return oneLine(theme, context, label);
}

export function renderPartialCallWithIntent(
	theme: Theme,
	context: RenderContext,
	label: string,
	intent: string | undefined,
): Component {
	if (!context.isPartial) return resetContainer(context);
	return renderToolWithIntent(theme, context, label, intent);
}

export function renderStandardToolResult<TName extends BuiltInToolName>(
	toolName: TName,
	result: ToolResult,
	options: ToolRenderOptions,
	theme: Theme,
	context: RenderContext,
	label: string,
): Component {
	if (options.isPartial) return resetContainer(context);
	if (!options.expanded) {
		return oneLine(theme, context, label);
	}
	stopSpinner(context);
	return renderExpandedResultWithHeader(theme, context, label, (builtInContext) => (
		renderBuiltInToolResult(toolName, context.cwd, result, options, theme, builtInContext)
	));
}

export function renderStandardIntentToolResult<TName extends BuiltInToolName>(
	toolName: TName,
	result: ToolResult,
	options: ToolRenderOptions,
	theme: Theme,
	context: RenderContext,
	label: string,
	intent: string | undefined,
): Component {
	if (options.isPartial) return resetContainer(context);
	if (!options.expanded) {
		return renderToolWithIntent(theme, context, label, intent);
	}
	stopSpinner(context);
	return renderExpandedResultWithHeader(theme, context, label, (builtInContext) => (
		renderBuiltInToolResult(toolName, context.cwd, result, options, theme, builtInContext)
	), intent);
}

export function renderCollapsedEditResult(
	result: ToolResult<EditToolDetails>,
	theme: Theme,
	context: RenderContext,
	label: string,
	intent: string | undefined,
): Component {
	const component = resetContainer(context);
	component.addChild(renderToolWithIntent(theme, { ...context, lastComponent: undefined }, appendExpandHint(theme, label), intent));
	const changes = countDiffChanges(result.details?.diff);
	if (changes) {
		component.addChild(
			previewComponent(
				`${theme.fg("success", `  +${changes.additions}`)}${theme.fg("dim", " / ")}${theme.fg("error", `-${changes.removals}`)}`,
				context,
				1,
			),
		);
	}
	return component;
}

export function renderCollapsedBashResult(
	result: ToolResult<BashToolDetails>,
	theme: Theme,
	context: RenderContext,
	label: string,
	intent: string | undefined,
): Component {
	const component = resetContainer(context);
	const output = cleanBashOutput(result);
	component.addChild(renderToolWithIntent(theme, { ...context, lastComponent: undefined }, label, intent));
	if (output.length > 0) {
		component.addChild(
			previewComponent(
				output
					.split("\n")
					.map((line) => theme.fg("toolOutput", line))
					.join("\n"),
				context,
				10,
				"  ",
				true,
				(hiddenLineCount) => `${theme.fg("dim", `  ... ${hiddenLineCount} more lines`)} ${expandHint(theme)}`,
				false,
				true,
			),
		);
	}
	return component;
}

export function syncImageAttachmentsWithExpandedState(
	result: ToolResult | undefined,
	options: ToolRenderOptions,
	context: RenderContext,
	stateKey = "hiddenImageResultContent",
): void {
	if (!result || !Array.isArray(result.content)) return;
	const content = result.content;
	const state = context.state as SpinnerState & Record<string, unknown>;
	const hiddenContent = state[stateKey];
	const hasImages = content.some((part) => part?.type === "image");

	if (options.expanded) {
		if (!hasImages && Array.isArray(hiddenContent)) {
			content.splice(0, content.length, ...hiddenContent);
		}
		return;
	}

	if (!hasImages) return;
	state[stateKey] = [...content];
	content.splice(0, content.length, ...content.filter((part) => part?.type !== "image"));
}

export function registerStandardTool(
	pi: ExtensionAPI,
	toolName: BuiltInToolName,
	buildLabel: LabelBuilder,
	renderCollapsedResult?: CollapsedStandardResultRenderer,
	prepareExpandedResult?: ExpandedStandardResultPreparer,
): void {
	pi.registerTool({
		...getBuiltInTool(process.cwd(), toolName),
		renderShell: "self",
		async execute(toolCallId: any, params: any, signal: any, onUpdate: any, ctx: any) {
			return executeBuiltInTool(toolName, toolCallId, params as Record<string, unknown>, signal, onUpdate, ctx);
		},
		renderCall(args: any, theme: any, context: any) {
			const toolTheme = theme as Theme;
			const toolContext = context as RenderContext;
			return renderPartialCallLine(toolTheme, toolContext, buildLabel(args, toolTheme, toolContext.cwd));
		},
		renderResult(result: any, options: any, theme: any, context: any) {
			const toolTheme = theme as Theme;
			const toolContext = context as RenderContext;
			const rawContext = context as any;
			const label = buildLabel(rawContext.args, toolTheme, rawContext.cwd);
			if (!renderCollapsedResult) {
				return renderStandardToolResult(
					toolName,
					result as ToolResult,
					options,
					toolTheme,
					toolContext,
					label,
				);
			}
			if (options.isPartial) return resetContainer(toolContext);
			stopSpinner(toolContext);
			if (!options.expanded) {
				return renderCollapsedResult(
					result as ToolResult,
					toolTheme,
					toolContext,
					label,
				);
			}
			prepareExpandedResult?.(result as ToolResult, toolContext);
			return renderExpandedResultWithHeader(toolTheme, toolContext, label, (builtInContext) => (
				renderBuiltInToolResult(toolName, rawContext.cwd, result as ToolResult, options, theme, builtInContext)
			));
		},
	} as any);
}

export function registerIntentTool(
	pi: ExtensionAPI,
	toolName: BuiltInToolName,
	buildLabel: LabelBuilder,
	renderCollapsedResult?: CollapsedIntentResultRenderer,
): void {
	pi.registerTool({
		...getBuiltInTool(process.cwd(), toolName),
		parameters: withIntentParameters(getBuiltInTool(process.cwd(), toolName).parameters),
		prepareArguments: prepareArgumentsWithIntent,
		renderShell: "self",
		async execute(toolCallId: any, params: any, signal: any, onUpdate: any, ctx: any) {
			return executeBuiltInTool(toolName, toolCallId, stripIntent(params as Record<string, unknown>), signal, onUpdate, ctx);
		},
		renderCall(args: any, theme: any, context: any) {
			const toolTheme = theme as Theme;
			const toolContext = context as RenderContext;
			const rawArgs = args as any;
			return renderPartialCallWithIntent(
				toolTheme,
				toolContext,
				buildLabel(args, toolTheme, toolContext.cwd),
				rawArgs.intent,
			);
		},
		renderResult(result: any, options: any, theme: any, context: any) {
			const toolTheme = theme as Theme;
			const toolContext = context as RenderContext;
			const rawContext = context as any;
			const label = buildLabel(rawContext.args, toolTheme, rawContext.cwd);
			if (!renderCollapsedResult) {
				return renderStandardIntentToolResult(
					toolName,
					result as ToolResult,
					options,
					toolTheme,
					toolContext,
					label,
					rawContext.args.intent,
				);
			}
			if (options.isPartial) return resetContainer(toolContext);
			stopSpinner(toolContext);
			if (!options.expanded) {
				return renderCollapsedResult(
					result as ToolResult,
					toolTheme,
					toolContext,
					label,
					rawContext.args.intent,
				);
			}
			return renderExpandedResultWithHeader(toolTheme, toolContext, label, (builtInContext) => (
				renderBuiltInToolResult(toolName, rawContext.cwd, result as ToolResult, options, theme, builtInContext)
			), rawContext.args.intent);
		},
	} as any);
}

export function getBuiltInTool<TName extends BuiltInToolName>(cwd: string, toolName: TName): BuiltInDefinitions[TName] {
	return getBuiltInDefinitions(cwd)[toolName];
}

export function executeBuiltInTool<TName extends BuiltInToolName>(
	toolName: TName,
	toolCallId: string,
	params: Record<string, unknown>,
	signal: AbortSignal | undefined,
	onUpdate: ((result: unknown) => void) | undefined,
	ctx: { cwd: string },
) {
	return getBuiltInTool(ctx.cwd, toolName).execute(toolCallId, params as any, signal as any, onUpdate as any, ctx as any);
}

export function renderBuiltInToolResult<TName extends BuiltInToolName>(
	toolName: TName,
	cwd: string,
	result: ToolResult,
	options: ToolRenderOptions,
	theme: unknown,
	context: RenderContext,
): Component | undefined {
	return getBuiltInTool(cwd, toolName).renderResult?.(result as any, options as any, theme as any, context as any);
}

export function trimBlankLines(lines: string[]): string[] {
	let start = 0;
	let end = lines.length;
	while (start < end && (lines[start] ?? "").trim().length === 0) start++;
	while (end > start && (lines[end - 1] ?? "").trim().length === 0) end--;
	return lines.slice(start, end);
}

export function expandHint(theme: Theme): string {
	return `${theme.fg("muted", "(")}${keyHint("app.tools.expand", "to expand")}${theme.fg("muted", ")")}`;
}

export function appendExpandHint(theme: Theme, label: string): string {
	return `${label}${NBSP}${expandHint(theme)}`;
}

export function countDiffChanges(diff: string | undefined): { additions: number; removals: number } | undefined {
	if (!diff) return undefined;
	let additions = 0;
	let removals = 0;
	for (const line of diff.split("\n")) {
		if (line.startsWith("+") && !line.startsWith("+++")) additions++;
		if (line.startsWith("-") && !line.startsWith("---")) removals++;
	}
	return { additions, removals };
}
