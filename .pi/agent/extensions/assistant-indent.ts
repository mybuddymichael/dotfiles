import type { AssistantMessage } from "@mariozechner/pi-ai";
import type { ExtensionAPI, Theme } from "@mariozechner/pi-coding-agent";
import { AssistantMessageComponent } from "@mariozechner/pi-coding-agent";
import { Container, Loader, Markdown, Spacer, truncateToWidth, visibleWidth } from "@mariozechner/pi-tui";

const ANSI_RESET_FG = "\x1b[39m";

const PATCH_VERSION = 12;
const INDENT = 0;
const THINKING_INDENT = 2;
const WORKING_PREFIX = "Working";
const AGENT_RAIL = "┃";
const AGENT_FILL = "╱";
const AGENT_LABEL = " AGENT ";
const AGENT_BODY_PREFIX = "┃ ";

type PatchableAssistantMessagePrototype = {
	updateContent(message: AssistantMessage): void;
	invalidate(): void;
	setHideThinkingBlock?(hide: boolean): void;
	setHiddenThinkingLabel?(label: string): void;
	contentContainer?: Container;
	hideThinkingBlock?: boolean;
	markdownTheme?: unknown;
	hiddenThinkingLabel?: string;
	lastMessage?: AssistantMessage;
	__assistantIndentOriginalUpdateContent?: (message: AssistantMessage) => void;
	__assistantIndentPatched?: boolean;
	__assistantIndentPatchVersion?: number;
};

type PatchableLoaderPrototype = {
	updateDisplay(): void;
	setText(text: string): void;
	spinnerColorFn?: (text: string) => string;
	messageColorFn?: (text: string) => string;
	message?: string;
	currentFrame?: number;
	frames?: string[];
	ui?: { requestRender(): void } | null;
	paddingX?: number;
	__assistantIndentOriginalUpdateDisplay?: () => void;
	__assistantIndentPatched?: boolean;
	__assistantIndentPatchVersion?: number;
};

type ThemeLike = Pick<Theme, "fg" | "italic" | "bg" | "getBgAnsi">;

let currentTheme: ThemeLike | undefined;

function getThemeLike(): ThemeLike {
	return currentTheme ?? {
		fg: (_color, text) => text,
		italic: (text) => text,
		bg: (_color, text) => text,
		getBgAnsi: () => "",
	};
}

function themeBgAsFg(themeLike: ThemeLike, color: "selectedBg", text: string): string {
	try {
		const ansi = themeLike.getBgAnsi?.(color) ?? "";
		if (!ansi) return text;
		return `${ansi.replace(/\[48;/g, "[38;")}${text}${ANSI_RESET_FG}`;
	} catch {
		return text;
	}
}

function trimEdgeBlankLines(lines: string[]): string[] {
	let start = 0;
	let end = lines.length;

	while (start < end && lines[start]?.trim().length === 0) start++;
	while (end > start && lines[end - 1]?.trim().length === 0) end--;

	return lines.slice(start, end);
}

function renderAgentRail(themeLike: ThemeLike): string {
	return themeLike.fg("border", AGENT_RAIL);
}

function renderAgentHeaderLine(width: number, themeLike: ThemeLike): string {
	const safeWidth = Math.max(1, Math.floor(width));
	const indent = " ".repeat(INDENT);
	const lead = `${indent}${renderAgentRail(themeLike)} `;
	const label = themeLike.bg("selectedBg", themeLike.fg("border", AGENT_LABEL));
	const base = `${lead}${label} `;
	const remaining = Math.max(0, safeWidth - visibleWidth(base));
	return truncateToWidth(`${base}${themeBgAsFg(themeLike, "selectedBg", AGENT_FILL.repeat(remaining))}`, safeWidth, "", true);
}

function renderAgentBodyLine(line: string, width: number, themeLike: ThemeLike): string {
	const safeWidth = Math.max(1, Math.floor(width));
	const indent = " ".repeat(INDENT);
	const prefix = `${indent}${renderAgentRail(themeLike)} `;
	const contentWidth = Math.max(1, safeWidth - visibleWidth(prefix));
	return `${prefix}${truncateToWidth(line, contentWidth, "", true)}`;
}

function createAgentMarkdownBlock(text: string, markdownTheme: unknown, themeLike: ThemeLike, defaultTextStyle?: unknown) {
	return {
		render: (width: number) => {
			const safeWidth = Math.max(1, Math.floor(width));
			const contentWidth = Math.max(1, safeWidth - INDENT - visibleWidth(AGENT_BODY_PREFIX));
			const markdown = new Markdown(text.trim(), 0, 0, markdownTheme as never, defaultTextStyle as never);
			const lines = trimEdgeBlankLines(markdown.render(contentWidth));
			const body = lines.length > 0 ? lines : [""];
			return body.map((line) => renderAgentBodyLine(line, safeWidth, themeLike));
		},
		invalidate: () => {},
	};
}

function createAgentTextLine(text: string, themeLike: ThemeLike) {
	return {
		render: (width: number) => [renderAgentBodyLine(text, width, themeLike)],
		invalidate: () => {},
	};
}

function renderThinkingLine(line: string, width: number): string {
	const safeWidth = Math.max(1, Math.floor(width));
	const prefix = " ".repeat(THINKING_INDENT);
	const contentWidth = Math.max(1, safeWidth - visibleWidth(prefix));
	return `${prefix}${truncateToWidth(line, contentWidth, "", true)}`;
}

function createThinkingMarkdownBlock(text: string, markdownTheme: unknown, themeLike: ThemeLike, defaultTextStyle?: unknown) {
	return {
		render: (width: number) => {
			const safeWidth = Math.max(1, Math.floor(width));
			const contentWidth = Math.max(1, safeWidth - THINKING_INDENT);
			const markdown = new Markdown(text.trim(), 0, 0, markdownTheme as never, defaultTextStyle as never);
			const lines = trimEdgeBlankLines(markdown.render(contentWidth));
			const body = lines.length > 0 ? lines : [themeLike.italic(themeLike.fg("thinkingText", ""))];
			return body.map((line) => renderThinkingLine(line, safeWidth));
		},
		invalidate: () => {},
	};
}

function createThinkingTextLine(text: string) {
	return {
		render: (width: number) => [renderThinkingLine(text, width)],
		invalidate: () => {},
	};
}

function patchAssistantMessagePrototype(): void {
	const prototype = AssistantMessageComponent.prototype as unknown as PatchableAssistantMessagePrototype;
	if (typeof prototype.updateContent !== "function") return;

	if (
		prototype.__assistantIndentPatched
		&& prototype.__assistantIndentPatchVersion === PATCH_VERSION
		&& typeof prototype.__assistantIndentOriginalUpdateContent === "function"
	) {
		return;
	}

	if (!prototype.__assistantIndentOriginalUpdateContent) {
		prototype.__assistantIndentOriginalUpdateContent = prototype.updateContent;
	}

	prototype.updateContent = function updateContentWithTwoSpaceIndent(message: AssistantMessage): void {
		this.lastMessage = message;

		const contentContainer = this.contentContainer;
		if (!contentContainer) {
			this.__assistantIndentOriginalUpdateContent?.call(this, message);
			return;
		}

		contentContainer.clear();

		const hasVisibleThinking = message.content.some((c) => c.type === "thinking" && c.thinking.trim());

		const themeLike = getThemeLike();
		let didStartAgentBlock = false;
		if (hasVisibleThinking) {
			contentContainer.addChild(new Spacer(1));
		}

		for (let i = 0; i < message.content.length; i++) {
			const content = message.content[i];

			if (content.type === "text" && content.text.trim()) {
				if (!didStartAgentBlock) {
					if (!hasVisibleThinking) contentContainer.addChild(new Spacer(1));
					contentContainer.addChild({
						render: (width: number) => [renderAgentHeaderLine(width, themeLike), renderAgentBodyLine("", width, themeLike)],
						invalidate: () => {},
					});
					didStartAgentBlock = true;
				}
				contentContainer.addChild(createAgentMarkdownBlock(content.text, this.markdownTheme, themeLike));
			} else if (content.type === "thinking" && content.thinking.trim()) {
				const hasVisibleContentAfter = message.content
					.slice(i + 1)
					.some((c) => (c.type === "text" && c.text.trim()) || (c.type === "thinking" && c.thinking.trim()));

				if (this.hideThinkingBlock) {
					contentContainer.addChild(
						createThinkingTextLine(themeLike.italic(themeLike.fg("thinkingText", this.hiddenThinkingLabel ?? "Thinking..."))),
					);
					if (hasVisibleContentAfter) contentContainer.addChild(new Spacer(1));
				} else {
					contentContainer.addChild(
						createThinkingMarkdownBlock(content.thinking, this.markdownTheme, themeLike, {
							color: (text: string) => themeLike.fg("thinkingText", text),
							italic: true,
						} as never),
					);
					if (hasVisibleContentAfter) contentContainer.addChild(new Spacer(1));
				}
			}
		}

		const hasToolCalls = message.content.some((c) => c.type === "toolCall");
		if (!hasToolCalls) {
			if (message.stopReason === "aborted") {
				const abortMessage = message.errorMessage && message.errorMessage !== "Request was aborted"
					? message.errorMessage
					: "Operation aborted";
				contentContainer.addChild(new Spacer(1));
				contentContainer.addChild(createAgentTextLine(themeLike.fg("error", abortMessage), themeLike));
			} else if (message.stopReason === "error") {
				const errorMsg = message.errorMessage || "Unknown error";
				contentContainer.addChild(new Spacer(1));
				contentContainer.addChild(createAgentTextLine(themeLike.fg("error", `Error: ${errorMsg}`), themeLike));
			}
		}
	} as PatchableAssistantMessagePrototype["updateContent"];

	prototype.__assistantIndentPatched = true;
	prototype.__assistantIndentPatchVersion = PATCH_VERSION;
}

function patchLoaderPrototype(): void {
	const prototype = Loader.prototype as unknown as PatchableLoaderPrototype;
	if (typeof prototype.updateDisplay !== "function") return;

	if (
		prototype.__assistantIndentPatched
		&& prototype.__assistantIndentPatchVersion === PATCH_VERSION
		&& typeof prototype.__assistantIndentOriginalUpdateDisplay === "function"
	) {
		return;
	}

	if (!prototype.__assistantIndentOriginalUpdateDisplay) {
		prototype.__assistantIndentOriginalUpdateDisplay = prototype.updateDisplay;
	}

	prototype.updateDisplay = function updateDisplayWithZeroIndentWorking(): void {
		const frame = this.frames?.[this.currentFrame ?? 0] ?? "";
		const message = this.message ?? "";

		if (!message.startsWith(WORKING_PREFIX)) {
			this.paddingX = 1;
			this.__assistantIndentOriginalUpdateDisplay?.call(this);
			return;
		}

		this.paddingX = 0;
		const spinner = this.spinnerColorFn ? this.spinnerColorFn(frame) : frame;
		const coloredMessage = this.messageColorFn ? this.messageColorFn(message) : message;
		this.setText(`${spinner} ${coloredMessage}`);
		this.ui?.requestRender();
	} as PatchableLoaderPrototype["updateDisplay"];

	prototype.__assistantIndentPatched = true;
	prototype.__assistantIndentPatchVersion = PATCH_VERSION;
}

export default function assistantIndentExtension(pi: ExtensionAPI): void {
	pi.on("session_start", async (_event, ctx) => {
		currentTheme = ctx.hasUI ? ctx.ui.theme : undefined;
		patchAssistantMessagePrototype();
		patchLoaderPrototype();
	});

	pi.on("before_agent_start", async (_event, ctx) => {
		currentTheme = ctx.hasUI ? ctx.ui.theme : currentTheme;
		patchAssistantMessagePrototype();
		patchLoaderPrototype();
	});
}
