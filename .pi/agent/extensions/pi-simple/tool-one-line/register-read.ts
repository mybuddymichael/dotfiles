import type { ToolResult, ExtensionAPI } from "@mariozechner/pi-coding-agent";
import {
	formatPathLabel,
	formatReadRange,
	oneLine,
	registerStandardTool,
	syncImageAttachmentsWithExpandedState,
	toFullPath,
	type RenderContext,
	type Theme,
} from "./render-shared.ts";

const readImageStateKey = "readHiddenImageContent";

function syncReadImageAttachments(result: ToolResult, expanded: boolean, context: RenderContext): void {
	syncImageAttachmentsWithExpandedState(result, { isPartial: false, expanded }, context, readImageStateKey);
}

function renderCollapsedReadResult(
	result: ToolResult,
	theme: Theme,
	context: RenderContext,
	label: string,
) {
	syncReadImageAttachments(result, false, context);
	return oneLine(theme, context, label);
}

export function registerReadTool(pi: ExtensionAPI): void {
	registerStandardTool(
		pi,
		"read",
		(args, theme, cwd) => (
			formatPathLabel(theme, "Read", `${toFullPath(args.path, cwd)}${formatReadRange(args.offset, args.limit)}`)
		),
		renderCollapsedReadResult,
		(result, context) => {
			syncReadImageAttachments(result as ToolResult, true, context);
		},
	);
}
