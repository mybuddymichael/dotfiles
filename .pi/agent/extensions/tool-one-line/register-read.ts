import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { formatPathLabel, formatReadRange, registerStandardTool, toFullPath } from "./render-shared.ts";

export function registerReadTool(pi: ExtensionAPI): void {
	registerStandardTool(pi, "read", (args, theme, cwd) => (
		formatPathLabel(theme, "Read", `${toFullPath(args.path, cwd)}${formatReadRange(args.offset, args.limit)}`)
	));
}
