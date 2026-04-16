import type { AssistantMessage } from "@mariozechner/pi-ai";
import type { ExtensionAPI, Theme } from "@mariozechner/pi-coding-agent";
import { AssistantMessageComponent } from "@mariozechner/pi-coding-agent";
import { Container, Loader, Markdown, Spacer, Text, truncateToWidth, visibleWidth } from "@mariozechner/pi-tui";

const ANSI_RESET_FG = "\x1b[39m";

const PATCH_VERSION = 4;
const INDENT = 2;
const WORKING_PREFIX = "Working";
const AGENT_FILL = "╱";
const AGENT_LABEL = " AGENT ";

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

function renderAgentHeaderLine(width: number, themeLike: ThemeLike): string {
	const safeWidth = Math.max(1, Math.floor(width));
	const indent = " ".repeat(INDENT);
	const label = themeLike.bg("selectedBg", themeLike.fg("dim", AGENT_LABEL));
	const base = `${indent}${label}`;
	const remaining = Math.max(0, safeWidth - visibleWidth(base));
	return truncateToWidth(`${base}${themeBgAsFg(themeLike, "selectedBg", AGENT_FILL.repeat(remaining))}`, safeWidth, "", true);
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

		const hasVisibleText = message.content.some((c) => c.type === "text" && c.text.trim());
		const hasVisibleThinking = message.content.some((c) => c.type === "thinking" && c.thinking.trim());

		if (hasVisibleText) {
			const themeLike = getThemeLike();
			contentContainer.addChild(new Spacer(1));
			contentContainer.addChild({
				render: (width: number) => [renderAgentHeaderLine(width, themeLike)],
				invalidate: () => {},
			});
			contentContainer.addChild(new Spacer(1));
		} else if (hasVisibleThinking) {
			contentContainer.addChild(new Spacer(1));
		}

		for (let i = 0; i < message.content.length; i++) {
			const content = message.content[i];

			if (content.type === "text" && content.text.trim()) {
				contentContainer.addChild(new Markdown(content.text.trim(), INDENT, 0, this.markdownTheme as never));
			} else if (content.type === "thinking" && content.thinking.trim()) {
				const hasVisibleContentAfter = message.content
					.slice(i + 1)
					.some((c) => (c.type === "text" && c.text.trim()) || (c.type === "thinking" && c.thinking.trim()));

				const themeLike = getThemeLike();
				if (this.hideThinkingBlock) {
					contentContainer.addChild(
						new Text(themeLike.italic(themeLike.fg("thinkingText", this.hiddenThinkingLabel ?? "Thinking...")), INDENT, 0),
					);
					if (hasVisibleContentAfter) contentContainer.addChild(new Spacer(1));
				} else {
					contentContainer.addChild(
						new Markdown(content.thinking.trim(), INDENT, 0, this.markdownTheme as never, {
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
			const themeLike = getThemeLike();
			if (message.stopReason === "aborted") {
				const abortMessage = message.errorMessage && message.errorMessage !== "Request was aborted"
					? message.errorMessage
					: "Operation aborted";
				contentContainer.addChild(new Spacer(1));
				contentContainer.addChild(new Text(themeLike.fg("error", abortMessage), INDENT, 0));
			} else if (message.stopReason === "error") {
				const errorMsg = message.errorMessage || "Unknown error";
				contentContainer.addChild(new Spacer(1));
				contentContainer.addChild(new Text(themeLike.fg("error", `Error: ${errorMsg}`), INDENT, 0));
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
