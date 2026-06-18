import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { Container, Spacer, truncateToWidth, visibleWidth, wrapTextWithAnsi } from "@mariozechner/pi-tui";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

const CONFIG_PATH = join(process.env.HOME ?? "", ".config/mcp/mcp.json");
const CONNECT_TIMEOUT_MS = 2_000;
const DESCRIPTION_LIMIT = 160;

const INTENT_PROPERTY = {
	type: "string",
	description: "Short note explaining why this MCP tool call helps accomplish the current task.",
} as const;

type McpJsonConfig = {
	mcpServers?: Record<string, { url?: unknown }>;
};

type ServerStatus = {
	name: string;
	url?: string;
	state: "configured" | "connected" | "failed";
	error?: string;
	tools: RegisteredMcpTool[];
	client?: Client;
	transport?: StreamableHTTPClientTransport;
};

type RegisteredMcpTool = {
	originalName: string;
	registeredName: string;
	description?: string;
	piOnlyIntent: boolean;
};

type ToolRenderContext = {
	lastComponent?: unknown;
	isPartial?: boolean;
	isError?: boolean;
	state?: Record<string, unknown>;
};

type ToolTheme = {
	fg?: (color: string, text: string) => string;
};

let statuses = new Map<string, ServerStatus>();
let registeredToolNames = new Set<string>();

export default function deadSimpleMcp(pi: ExtensionAPI): void {
	pi.on("session_start", async (_event, ctx) => {
		await shutdownClients();
		statuses = new Map();
		registeredToolNames = new Set();

		const config = await readConfig();
		if (!config.ok) {
			if (config.warning) ctx.ui.notify(config.warning, "warning");
			return;
		}

		const serverEntries = Object.entries(config.servers);
		if (serverEntries.length === 0) return;

		await Promise.all(serverEntries.map(async ([name, url]) => {
			const status: ServerStatus = { name, url, state: "configured", tools: [] };
			statuses.set(name, status);
			const abortController = new AbortController();
			const timeout = setTimeout(() => abortController.abort(new Error(`timed out after ${CONNECT_TIMEOUT_MS}ms connecting to ${name}`)), CONNECT_TIMEOUT_MS);
			try {
				await connectAndRegisterServer(pi, status, abortController.signal);
			} catch (error) {
				status.state = "failed";
				status.error = abortController.signal.aborted ? formatError(abortController.signal.reason) : formatError(error);
				ctx.ui.notify(`dead-simple-mcp: ${name} failed: ${status.error}`, "warning");
				await closeStatus(status);
			} finally {
				clearTimeout(timeout);
			}
		}));
	});

	pi.on("session_shutdown", async () => {
		await shutdownClients();
	});

	pi.registerCommand("mcp-status", {
		description: "Show dead-simple-mcp server and tool status",
		handler: async (_args, ctx) => {
			ctx.ui.notify(formatStatus(), "info");
		},
	});
}

async function readConfig(): Promise<
	| { ok: true; servers: Record<string, string> }
	| { ok: false; warning?: string }
> {
	let raw: string;
	try {
		raw = await readFile(CONFIG_PATH, "utf8");
	} catch (error: any) {
		if (error?.code === "ENOENT") return { ok: true, servers: {} };
		return { ok: false, warning: `dead-simple-mcp: could not read ${CONFIG_PATH}: ${formatError(error)}` };
	}

	let parsed: McpJsonConfig;
	try {
		parsed = JSON.parse(raw) as McpJsonConfig;
	} catch (error) {
		return { ok: false, warning: `dead-simple-mcp: malformed JSON in ${CONFIG_PATH}: ${formatError(error)}` };
	}

	if (!parsed || typeof parsed !== "object" || parsed.mcpServers === undefined) {
		return { ok: false, warning: `dead-simple-mcp: invalid config shape in ${CONFIG_PATH}; expected { "mcpServers": { ... } }` };
	}
	if (!parsed.mcpServers || typeof parsed.mcpServers !== "object" || Array.isArray(parsed.mcpServers)) {
		return { ok: false, warning: `dead-simple-mcp: invalid mcpServers in ${CONFIG_PATH}; expected an object` };
	}

	const servers: Record<string, string> = {};
	for (const [name, server] of Object.entries(parsed.mcpServers)) {
		if (!server || typeof server !== "object") {
			return { ok: false, warning: `dead-simple-mcp: invalid server ${name}; expected an object with url` };
		}
		if (typeof server.url !== "string" || server.url.trim().length === 0) {
			return { ok: false, warning: `dead-simple-mcp: invalid server ${name}; expected non-empty url` };
		}
		servers[name] = server.url.trim();
	}

	return { ok: true, servers };
}

async function connectAndRegisterServer(pi: ExtensionAPI, status: ServerStatus, signal: AbortSignal): Promise<void> {
	if (!status.url) throw new Error("missing url");
	const client = new Client({ name: "dead-simple-mcp", version: "0.1.0" });
	const transport = new StreamableHTTPClientTransport(new URL(status.url), { requestInit: { signal } });
	status.client = client;
	status.transport = transport;

	await client.connect(transport);
	signal.throwIfAborted();
	const toolList = await client.listTools();
	signal.throwIfAborted();
	const seenRemoteNames = new Set<string>();

	for (const tool of toolList.tools ?? []) {
		if (seenRemoteNames.has(tool.name)) {
			status.tools.push({
				originalName: tool.name,
				registeredName: "",
				description: "Skipped duplicate remote tool name",
				piOnlyIntent: false,
			});
			continue;
		}
		seenRemoteNames.add(tool.name);

		const serverPart = sanitizeName(status.name);
		const toolPart = sanitizeName(tool.name);
		const registeredName = `mcp__${serverPart}__${toolPart}`;
		if (registeredToolNames.has(registeredName)) {
			status.tools.push({
				originalName: tool.name,
				registeredName: "",
				description: `Skipped sanitized name collision (${registeredName})`,
				piOnlyIntent: false,
			});
			continue;
		}
		registeredToolNames.add(registeredName);

		const piOnlyIntent = !schemaHasIntent(tool.inputSchema);
		const parameters = withIntentParameter(tool.inputSchema, piOnlyIntent);
		const description = normalizeDescription(tool.description) || `MCP ${status.name}.${tool.name}`;
		const registeredTool: RegisteredMcpTool = {
			originalName: tool.name,
			registeredName,
			description,
			piOnlyIntent,
		};
		status.tools.push(registeredTool);

		pi.registerTool({
			name: registeredName,
			label: `MCP ${status.name}.${tool.name}`,
			renderShell: "self",
			description,
			promptSnippet: `${registeredName}: ${truncateDescription(description)}`,
			parameters,
			prepareArguments(args: unknown) {
				if (!piOnlyIntent) return args;
				if (!args || typeof args !== "object") return { intent: "Intent not provided" };
				const input = args as Record<string, unknown>;
				if (typeof input.intent === "string" && input.intent.trim().length > 0) return input;
				return { ...input, intent: "Intent not provided" };
			},
			async execute(_toolCallId: string, params: Record<string, unknown>) {
				const activeClient = status.client;
				if (!activeClient) throw new Error(`MCP server ${status.name} is not connected`);
				const args = piOnlyIntent ? stripIntent(params) : params;
				const result = await activeClient.callTool({ name: tool.name, arguments: args });
				return {
					content: [{ type: "text", text: stringifyMcpResult(result) }],
					details: result,
					isError: Boolean((result as any).isError),
				};
			},
			renderCall(args: any, theme: any, context: any) {
				if (!context?.isPartial) return resetContainer(context ?? {});
				return renderMcpTool(theme, context, `MCP ${status.name}.${tool.name}`, readIntent(args));
			},
			renderResult(_result: any, options: any, theme: any, context: any) {
				const label = `MCP ${status.name}.${tool.name}`;
				const intent = readIntent(context?.args);
				if (!options?.expanded) return renderMcpTool(theme, context, label, intent);
				return renderExpandedMcpTool(theme, context, label, intent, _result);
			},
		} as any);
	}

	status.state = "connected";
}

function withIntentParameter(schema: unknown, addIntent: boolean): Record<string, unknown> {
	const base = normalizeInputSchema(schema);
	if (!addIntent) return base;
	const properties = {
		...((base.properties as Record<string, unknown> | undefined) ?? {}),
		intent: INTENT_PROPERTY,
	};
	const required = Array.isArray(base.required) ? [...base.required] : [];
	if (!required.includes("intent")) required.push("intent");
	return { ...base, properties, required };
}

function normalizeInputSchema(schema: unknown): Record<string, unknown> {
	if (!schema || typeof schema !== "object" || Array.isArray(schema)) {
		return { type: "object", properties: {}, required: [] };
	}
	const objectSchema = schema as Record<string, unknown>;
	return {
		...objectSchema,
		type: objectSchema.type === "object" ? "object" : "object",
		properties: (objectSchema.properties && typeof objectSchema.properties === "object" && !Array.isArray(objectSchema.properties))
			? objectSchema.properties
			: {},
		required: Array.isArray(objectSchema.required) ? objectSchema.required : [],
	};
}

function schemaHasIntent(schema: unknown): boolean {
	if (!schema || typeof schema !== "object" || Array.isArray(schema)) return false;
	const properties = (schema as Record<string, unknown>).properties;
	return Boolean(properties && typeof properties === "object" && !Array.isArray(properties) && "intent" in properties);
}

function stripIntent(args: Record<string, unknown>): Record<string, unknown> {
	const { intent: _intent, ...rest } = args;
	return rest;
}

function stringifyMcpResult(result: unknown): string {
	const content = (result as any)?.content;
	if (!Array.isArray(content)) return stringifyUnknown(result);
	return content.map((part) => {
		if (part?.type === "text" && typeof part.text === "string") return part.text;
		return stringifyUnknown(part);
	}).join("\n");
}

function stringifyUnknown(value: unknown): string {
	if (typeof value === "string") return value;
	try {
		return JSON.stringify(value, null, 2);
	} catch {
		return String(value);
	}
}

async function shutdownClients(): Promise<void> {
	await Promise.all([...statuses.values()].map(closeStatus));
}

async function closeStatus(status: ServerStatus): Promise<void> {
	const client = status.client;
	status.client = undefined;
	status.transport = undefined;
	if (!client) return;
	try {
		await client.close();
	} catch {
		// Ignore shutdown errors.
	}
}

function formatStatus(): string {
	const lines = ["dead-simple-mcp"];
	if (statuses.size === 0) {
		lines.push(`no servers loaded from ${CONFIG_PATH}`);
		return lines.join("\n");
	}
	for (const status of statuses.values()) {
		const marker = status.state === "connected" ? "✓" : status.state === "failed" ? "✗" : "?";
		const summary = status.state === "connected"
			? `${status.tools.filter((tool) => tool.registeredName).length} tools ${status.url}`
			: `${status.error ?? status.url ?? "not connected"}`;
		lines.push(`${marker} ${status.name} ${summary}`);
		const names = status.tools
			.filter((tool) => tool.registeredName)
			.map((tool) => tool.originalName)
			.join(", ");
		if (names) lines.push(`  ${names}`);
		const skipped = status.tools.filter((tool) => !tool.registeredName || tool.description?.startsWith("Skipped"));
		for (const tool of skipped) {
			lines.push(`  ! ${tool.originalName}: ${tool.description ?? "skipped"}`);
		}
	}
	return lines.join("\n");
}

function sanitizeName(name: string): string {
	const sanitized = name.trim().replace(/[^A-Za-z0-9_]+/g, "_").replace(/^_+|_+$/g, "").toLowerCase();
	if (!sanitized) return "unnamed";
	if (/^[0-9]/.test(sanitized)) return `_${sanitized}`;
	return sanitized;
}

function normalizeDescription(description: unknown): string {
	return typeof description === "string" ? description.replace(/\s+/g, " ").trim() : "";
}

function truncateDescription(description: string): string {
	const normalized = normalizeDescription(description);
	if (normalized.length <= DESCRIPTION_LIMIT) return normalized;
	return `${normalized.slice(0, DESCRIPTION_LIMIT - 1).trimEnd()}…`;
}

function readIntent(args: unknown): string | undefined {
	if (!args || typeof args !== "object") return undefined;
	const intent = (args as Record<string, unknown>).intent;
	return typeof intent === "string" ? intent : undefined;
}

function formatError(error: unknown): string {
	if (error instanceof Error) return error.message;
	return String(error);
}

function renderMcpTool(theme: ToolTheme, context: ToolRenderContext, label: string, intent?: string): Container | StatusLine {
	const formattedIntent = intent?.trim();
	if (!formattedIntent) return statusLine(theme, context, label);
	const container = resetContainer(context);
	container.addChild(new WrappedPreview(color(theme, "thinkingText", formattedIntent), "  ", 4));
	container.addChild(new Spacer(1));
	container.addChild(statusLine(theme, { ...context, lastComponent: undefined }, label));
	return container;
}

function renderExpandedMcpTool(theme: ToolTheme, context: ToolRenderContext, label: string, intent: string | undefined, result: unknown): Container {
	const container = resetContainer(context);
	container.addChild(renderMcpTool(theme, {}, label, intent) as any);
	const text = typeof (result as any)?.content?.[0]?.text === "string" ? (result as any).content[0].text : stringifyUnknown(result);
	if (text.trim().length > 0) {
		container.addChild(new Spacer(1));
		container.addChild(new WrappedPreview(text, "  ", Number.POSITIVE_INFINITY));
	}
	return container;
}

function statusLine(theme: ToolTheme, context: ToolRenderContext, label: string): StatusLine {
	const component = context.lastComponent instanceof StatusLine ? context.lastComponent : new StatusLine();
	const marker = context.isPartial ? color(theme, "accent", "?") : context.isError ? color(theme, "error", "✕") : color(theme, "success", "✓");
	component.setParts(marker, label);
	return component;
}

function resetContainer(context: ToolRenderContext): Container {
	const component = context.lastComponent instanceof Container ? context.lastComponent : new Container();
	component.clear();
	return component;
}

function color(theme: ToolTheme, name: string, text: string): string {
	return theme?.fg ? theme.fg(name, text) : text;
}

class StatusLine {
	private marker = "";
	private label = "";

	setParts(marker: string, label: string): void {
		this.marker = marker;
		this.label = label;
	}

	render(width: number): string[] {
		const safeWidth = Math.max(1, Math.floor(width));
		const prefix = `${this.marker} `;
		const contentWidth = Math.max(1, safeWidth - visibleWidth(prefix));
		return [`${prefix}${truncateToWidth(this.label, contentWidth, "", true)}`];
	}

	invalidate(): void {}
}

class WrappedPreview {
	constructor(private text: string, private indent = "", private maxLines = 4) {}

	render(width: number): string[] {
		const safeWidth = Math.max(1, Math.floor(width));
		const contentWidth = Math.max(1, safeWidth - visibleWidth(this.indent));
		const lines = this.text.split("\n").flatMap((line) => {
			const wrapped = wrapTextWithAnsi(line, contentWidth);
			return wrapped.length > 0 ? wrapped : [""];
		});
		const visible = Number.isFinite(this.maxLines) ? lines.slice(0, this.maxLines) : lines;
		return visible.map((line) => truncateToWidth(`${this.indent}${line}`, safeWidth, "", true));
	}

	invalidate(): void {}
}
