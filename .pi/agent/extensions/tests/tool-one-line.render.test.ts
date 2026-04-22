import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { initTheme } from "@mariozechner/pi-coding-agent";
import { beforeAll, describe, expect, it } from "vitest";
import toolOneLineExtension from "../pi-simple/tool-one-line/index.ts";

type RenderThemeLike = {
	fg(color: string, value: string): string;
	bold(value: string): string;
};

type RenderComponentLike = {
	render(width: number): string[];
};

type RegisteredToolLike = {
	name: string;
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

function normalizeRenderedText(component: RenderComponentLike): string {
	return component
		.render(120)
		.map((line) => line.trimEnd())
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

function createRenderContext(args: Record<string, unknown>, expanded: boolean): Record<string, unknown> {
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
	};
}

describe("tool-one-line settled bash rendering", () => {
	beforeAll(() => {
		initTheme("dark");
	});

	it("shows the first lines in collapsed bash previews", () => {
		const { api, registeredTools } = createExtensionApiStub();
		toolOneLineExtension(api);

		const bashTool = registeredTools.find((tool) => tool.name === "bash");
		const output = Array.from({ length: 20 }, (_, index) => (
			`${String(index + 1).padStart(2, "0")}: short-preview-test ${"x".repeat(24)}`
		)).join("\n");
		const rendered = renderBashResult(bashTool, output);

		expect(rendered).toContain("01: short-preview-test");
		expect(rendered).toContain("10: short-preview-test");
		expect(rendered).not.toContain("20: short-preview-test");
		expect(rendered).toContain("... 10 more lines");
	});

	it("shows short settled bash output directly when it fits", () => {
		const { api, registeredTools } = createExtensionApiStub();
		toolOneLineExtension(api);

		const bashTool = registeredTools.find((tool) => tool.name === "bash");
		const rendered = renderBashResult(bashTool, "01: alpha\n02: beta\n03: gamma");

		expect(rendered).toContain("01: alpha");
		expect(rendered).toContain("03: gamma");
		expect(rendered).not.toContain("more lines");
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
