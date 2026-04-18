import type { BashToolDetails } from "@mariozechner/pi-coding-agent";
import { formatSize, truncateHead } from "@mariozechner/pi-coding-agent";
import { readFile } from "node:fs/promises";

export type ToolResult<TDetails = unknown> = {
	content: Array<{ type: string; text?: string; data?: string; mimeType?: string }>;
	details?: TDetails;
};

export function extractTextContent(result: ToolResult | undefined): string {
	return result?.content
		.map((part) => part.type === "text" ? part.text ?? "" : "")
		.join("")
		.trim() ?? "";
}

export function cleanBashOutput(result: ToolResult<BashToolDetails> | undefined): string {
	const output = extractTextContent(result)
		.replace(/\r\n?/g, "\n")
		.replace(/\n?exit code:\s*-?\d+\s*$/i, "")
		.trim();
	return output === "(no output)" ? "" : output;
}

export function rebuildHeadTruncatedBashContentFromFullOutput(
	fullOutput: string,
	content: string,
	fullOutputPath: string,
	truncation: NonNullable<BashToolDetails["truncation"]>,
): { text: string; truncation: NonNullable<BashToolDetails["truncation"]> } {
	const head = truncateHead(fullOutput, {
		maxLines: truncation.maxLines,
		maxBytes: truncation.maxBytes,
	});
	let outputText = head.content || "(no output)";
	if (head.truncated) {
		if (head.firstLineExceedsLimit) {
			outputText += `\n\n[First line exceeds ${formatSize(head.maxBytes)}. Full output: ${fullOutputPath}]`;
		} else if (head.truncatedBy === "lines") {
			outputText += `\n\n[Showing lines 1-${head.outputLines} of ${head.totalLines}. Full output: ${fullOutputPath}]`;
		} else {
			outputText += `\n\n[Showing lines 1-${head.outputLines} of ${head.totalLines} (${formatSize(head.maxBytes)} limit). Full output: ${fullOutputPath}]`;
		}
	}
	const exitSuffix = content.match(/\n\nCommand exited with code \d+\s*$/)?.[0] ?? "";
	return { text: `${outputText}${exitSuffix}`, truncation: head };
}

export async function rebuildHeadTruncatedBashContent(
	content: string,
	fullOutputPath: string,
	truncation: NonNullable<BashToolDetails["truncation"]>,
): Promise<{ text: string; truncation: NonNullable<BashToolDetails["truncation"]> }> {
	const fullOutput = await readFile(fullOutputPath, "utf8");
	return rebuildHeadTruncatedBashContentFromFullOutput(fullOutput, content, fullOutputPath, truncation);
}
