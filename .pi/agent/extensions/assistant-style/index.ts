import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { patchAssistantMessagePrototype } from "./patch-assistant-message.ts";
import { patchLoaderPrototype } from "./patch-working-loader.ts";
import { setCurrentTheme } from "./theme.ts";

export default function assistantStyleExtension(pi: ExtensionAPI): void {
	pi.on("session_start", async (_event, ctx) => {
		setCurrentTheme(ctx.hasUI ? ctx.ui.theme : undefined);
		patchAssistantMessagePrototype();
		patchLoaderPrototype();
	});

	pi.on("before_agent_start", async (_event, ctx) => {
		setCurrentTheme(ctx.hasUI ? ctx.ui.theme : undefined);
		patchAssistantMessagePrototype();
		patchLoaderPrototype();
	});
}
