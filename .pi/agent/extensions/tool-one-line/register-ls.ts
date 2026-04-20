import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { formatPathLabel, registerStandardTool, toFullPath } from "./render-shared.ts";

export function registerLsTool(pi: ExtensionAPI): void {
	registerStandardTool(pi, "ls", (args, theme, cwd) => (
		formatPathLabel(theme, "List", toFullPath(args.path, cwd))
	));
}
