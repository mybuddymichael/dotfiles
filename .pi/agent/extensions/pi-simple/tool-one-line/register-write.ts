import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { formatPathLabel, registerIntentTool, toFullPath } from "./render-shared.ts";

export function registerWriteTool(pi: ExtensionAPI): void {
	registerIntentTool(pi, "write", (args, theme, cwd) => (
		formatPathLabel(theme, "Write", toFullPath(args.path, cwd))
	));
}
