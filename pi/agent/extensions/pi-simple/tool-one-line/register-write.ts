import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import {
	formatPathLabel,
	registerIntentTool,
	renderBuiltInToolResult,
	renderExpandedResultWithHeader,
	resetContainer,
	toFullPath,
	type RenderContext,
	type Theme,
} from "./render-shared.ts";
import type { ToolResult } from "./bash-output.ts";

function renderExpandedWriteResult(
	_result: ToolResult,
	theme: Theme,
	context: RenderContext,
	label: string,
	intent: string | undefined,
) {
	const content: string = typeof context.args?.content === "string" ? context.args.content : "";
	const readLikeResult: ToolResult = {
		content: [{ type: "text", text: content }],
		details: undefined,
	};

	return renderExpandedResultWithHeader(
		theme,
		context,
		label,
		(builtInContext) => renderBuiltInToolResult(
			"read",
			context.cwd,
			readLikeResult,
			{ isPartial: false, expanded: true },
			theme,
			{ ...builtInContext, args: { path: context.args?.path } },
		) ?? resetContainer(builtInContext),
		intent,
	);
}

export function registerWriteTool(pi: ExtensionAPI): void {
	registerIntentTool(
		pi,
		"write",
		(args, theme, cwd) => (
			formatPathLabel(theme, "Write", toFullPath(args.path, cwd))
		),
		undefined,
		renderExpandedWriteResult,
	);
}
