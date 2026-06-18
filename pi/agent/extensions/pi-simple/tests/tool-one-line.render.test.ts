import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { initTheme } from "@mariozechner/pi-coding-agent";
import { beforeAll, describe, expect, it } from "vitest";
import toolOneLineExtension from "../tool-one-line/index.ts";

type RenderThemeLike = {
	fg(color: string, value: string): string;
	bold(value: string): string;
};

type RenderComponentLike = {
	render(width: number): string[];
};

type RegisteredToolLike = {
	name: string;
	renderCall?: (args: unknown, theme: unknown, context: unknown) => RenderComponentLike;
	renderResult?: (result: unknown, options: unknown, theme: unknown, context: unknown) => RenderComponentLike;
};

type ToolEventHandler = (event: unknown) => Promise<unknown> | unknown;

function createExtensionApiStub(): {
	api: ExtensionAPI;
	registeredTools: RegisteredToolLike[];
	eventHandlers: Record<string, ToolEventHandler>;
} {
	const registeredTools: RegisteredToolLike[] = [];
	const eventHandlers: Record<string, ToolEventHandler> = {};
	const api = {
		registerTool(tool: RegisteredToolLike): void {
			registeredTools.push(tool);
		},
		on(event: string, handler: ToolEventHandler): void {
			eventHandlers[event] = handler;
		},
	} as unknown as ExtensionAPI;
	return { api, registeredTools, eventHandlers };
}

function createTheme(): RenderThemeLike {
	return {
		fg: (_color: string, value: string): string => value,
		bold: (value: string): string => value,
	};
}

function normalizeRenderedLines(component: RenderComponentLike): string[] {
	return component.render(120).map((line) => line.trimEnd());
}

function normalizeRenderedText(component: RenderComponentLike): string {
	return normalizeRenderedLines(component)
		.join("\n")
		.trim();
}

function renderBashResult(tool: RegisteredToolLike | undefined, text: string): string {
	expect(tool?.renderResult).toBeTypeOf("function");
	return normalizeRenderedText(
		tool!.renderResult!(
			{
				content: [{ type: "text", text }],
				details: {},
				isError: false,
			},
			{ isPartial: false, expanded: false },
			createTheme(),
			{
				args: { command: "uv run python - <<'PY' ...", intent: "test collapsed preview" },
				state: {},
				lastComponent: undefined,
				invalidate: () => {},
				toolCallId: "bash-test-1",
				cwd: process.cwd(),
				executionStarted: true,
				argsComplete: true,
				isPartial: false,
				expanded: false,
				showImages: false,
				isError: false,
			},
		),
	);
}

function createRenderContext(
	args: Record<string, unknown>,
	expanded: boolean,
	overrides: Record<string, unknown> = {},
): Record<string, unknown> {
	return {
		args,
		state: {},
		lastComponent: undefined,
		invalidate: () => {},
		toolCallId: "tool-test-1",
		cwd: process.cwd(),
		executionStarted: true,
		argsComplete: true,
		isPartial: false,
		expanded,
		showImages: true,
		isError: false,
		...overrides,
	};
}

describe("tool-one-line lifecycle icons", () => {
	beforeAll(() => {
		initTheme("dark");
	});

	it("renders partial tool calls with a static question mark and no interval state", () => {
		const { api, registeredTools } = createExtensionApiStub();
		toolOneLineExtension(api);

		const bashTool = registeredTools.find((tool) => tool.name === "bash");
		expect(bashTool?.renderCall).toBeTypeOf("function");
		const context = createRenderContext(
			{ command: "sleep 3", intent: "test pending icon" },
			false,
			{ isPartial: true },
		);
		const rendered = normalizeRenderedText(
			bashTool!.renderCall!(context.args, createTheme(), context),
		);

		expect(rendered).toContain("?");
		expect(context.state).not.toHaveProperty("interval");
	});

	it("renders partial bash results as output only so the call header is not duplicated", () => {
		const { api, registeredTools } = createExtensionApiStub();
		toolOneLineExtension(api);

		const bashTool = registeredTools.find((tool) => tool.name === "bash");
		expect(bashTool?.renderResult).toBeTypeOf("function");
		const rendered = normalizeRenderedText(
			bashTool!.renderResult!(
				{ content: [{ type: "text", text: "line 1\nline 2" }], details: {}, isError: false },
				{ isPartial: true, expanded: false },
				createTheme(),
				createRenderContext(
					{ command: "printf 'line 1\\nline 2\\n'", intent: "test streaming output" },
					false,
					{ isPartial: true },
				),
			),
		);

		expect(rendered).toContain("line 1");
		expect(rendered).toContain("line 2");
		expect(rendered).not.toContain("Run");
		expect(rendered).not.toContain("test streaming output");
	});

	it("starts partial bash output with a blank separator line", () => {
		const { api, registeredTools } = createExtensionApiStub();
		toolOneLineExtension(api);

		const bashTool = registeredTools.find((tool) => tool.name === "bash");
		expect(bashTool?.renderResult).toBeTypeOf("function");
		const renderedLines = normalizeRenderedLines(
			bashTool!.renderResult!(
				{ content: [{ type: "text", text: "line 1\nline 2" }], details: {}, isError: false },
				{ isPartial: true, expanded: false },
				createTheme(),
				createRenderContext(
					{ command: "printf 'line 1\\nline 2\\n'", intent: "test streaming output spacing" },
					false,
					{ isPartial: true },
				),
			),
		);

		expect(renderedLines[0]).toBe("");
		expect(renderedLines[1]).toContain("line 1");
	});

	it("renders empty partial bash updates as empty so the call header is not duplicated", () => {
		const { api, registeredTools } = createExtensionApiStub();
		toolOneLineExtension(api);

		const bashTool = registeredTools.find((tool) => tool.name === "bash");
		expect(bashTool?.renderResult).toBeTypeOf("function");
		const rendered = normalizeRenderedText(
			bashTool!.renderResult!(
				{ content: [], details: undefined, isError: false },
				{ isPartial: true, expanded: false },
				createTheme(),
				createRenderContext(
					{ command: "sleep 1", intent: "test empty streaming update" },
					false,
					{ isPartial: true },
				),
			),
		);

		expect(rendered).toBe("");
	});

	it("renders expanded partial bash output without the collapsed preview limit", () => {
		const { api, registeredTools } = createExtensionApiStub();
		toolOneLineExtension(api);

		const bashTool = registeredTools.find((tool) => tool.name === "bash");
		expect(bashTool?.renderResult).toBeTypeOf("function");
		const output = Array.from({ length: 12 }, (_, index) => `line-${index + 1}`).join("\n");
		const rendered = normalizeRenderedText(
			bashTool!.renderResult!(
				{ content: [{ type: "text", text: output }], details: {}, isError: false },
				{ isPartial: true, expanded: true },
				createTheme(),
				createRenderContext(
					{ command: "for i in $(seq 1 12); do echo line-$i; done", intent: "test expanded streaming output" },
					true,
					{ isPartial: true },
				),
			),
		);

		expect(rendered).toContain("line-11");
		expect(rendered).toContain("line-12");
		expect(rendered).not.toContain("more lines");
		expect(rendered).not.toContain("to expand");
		expect(rendered).not.toContain("Run");
		expect(rendered).not.toContain("test expanded streaming output");
	});

	it("renders successful completed tool calls with a check mark", () => {
		const { api, registeredTools } = createExtensionApiStub();
		toolOneLineExtension(api);

		const bashTool = registeredTools.find((tool) => tool.name === "bash");
		const rendered = renderBashResult(bashTool, "done");

		expect(rendered).toContain("✓");
	});

	it("renders failed completed tool calls with a cross mark", () => {
		const { api, registeredTools } = createExtensionApiStub();
		toolOneLineExtension(api);

		const bashTool = registeredTools.find((tool) => tool.name === "bash");
		expect(bashTool?.renderResult).toBeTypeOf("function");
		const rendered = normalizeRenderedText(
			bashTool!.renderResult!(
				{ content: [{ type: "text", text: "failed" }], details: {}, isError: true },
				{ isPartial: false, expanded: false },
				createTheme(),
				createRenderContext(
					{ command: "false", intent: "test error icon" },
					false,
					{ isError: true },
				),
			),
		);

		expect(rendered).toContain("✕");
	});
});

describe("tool-one-line settled bash rendering", () => {
	beforeAll(() => {
		initTheme("dark");
	});

	it("summarizes settled bash output without showing an output preview", () => {
		const { api, registeredTools } = createExtensionApiStub();
		toolOneLineExtension(api);

		const bashTool = registeredTools.find((tool) => tool.name === "bash");
		const output = Array.from({ length: 20 }, (_, index) => (
			`${String(index + 1).padStart(2, "0")}: short-preview-test ${"x".repeat(24)}`
		)).join("\n");
		const rendered = renderBashResult(bashTool, output);

		expect(rendered).toContain("✓");
		expect(rendered).toContain("Run");
		expect(rendered).toContain("20 output lines");
		expect(rendered).toContain("ctrl-o to expand");
		expect(rendered).not.toContain("01: short-preview-test");
		expect(rendered).not.toContain("20: short-preview-test");
		expect(rendered).toContain("test collapsed preview");
	});

	it("uses a singular output-line summary for one-line settled bash output", () => {
		const { api, registeredTools } = createExtensionApiStub();
		toolOneLineExtension(api);

		const bashTool = registeredTools.find((tool) => tool.name === "bash");
		const rendered = renderBashResult(bashTool, "01: alpha");

		expect(rendered).toContain("1 output line");
		expect(rendered).toContain("ctrl-o to expand");
		expect(rendered).not.toContain("01: alpha");
	});

	it("preserves ANSI SGR sequences in expanded settled bash output", () => {
		const { api, registeredTools } = createExtensionApiStub();
		toolOneLineExtension(api);

		const bashTool = registeredTools.find((tool) => tool.name === "bash");
		expect(bashTool?.renderResult).toBeTypeOf("function");
		const rendered = normalizeRenderedText(
			bashTool!.renderResult!(
				{ content: [{ type: "text", text: "\x1b[31mred\x1b[0m normal\n\x1b[32mgreen\x1b[0m" }], details: {}, isError: false },
				{ isPartial: false, expanded: true },
				createTheme(),
				createRenderContext(
					{ command: "printf colors", intent: "test ANSI output" },
					true,
				),
			),
		);

		expect(rendered).toContain("\x1b[31mred\x1b[0m normal");
		expect(rendered).toContain("\x1b[32mgreen\x1b[0m");
	});
});

describe("tool-one-line read image rendering", () => {
	beforeAll(() => {
		initTheme("dark");
	});

	it("removes image attachments from collapsed read results", () => {
		const { api, registeredTools } = createExtensionApiStub();
		toolOneLineExtension(api);

		const readTool = registeredTools.find((tool) => tool.name === "read");
		expect(readTool?.renderResult).toBeTypeOf("function");

		const result = {
			content: [
				{ type: "text", text: "Read image file [image/png]" },
				{ type: "image", data: "ZmFrZQ==", mimeType: "image/png" },
			],
			details: {},
			isError: false,
		};

		readTool!.renderResult!(
			result,
			{ isPartial: false, expanded: false },
			createTheme(),
			createRenderContext({ path: "image.png" }, false),
		);

		expect(result.content).toEqual([
			{ type: "text", text: "Read image file [image/png]" },
		]);
	});

	it("restores image attachments when the read result is expanded", () => {
		const { api, registeredTools } = createExtensionApiStub();
		toolOneLineExtension(api);

		const readTool = registeredTools.find((tool) => tool.name === "read");
		expect(readTool?.renderResult).toBeTypeOf("function");

		const result = {
			content: [
				{ type: "text", text: "Read image file [image/png]" },
				{ type: "image", data: "ZmFrZQ==", mimeType: "image/png" },
			],
			details: {},
			isError: false,
		};
		const collapsedContext = createRenderContext({ path: "image.png" }, false);

		readTool!.renderResult!(
			result,
			{ isPartial: false, expanded: false },
			createTheme(),
			collapsedContext,
		);
		readTool!.renderResult!(
			result,
			{ isPartial: false, expanded: true },
			createTheme(),
			{ ...collapsedContext, expanded: true },
		);

		expect(result.content).toEqual([
			{ type: "text", text: "Read image file [image/png]" },
			{ type: "image", data: "ZmFrZQ==", mimeType: "image/png" },
		]);
	});
});
