import { pathToFileURL } from "node:url";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { existsSync } from "node:fs";

type Component = {
	render(width: number): string[];
	invalidate(): void;
};

type SkillBlock = {
	name: string;
	location: string;
	content: string;
	userMessage?: string;
};

type Theme = {
	bold(text: string): string;
	fg(color: string, text: string): string;
	bg(color: string, text: string): string;
};

type PatchedSkillComponent = {
	children?: Component[];
	skillBlock: SkillBlock;
	expanded: boolean;
	markdownTheme?: unknown;
	setBgFn?: (bgFn?: (text: string) => string) => void;
	clear(): void;
	addChild(component: Component): void;
};

const PATCH_FLAG = Symbol.for("michael.skillInvocationToolStyle.patch");
const NBSP = "\u00A0";

function piDistCandidates(): string[] {
	const candidates = [
		join(homedir(), ".bun/install/global/node_modules/@earendil-works/pi-coding-agent/dist"),
		join(homedir(), ".bun/install/global/node_modules/@mariozechner/pi-coding-agent/dist"),
	];

	const argvEntry = process.argv[1];
	if (argvEntry?.includes("/node_modules/")) {
		candidates.unshift(dirname(argvEntry));
	}

	return candidates;
}

async function importPiPackage(): Promise<any> {
	try {
		return await import("@earendil-works/pi-coding-agent");
	} catch {}

	for (const distDir of piDistCandidates()) {
		const candidate = join(distDir, "index.js");
		if (existsSync(candidate)) {
			return await import(pathToFileURL(candidate).href);
		}
	}

	return await import("@mariozechner/pi-coding-agent");
}

async function importPiThemeModule(): Promise<any> {
	for (const distDir of piDistCandidates()) {
		const candidate = join(distDir, "modes/interactive/theme/theme.js");
		if (existsSync(candidate)) {
			return await import(pathToFileURL(candidate).href);
		}
	}

	throw new Error("Unable to locate Pi theme module");
}

async function importTuiPackage(): Promise<any> {
	try {
		return await import("@earendil-works/pi-tui");
	} catch {}

	const candidates = [
		join(homedir(), ".bun/install/global/node_modules/@earendil-works/pi-tui/dist/index.js"),
		join(homedir(), ".bun/install/global/node_modules/@mariozechner/pi-tui/dist/index.js"),
	];

	for (const candidate of candidates) {
		if (existsSync(candidate)) {
			return await import(pathToFileURL(candidate).href);
		}
	}

	return await import("@mariozechner/pi-tui");
}

class IndentedComponent implements Component {
	constructor(
		private readonly child: Component,
		private readonly indent = "  ",
		private readonly deps: {
			truncateToWidth: (text: string, width: number, ellipsis?: string, preserveAnsi?: boolean) => string;
			visibleWidth: (text: string) => number;
		},
	) {}

	render(width: number): string[] {
		const safeWidth = Math.max(1, Math.floor(width));
		const indentWidth = this.deps.visibleWidth(this.indent);
		const childWidth = Math.max(1, safeWidth - indentWidth);
		return this.child.render(childWidth).map((line) => (
			this.deps.truncateToWidth(`${this.indent}${line}`, safeWidth, "", true)
		));
	}

	invalidate(): void {
		this.child.invalidate?.();
	}
}

class WrappedSkillStatus implements Component {
	constructor(
		private readonly deps: {
			truncateToWidth: (text: string, width: number, ellipsis?: string, preserveAnsi?: boolean) => string;
			visibleWidth: (text: string) => number;
			wrapTextWithAnsi: (text: string, width: number) => string[];
		},
		private marker: string,
		private label: string,
	) {}

	render(width: number): string[] {
		const { truncateToWidth, visibleWidth, wrapTextWithAnsi } = this.deps;
		const safeWidth = Math.max(1, Math.floor(width));
		const firstPrefix = `${this.marker} `;
		const continuationPrefix = " ".repeat(visibleWidth(firstPrefix));
		const firstWidth = Math.max(1, safeWidth - visibleWidth(firstPrefix));
		const continuationWidth = Math.max(1, safeWidth - visibleWidth(continuationPrefix));
		const firstPass = wrapTextWithAnsi(this.label, firstWidth);
		const first = firstPass[0] ?? "";
		const remainder = firstPass.slice(1).join(" ").trim();
		const continuation = remainder ? wrapTextWithAnsi(remainder, continuationWidth) : [];

		return [
			`${firstPrefix}${truncateToWidth(first, firstWidth, "", true)}`,
			...continuation.map((line) => (
				`${continuationPrefix}${truncateToWidth(line, continuationWidth, "", true)}`
			)),
		].map((line) => truncateToWidth(line, safeWidth, "", true));
	}

	invalidate(): void {}
}

function skillLabel(t: Theme, keyHint: (id: string, fallback: string) => string, skillBlock: SkillBlock, expanded: boolean): string {
	const hint = expanded
		? keyHint("app.tools.expand", "to collapse")
		: keyHint("app.tools.expand", "to expand");
	return [
		t.fg("toolTitle", t.bold("Skill")),
		t.fg("accent", skillBlock.name),
		t.fg("dim", `from${NBSP}${skillBlock.location}`),
		t.fg("muted", `(${hint})`),
	].join(NBSP);
}

async function patchSkillInvocationRenderer(): Promise<void> {
	const pi = await importPiPackage();
	const themeModule = await importPiThemeModule();
	const tui = await importTuiPackage();
	const {
		getMarkdownTheme,
		keyHint,
		SkillInvocationMessageComponent,
	} = pi;
	const { theme } = themeModule;
	const {
		Container,
		Markdown,
		Spacer,
		truncateToWidth,
		visibleWidth,
		wrapTextWithAnsi,
	} = tui;

	if (!SkillInvocationMessageComponent || !theme || !Container || !Markdown) {
		throw new Error("Unable to load Pi skill invocation rendering dependencies");
	}

	const proto = SkillInvocationMessageComponent.prototype as {
		[PATCH_FLAG]?: boolean;
		render(this: PatchedSkillComponent, width: number): string[];
		updateDisplay(this: PatchedSkillComponent): void;
	};

	if (proto[PATCH_FLAG]) return;
	proto[PATCH_FLAG] = true;

	proto.render = function render(this: PatchedSkillComponent, width: number): string[] {
		return (this.children ?? []).flatMap((child) => child.render(width));
	};

	proto.updateDisplay = function updateDisplay(this: PatchedSkillComponent): void {
		this.setBgFn?.(undefined);
		this.clear();

		const container = new Container();
		container.addChild(
			new WrappedSkillStatus(
				{ truncateToWidth, visibleWidth, wrapTextWithAnsi },
				theme.fg("success", "✓"),
				skillLabel(theme, keyHint, this.skillBlock, this.expanded),
			),
		);

		if (this.expanded) {
			container.addChild(new Spacer(1));
			const markdown = new Markdown(this.skillBlock.content, 0, 0, this.markdownTheme ?? getMarkdownTheme(), {
				color: (text: string) => theme.fg("toolOutput", text),
			});
			container.addChild(
				new IndentedComponent(markdown, "  ", { truncateToWidth, visibleWidth }),
			);
		}

		this.addChild(container);
	};
}

export default async function skillInvocationToolStyle(_pi: unknown): Promise<void> {
	await patchSkillInvocationRenderer();
}
