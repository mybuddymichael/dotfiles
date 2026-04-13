import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { UserMessageComponent } from "@mariozechner/pi-coding-agent";
import { Markdown, truncateToWidth, visibleWidth } from "@mariozechner/pi-tui";

type RenderFn = (width: number) => string[];

type PatchableUserMessagePrototype = {
	render: RenderFn;
	__userMessageStyleOriginalRender?: RenderFn;
	__userMessageStylePatched?: boolean;
	__userMessageStylePatchVersion?: number;
};

type MarkdownLikeChild = {
	text?: unknown;
	theme?: unknown;
	defaultTextStyle?: unknown;
};

const PATCH_VERSION = 3;
const ANSI_COLOR_2 = "\x1b[32m";
const ANSI_RESET_FG = "\x1b[39m";
const ANSI_RE = /\x1b\[[0-9;]*m/g;
const PREFIX = "▎ ";

function color2(text: string): string {
	return `${ANSI_COLOR_2}${text}${ANSI_RESET_FG}`;
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

function prefixLine(line: string, width: number): string {
	const contentWidth = Math.max(1, width - visibleWidth(PREFIX));
	const plainLine = stripAnsi(line);
	return color2(`${PREFIX}${truncateToWidth(plainLine, contentWidth, "", true)}`);
}

function patchUserMessagePrototype(): void {
	const prototype = UserMessageComponent.prototype as unknown as PatchableUserMessagePrototype;
	if (typeof prototype.render !== "function") return;

	if (
		prototype.__userMessageStylePatched
		&& prototype.__userMessageStylePatchVersion === PATCH_VERSION
		&& typeof prototype.__userMessageStyleOriginalRender === "function"
	) {
		return;
	}

	if (!prototype.__userMessageStyleOriginalRender) {
		prototype.__userMessageStyleOriginalRender = prototype.render;
	}

	const originalRender = prototype.__userMessageStyleOriginalRender;
	if (!originalRender) return;

	prototype.render = function renderUserMessageWithStyle(width: number): string[] {
		const safeWidth = Math.max(1, Math.floor(width));
		const contentWidth = Math.max(1, safeWidth - visibleWidth(PREFIX));
		const body = renderBody(this, contentWidth, originalRender);
		return ["", ...(body.length > 0 ? body : [""]).map((line) => prefixLine(line, safeWidth))];
	};

	prototype.__userMessageStylePatched = true;
	prototype.__userMessageStylePatchVersion = PATCH_VERSION;
}

export default function userMessageStyleExtension(pi: ExtensionAPI): void {
	patchUserMessagePrototype();

	pi.on("session_start", async () => {
		patchUserMessagePrototype();
	});

	pi.on("before_agent_start", async () => {
		patchUserMessagePrototype();
	});
}
