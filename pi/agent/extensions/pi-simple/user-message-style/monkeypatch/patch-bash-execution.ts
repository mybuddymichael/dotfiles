import { BashExecutionComponent } from "@mariozechner/pi-coding-agent";
import { truncateToWidth } from "@mariozechner/pi-tui";
import {
	type PatchableBashExecutionPrototype,
	BASH_EXECUTION_PATCH_VERSION,
} from "../shared/types.ts";
import { trimBashBox } from "./render-bash-block.ts";

export function patchBashExecutionPrototype(): void {
	const prototype = BashExecutionComponent.prototype as unknown as PatchableBashExecutionPrototype;
	if (typeof prototype.render !== "function") return;

	if (
		prototype.__userMessageStylePatched
		&& prototype.__userMessageStylePatchVersion === BASH_EXECUTION_PATCH_VERSION
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
	prototype.__userMessageStylePatchVersion = BASH_EXECUTION_PATCH_VERSION;
}
