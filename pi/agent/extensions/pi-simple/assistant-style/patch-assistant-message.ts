import type { AssistantMessage } from "@mariozechner/pi-ai";
import { AssistantMessageComponent } from "@mariozechner/pi-coding-agent";
import { Container, Spacer } from "@mariozechner/pi-tui";
import {
	createAgentMarkdownBlock,
	createAgentTextLine,
	renderAgentBodyLine,
	renderAgentHeaderLine,
} from "./render-agent-block.ts";
import {
	createThinkingMarkdownBlock,
	createThinkingTextLine,
} from "./render-thinking-block.ts";
import { getThemeLike } from "./theme.ts";

export const ASSISTANT_MESSAGE_PATCH_VERSION = 12;

export type PatchableAssistantMessagePrototype = {
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

export function patchAssistantMessagePrototype(): void {
	const prototype = AssistantMessageComponent.prototype as unknown as PatchableAssistantMessagePrototype;
	if (typeof prototype.updateContent !== "function") return;

	if (
		prototype.__assistantIndentPatched
		&& prototype.__assistantIndentPatchVersion === ASSISTANT_MESSAGE_PATCH_VERSION
		&& typeof prototype.__assistantIndentOriginalUpdateContent === "function"
	) {
		return;
	}

	if (!prototype.__assistantIndentOriginalUpdateContent) {
		prototype.__assistantIndentOriginalUpdateContent = prototype.updateContent;
	}

	prototype.updateContent = function updateContentWithTwoSpaceIndent(this: PatchableAssistantMessagePrototype, message: AssistantMessage): void {
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
	prototype.__assistantIndentPatchVersion = ASSISTANT_MESSAGE_PATCH_VERSION;
}
