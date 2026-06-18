import { Markdown, truncateToWidth, visibleWidth } from "@mariozechner/pi-tui";
import { type ThemeLike } from "./theme.ts";
import { trimEdgeBlankLines } from "./render-agent-block.ts";

export const THINKING_INDENT = 2;

export function renderThinkingLine(line: string, width: number): string {
	const safeWidth = Math.max(1, Math.floor(width));
	const prefix = " ".repeat(THINKING_INDENT);
	const contentWidth = Math.max(1, safeWidth - visibleWidth(prefix));
	return `${prefix}${truncateToWidth(line, contentWidth, "", true)}`;
}

export function createThinkingMarkdownBlock(text: string, markdownTheme: unknown, themeLike: ThemeLike, defaultTextStyle?: unknown) {
	return {
		render: (width: number) => {
			const safeWidth = Math.max(1, Math.floor(width));
			const contentWidth = Math.max(1, safeWidth - THINKING_INDENT);
			const markdown = new Markdown(text.trim(), 0, 0, markdownTheme as never, defaultTextStyle as never);
			const lines = trimEdgeBlankLines(markdown.render(contentWidth));
			const body = lines.length > 0 ? lines : [themeLike.italic(themeLike.fg("thinkingText", ""))];
			return body.map((line) => renderThinkingLine(line, safeWidth));
		},
		invalidate: () => {},
	};
}

export function createThinkingTextLine(text: string) {
	return {
		render: (width: number) => [renderThinkingLine(text, width)],
		invalidate: () => {},
	};
}
