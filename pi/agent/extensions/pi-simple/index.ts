import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import assistantStyleExtension from "./assistant-style/index.ts";
import statusMessageStyleExtension from "./status-message-style/index.ts";
import toolOneLineExtension from "./tool-one-line/index.ts";
import userMessageStyleExtension from "./user-message-style/index.ts";

export default function piSimpleExtension(pi: ExtensionAPI): void {
	assistantStyleExtension(pi);
	statusMessageStyleExtension(pi);
	toolOneLineExtension(pi);
	userMessageStyleExtension(pi);
}
