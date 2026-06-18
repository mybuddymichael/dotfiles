import { InteractiveMode } from "@mariozechner/pi-coding-agent";
import {
	type PatchableInteractiveModePrototype,
	type PrefixKind,
	INTERACTIVE_MODE_PATCH_VERSION,
} from "../shared/types.ts";
import { withPatchedAddChild } from "./render-bash-block.ts";

export function patchInteractiveModePrototype(): void {
	const prototype = InteractiveMode.prototype as unknown as PatchableInteractiveModePrototype;

	if (
		prototype.__userMessageStylePatched
		&& prototype.__userMessageStylePatchVersion === INTERACTIVE_MODE_PATCH_VERSION
	) {
		return;
	}

	const originalAddMessageToChat = prototype.addMessageToChat;
	if (typeof originalAddMessageToChat === "function") {
		prototype.addMessageToChat = function addMessageToChatWithStyledBashMarker(
			this: PatchableInteractiveModePrototype,
			message: { role?: string; excludeFromContext?: boolean },
			options: unknown,
		): unknown {
			if (message?.role !== "bashExecution") {
				return originalAddMessageToChat.call(this, message, options);
			}

			const prefixKind: Exclude<PrefixKind, "default"> = message.excludeFromContext ? "bashExcluded" : "bash";
			return withPatchedAddChild(this as PatchableInteractiveModePrototype, prefixKind, () => originalAddMessageToChat.call(this, message, options));
		};
	}

	const originalHandleBashCommand = prototype.handleBashCommand;
	if (typeof originalHandleBashCommand === "function") {
		prototype.handleBashCommand = function handleBashCommandWithStyledMarker(
			this: PatchableInteractiveModePrototype,
			command: string,
			excludeFromContext = false,
		): unknown {
			const prefixKind: Exclude<PrefixKind, "default"> = excludeFromContext ? "bashExcluded" : "bash";
			return withPatchedAddChild(this as PatchableInteractiveModePrototype, prefixKind, () => originalHandleBashCommand.call(this, command, excludeFromContext));
		};
	}

	prototype.__userMessageStylePatched = true;
	prototype.__userMessageStylePatchVersion = INTERACTIVE_MODE_PATCH_VERSION;
}
