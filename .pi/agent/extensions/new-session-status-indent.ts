import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { Text } from "@mariozechner/pi-tui";

type PatchableText = {
	text?: string;
	paddingX?: number;
	paddingY?: number;
	render(width: number): string[];
	__newSessionStatusIndentPatched?: boolean;
};

const TARGET_TEXT = "✓ New session started";

function patchTextRender(): void {
	const prototype = Text.prototype as unknown as PatchableText;
	const originalRender = prototype.render;
	if (typeof originalRender !== "function") return;
	if (prototype.__newSessionStatusIndentPatched) return;

	prototype.render = function renderWithAdjustedNewSessionIndent(width: number): string[] {
		const matchesNewSessionMessage =
			typeof this.text === "string"
			&& this.text.includes(TARGET_TEXT)
			&& this.paddingX === 1
			&& this.paddingY === 1;

		if (!matchesNewSessionMessage) {
			return originalRender.call(this, width);
		}

		const originalPaddingX = this.paddingX;
		this.paddingX = 0;
		try {
			return originalRender.call(this, width);
		} finally {
			this.paddingX = originalPaddingX;
		}
	};

	prototype.__newSessionStatusIndentPatched = true;
}

export default function newSessionStatusIndentExtension(_pi: ExtensionAPI): void {
	patchTextRender();
}
