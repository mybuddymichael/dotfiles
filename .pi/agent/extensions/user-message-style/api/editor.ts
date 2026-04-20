import { CustomEditor } from "@mariozechner/pi-coding-agent";
import type { EditorTheme } from "@mariozechner/pi-tui";
import { visibleWidth } from "@mariozechner/pi-tui";
import { type UserMessageTheme, type PatchableEditor } from "../shared/types.ts";
import { getModeLabel, getPrefix, getPrefixKind, prefixRenderedLine } from "../monkeypatch/render-bash-block.ts";

export class UserMessageStyleEditor extends CustomEditor {
	constructor(
		tui: ConstructorParameters<typeof CustomEditor>[0],
		theme: EditorTheme,
		keybindings: ConstructorParameters<typeof CustomEditor>[2],
		private readonly piTheme: UserMessageTheme,
	) {
		super(tui, theme, keybindings);
	}

	render(width: number): string[] {
		const safeWidth = Math.max(1, Math.floor(width));
		const prefixKind = getPrefixKind(this.getText());
		const prefixWidth = visibleWidth(getPrefix(prefixKind));
		const contentWidth = Math.max(1, safeWidth - prefixWidth);
		const baseLines = super.render(contentWidth);
		const editor = this as unknown as PatchableEditor;

		let autocompleteLines: string[] = [];
		if (editor.isShowingAutocomplete?.() && editor.autocompleteList) {
			try {
				autocompleteLines = editor.autocompleteList.render(contentWidth);
			} catch {
				autocompleteLines = [];
			}
		}

		const editorLineCount = Math.max(0, baseLines.length - autocompleteLines.length);
		const editorLines = baseLines.slice(0, editorLineCount);
		const modeLabel = getModeLabel(prefixKind, safeWidth, this.piTheme);

		if (editorLines.length <= 2) {
			return [
				...(modeLabel ? [modeLabel, ""] : []),
				prefixRenderedLine("", safeWidth, prefixKind),
				"",
				...autocompleteLines.map((line) => `${" ".repeat(prefixWidth)}${line}`),
			];
		}

		const bodyLines = editorLines.slice(1, -1);
		return [
			...(modeLabel ? [modeLabel, ""] : []),
			...bodyLines.map((line) => prefixRenderedLine(line, safeWidth, prefixKind)),
			"",
			...autocompleteLines.map((line) => `${" ".repeat(prefixWidth)}${line}`),
		];
	}
}
