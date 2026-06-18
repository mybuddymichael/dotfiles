#!/usr/bin/env node
import { existsSync, readdirSync, readFileSync, realpathSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join, resolve, isAbsolute, basename } from "node:path";
import { pathToFileURL } from "node:url";

const SELF_DIR = realpathSync(resolve(dirname(new URL(import.meta.url).pathname), ".."));
const TOOL_CALL_ID = "pi-ui-render-tool-call";

function die(message, code = 1) {
  console.error(`pi-ui-render: ${message}`);
  process.exit(code);
}

function parseArgs(argv) {
  const args = { metadata: false, extensionsDir: process.env.PI_UI_RENDER_EXTENSIONS_DIR };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--metadata" || arg === "--verbose") args.metadata = true;
    else if (arg === "--extensions-dir") args.extensionsDir = argv[++i];
    else if (arg === "--help" || arg === "-h") args.help = true;
    else if (!args.fixturePath) args.fixturePath = arg;
    else die(`unexpected argument: ${arg}`);
  }
  return args;
}

function usage() {
  return `Usage: pi-ui-render <fixture.json> [--extensions-dir DIR] [--metadata]\n\nRenders Pi UI surfaces as ANSI terminal text. Supports tool, message, and footer rendering.\n\nDefault extensions dir: ~/.pi/agent/extensions\nEnv override: PI_UI_RENDER_EXTENSIONS_DIR\n`;
}

async function importFromCandidates(specifier, candidates) {
  try { return await import(specifier); } catch {}
  for (const candidate of candidates) {
    if (existsSync(candidate)) return await import(pathToFileURL(candidate).href);
  }
  throw new Error(`Unable to import ${specifier}. Tried:\n${candidates.join("\n")}`);
}

function piPackageCandidates() {
  const candidates = [
    join(homedir(), ".local/share/mise/installs/npm-earendil-works-pi-coding-agent/0.79.6/lib/node_modules/@earendil-works/pi-coding-agent/dist/index.js"),
    join(homedir(), ".bun/install/global/node_modules/@earendil-works/pi-coding-agent/dist/index.js"),
    join(homedir(), ".bun/install/global/node_modules/@mariozechner/pi-coding-agent/dist/index.js"),
  ];
  if (process.argv[1]?.includes("/node_modules/")) candidates.unshift(join(dirname(process.argv[1]), "index.js"));
  return candidates;
}

function piDistDir() {
  for (const candidate of piPackageCandidates()) {
    if (existsSync(candidate)) return dirname(candidate);
  }
  return undefined;
}

async function importPi() {
  return importFromCandidates("@earendil-works/pi-coding-agent", piPackageCandidates());
}

async function importLegacyPi(extensionsDir) {
  const candidates = [];
  if (extensionsDir) candidates.push(join(resolve(extensionsDir), "node_modules/@mariozechner/pi-coding-agent/dist/index.js"));
  candidates.push(join(homedir(), ".pi/agent/extensions/node_modules/@mariozechner/pi-coding-agent/dist/index.js"));
  try { return await importFromCandidates("@mariozechner/pi-coding-agent", candidates); }
  catch { return undefined; }
}

async function importToolsModule() {
  const dist = piDistDir();
  const candidates = [];
  if (dist) candidates.push(join(dist, "core/tools/index.js"));
  return importFromCandidates("@earendil-works/pi-coding-agent/dist/core/tools/index.js", candidates);
}

async function importExtensionLoaderModule() {
  const dist = piDistDir();
  const candidates = [];
  if (dist) candidates.push(join(dist, "core/extensions/loader.js"));
  return importFromCandidates("@earendil-works/pi-coding-agent/dist/core/extensions/loader.js", candidates);
}

async function importThemeModule() {
  const dist = piDistDir();
  const candidates = [];
  if (dist) candidates.push(join(dist, "modes/interactive/theme/theme.js"));
  return importFromCandidates("@earendil-works/pi-coding-agent/dist/modes/interactive/theme/theme.js", candidates);
}

function readJson(path) {
  try { return JSON.parse(readFileSync(path, "utf8")); }
  catch (error) { die(`failed to read JSON ${path}: ${error.message}`); }
}

function assertObject(value, name) {
  if (!value || typeof value !== "object" || Array.isArray(value)) die(`${name} must be an object`);
}

function validateFixture(fixture) {
  assertObject(fixture, "fixture");
  if (!["tool", "message", "footer"].includes(fixture.surface)) die(`fixture.surface must be "tool", "message", or "footer"`);
  if (fixture.width !== undefined && (!Number.isInteger(fixture.width) || fixture.width < 1)) die(`fixture.width must be a positive integer`);
  if (fixture.cwd !== undefined && typeof fixture.cwd !== "string") die(`fixture.cwd must be a string`);
  if (fixture.theme !== undefined && typeof fixture.theme !== "string") die(`fixture.theme must be a string`);
  const expanded = fixture.expanded ?? false;
  if (![true, false, "both"].includes(expanded)) die(`fixture.expanded must be true, false, or "both"`);

  if (fixture.surface === "footer") {
    if (fixture.statuses !== undefined && (typeof fixture.statuses !== "object" || fixture.statuses === null || Array.isArray(fixture.statuses))) die(`fixture.statuses must be an object`);
    if (fixture.gitBranch !== undefined && typeof fixture.gitBranch !== "string" && fixture.gitBranch !== null) die(`fixture.gitBranch must be a string or null`);
    if (fixture.thinkingLevel !== undefined && typeof fixture.thinkingLevel !== "string") die(`fixture.thinkingLevel must be a string`);
    if (fixture.contextUsage !== undefined) assertObject(fixture.contextUsage, "fixture.contextUsage");
    if (fixture.model !== undefined) assertObject(fixture.model, "fixture.model");
    return { mode: undefined, expanded, slot: undefined };
  }

  if (fixture.surface === "tool") {
    if (typeof fixture.tool !== "string" || fixture.tool.length === 0) die(`fixture.tool must be a non-empty string`);
    const mode = fixture.mode ?? "fixture";
    if (mode !== "fixture" && mode !== "execute") die(`fixture.mode must be "fixture" or "execute"`);
    if (fixture.args !== undefined) assertObject(fixture.args, "fixture.args");
    if (mode === "execute" && fixture.args === undefined) die(`execute mode requires fixture.args`);
    if (mode === "fixture" && fixture.result === undefined) die(`fixture mode requires fixture.result`);
    if (fixture.result !== undefined) assertObject(fixture.result, "fixture.result");
    const slot = fixture.slot ?? "both";
    if (!["call", "result", "both"].includes(slot)) die(`fixture.slot must be "call", "result", or "both"`);
    return { mode, expanded, slot };
  }

  if (fixture.role !== undefined && !["assistant", "user"].includes(fixture.role)) die(`fixture.role must be "assistant" or "user"`);
  if (fixture.customType !== undefined && (typeof fixture.customType !== "string" || fixture.customType.length === 0)) die(`fixture.customType must be a non-empty string`);
  if (!fixture.role && !fixture.customType) die(`message fixture requires role or customType`);
  if (fixture.role && fixture.customType) die(`message fixture must not specify both role and customType`);
  if (typeof fixture.content !== "string" && !Array.isArray(fixture.content)) die(`message fixture.content must be a string or content array`);
  if (fixture.details !== undefined && (typeof fixture.details !== "object" || fixture.details === null || Array.isArray(fixture.details))) die(`message fixture.details must be an object`);
  return { mode: undefined, expanded, slot: undefined };
}

function extensionPaths(extensionsDir) {
  const dir = resolve(extensionsDir ?? join(homedir(), ".pi/agent/extensions"));
  if (!existsSync(dir)) return { dir, paths: [] };
  const paths = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith(".")) continue;
    if (entry.name === "node_modules") continue;
    const full = join(dir, entry.name);
    let real;
    try { real = realpathSync(full); } catch { real = full; }
    if (real === SELF_DIR) continue;
    if (entry.isFile() && entry.name.endsWith(".ts") && !entry.name.endsWith(".d.ts") && !entry.name.endsWith(".disabled")) paths.push(full);
    const indexTs = join(full, "index.ts");
    if (existsSync(indexTs)) paths.push(indexTs);
  }
  paths.sort((a, b) => basename(a).localeCompare(basename(b)) || a.localeCompare(b));
  return { dir, paths };
}

function readCurrentSettings() {
  const settingsPaths = [join(homedir(), ".pi/agent/settings.json")];
  for (const p of settingsPaths) {
    if (!existsSync(p)) continue;
    try { return JSON.parse(readFileSync(p, "utf8")); } catch {}
  }
  return {};
}

function readCurrentThemeName() {
  const data = readCurrentSettings();
  return typeof data.theme === "string" && data.theme ? data.theme : undefined;
}

function makeRenderContext({ args, cwd, expanded, isPartial, isError, showImages }) {
  return {
    args,
    toolCallId: TOOL_CALL_ID,
    invalidate: () => {},
    lastComponent: undefined,
    state: {},
    cwd,
    executionStarted: true,
    argsComplete: true,
    isPartial,
    expanded,
    showImages,
    isError,
  };
}

function resultText(result) {
  const content = result?.content;
  if (!Array.isArray(content)) return "";
  return content.map((part) => part?.type === "text" ? part.text ?? "" : `[${part?.type ?? "unknown"}]`).join("\n");
}

function fallbackCall(tool, theme, Text) {
  return new Text(theme.fg("toolTitle", theme.bold(tool.label || tool.name)), 0, 0);
}

function fallbackResult(result, _theme, Text) {
  return new Text(resultText(result), 0, 0);
}

function renderComponent(component, width) {
  if (!component || typeof component.render !== "function") throw new Error("renderer did not return a Component");
  const lines = component.render(width);
  if (!Array.isArray(lines) || !lines.every((line) => typeof line === "string")) throw new Error("component.render(width) must return string[]");
  return lines.join("\n");
}

function mergeTool(base, override) {
  if (!base) return override;
  return {
    ...base,
    ...override,
    renderCall: override.renderCall ?? base.renderCall,
    renderResult: override.renderResult ?? base.renderResult,
    renderShell: override.renderShell ?? base.renderShell,
  };
}

async function loadSurfaces({ cwd, extensionsDir, metadata, theme, uiState }) {
  const pi = await importPi();
  const toolsModule = await importToolsModule();
  const loaderModule = await importExtensionLoaderModule();
  const byName = new Map();
  const messageRenderers = new Map();
  const toolSources = new Map();
  const messageRendererSources = new Map();
  const builtins = toolsModule.createAllToolDefinitions
    ? Object.values(toolsModule.createAllToolDefinitions(cwd))
    : toolsModule.createCodingToolDefinitions(cwd);
  for (const tool of builtins) {
    byName.set(tool.name, tool);
    toolSources.set(tool.name, "builtin");
  }

  const { dir, paths } = extensionPaths(extensionsDir);
  const eventBus = pi.createEventBus?.();
  const oldArgv1 = process.argv[1];
  const piCliPath = piDistDir() ? join(piDistDir(), "cli.js") : undefined;
  if (piCliPath && existsSync(piCliPath)) process.argv[1] = piCliPath;
  let loaded;
  try {
    loaded = await loaderModule.loadExtensions(paths, cwd, eventBus);
  } finally {
    process.argv[1] = oldArgv1;
  }
  Object.assign(loaded.runtime, {
    sendMessage: () => {}, sendUserMessage: () => {}, appendEntry: () => {}, setSessionName: () => {},
    getSessionName: () => undefined, setLabel: () => {}, getActiveTools: () => [...byName.keys()],
    getAllTools: () => [...byName.values()].map((tool) => ({ name: tool.name, description: tool.description, parameters: tool.parameters, promptGuidelines: tool.promptGuidelines, sourceInfo: {} })),
    setActiveTools: () => {}, refreshTools: () => {}, getCommands: () => [], setModel: async () => false,
    getThinkingLevel: () => uiState.thinkingLevel ?? "off", setThinkingLevel: () => {},
  });
  const sessionStartCtx = makeCtx(cwd, theme, uiState);
  sessionStartCtx.mode = "tui";
  sessionStartCtx.hasUI = true;
  for (const extension of loaded.extensions ?? []) {
    const handlers = extension.handlers?.get?.("session_start") ?? [];
    for (const handler of handlers) {
      try {
        await handler({ type: "session_start", reason: "startup" }, sessionStartCtx);
      } catch (error) {
        console.error(`warning: session_start failed for ${extension.path}: ${error?.message ?? String(error)}`);
      }
    }
  }
  if (loaded.errors?.length) {
    for (const error of loaded.errors) console.error(`warning: failed to load extension ${error.path}: ${error.error}`);
  }

  for (const extension of loaded.extensions ?? []) {
    for (const registered of extension.tools.values()) {
      const tool = registered.definition;
      const source = toolSources.get(tool.name);
      if (source === "extension") {
        if (metadata) console.error(`duplicateExtensionToolIgnored=${tool.name} from ${extension.path}`);
        continue;
      }
      byName.set(tool.name, mergeTool(byName.get(tool.name), tool));
      toolSources.set(tool.name, "extension");
    }
    for (const [customType, renderer] of extension.messageRenderers.entries()) {
      if (messageRenderers.has(customType)) {
        if (metadata) console.error(`duplicateMessageRendererIgnored=${customType} from ${extension.path}`);
        continue;
      }
      messageRenderers.set(customType, renderer);
      messageRendererSources.set(customType, extension.path);
    }
  }

  if (metadata) {
    console.error(`extensionsDir=${dir}`);
    for (const p of paths) console.error(`loadedExtensionCandidate=${p}`);
    console.error(`loadedExtensions=${(loaded.extensions ?? []).length}`);
    console.error(`tools=${[...byName.keys()].sort().join(",")}`);
    console.error(`messageRenderers=${[...messageRenderers.keys()].sort().join(",")}`);
  }
  return { tools: byName, messageRenderers };
}

function makeCtx(cwd, theme, uiState = createUiState()) {
  return {
    cwd,
    mode: "print",
    hasUI: false,
    ui: {
      theme,
      notify: (message, level = "info") => console.error(`notification(${level}): ${message}`),
      setStatus: (key, value) => {
        if (value === undefined) uiState.statuses.delete(key);
        else uiState.statuses.set(key, value);
      }, setWidget: () => {}, setTitle: () => {}, setEditorText: () => {},
      getEditorText: () => "", pasteToEditor: () => {}, getToolsExpanded: () => false, setToolsExpanded: () => {},
      setEditorComponent: () => {}, getEditorComponent: () => undefined, addAutocompleteProvider: () => {},
      setFooter: (factory) => { uiState.footerFactory = factory; }, setWorkingMessage: () => {}, setWorkingVisible: () => {}, setWorkingIndicator: () => {},
      getAllThemes: () => [], getTheme: () => undefined, setTheme: () => ({ success: false, error: "theme switching is unavailable in pi-ui-render" }),
    },
    sessionManager: { getEntries: () => [], getBranch: () => [], getLeafId: () => null, getSessionFile: () => undefined },
    modelRegistry: undefined,
    model: uiState.model,
    signal: undefined,
    isIdle: () => true,
    abort: () => {},
    hasPendingMessages: () => false,
    shutdown: () => {},
    getContextUsage: () => uiState.contextUsage,
    compact: () => {},
    getSystemPrompt: () => "",
    isProjectTrusted: () => false,
  };
}

function createUiState(fixture = {}) {
  return {
    statuses: new Map(Object.entries(fixture.statuses ?? {}).filter(([, value]) => typeof value === "string")),
    footerFactory: undefined,
    gitBranch: fixture.gitBranch ?? null,
    thinkingLevel: fixture.thinkingLevel ?? "off",
    contextUsage: fixture.contextUsage,
    model: fixture.model,
  };
}

function renderFooter(uiState, theme, width) {
  const footerData = {
    getGitBranch: () => uiState.gitBranch,
    getExtensionStatuses: () => uiState.statuses,
    onBranchChange: () => () => {},
  };
  const tui = { requestRender: () => {} };
  if (uiState.footerFactory) {
    const component = uiState.footerFactory(tui, theme, footerData);
    return renderComponent(component, width);
  }
  const line = [...uiState.statuses.values()].filter(Boolean).join("  ");
  return line ? renderComponent({ render: () => [line], invalidate: () => {} }, width) : "";
}

async function executeTool(tool, args, cwd, theme) {
  const params = typeof tool.prepareArguments === "function" ? tool.prepareArguments(args) : args;
  const updates = [];
  const result = await tool.execute(TOOL_CALL_ID, params, undefined, (update) => updates.push(update), makeCtx(cwd, theme));
  return { result, params, updates };
}

async function main() {
  const argv = parseArgs(process.argv.slice(2));
  if (argv.help || !argv.fixturePath) {
    process.stdout.write(usage());
    process.exit(argv.help ? 0 : 1);
  }
  const fixturePath = resolve(argv.fixturePath);
  const fixture = readJson(fixturePath);
  const { mode, expanded, slot } = validateFixture(fixture);
  const cwd = resolve(fixture.cwd ? (isAbsolute(fixture.cwd) ? fixture.cwd : resolve(dirname(fixturePath), fixture.cwd)) : process.cwd());
  const width = fixture.width ?? 100;

  const themeModule = await importThemeModule();
  const pi = await importPi();
  const legacyPi = await importLegacyPi(argv.extensionsDir);
  const { Text } = await importFromCandidates("@earendil-works/pi-tui", [
    piDistDir() ? join(dirname(piDistDir()), "node_modules/@earendil-works/pi-tui/dist/index.js") : "",
    piDistDir() ? join(dirname(dirname(piDistDir())), "pi-tui/dist/index.js") : "",
  ].filter(Boolean));

  const themeName = fixture.theme ?? readCurrentThemeName();
  try { themeModule.initTheme(themeName, false); } catch (error) { die(`failed to initialize theme ${themeName ?? "<default>"}: ${error.message}`); }
  const theme = themeModule.theme;

  const uiState = createUiState(fixture);
  const surfaces = await loadSurfaces({ cwd, extensionsDir: argv.extensionsDir, metadata: argv.metadata, theme, uiState });
  for (const [key, value] of Object.entries(fixture.statuses ?? {})) {
    if (typeof value === "string") uiState.statuses.set(key, value);
  }

  const renderTool = (expandedValue) => {
    const tool = surfaces.tools.get(fixture.tool);
    if (!tool) die(`tool not found: ${fixture.tool}`);
    const chunks = [];
    const isPartial = fixture.isPartial ?? false;
    const isError = renderTool.result?.isError ?? false;
    if (slot === "call" || slot === "both") {
      const context = makeRenderContext({ args: renderTool.args, cwd, expanded: expandedValue, isPartial, isError, showImages: fixture.showImages ?? false });
      const component = tool.renderCall ? tool.renderCall(renderTool.args, theme, context) : fallbackCall(tool, theme, Text);
      chunks.push(renderComponent(component, width));
    }
    if (slot === "result" || slot === "both") {
      if (!renderTool.result) throw new Error(`slot ${slot} requires a result; use mode "execute" or provide fixture.result`);
      const context = makeRenderContext({ args: renderTool.args, cwd, expanded: expandedValue, isPartial, isError, showImages: fixture.showImages ?? false });
      const options = { expanded: expandedValue, isPartial };
      const component = tool.renderResult ? tool.renderResult(renderTool.result, options, theme, context) : fallbackResult(renderTool.result, theme, Text);
      chunks.push(renderComponent(component, width));
    }
    return chunks.filter(Boolean).join("\n");
  };

  const renderMessage = (expandedValue) => {
    const messagePi = legacyPi?.AssistantMessageComponent?.prototype?.__assistantIndentPatched ? legacyPi : pi;
    const markdownTheme = messagePi.getMarkdownTheme();
    if (fixture.customType) {
      const message = {
        role: "custom",
        customType: fixture.customType,
        content: fixture.content,
        display: fixture.display ?? true,
        details: fixture.details,
        timestamp: fixture.timestamp ?? Date.now(),
      };
      const component = new messagePi.CustomMessageComponent(message, surfaces.messageRenderers.get(fixture.customType), markdownTheme);
      component.setExpanded?.(expandedValue);
      return renderComponent(component, width);
    }
    if (fixture.role === "user") {
      const text = typeof fixture.content === "string"
        ? fixture.content
        : fixture.content.filter((part) => part?.type === "text").map((part) => part.text ?? "").join("\n");
      return renderComponent(new messagePi.UserMessageComponent(text, markdownTheme), width);
    }
    const content = typeof fixture.content === "string" ? [{ type: "text", text: fixture.content }] : fixture.content;
    const message = {
      role: "assistant",
      content,
      stopReason: fixture.stopReason,
      errorMessage: fixture.errorMessage,
      usage: fixture.usage,
      timestamp: fixture.timestamp ?? Date.now(),
    };
    const settings = readCurrentSettings();
    const hideThinking = fixture.hideThinkingBlock ?? Boolean(settings.hideThinkingBlock);
    return renderComponent(new messagePi.AssistantMessageComponent(message, hideThinking, markdownTheme), width);
  };

  let renderOne;
  if (fixture.surface === "footer") {
    renderOne = () => renderFooter(uiState, theme, width);
  } else if (fixture.surface === "tool") {
    const tool = surfaces.tools.get(fixture.tool);
    if (!tool) die(`tool not found: ${fixture.tool}`);
    renderTool.args = fixture.args ?? fixture.call?.args ?? {};
    renderTool.result = fixture.result;
    if (mode === "execute") {
      const executed = await executeTool(tool, renderTool.args, cwd, theme);
      renderTool.args = executed.params;
      renderTool.result = executed.result;
      if (argv.metadata) console.error(`updates=${executed.updates.length}`);
    }
    renderOne = renderTool;
  } else {
    renderOne = renderMessage;
  }

  let output;
  if (expanded === "both") {
    output = [`--- collapsed ---`, renderOne(false), `--- expanded ---`, renderOne(true)].join("\n");
  } else {
    output = renderOne(expanded);
  }
  if (argv.metadata) {
    const subject = fixture.surface === "tool" ? `tool=${fixture.tool} mode=${mode} slot=${slot}` : fixture.surface === "footer" ? `footer statuses=${[...uiState.statuses.keys()].join(",")}` : `message=${fixture.customType ? `custom:${fixture.customType}` : fixture.role}`;
    console.error(`surface=${fixture.surface} ${subject} width=${width} expanded=${expanded} theme=${theme.name ?? themeName ?? "default"} cwd=${cwd}`);
  }
  process.stdout.write(output.endsWith("\n") ? output : `${output}\n`);
}

main().catch((error) => die(error?.stack || error?.message || String(error)));
