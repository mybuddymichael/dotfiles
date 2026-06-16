import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import {
	Editor,
	fuzzyFilter,
	type AutocompleteItem,
	type AutocompleteProvider,
	type AutocompleteSuggestions,
} from "@earendil-works/pi-tui";

const MAX_SUGGESTIONS = 20;
const PATCH_FLAG = Symbol.for("michael.skillSlashAutocomplete.editorPatch");
const BUILT_IN_SLASH_COMMANDS = new Set([
	"login",
	"logout",
	"model",
	"scoped-models",
	"settings",
	"resume",
	"new",
	"name",
	"session",
	"tree",
	"fork",
	"clone",
	"compact",
	"copy",
	"export",
	"share",
	"reload",
	"hotkeys",
	"changelog",
	"quit",
]);

type SkillCommand = {
	name: string;
	description?: string;
};

function extractSkillToken(textBeforeCursor: string, cursorLine: number): string | undefined {
	const match = textBeforeCursor.match(/(^|[ \t])\/((?:skill:)?[^\s/]*)$/);
	if (!match) return undefined;

	const slashIndex = (match.index ?? 0) + match[1].length;
	const rawToken = match[2] ?? "";
	const isAtStartOfMessage = cursorLine === 0 && textBeforeCursor.slice(0, slashIndex).trim() === "";
	const normalizedToken = rawToken.replace(/^skill:/, "");

	// At the start of the message, preserve Pi's built-in command behavior:
	// / and built-in prefixes (like /resu, /for) go to Pi's command menu so
	// selecting them executes immediately. Non-built-in skill matches (like
	// /grill-me) complete to /skill:name without submitting the editor.
	if (
		isAtStartOfMessage &&
		!rawToken.startsWith("skill:") &&
		(normalizedToken === "" || [...BUILT_IN_SLASH_COMMANDS].some((command) => command.startsWith(normalizedToken)))
	) {
		return undefined;
	}

	return normalizedToken;
}

function formatSkillItem(command: SkillCommand): AutocompleteItem {
	const skillName = command.name.replace(/^skill:/, "");
	return {
		value: `skill:${skillName}`,
		label: skillName,
		...(command.description && { description: command.description }),
	};
}

function filterSkills(commands: SkillCommand[], query: string): AutocompleteItem[] {
	const skills = commands.filter((command) => command.name.startsWith("skill:"));
	if (!query.trim()) {
		return skills.slice(0, MAX_SUGGESTIONS).map(formatSkillItem);
	}

	return fuzzyFilter(skills, query, (command) => {
		const skillName = command.name.replace(/^skill:/, "");
		return `${skillName} ${command.description ?? ""}`;
	})
		.slice(0, MAX_SUGGESTIONS)
		.map(formatSkillItem);
}

function patchEditorSlashTrigger(): void {
	const proto = Editor.prototype as typeof Editor.prototype & { [PATCH_FLAG]?: boolean };
	if (proto[PATCH_FLAG]) return;
	proto[PATCH_FLAG] = true;

	const originalHandleInput = proto.handleInput;
	proto.handleInput = function handleInputWithInlineSkillSlash(this: any, data: string): void {
		const line = this.state?.lines?.[this.state.cursorLine] ?? "";
		const cursorCol = this.state?.cursorCol ?? 0;
		const charBeforeSlash = line.slice(0, cursorCol).at(-1);
		const shouldTriggerSkillSlash =
			data === "/" && (charBeforeSlash === undefined || charBeforeSlash === " " || charBeforeSlash === "\t");

		originalHandleInput.call(this, data);

		if (shouldTriggerSkillSlash) {
			this.tryTriggerAutocomplete?.();
		}
	};
}

function createSkillSlashAutocompleteProvider(
	current: AutocompleteProvider,
	getSkillCommands: () => SkillCommand[],
): AutocompleteProvider {
	return {
		async getSuggestions(lines, cursorLine, cursorCol, options): Promise<AutocompleteSuggestions | null> {
			const currentLine = lines[cursorLine] ?? "";
			const textBeforeCursor = currentLine.slice(0, cursorCol);
			const token = extractSkillToken(textBeforeCursor, cursorLine);
			if (token === undefined) {
				return current.getSuggestions(lines, cursorLine, cursorCol, options);
			}

			const suggestions = filterSkills(getSkillCommands(), token);
			if (suggestions.length === 0) {
				return current.getSuggestions(lines, cursorLine, cursorCol, options);
			}

			const prefixMatch = textBeforeCursor.match(/\/(skill:[^\s/]*|[^\s/]*)$/);
			return {
				items: suggestions,
				prefix: prefixMatch?.[1] ?? token,
			};
		},

		applyCompletion(lines, cursorLine, cursorCol, item, prefix) {
			// Suggestions delegated to Pi's built-in slash-command provider use a
			// leading-/ prefix. Delegate completion too so /resume stays /resume and
			// Enter executes it instead of submitting plain text like "resume".
			if (prefix.startsWith("/")) {
				return current.applyCompletion(lines, cursorLine, cursorCol, item, prefix);
			}

			const currentLine = lines[cursorLine] ?? "";
			const beforePrefix = currentLine.slice(0, cursorCol - prefix.length);
			const afterCursor = currentLine.slice(cursorCol);
			const suffix = afterCursor.startsWith(" ") ? "" : " ";
			const newLines = [...lines];
			newLines[cursorLine] = `${beforePrefix}${item.value}${suffix}${afterCursor}`;
			return {
				lines: newLines,
				cursorLine,
				cursorCol: beforePrefix.length + item.value.length + suffix.length,
			};
		},

		shouldTriggerFileCompletion(lines, cursorLine, cursorCol) {
			return current.shouldTriggerFileCompletion?.(lines, cursorLine, cursorCol) ?? true;
		},
	};
}

export default function skillSlashAutocomplete(pi: ExtensionAPI): void {
	patchEditorSlashTrigger();

	pi.on("session_start", (_event, ctx) => {
		ctx.ui.addAutocompleteProvider((current) =>
			createSkillSlashAutocompleteProvider(current, () =>
				pi.getCommands().filter((command) => command.source === "skill"),
			),
		);
	});
}
