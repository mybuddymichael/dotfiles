import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { formatFindLabel, registerStandardTool, toFullPath } from "./render-shared.ts";

export function registerFindTool(pi: ExtensionAPI): void {
	registerStandardTool(pi, "find", (args, theme, cwd) => (
		formatFindLabel(theme, args.pattern, toFullPath(args.path, cwd))
	));
}
