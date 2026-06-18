import { UserMessageComponent } from "@mariozechner/pi-coding-agent";
import { visibleWidth } from "@mariozechner/pi-tui";
import { renderBody, renderUserMessageBlock } from "./render-user-block.ts";
import {
	type PatchableUserMessagePrototype,
	USER_BODY_PREFIX,
	USER_MESSAGE_PATCH_VERSION,
} from "../shared/types.ts";

export function patchUserMessagePrototype(): void {
	const prototype = UserMessageComponent.prototype as unknown as PatchableUserMessagePrototype;
	if (typeof prototype.render !== "function") return;

	if (
		prototype.__userMessageStylePatched
		&& prototype.__userMessageStylePatchVersion === USER_MESSAGE_PATCH_VERSION
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
	prototype.__userMessageStylePatchVersion = USER_MESSAGE_PATCH_VERSION;
}
