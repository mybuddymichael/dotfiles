import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { isBashToolResult } from "@mariozechner/pi-coding-agent";
import { rebuildHeadTruncatedBashContent } from "./bash-output.ts";

export function registerBashTruncationHook(pi: ExtensionAPI): void {
	pi.on("tool_result", async (event) => {
		if (!isBashToolResult(event)) return;
		const truncation = event.details?.truncation;
		const fullOutputPath = event.details?.fullOutputPath;
		const content = event.content.find((part) => part.type === "text");
		if (!truncation?.truncated || !fullOutputPath || content?.type !== "text") return;
		const rebuilt = await rebuildHeadTruncatedBashContent(content.text ?? "", fullOutputPath, truncation);
		return {
			content: event.content.map((part) => part.type === "text" ? { ...part, text: rebuilt.text } : part),
			details: { ...event.details, truncation: rebuilt.truncation },
		};
	});
}
