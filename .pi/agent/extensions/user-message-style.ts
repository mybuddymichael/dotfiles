import type { ExtensionAPI, Theme } from "@mariozechner/pi-coding-agent";
import {
	BashExecutionComponent,
	CustomEditor,
	InteractiveMode,
	UserMessageComponent,
} from "@mariozechner/pi-coding-agent";
import type { EditorTheme } from "@mariozechner/pi-tui";
import { Markdown, truncateToWidth, visibleWidth } from "@mariozechner/pi-tui";

type RenderFn = (width: number) => string[];

type PatchableUserMessagePrototype = {
	render: RenderFn;
	__userMessageStyleOriginalRender?: RenderFn;
	__userMessageStylePatched?: boolean;
	__userMessageStylePatchVersion?: number;
};

type PatchableBashExecutionPrototype = {
	render: RenderFn;
	__userMessageStyleOriginalRender?: RenderFn;
	__userMessageStylePatched?: boolean;
	__userMessageStylePatchVersion?: number;
};

type PatchableInteractiveModePrototype = {
	addMessageToChat?: (message: { role?: string; excludeFromContext?: boolean }, options: unknown) => unknown;
	handleBashCommand?: (command: string, excludeFromContext?: boolean) => unknown;
	__userMessageStylePatched?: boolean;
	__userMessageStylePatchVersion?: number;
};

type MarkdownLikeChild = {
	text?: unknown;
	theme?: unknown;
	defaultTextStyle?: unknown;
	children?: unknown[];
};

type AutocompleteListLike = {
	render(width: number): string[];
};

type PatchableEditor = UserMessageStyleEditor & {
	isShowingAutocomplete?: () => boolean;
	autocompleteList?: AutocompleteListLike;
};

const PATCH_VERSION = 17;
const ANSI_GREEN = "\x1b[32m";
const ANSI_CYAN = "\x1b[36m";
const ANSI_RESET_FG = "\x1b[39m";
const ANSI_RE = /\x1b\[[0-9;]*m/g;
const DEFAULT_PREFIX = "┃ ";
const USER_RAIL = "┃";
const USER_FILL = "╱";
const USER_LABEL = " USER ";
const USER_BODY_PREFIX = "┃ ";

let activeTheme: Theme | undefined;

type PrefixKind = "default" | "bash" | "bashExcluded";

type PatchableBashExecutionInstance = BashExecutionComponent & {
	__userMessageStylePrefixKind?: Exclude<PrefixKind, "default">;
};

function color2(text: string): string {
	return `${ANSI_GREEN}${text}${ANSI_RESET_FG}`;
}

function getBashModeAnsi(): string {
	try {
		return activeTheme?.getFgAnsi("bashMode") ?? ANSI_CYAN;
	} catch {
		return ANSI_CYAN;
	}
}

function color6(text: string): string {
	return `${getBashModeAnsi()}${text}${ANSI_RESET_FG}`;
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

function isMarkdownLikeChild(value: unknown): value is MarkdownLikeChild {
	return !!value
		&& typeof value === "object"
		&& typeof (value as MarkdownLikeChild).text === "string"
		&& (value as MarkdownLikeChild).theme !== undefined;
}

function extractMarkdownChild(instance: unknown): MarkdownLikeChild | undefined {
	if (!instance || typeof instance !== "object") return undefined;

	const stack: unknown[] = [instance];
	const visited = new Set<unknown>();

	while (stack.length > 0) {
		const current = stack.pop();
		if (!current || typeof current !== "object" || visited.has(current)) continue;
		visited.add(current);

		if (isMarkdownLikeChild(current)) return current;

		const children = (current as { children?: unknown[] }).children;
		if (Array.isArray(children)) {
			for (let i = children.length - 1; i >= 0; i--) {
				stack.push(children[i]);
			}
		}
	}

	return undefined;
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

function getPrefix(kind: PrefixKind): string {
	switch (kind) {
		case "bash":
		case "bashExcluded":
		default:
			return DEFAULT_PREFIX;
	}
}

function getPrefixKind(text: string): PrefixKind {
	if (text.startsWith("!!")) return "bashExcluded";
	if (text.startsWith("!")) return "bash";
	return "default";
}

function colorPrefix(prefix: string, kind: PrefixKind): string {
	if (kind === "default") return prefix;
	return color6(prefix);
}

function colorContent(text: string, kind: PrefixKind): string {
	if (kind === "default") return text;
	return text;
}

function prefixLine(line: string, width: number, kind: PrefixKind): string {
	const prefix = getPrefix(kind);
	const contentWidth = Math.max(1, width - visibleWidth(prefix));
	const content = truncateToWidth(line, contentWidth, "", true);
	return `${colorPrefix(prefix, kind)}${colorContent(content, kind)}`;
}

function prefixRenderedLine(line: string, width: number, kind: PrefixKind): string {
	const prefix = getPrefix(kind);
	const contentWidth = Math.max(1, width - visibleWidth(prefix));
	return `${colorPrefix(prefix, kind)}${colorContent(truncateToWidth(line, contentWidth, "", true), kind)}`;
}

function themeFg(color: "muted" | "dim" | "text" | "borderAccent" | "borderMuted", text: string): string {
	try {
		return activeTheme?.fg(color, text) ?? text;
	} catch {
		return text;
	}
}

function themeBg(color: "selectedBg", text: string): string {
	try {
		return activeTheme?.bg(color, text) ?? text;
	} catch {
		return text;
	}
}

function bgAnsiToFgAnsi(ansi: string): string {
	return ansi.replace(/\x1b\[([0-9;]+)m/g, (_match, codes: string) => {
		const parts = codes.split(";");
		const converted = parts.map((part, index) => {
			if (part === "48" && (parts[index + 1] === "5" || parts[index + 1] === "2")) return "38";
			if (/^4[0-7]$/.test(part)) return `3${part[1]}`;
			if (/^10[0-7]$/.test(part)) return `9${part[2]}`;
			return part;
		});
		return `\x1b[${converted.join(";")}m`;
	});
}

function themeBgAsFg(color: "selectedBg", text: string): string {
	try {
		const ansi = activeTheme?.getBgAnsi(color) ?? "";
		if (!ansi) return text;
		return `${bgAnsiToFgAnsi(ansi)}${text}${ANSI_RESET_FG}`;
	} catch {
		return text;
	}
}

function renderUserFrameLine(width: number, left: string, middle = "", right = ""): string {
	const safeWidth = Math.max(1, Math.floor(width));
	const base = `${left}${middle}${right}`;
	const remaining = Math.max(0, safeWidth - visibleWidth(base));
	const fill = themeBgAsFg("selectedBg", USER_FILL.repeat(remaining));
	return truncateToWidth(`${left}${middle}${right}${fill}`, safeWidth, "", true);
}

function renderUserRail(): string {
	return themeFg("borderAccent", USER_RAIL);
}

function renderUserHeaderLine(width: number): string {
	const rail = renderUserRail();
	const lead = `${rail} `;
	const label = themeBg("selectedBg", themeFg("borderAccent", USER_LABEL));
	const trail = " ";
	return renderUserFrameLine(width, lead, label, trail);
}

function renderUserBodyLine(line: string, width: number): string {
	const safeWidth = Math.max(1, Math.floor(width));
	const contentWidth = Math.max(1, safeWidth - visibleWidth(USER_BODY_PREFIX));
	const prefix = `${renderUserRail()} `;
	return `${prefix}${truncateToWidth(line, contentWidth, "", true)}`;
}

function normalizeUserBodyLines(lines: string[]): string[] {
	const trimmed = trimEdgeBlankLines(lines);
	return trimmed.length > 0 ? trimmed : [""];
}

function renderUserMessageBlock(lines: string[], width: number): string[] {
	const body = normalizeUserBodyLines(lines);
	return [
		renderUserHeaderLine(width),
		renderUserBodyLine("", width),
		...body.map((line) => renderUserBodyLine(line, width)),
	];
}

function getModeLabel(kind: PrefixKind, width: number, piTheme: Theme | undefined = activeTheme): string | undefined {
	if (kind === "default") return undefined;
	const label = kind === "bashExcluded" ? "  bash mode (excluded from context)" : "  bash mode";
	const truncated = truncateToWidth(label, Math.max(1, width), "", true);
	return piTheme?.fg("bashMode", truncated) ?? color6(truncated);
}

function trimBashBox(lines: string[]): string[] {
	const trimmed = trimEdgeBlankLines(lines);
	if (trimmed.length >= 2) return trimEdgeBlankLines(trimmed.slice(1, -1));
	return trimmed;
}

function withPatchedAddChild<T>(
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
		if (result && typeof (result as PromiseLike<unknown>).then === "function") {
			return Promise.resolve(result as PromiseLike<unknown>).finally(restore) as T;
		}
		restore();
		return result;
	} catch (error) {
		restore();
		throw error;
	}
}

class UserMessageStyleEditor extends CustomEditor {
	constructor(
		tui: ConstructorParameters<typeof CustomEditor>[0],
		theme: EditorTheme,
		keybindings: ConstructorParameters<typeof CustomEditor>[2],
		private readonly piTheme: Theme,
	) {
		super(tui, theme, keybindings);
	}

	render(width: number): string[] {
		const safeWidth = Math.max(1, Math.floor(width));
		const prefixKind = getPrefixKind(this.getText());
		const prefixWidth = visibleWidth(getPrefix(prefixKind));
		const contentWidth = Math.max(1, safeWidth - prefixWidth);
		const baseLines = super.render(contentWidth);
		const editor = this as PatchableEditor;

		let autocompleteLines: string[] = [];
		if (editor.isShowingAutocomplete?.() && editor.autocompleteList) {
			try {
				autocompleteLines = editor.autocompleteList.render(contentWidth);
			} catch {
				autocompleteLines = [];
			}
		}

		const editorLineCount = Math.max(0, baseLines.length - autocompleteLines.length);
		const editorLines = baseLines.slice(0, editorLineCount);
		const modeLabel = getModeLabel(prefixKind, safeWidth, this.piTheme);

		if (editorLines.length <= 2) {
			return [
				...(modeLabel ? [modeLabel, ""] : []),
				prefixRenderedLine("", safeWidth, prefixKind),
				"",
				...autocompleteLines.map((line) => `${" ".repeat(prefixWidth)}${line}`),
			];
		}

		const bodyLines = editorLines.slice(1, -1);
		return [
			...(modeLabel ? [modeLabel, ""] : []),
			...bodyLines.map((line) => prefixRenderedLine(line, safeWidth, prefixKind)),
			"",
			...autocompleteLines.map((line) => `${" ".repeat(prefixWidth)}${line}`),
		];
	}
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
		const contentWidth = Math.max(1, safeWidth - visibleWidth(USER_BODY_PREFIX));
		const body = renderBody(this, contentWidth, originalRender);
		return renderUserMessageBlock(body, safeWidth);
	};

	prototype.__userMessageStylePatched = true;
	prototype.__userMessageStylePatchVersion = PATCH_VERSION;
}

function patchBashExecutionPrototype(): void {
	const prototype = BashExecutionComponent.prototype as unknown as PatchableBashExecutionPrototype;
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

	prototype.render = function renderBashExecutionWithStyle(width: number): string[] {
		const safeWidth = Math.max(1, Math.floor(width));
		const body = trimBashBox(originalRender.call(this, safeWidth));
		const hasExistingSpacerAfterCommand = (body[1] ?? "").trim().length === 0;
		const spacedBody = body.length > 1
			? (hasExistingSpacerAfterCommand ? body : [body[0], "", ...body.slice(1)])
			: (body.length > 0 ? body : [""]);
		return ["", ...spacedBody.map((line) => truncateToWidth(line, safeWidth, "", true))];
	};

	prototype.__userMessageStylePatched = true;
	prototype.__userMessageStylePatchVersion = PATCH_VERSION;
}

function patchInteractiveModePrototype(): void {
	const prototype = InteractiveMode.prototype as unknown as PatchableInteractiveModePrototype & {
		chatContainer?: { addChild?: (child: unknown) => unknown };
		pendingMessagesContainer?: { addChild?: (child: unknown) => unknown };
	};

	if (
		prototype.__userMessageStylePatched
		&& prototype.__userMessageStylePatchVersion === PATCH_VERSION
	) {
		return;
	}

	const originalAddMessageToChat = prototype.addMessageToChat;
	if (typeof originalAddMessageToChat === "function") {
		prototype.addMessageToChat = function addMessageToChatWithStyledBashMarker(message, options): unknown {
			if (message?.role !== "bashExecution") {
				return originalAddMessageToChat.call(this, message, options);
			}

			const prefixKind: Exclude<PrefixKind, "default"> = message.excludeFromContext ? "bashExcluded" : "bash";
			return withPatchedAddChild(this as typeof prototype, prefixKind, () => originalAddMessageToChat.call(this, message, options));
		};
	}

	const originalHandleBashCommand = prototype.handleBashCommand;
	if (typeof originalHandleBashCommand === "function") {
		prototype.handleBashCommand = function handleBashCommandWithStyledMarker(command, excludeFromContext = false): unknown {
			const prefixKind: Exclude<PrefixKind, "default"> = excludeFromContext ? "bashExcluded" : "bash";
			return withPatchedAddChild(this as typeof prototype, prefixKind, () => originalHandleBashCommand.call(this, command, excludeFromContext));
		};
	}

	prototype.__userMessageStylePatched = true;
	prototype.__userMessageStylePatchVersion = PATCH_VERSION;
}

export default function userMessageStyleExtension(pi: ExtensionAPI): void {
	patchUserMessagePrototype();
	patchBashExecutionPrototype();
	patchInteractiveModePrototype();

	pi.on("session_start", async (_event, ctx) => {
		activeTheme = ctx.ui.theme;
		patchUserMessagePrototype();
		patchBashExecutionPrototype();
		patchInteractiveModePrototype();
		ctx.ui.setEditorComponent((tui, theme, keybindings) => new UserMessageStyleEditor(tui, theme, keybindings, ctx.ui.theme));
	});

	pi.on("before_agent_start", async (_event, ctx) => {
		activeTheme = ctx.ui.theme;
		patchUserMessagePrototype();
		patchBashExecutionPrototype();
		patchInteractiveModePrototype();
	});
}
