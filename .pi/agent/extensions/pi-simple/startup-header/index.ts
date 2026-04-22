import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { VERSION, keyHint, keyText, rawKeyHint } from "@mariozechner/pi-coding-agent";
import { Text } from "@mariozechner/pi-tui";

const HEADER_INDENT = 2;

export default function startupHeaderIndentExtension(pi: ExtensionAPI): void {
	pi.on("session_start", async (_event, ctx) => {
		if (!ctx.hasUI) return;

		ctx.ui.setHeader((_tui, theme) => {
			const hint = (keybinding: Parameters<typeof keyHint>[0], description: string) =>
				keyHint(keybinding, description);

			const logo = theme.bold(theme.fg("accent", "pi")) + theme.fg("dim", ` v${VERSION}`);
			const instructions = [
				hint("app.interrupt", "to interrupt"),
				hint("app.clear", "to clear"),
				rawKeyHint(`${keyText("app.clear")} twice`, "to exit"),
				hint("app.exit", "to exit (empty)"),
				hint("app.suspend", "to suspend"),
				keyHint("tui.editor.deleteToLineEnd", "to delete to end"),
				hint("app.thinking.cycle", "to cycle thinking level"),
				rawKeyHint(`${keyText("app.model.cycleForward")}/${keyText("app.model.cycleBackward")}`, "to cycle models"),
				hint("app.model.select", "to select model"),
				hint("app.tools.expand", "to expand tools"),
				hint("app.thinking.toggle", "to expand thinking"),
				hint("app.editor.external", "for external editor"),
				rawKeyHint("/", "for commands"),
				rawKeyHint("!", "to run bash"),
				rawKeyHint("!!", "to run bash (no context)"),
				hint("app.message.followUp", "to queue follow-up"),
				hint("app.message.dequeue", "to edit all queued messages"),
				hint("app.clipboard.pasteImage", "to paste image"),
				rawKeyHint("drop files", "to attach"),
			].join("\n");

			const onboarding = theme.fg(
				"dim",
				"Pi can explain its own features and look up its docs. Ask it how to use or extend Pi.",
			);

			return new Text(`${logo}\n${instructions}\n\n${onboarding}`, HEADER_INDENT, 0);
		});
	});
}
