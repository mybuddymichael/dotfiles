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

type FooterState = {
  path: string;
  profile: PiProfile;
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

function formatProfile(profile: PiProfile): string {
  return profile === "work" ? "WORK" : "personal";
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
      const line = `${profile}${theme.fg("dim", `  ${state.path}  ${state.model}  ${state.thinking}  `)}${fastMode}${theme.fg(
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
