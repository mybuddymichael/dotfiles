import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { formatBashLabel, registerIntentTool, renderCollapsedBashResult, renderPartialBashResult } from "./render-shared.ts";

export function registerBashTool(pi: ExtensionAPI): void {
	registerIntentTool(
		pi,
		"bash",
		(args, theme) => formatBashLabel(theme, args.command),
		renderCollapsedBashResult,
		undefined,
		renderPartialBashResult,
	);
}
