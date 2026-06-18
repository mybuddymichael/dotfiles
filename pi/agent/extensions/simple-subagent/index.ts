import { spawn } from "node:child_process";
import * as fs from "node:fs";
import * as path from "node:path";
import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { Container, Spacer, Text } from "@mariozechner/pi-tui";
import { Type } from "@sinclair/typebox";

const MAX_COLLAPSED_ACTIVITY = 8;

const SUBAGENT_GUARDRAIL = `

You are a subagent invoked by a parent Pi agent.
Do only the delegated task. Return concise findings or results for the parent agent.
The subagent tool is intentionally unavailable to you; do not try to invoke subagents.
Do not ask the user questions. Report assumptions, blockers, and useful next steps to the parent agent.`;

type TextPart = { type: "text"; text: string };
type ToolCallPart = { type: "toolCall"; name: string; arguments?: Record<string, unknown> };
type ActivityItem =
	| { type: "toolCall"; name: string; args: Record<string, unknown> }
	| { type: "text"; text: string };

type UsageStats = {
	input: number;
	output: number;
	cacheRead: number;
	cacheWrite: number;
	cost: number;
	contextTokens: number;
	turns: number;
};

type SubagentDetails = {
	title: string;
	instructions: string;
	cwd: string;
	activity: ActivityItem[];
	finalOutput: string;
	stderr: string;
	exitCode: number | null;
	model?: string;
	stopReason?: string;
	errorMessage?: string;
	usage: UsageStats;
};

function formatTokens(count: number): string {
	if (count < 1000) return count.toString();
	if (count < 10000) return `${(count / 1000).toFixed(1)}k`;
	if (count < 1000000) return `${Math.round(count / 1000)}k`;
	return `${(count / 1000000).toFixed(1)}M`;
}

function formatUsage(usage: UsageStats, model?: string): string {
	const parts: string[] = [];
	if (usage.turns) parts.push(`${usage.turns} turn${usage.turns === 1 ? "" : "s"}`);
	if (usage.input) parts.push(`↑${formatTokens(usage.input)}`);
	if (usage.output) parts.push(`↓${formatTokens(usage.output)}`);
	if (usage.cacheRead) parts.push(`R${formatTokens(usage.cacheRead)}`);
	if (usage.cacheWrite) parts.push(`W${formatTokens(usage.cacheWrite)}`);
	if (usage.cost) parts.push(`$${usage.cost.toFixed(4)}`);
	if (usage.contextTokens) parts.push(`ctx:${formatTokens(usage.contextTokens)}`);
	if (model) parts.push(model);
	return parts.join(" ");
}

function compactText(text: string | undefined, max = 80): string {
	const compact = (text ?? "").replace(/\s+/g, " ").trim();
	return compact.length > max ? `${compact.slice(0, max - 1)}…` : compact;
}

function titleFromInstructions(instructions: string, title?: string): string {
	return compactText(title || instructions.split("\n").find((line) => line.trim()) || "subagent", 80);
}

function textFromMessage(message: any): string {
	return (message?.content ?? [])
		.filter((part: any): part is TextPart => part?.type === "text" && typeof part.text === "string")
		.map((part: TextPart) => part.text)
		.join("\n");
}

function updateUsage(details: SubagentDetails, message: any): void {
	details.usage.turns++;
	const usage = message?.usage;
	if (!usage) return;
	details.usage.input += usage.input || 0;
	details.usage.output += usage.output || 0;
	details.usage.cacheRead += usage.cacheRead || 0;
	details.usage.cacheWrite += usage.cacheWrite || 0;
	details.usage.cost += usage.cost?.total || 0;
	details.usage.contextTokens = usage.totalTokens || details.usage.contextTokens;
}

function hasToolCall(details: SubagentDetails, name: string, args: Record<string, unknown>): boolean {
	const encoded = JSON.stringify(args ?? {});
	return details.activity.some((item) => (
		item.type === "toolCall" && item.name === name && JSON.stringify(item.args ?? {}) === encoded
	));
}

function recordToolCall(details: SubagentDetails, name: string, args: Record<string, unknown>): void {
	if (!hasToolCall(details, name, args)) details.activity.push({ type: "toolCall", name, args });
}

function recordAssistantMessage(details: SubagentDetails, message: any): void {
	const parts = message?.content ?? [];
	for (const part of parts) {
		if (part?.type === "toolCall" && typeof part.name === "string") {
			recordToolCall(details, part.name, part.arguments ?? {});
		}
	}

	const text = textFromMessage(message);
	if (text.trim()) {
		details.finalOutput = text;
		details.activity.push({ type: "text", text });
	}

	if (message?.model) details.model = message.model;
	if (message?.stopReason) details.stopReason = message.stopReason;
	if (message?.errorMessage) details.errorMessage = message.errorMessage;
	updateUsage(details, message);
}

function getPiInvocation(args: string[]): { command: string; args: string[] } {
	const currentScript = process.argv[1];
	const isBunVirtualScript = currentScript?.startsWith("/$bunfs/root/");
	if (currentScript && !isBunVirtualScript && fs.existsSync(currentScript)) {
		return { command: process.execPath, args: [currentScript, ...args] };
	}

	const execName = path.basename(process.execPath).toLowerCase();
	const isGenericRuntime = /^(node|bun)(\.exe)?$/.test(execName);
	if (!isGenericRuntime) return { command: process.execPath, args };
	return { command: "pi", args };
}

function formatToolCall(item: ActivityItem, theme: any): string {
	if (item.type === "text") return theme.fg("toolOutput", compactText(item.text, 120));
	const args = item.args ?? {};
	switch (item.name) {
		case "bash":
			return theme.fg("muted", "Run ") + theme.fg("bashMode", compactText(args.command as string, 90));
		case "read":
			return theme.fg("muted", "Read ") + theme.fg("syntaxFunction", compactText((args.path ?? args.file_path) as string, 90));
		case "write":
			return theme.fg("muted", "Write ") + theme.fg("syntaxFunction", compactText((args.path ?? args.file_path) as string, 90));
		case "edit":
			return theme.fg("muted", "Edit ") + theme.fg("syntaxFunction", compactText((args.path ?? args.file_path) as string, 90));
		case "grep":
			return theme.fg("muted", "Grep ") + theme.fg("syntaxNumber", compactText(args.pattern as string, 60));
		case "find":
			return theme.fg("muted", "Find ") + theme.fg("syntaxVariable", compactText(args.pattern as string, 60));
		case "ls":
			return theme.fg("muted", "List ") + theme.fg("syntaxFunction", compactText(args.path as string || ".", 90));
		default:
			return theme.fg("accent", item.name) + theme.fg("dim", ` ${compactText(JSON.stringify(args), 80)}`);
	}
}

function renderDetails(details: SubagentDetails, options: { expanded: boolean; isPartial: boolean }, theme: any) {
	const icon = options.isPartial || details.exitCode === null
		? theme.fg("accent", "?")
		: details.exitCode !== 0 || details.errorMessage
			? theme.fg("error", "✕")
			: theme.fg("success", "✓");
	const header = `${icon} ${theme.fg("toolTitle", theme.bold("Subagent"))} ${theme.fg("accent", details.title)}`;
	const usage = formatUsage(details.usage, details.model);

	if (!options.expanded) {
		let text = header;
		const activity = details.activity.slice(-MAX_COLLAPSED_ACTIVITY);
		const skipped = details.activity.length - activity.length;
		const hasBody = skipped > 0 || activity.length > 0 || !!details.errorMessage || !!usage;
		if (hasBody) text += "\n";
		if (skipped > 0) text += `\n  ${theme.fg("muted", `… ${skipped} earlier items`)}`;
		for (const item of activity) text += `\n  ${theme.fg("muted", "→ ")}${formatToolCall(item, theme)}`;
		if (details.errorMessage) text += `\n  ${theme.fg("error", compactText(details.errorMessage, 120))}`;
		if (usage) text += `\n  ${theme.fg("dim", usage)}`;
		return new Text(text, 0, 0);
	}

	const container = new Container();
	container.addChild(new Text(header, 0, 0));
	container.addChild(new Spacer(1));
	container.addChild(new Text(theme.fg("muted", "─── Instructions ───"), 0, 0));
	container.addChild(new Text(theme.fg("dim", details.instructions), 0, 0));
	container.addChild(new Spacer(1));
	container.addChild(new Text(theme.fg("muted", "─── Activity ───"), 0, 0));
	if (details.activity.length === 0) {
		container.addChild(new Text(theme.fg("muted", "(no activity yet)"), 0, 0));
	} else {
		for (const item of details.activity) {
			container.addChild(new Text(`${theme.fg("muted", "→ ")}${formatToolCall(item, theme)}`, 0, 0));
		}
	}
	if (details.finalOutput.trim()) {
		container.addChild(new Spacer(1));
		container.addChild(new Text(theme.fg("muted", "─── Final output ───"), 0, 0));
		container.addChild(new Text(theme.fg("toolOutput", details.finalOutput.trim()), 0, 0));
	}
	if (details.stderr.trim()) {
		container.addChild(new Spacer(1));
		container.addChild(new Text(theme.fg("muted", "─── stderr ───"), 0, 0));
		container.addChild(new Text(theme.fg("error", details.stderr.trim()), 0, 0));
	}
	if (usage) {
		container.addChild(new Spacer(1));
		container.addChild(new Text(theme.fg("dim", usage), 0, 0));
	}
	return container;
}

function buildModelArg(ctx: any, pi: ExtensionAPI): string | undefined {
	if (!ctx.model?.provider || !ctx.model?.id) return undefined;
	const thinking = pi.getThinkingLevel?.();
	const suffix = thinking && thinking !== "off" ? `:${thinking}` : "";
	return `${ctx.model.provider}/${ctx.model.id}${suffix}`;
}

function activeToolsWithoutSubagent(pi: ExtensionAPI): string[] {
	return pi.getActiveTools().filter((tool) => tool !== "subagent");
}

export default function simpleSubagentExtension(pi: ExtensionAPI): void {
	pi.registerTool({
		name: "subagent",
		label: "Subagent",
		description: "Invoke a one-level child Pi agent with inherited profile, model, system prompt, cwd, and active tools minus subagent. Returns the child agent's final answer.",
		promptSnippet: "Delegate an isolated task to a child Pi agent and wait for its final answer",
		promptGuidelines: [
			"Use subagent when a task benefits from isolated exploration or parallelizable context gathering.",
			"Do not use subagent for simple tasks you can perform directly.",
			"Subagent children cannot call subagents; only one level of delegation is available.",
		],
		parameters: Type.Object({
			instructions: Type.String({ description: "Detailed instructions for the child agent." }),
			title: Type.Optional(Type.String({ description: "Short label for rendering this subagent task." })),
			cwd: Type.Optional(Type.String({ description: "Optional working directory for the child agent. Defaults to the parent cwd." })),
		}),
		renderShell: "self",

		async execute(_toolCallId: any, params: any, signal: any, onUpdate: any, ctx: any) {
			const title = titleFromInstructions(params.instructions, params.title);
			const cwd = params.cwd ? path.resolve(ctx.cwd, params.cwd) : ctx.cwd;
			const details: SubagentDetails = {
				title,
				instructions: params.instructions,
				cwd,
				activity: [],
				finalOutput: "",
				stderr: "",
				exitCode: null,
				usage: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0, cost: 0, contextTokens: 0, turns: 0 },
			};

			const emitUpdate = () => {
				onUpdate?.({ content: [{ type: "text", text: details.finalOutput || "(running...)" }], details });
			};

			const args = ["--mode", "json", "-p", "--no-session"];
			const modelArg = buildModelArg(ctx, pi);
			if (modelArg) args.push("--model", modelArg);

			const activeTools = activeToolsWithoutSubagent(pi);
			if (activeTools.length > 0) args.push("--tools", activeTools.join(","));
			else args.push("--no-tools");

			args.push("--system-prompt", `${ctx.getSystemPrompt()}${SUBAGENT_GUARDRAIL}`);
			args.push(params.instructions);

			let wasAborted = false;
			let buffer = "";
			const invocation = getPiInvocation(args);

			const exitCode = await new Promise<number>((resolve) => {
				const proc = spawn(invocation.command, invocation.args, {
					cwd,
					shell: false,
					stdio: ["ignore", "pipe", "pipe"],
					env: process.env,
				});

				const processLine = (line: string) => {
					if (!line.trim()) return;
					let event: any;
					try {
						event = JSON.parse(line);
					} catch {
						return;
					}

					if (event.type === "tool_execution_start" && event.toolName) {
						recordToolCall(details, event.toolName, event.args ?? {});
						emitUpdate();
						return;
					}

					if (event.type === "message_end" && event.message?.role === "assistant") {
						recordAssistantMessage(details, event.message);
						emitUpdate();
					}
				};

				proc.stdout.on("data", (data) => {
					buffer += data.toString();
					const lines = buffer.split("\n");
					buffer = lines.pop() || "";
					for (const line of lines) processLine(line);
				});

				proc.stderr.on("data", (data) => {
					details.stderr += data.toString();
					emitUpdate();
				});

				proc.on("close", (code) => {
					if (buffer.trim()) processLine(buffer);
					resolve(code ?? 0);
				});

				proc.on("error", (error) => {
					details.errorMessage = error.message;
					resolve(1);
				});

				const killProc = () => {
					wasAborted = true;
					proc.kill("SIGTERM");
					setTimeout(() => {
						if (!proc.killed) proc.kill("SIGKILL");
					}, 5000).unref();
				};

				if (signal?.aborted) killProc();
				else signal?.addEventListener("abort", killProc, { once: true });
			});

			details.exitCode = exitCode;
			emitUpdate();

			if (wasAborted) throw new Error("Subagent was aborted");
			if (exitCode !== 0) throw new Error(details.stderr.trim() || details.errorMessage || `Subagent exited with code ${exitCode}`);
			if (details.stopReason === "error" || details.stopReason === "aborted") {
				throw new Error(details.errorMessage || `Subagent stopped: ${details.stopReason}`);
			}

			return {
				content: [{ type: "text", text: details.finalOutput || "(no output)" }],
				details,
			};
		},

		renderCall(_args: any, _theme: any, _context: any) {
			return new Text("", 0, 0);
		},

		renderResult(result: any, options: any, theme: any, _context: any) {
			const details = result.details as SubagentDetails | undefined;
			if (!details) {
				const text = result.content?.find((part: any) => part?.type === "text")?.text ?? "(no output)";
				return new Text(text, 0, 0);
			}
			return renderDetails(details, options, theme);
		},
	} as any);
}
