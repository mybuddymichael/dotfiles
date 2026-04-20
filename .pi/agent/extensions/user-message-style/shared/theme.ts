import type { Theme } from "@mariozechner/pi-coding-agent";

const ANSI_CYAN = "\x1b[36m";
export const ANSI_RESET_FG = "\x1b[39m";
export const ANSI_RE = /\x1b\[[0-9;]*m/g;

let activeTheme: Theme | undefined;

export function setActiveTheme(theme: Theme | undefined): void {
	activeTheme = theme;
}

export function getActiveTheme(): Theme | undefined {
	return activeTheme;
}

export function themeFg(color: "muted" | "dim" | "text" | "borderAccent" | "borderMuted", text: string): string {
	try {
		return activeTheme?.fg(color, text) ?? text;
	} catch {
		return text;
	}
}

export function themeBg(color: "selectedBg", text: string): string {
	try {
		return activeTheme?.bg(color, text) ?? text;
	} catch {
		return text;
	}
}

function bgAnsiToFgAnsi(ansi: string): string {
	return ansi.replace(/\x1b\[([0-9;]+)m/g, (_match, codes: string) => {
		const parts = codes.split(";");
		const converted = parts.map((part, index) => {
			if (part === "48" && (parts[index + 1] === "5" || parts[index + 1] === "2")) return "38";
			if (/^4[0-7]$/.test(part)) return `3${part[1]}`;
			if (/^10[0-7]$/.test(part)) return `9${part[2]}`;
			return part;
		});
		return `\x1b[${converted.join(";")}m`;
	});
}

export function themeBgAsFg(color: "selectedBg", text: string): string {
	try {
		const ansi = activeTheme?.getBgAnsi(color) ?? "";
		if (!ansi) return text;
		return `${bgAnsiToFgAnsi(ansi)}${text}${ANSI_RESET_FG}`;
	} catch {
		return text;
	}
}

export function getBashModeAnsi(): string {
	try {
		return activeTheme?.getFgAnsi("bashMode") ?? ANSI_CYAN;
	} catch {
		return ANSI_CYAN;
	}
}

export function color6(text: string): string {
	return `${getBashModeAnsi()}${text}${ANSI_RESET_FG}`;
}
