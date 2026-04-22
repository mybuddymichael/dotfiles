import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { registerBashTool } from "./register-bash.ts";
import { registerEditTool } from "./register-edit.ts";
import { registerFindTool } from "./register-find.ts";
import { registerGrepTool } from "./register-grep.ts";
import { registerLsTool } from "./register-ls.ts";
import { registerReadTool } from "./register-read.ts";
import { registerWriteTool } from "./register-write.ts";
import { registerBashTruncationHook } from "./tool-result-bash-truncation.ts";

export default function toolOneLineExtension(pi: ExtensionAPI): void {
	registerBashTruncationHook(pi);
	registerReadTool(pi);
	registerWriteTool(pi);
	registerEditTool(pi);
	registerBashTool(pi);
	registerGrepTool(pi);
	registerFindTool(pi);
	registerLsTool(pi);
}
