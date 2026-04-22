import { Loader } from "@mariozechner/pi-tui";

export const WORKING_LOADER_PATCH_VERSION = 12;
export const WORKING_PREFIX = "Working";

export type PatchableLoaderPrototype = {
	updateDisplay(): void;
	setText(text: string): void;
	spinnerColorFn?: (text: string) => string;
	messageColorFn?: (text: string) => string;
	message?: string;
	currentFrame?: number;
	frames?: string[];
	ui?: { requestRender(): void } | null;
	paddingX?: number;
	__assistantIndentOriginalUpdateDisplay?: () => void;
	__assistantIndentPatched?: boolean;
	__assistantIndentPatchVersion?: number;
};

export function patchLoaderPrototype(): void {
	const prototype = Loader.prototype as unknown as PatchableLoaderPrototype;
	if (typeof prototype.updateDisplay !== "function") return;

	if (
		prototype.__assistantIndentPatched
		&& prototype.__assistantIndentPatchVersion === WORKING_LOADER_PATCH_VERSION
		&& typeof prototype.__assistantIndentOriginalUpdateDisplay === "function"
	) {
		return;
	}

	if (!prototype.__assistantIndentOriginalUpdateDisplay) {
		prototype.__assistantIndentOriginalUpdateDisplay = prototype.updateDisplay;
	}

	prototype.updateDisplay = function updateDisplayWithZeroIndentWorking(this: PatchableLoaderPrototype): void {
		const frame = this.frames?.[this.currentFrame ?? 0] ?? "";
		const message = this.message ?? "";

		if (!message.startsWith(WORKING_PREFIX)) {
			this.paddingX = 1;
			this.__assistantIndentOriginalUpdateDisplay?.call(this);
			return;
		}

		this.paddingX = 0;
		const spinner = this.spinnerColorFn ? this.spinnerColorFn(frame) : frame;
		const coloredMessage = this.messageColorFn ? this.messageColorFn(message) : message;
		this.setText(`${spinner} ${coloredMessage}`);
		this.ui?.requestRender();
	} as PatchableLoaderPrototype["updateDisplay"];

	prototype.__assistantIndentPatched = true;
	prototype.__assistantIndentPatchVersion = WORKING_LOADER_PATCH_VERSION;
}
