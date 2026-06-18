import { BashExecutionComponent } from "@mariozechner/pi-coding-agent";
import { truncateToWidth, visibleWidth } from "@mariozechner/pi-tui";
import type { Theme } from "@mariozechner/pi-coding-agent";
import { getActiveTheme, color6 } from "../shared/theme.ts";
import {
	type PatchableBashExecutionInstance,
	type PrefixKind,
	DEFAULT_PREFIX,
} from "../shared/types.ts";
import { trimEdgeBlankLines } from "./render-user-block.ts";

export function getPrefix(kind: PrefixKind): string {
	switch (kind) {
		case "bash":
		case "bashExcluded":
		default:
			return DEFAULT_PREFIX;
	}
}

export function getPrefixKind(text: string): PrefixKind {
	if (text.startsWith("!!")) return "bashExcluded";
	if (text.startsWith("!")) return "bash";
	return "default";
}

export function colorPrefix(prefix: string, kind: PrefixKind): string {
	if (kind === "default") return prefix;
	return color6(prefix);
}

export function colorContent(text: string, kind: PrefixKind): string {
	if (kind === "default") return text;
	return text;
}

export function prefixRenderedLine(line: string, width: number, kind: PrefixKind): string {
	const prefix = getPrefix(kind);
	const contentWidth = Math.max(1, width - visibleWidth(prefix));
	return `${colorPrefix(prefix, kind)}${colorContent(truncateToWidth(line, contentWidth, "", true), kind)}`;
}

export function getModeLabel(kind: PrefixKind, width: number, piTheme: Theme | undefined = getActiveTheme()): string | undefined {
	if (kind === "default") return undefined;
	const label = kind === "bashExcluded" ? "  bash mode (excluded from context)" : "  bash mode";
	const truncated = truncateToWidth(label, Math.max(1, width), "", true);
	return piTheme?.fg("bashMode", truncated) ?? color6(truncated);
}

export function trimBashBox(lines: string[]): string[] {
	const trimmed = trimEdgeBlankLines(lines);
	if (trimmed.length >= 2) return trimEdgeBlankLines(trimmed.slice(1, -1));
	return trimmed;
}

export function withPatchedAddChild<T>(
	mode: {
		chatContainer?: { addChild?: (child: unknown) => unknown };
		pendingMessagesContainer?: { addChild?: (child: unknown) => unknown };
	},
	prefixKind: Exclude<PrefixKind, "default">,
	run: () => T,
): T {
	const patchContainer = (container?: { addChild?: (child: unknown) => unknown }) => {
		if (!container || typeof container.addChild !== "function") return undefined;
		const originalAddChild = container.addChild;
		container.addChild = function addChildWithPrefixKind(child: unknown): unknown {
			if (child instanceof BashExecutionComponent) {
				(child as PatchableBashExecutionInstance).__userMessageStylePrefixKind = prefixKind;
			}
			return originalAddChild.call(this, child);
		};
		return originalAddChild;
	};

	const originalChatAddChild = patchContainer(mode.chatContainer);
	const originalPendingAddChild = patchContainer(mode.pendingMessagesContainer);
	const restore = () => {
		if (originalChatAddChild && mode.chatContainer) mode.chatContainer.addChild = originalChatAddChild;
		if (originalPendingAddChild && mode.pendingMessagesContainer) mode.pendingMessagesContainer.addChild = originalPendingAddChild;
	};

	try {
		const result = run();
		if (result && typeof (result as unknown as PromiseLike<unknown>).then === "function") {
			return Promise.resolve(result as unknown as PromiseLike<unknown>).finally(restore) as T;
		}
		restore();
		return result;
	} catch (error) {
		restore();
		throw error;
	}
}
