import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { Text } from "@mariozechner/pi-tui";

type PatchableText = {
	text?: string;
	paddingX?: number;
	paddingY?: number;
	render(width: number): string[];
	__sessionStatusIndentPatched?: boolean;
};

const NEW_SESSION_TEXT = "✓ New session started";
const RESUMED_SESSION_PREFIX = "Resumed session";

function patchTextRender(): void {
	const prototype = Text.prototype as unknown as PatchableText;
	const originalRender = prototype.render;
	if (typeof originalRender !== "function") return;
	if (prototype.__sessionStatusIndentPatched) return;

	prototype.render = function renderWithAdjustedSessionStatusIndent(width: number): string[] {
		const text = this.text;
		const isNewSessionMessage = typeof text === "string"
			&& text.includes(NEW_SESSION_TEXT)
			&& this.paddingX === 1
			&& this.paddingY === 1;
		const isResumedSessionMessage = typeof text === "string"
			&& text.includes(RESUMED_SESSION_PREFIX)
			&& this.paddingX === 1
			&& this.paddingY === 0;

		if (!isNewSessionMessage && !isResumedSessionMessage) {
			return originalRender.call(this, width);
		}

		const originalPaddingX = this.paddingX;
		this.paddingX = isNewSessionMessage ? 0 : 2;
		try {
			return originalRender.call(this, width);
		} finally {
			this.paddingX = originalPaddingX;
		}
	};

	prototype.__sessionStatusIndentPatched = true;
}

export default function sessionStatusIndentExtension(_pi: ExtensionAPI): void {
	patchTextRender();
}
