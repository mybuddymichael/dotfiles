import type { BashExecutionComponent, Theme, UserMessageComponent } from "@mariozechner/pi-coding-agent";

export type RenderFn = (width: number) => string[];
export type PrefixKind = "default" | "bash" | "bashExcluded";

export type PatchableUserMessagePrototype = {
	render: RenderFn;
	__userMessageStyleOriginalRender?: RenderFn;
	__userMessageStylePatched?: boolean;
	__userMessageStylePatchVersion?: number;
};

export type PatchableBashExecutionPrototype = {
	render: RenderFn;
	__userMessageStyleOriginalRender?: RenderFn;
	__userMessageStylePatched?: boolean;
	__userMessageStylePatchVersion?: number;
};

export type PatchableInteractiveModePrototype = {
	addMessageToChat?: (message: { role?: string; excludeFromContext?: boolean }, options: unknown) => unknown;
	handleBashCommand?: (command: string, excludeFromContext?: boolean) => unknown;
	chatContainer?: { addChild?: (child: unknown) => unknown };
	pendingMessagesContainer?: { addChild?: (child: unknown) => unknown };
	__userMessageStylePatched?: boolean;
	__userMessageStylePatchVersion?: number;
};

export type MarkdownLikeChild = {
	text?: unknown;
	theme?: unknown;
	defaultTextStyle?: unknown;
	children?: unknown[];
};

export type AutocompleteListLike = {
	render(width: number): string[];
};

export type PatchableEditor = {
	isShowingAutocomplete?: () => boolean;
	autocompleteList?: AutocompleteListLike;
};

export type PatchableBashExecutionInstance = BashExecutionComponent & {
	__userMessageStylePrefixKind?: Exclude<PrefixKind, "default">;
};

export const USER_MESSAGE_PATCH_VERSION = 19;
export const BASH_EXECUTION_PATCH_VERSION = 19;
export const INTERACTIVE_MODE_PATCH_VERSION = 19;

export const DEFAULT_PREFIX = "┃ ";
export const USER_RAIL = "┃";
export const USER_FILL = "╱";
export const USER_LABEL = " USER ";
export const USER_BODY_PREFIX = "┃ ";

export type UserMessageTheme = Theme;
export type UserMessageComponentLike = UserMessageComponent;
