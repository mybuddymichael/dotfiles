import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { formatPathLabel, registerIntentTool, renderCollapsedEditResult, toFullPath } from "./render-shared.ts";

export function registerEditTool(pi: ExtensionAPI): void {
	registerIntentTool(pi, "edit", (args, theme, cwd) => (
		formatPathLabel(theme, "Edit", toFullPath(args.path, cwd))
	), renderCollapsedEditResult);
}
