import type { Theme } from "@mariozechner/pi-coding-agent";

export const ANSI_RESET_FG = "\x1b[39m";

export type ThemeLike = Pick<Theme, "fg" | "italic" | "bg" | "getBgAnsi">;

let currentTheme: ThemeLike | undefined;

export function setCurrentTheme(theme: ThemeLike | undefined): void {
	currentTheme = theme;
}

export function getThemeLike(): ThemeLike {
	return currentTheme ?? {
		fg: (_color, text) => text,
		italic: (text) => text,
		bg: (_color, text) => text,
		getBgAnsi: () => "",
	};
}

export function themeBgAsFg(themeLike: ThemeLike, color: "selectedBg", text: string): string {
	try {
		const ansi = themeLike.getBgAnsi?.(color) ?? "";
		if (!ansi) return text;
		return `${ansi.replace(/\[48;/g, "[38;")}${text}${ANSI_RESET_FG}`;
	} catch {
		return text;
	}
}
