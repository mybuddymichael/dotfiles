import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { UserMessageComponent } from "@mariozechner/pi-coding-agent";
import { Markdown, truncateToWidth, visibleWidth } from "@mariozechner/pi-tui";

type RenderFn = (width: number) => string[];

type PatchableUserMessagePrototype = {
	render: RenderFn;
	__userMessageLabelOriginalRender?: RenderFn;
	__userMessageLabelPatched?: boolean;
	__userMessageLabelPatchVersion?: number;
};

type MarkdownLikeChild = {
	text?: unknown;
	theme?: unknown;
	defaultTextStyle?: unknown;
};

const PATCH_VERSION = 2;
const ANSI_COLOR_3 = "\x1b[33m";
const ANSI_RESET_FG = "\x1b[39m";
const ANSI_RE = /\x1b\[[0-9;]*m/g;
const TITLE = "── user ";
const INDENT = " ";

function color3(text: string): string {
	return `${ANSI_COLOR_3}${text}${ANSI_RESET_FG}`;
}

function stripAnsi(text: string): string {
	return text.replace(ANSI_RE, "");
}

function isBlank(line: string): boolean {
	return stripAnsi(line).trim().length === 0;
}

function trimEdgeBlankLines(lines: string[]): string[] {
	let start = 0;
	let end = lines.length;

	while (start < end && isBlank(lines[start] ?? "")) start++;
	while (end > start && isBlank(lines[end - 1] ?? "")) end--;

	return lines.slice(start, end);
}

function sanitizeDefaultTextStyle(style: unknown): Record<string, unknown> | undefined {
	if (!style || typeof style !== "object" || Array.isArray(style)) return undefined;
	const { bgColor: _bgColor, ...rest } = style as Record<string, unknown>;
	return Object.keys(rest).length > 0 ? rest : undefined;
}

function extractMarkdownChild(instance: unknown): MarkdownLikeChild | undefined {
	if (!instance || typeof instance !== "object") return undefined;
	const children = (instance as { children?: unknown[] }).children;
	if (!Array.isArray(children)) return undefined;

	return children.find(
		(child): child is MarkdownLikeChild =>
			!!child
			&& typeof child === "object"
			&& typeof (child as MarkdownLikeChild).text === "string"
			&& (child as MarkdownLikeChild).theme !== undefined,
	);
}

function renderBody(instance: unknown, width: number, originalRender: RenderFn): string[] {
	const markdownChild = extractMarkdownChild(instance);
	if (!markdownChild || typeof markdownChild.text !== "string") {
		return trimEdgeBlankLines(originalRender.call(instance, width));
	}

	try {
		const markdown = new Markdown(
			markdownChild.text,
			0,
			0,
			markdownChild.theme as never,
			sanitizeDefaultTextStyle(markdownChild.defaultTextStyle) as never,
		);
		return trimEdgeBlankLines(markdown.render(width));
	} catch {
		return trimEdgeBlankLines(originalRender.call(instance, width));
	}
}

function indentLine(line: string): string {
	return `${INDENT}${line}`;
}

function buildTopLine(width: number): string {
	const contentWidth = Math.max(1, width - visibleWidth(INDENT));
	const fill = "─".repeat(Math.max(0, contentWidth - visibleWidth(TITLE)));
	return indentLine(color3(truncateToWidth(`${TITLE}${fill}`, contentWidth, "", true)));
}

function buildBottomLine(width: number): string {
	const contentWidth = Math.max(1, width - visibleWidth(INDENT));
	return indentLine(color3("─".repeat(contentWidth)));
}

function patchUserMessagePrototype(): void {
	const prototype = UserMessageComponent.prototype as unknown as PatchableUserMessagePrototype;
	if (typeof prototype.render !== "function") return;

	if (
		prototype.__userMessageLabelPatched
		&& prototype.__userMessageLabelPatchVersion === PATCH_VERSION
		&& typeof prototype.__userMessageLabelOriginalRender === "function"
	) {
		return;
	}

	if (!prototype.__userMessageLabelOriginalRender) {
		prototype.__userMessageLabelOriginalRender = prototype.render;
	}

	const originalRender = prototype.__userMessageLabelOriginalRender;
	if (!originalRender) return;

	prototype.render = function renderUserMessageWithLabel(width: number): string[] {
		const safeWidth = Math.max(1, Math.floor(width));
		const contentWidth = Math.max(1, safeWidth - visibleWidth(INDENT));
		const body = renderBody(this, contentWidth, originalRender);
		const indentedBody = (body.length > 0 ? body : [""]).map(indentLine);
		return [
			"",
			buildTopLine(safeWidth),
			...indentedBody,
			buildBottomLine(safeWidth),
		];
	};

	prototype.__userMessageLabelPatched = true;
	prototype.__userMessageLabelPatchVersion = PATCH_VERSION;
}

export default function userMessageLabelExtension(pi: ExtensionAPI): void {
	patchUserMessagePrototype();

	pi.on("session_start", async () => {
		patchUserMessagePrototype();
	});

	pi.on("before_agent_start", async () => {
		patchUserMessagePrototype();
	});
}
