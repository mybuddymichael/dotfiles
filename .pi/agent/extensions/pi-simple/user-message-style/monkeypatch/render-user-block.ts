import { Markdown, truncateToWidth, visibleWidth } from "@mariozechner/pi-tui";
import { ANSI_RE, themeBg, themeBgAsFg, themeFg } from "../shared/theme.ts";
import {
	type MarkdownLikeChild,
	type RenderFn,
	USER_BODY_PREFIX,
	USER_FILL,
	USER_LABEL,
	USER_RAIL,
} from "../shared/types.ts";

export function stripAnsi(text: string): string {
	return text.replace(ANSI_RE, "");
}

export function isBlank(line: string): boolean {
	return stripAnsi(line).trim().length === 0;
}

export function trimEdgeBlankLines(lines: string[]): string[] {
	let start = 0;
	let end = lines.length;

	while (start < end && isBlank(lines[start] ?? "")) start++;
	while (end > start && isBlank(lines[end - 1] ?? "")) end--;

	return lines.slice(start, end);
}

export function sanitizeDefaultTextStyle(style: unknown): Record<string, unknown> | undefined {
	if (!style || typeof style !== "object" || Array.isArray(style)) return undefined;
	const { bgColor: _bgColor, ...rest } = style as Record<string, unknown>;
	return Object.keys(rest).length > 0 ? rest : undefined;
}

export function isMarkdownLikeChild(value: unknown): value is MarkdownLikeChild {
	return !!value
		&& typeof value === "object"
		&& typeof (value as MarkdownLikeChild).text === "string"
		&& (value as MarkdownLikeChild).theme !== undefined;
}

export function extractMarkdownChild(instance: unknown): MarkdownLikeChild | undefined {
	if (!instance || typeof instance !== "object") return undefined;

	const stack: unknown[] = [instance];
	const visited = new Set<unknown>();

	while (stack.length > 0) {
		const current = stack.pop();
		if (!current || typeof current !== "object" || visited.has(current)) continue;
		visited.add(current);

		if (isMarkdownLikeChild(current)) return current;

		const children = (current as { children?: unknown[] }).children;
		if (Array.isArray(children)) {
			for (let i = children.length - 1; i >= 0; i--) {
				stack.push(children[i]);
			}
		}
	}

	return undefined;
}

export function renderBody(instance: unknown, width: number, originalRender: RenderFn): string[] {
	const markdownChild = extractMarkdownChild(instance);
	if (!markdownChild || typeof markdownChild.text !== "string") {
		return trimEdgeBlankLines(originalRender.call(instance, width));
	}

	try {
		const markdown = new Markdown(
			markdownChild.text,
			0,
			0,
			markdownChild.theme as never,
			sanitizeDefaultTextStyle(markdownChild.defaultTextStyle) as never,
		);
		return trimEdgeBlankLines(markdown.render(width));
	} catch {
		return trimEdgeBlankLines(originalRender.call(instance, width));
	}
}

export function renderUserFrameLine(width: number, left: string, middle = "", right = ""): string {
	const safeWidth = Math.max(1, Math.floor(width));
	const base = `${left}${middle}${right}`;
	const remaining = Math.max(0, safeWidth - visibleWidth(base));
	const fill = themeBgAsFg("selectedBg", USER_FILL.repeat(remaining));
	return truncateToWidth(`${left}${middle}${right}${fill}`, safeWidth, "", true);
}

export function renderUserRail(): string {
	return themeFg("borderAccent", USER_RAIL);
}

export function renderUserHeaderLine(width: number): string {
	const rail = renderUserRail();
	const lead = `${rail} `;
	const label = themeBg("selectedBg", themeFg("borderAccent", USER_LABEL));
	const trail = " ";
	return renderUserFrameLine(width, lead, label, trail);
}

export function renderUserBodyLine(line: string, width: number): string {
	const safeWidth = Math.max(1, Math.floor(width));
	const contentWidth = Math.max(1, safeWidth - visibleWidth(USER_BODY_PREFIX));
	const prefix = `${renderUserRail()} `;
	return `${prefix}${truncateToWidth(line, contentWidth, "", true)}`;
}

export function normalizeUserBodyLines(lines: string[]): string[] {
	const trimmed = trimEdgeBlankLines(lines);
	return trimmed.length > 0 ? trimmed : [""];
}

export function renderUserMessageBlock(lines: string[], width: number): string[] {
	const body = normalizeUserBodyLines(lines);
	return [
		renderUserHeaderLine(width),
		renderUserBodyLine("", width),
		...body.map((line) => renderUserBodyLine(line, width)),
	];
}
