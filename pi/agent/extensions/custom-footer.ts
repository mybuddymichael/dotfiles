import type {
  ExtensionAPI,
  ExtensionContext,
} from "@mariozechner/pi-coding-agent";
import { truncateToWidth } from "@mariozechner/pi-tui";

type ContextColor = "dim" | "success" | "warning" | "error";

type ContextSnapshot = {
  used: string;
  total?: string;
  color: ContextColor;
};

type PiProfile = "work" | "personal";

type NonoSandboxState = "sandboxed" | "unsandboxed";

type FooterState = {
  path: string;
  profile: PiProfile;
  sandbox: NonoSandboxState;
  model: string;
  thinking: string;
  fastMode: string;
  context: ContextSnapshot;
};

type FastModeState = {
  enabled: boolean;
};

const FAST_MODE_STATE_KEY = "__piOpenAICodexFastModeState";

function readFastMode(): string {
  const globalWithState = globalThis as typeof globalThis & {
    [FAST_MODE_STATE_KEY]?: FastModeState;
  };
  return globalWithState[FAST_MODE_STATE_KEY]?.enabled ? "fast" : "";
}

function readFastModeStatus(footerData?: {
  getExtensionStatuses(): ReadonlyMap<string, string>;
}): string {
  return (
    footerData?.getExtensionStatuses().get("openai-codex-fast") ??
    readFastMode()
  );
}

function detectPiProfile(): PiProfile {
  const agentDir = process.env.PI_CODING_AGENT_DIR ?? "";
  return agentDir.includes(".pi-work") ? "work" : "personal";
}

function detectNonoSandbox(): NonoSandboxState {
  // nono injects NONO_CAP_FILE into sandboxed processes. Outside nono this is
  // unset, which makes it a cheap, synchronous status-line check.
  return process.env.NONO_CAP_FILE ? "sandboxed" : "unsandboxed";
}

function formatProfile(profile: PiProfile): string {
  return profile === "work" ? "work" : "personal";
}

function formatPath(path: string): string {
  const home = process.env.HOME;
  return home && path.startsWith(home) ? `~${path.slice(home.length)}` : path;
}

function formatTokens(tokens: number): string {
  if (tokens >= 1_000_000) return `${(tokens / 1_000_000).toFixed(1)}M`;
  if (tokens >= 1_000) return `${(tokens / 1_000).toFixed(1)}k`;
  return `${tokens}`;
}

function fgColorAsBg(
  theme: { getFgAnsi?: (color: any) => string },
  color: string,
  text: string,
): string {
  try {
    const ansi = theme.getFgAnsi?.(color) ?? "";
    if (!ansi) return text;
    return `${ansi.replace(/\[38;/g, "[48;")}${text}\x1b[49m`;
  } catch {
    return text;
  }
}

function bgColorAsFg(
  theme: { getBgAnsi?: (color: any) => string },
  color: string,
  text: string,
): string {
  try {
    const ansi = theme.getBgAnsi?.(color) ?? "";
    if (!ansi) return text;
    return `${ansi.replace(/\[48;/g, "[38;")}${text}\x1b[39m`;
  } catch {
    return text;
  }
}

function readContextUsage(ctx: ExtensionContext): ContextSnapshot {
  const usage = ctx.getContextUsage();
  if (!usage) return { used: "?", color: "dim" };

  const used = usage.tokens == null ? "?" : formatTokens(usage.tokens);
  const total = formatTokens(usage.contextWindow);
  let color: ContextColor = "success";
  if (usage.tokens != null && usage.tokens >= 100_000) {
    color = "error";
  } else if (usage.tokens != null && usage.tokens >= 75_000) {
    color = "warning";
  }

  return { used, total, color };
}

function updateFooterState(
  pi: ExtensionAPI,
  ctx: ExtensionContext,
  state: FooterState,
  options: { refreshContextUsage: boolean },
) {
  state.path = formatPath(ctx.cwd);
  state.profile = detectPiProfile();
  state.sandbox = detectNonoSandbox();
  state.model = ctx.model?.id ?? "no-model";
  state.thinking = pi.getThinkingLevel();
  state.fastMode = readFastMode();

  if (options.refreshContextUsage) {
    state.context = readContextUsage(ctx);
  }
}

function installFooter(ctx: ExtensionContext, state: FooterState) {
  if (!ctx.hasUI) return;

  ctx.ui.setFooter((_tui, theme, footerData) => ({
    invalidate() {},
    render(width: number): string[] {
      // Keep render cheap: only format the cached snapshot. In particular, do
      // not call ctx.getContextUsage() here, because footer render can happen
      // frequently while the TUI is otherwise idle.
      const total =
        state.context.total == null
          ? ""
          : theme.fg("dim", `/${state.context.total}`);
      const currentFastMode = readFastModeStatus(footerData);
      const fastMode = currentFastMode
        ? `${theme.fg("success", currentFastMode)}${theme.fg("dim", "  ")}`
        : "";
      const profile = theme.fg(
        state.profile === "work" ? "warning" : "success",
        formatProfile(state.profile),
      );
      const sandbox =
        state.sandbox === "sandboxed"
          ? theme.fg("dim", "✓ nono")
          : fgColorAsBg(
              theme,
              "error",
              bgColorAsFg(theme, "selectedBg", " ✗ nono "),
            );
      const line = `${profile}${theme.fg("dim", "  ")}${sandbox}${theme.fg("dim", `  ${state.path}  ${state.model}  ${state.thinking}  `)}${fastMode}${theme.fg(
        state.context.color,
        state.context.used,
      )}${total}`;

      return [truncateToWidth(line, width)];
    },
    dispose: () => {},
  }));
}

export default function (pi: ExtensionAPI) {
  const state: FooterState = {
    path: "",
    profile: detectPiProfile(),
    sandbox: detectNonoSandbox(),
    model: "no-model",
    // Do not call action methods while the extension factory is running; the
    // extension runtime is not initialized yet. This is populated on
    // session_start / model_select / thinking_level_select.
    thinking: "?",
    fastMode: readFastMode(),
    context: { used: "?", color: "dim" },
  };
  let installed = false;

  function update(ctx: ExtensionContext, refreshContextUsage = false) {
    updateFooterState(pi, ctx, state, { refreshContextUsage });
    if (!installed && ctx.hasUI) {
      installFooter(ctx, state);
      installed = true;
    }
  }

  pi.on("session_start", async (_event, ctx) => update(ctx, true));
  pi.on("model_select", async (_event, ctx) => update(ctx, true));
  pi.on("thinking_level_select", async (event, ctx) => {
    state.thinking = event.level;
    update(ctx, false);
  });
  pi.on("message_end", async (_event, ctx) => update(ctx, true));
  pi.on("agent_end", async (_event, ctx) => update(ctx, true));
}
