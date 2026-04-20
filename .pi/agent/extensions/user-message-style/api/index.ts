import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { UserMessageStyleEditor } from "./editor.ts";
import { patchBashExecutionPrototype } from "../monkeypatch/patch-bash-execution.ts";
import { patchInteractiveModePrototype } from "../monkeypatch/patch-interactive-mode.ts";
import { patchUserMessagePrototype } from "../monkeypatch/patch-user-message.ts";
import { setActiveTheme } from "../shared/theme.ts";

export default function userMessageStyleExtension(pi: ExtensionAPI): void {
	patchUserMessagePrototype();
	patchBashExecutionPrototype();
	patchInteractiveModePrototype();

	pi.on("session_start", async (_event, ctx) => {
		setActiveTheme(ctx.ui.theme);
		patchUserMessagePrototype();
		patchBashExecutionPrototype();
		patchInteractiveModePrototype();
		ctx.ui.setEditorComponent((tui, theme, keybindings) => new UserMessageStyleEditor(tui, theme, keybindings, ctx.ui.theme));
	});

	pi.on("before_agent_start", async (_event, ctx) => {
		setActiveTheme(ctx.ui.theme);
		patchUserMessagePrototype();
		patchBashExecutionPrototype();
		patchInteractiveModePrototype();
	});
}
