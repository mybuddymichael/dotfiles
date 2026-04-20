import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { patchTextRender } from "./patch-status-text.ts";

export default function statusMessageStyleExtension(_pi: ExtensionAPI): void {
	patchTextRender();
}
