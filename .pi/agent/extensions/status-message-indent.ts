import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { Text } from "@mariozechner/pi-tui";

type PatchableText = {
	text?: string;
	paddingX?: number;
	paddingY?: number;
	render(width: number): string[];
	__statusMessageIndentPatched?: boolean;
};

const NEW_SESSION_TEXT = "✓ New session started";
const EXTRA_INDENT_STATUS_PREFIXES = [
	"Resumed session",
	"Only one model in scope",
] as const;

function patchTextRender(): void {
	const prototype = Text.prototype as unknown as PatchableText;
	const originalRender = prototype.render;
	if (typeof originalRender !== "function") return;
	if (prototype.__statusMessageIndentPatched) return;

	prototype.render = function renderWithAdjustedStatusMessageIndent(width: number): string[] {
		const text = this.text;
		const isNewSessionMessage = typeof text === "string"
			&& text.includes(NEW_SESSION_TEXT)
			&& this.paddingX === 1
			&& this.paddingY === 1;
		const isExtraIndentStatusMessage = typeof text === "string"
			&& EXTRA_INDENT_STATUS_PREFIXES.some((prefix) => text.includes(prefix))
			&& this.paddingX === 1
			&& this.paddingY === 0;

		if (!isNewSessionMessage && !isExtraIndentStatusMessage) {
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

	prototype.__statusMessageIndentPatched = true;
}

export default function statusMessageIndentExtension(_pi: ExtensionAPI): void {
	patchTextRender();
}
