import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { formatGrepLabel, registerStandardTool, toFullPath } from "./render-shared.ts";

export function registerGrepTool(pi: ExtensionAPI): void {
	registerStandardTool(pi, "grep", (args, theme, cwd) => (
		formatGrepLabel(theme, args.pattern, toFullPath(args.path, cwd), args.glob)
	));
}
