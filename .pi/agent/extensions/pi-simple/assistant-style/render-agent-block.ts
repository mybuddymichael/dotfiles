import { Markdown, truncateToWidth, visibleWidth } from "@mariozechner/pi-tui";
import { getThemeLike, themeBgAsFg, type ThemeLike } from "./theme.ts";

export const INDENT = 0;
export const AGENT_RAIL = "┃";
export const AGENT_FILL = "╱";
export const AGENT_LABEL = " AGENT ";
export const AGENT_BODY_PREFIX = "┃ ";

export function trimEdgeBlankLines(lines: string[]): string[] {
	let start = 0;
	let end = lines.length;

	while (start < end && lines[start]?.trim().length === 0) start++;
	while (end > start && lines[end - 1]?.trim().length === 0) end--;

	return lines.slice(start, end);
}

export function renderAgentRail(themeLike: ThemeLike = getThemeLike()): string {
	return themeLike.fg("border", AGENT_RAIL);
}

export function renderAgentHeaderLine(width: number, themeLike: ThemeLike = getThemeLike()): string {
	const safeWidth = Math.max(1, Math.floor(width));
	const indent = " ".repeat(INDENT);
	const lead = `${indent}${renderAgentRail(themeLike)} `;
	const label = themeLike.bg("selectedBg", themeLike.fg("border", AGENT_LABEL));
	const base = `${lead}${label} `;
	const remaining = Math.max(0, safeWidth - visibleWidth(base));
	return truncateToWidth(`${base}${themeBgAsFg(themeLike, "selectedBg", AGENT_FILL.repeat(remaining))}`, safeWidth, "", true);
}

export function renderAgentBodyLine(line: string, width: number, themeLike: ThemeLike = getThemeLike()): string {
	const safeWidth = Math.max(1, Math.floor(width));
	const indent = " ".repeat(INDENT);
	const prefix = `${indent}${renderAgentRail(themeLike)} `;
	const contentWidth = Math.max(1, safeWidth - visibleWidth(prefix));
	return `${prefix}${truncateToWidth(line, contentWidth, "", true)}`;
}

export function createAgentMarkdownBlock(text: string, markdownTheme: unknown, themeLike: ThemeLike, defaultTextStyle?: unknown) {
	return {
		render: (width: number) => {
			const safeWidth = Math.max(1, Math.floor(width));
			const contentWidth = Math.max(1, safeWidth - INDENT - visibleWidth(AGENT_BODY_PREFIX));
			const markdown = new Markdown(text.trim(), 0, 0, markdownTheme as never, defaultTextStyle as never);
			const lines = trimEdgeBlankLines(markdown.render(contentWidth));
			const body = lines.length > 0 ? lines : [""];
			return body.map((line) => renderAgentBodyLine(line, safeWidth, themeLike));
		},
		invalidate: () => {},
	};
}

export function createAgentTextLine(text: string, themeLike: ThemeLike) {
	return {
		render: (width: number) => [renderAgentBodyLine(text, width, themeLike)],
		invalidate: () => {},
	};
}
