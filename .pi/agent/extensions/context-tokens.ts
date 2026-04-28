import type {
  ExtensionAPI,
  ExtensionContext,
} from "@mariozechner/pi-coding-agent";
import { truncateToWidth } from "@mariozechner/pi-tui";

function formatPath(path: string): string {
  const home = process.env.HOME;
  return home && path.startsWith(home) ? `~${path.slice(home.length)}` : path;
}

function formatTokens(tokens: number): string {
  if (tokens >= 1_000_000) return `${(tokens / 1_000_000).toFixed(1)}M`;
  if (tokens >= 1_000) return `${(tokens / 1_000).toFixed(1)}k`;
  return `${tokens}`;
}

function formatContextUsage(ctx: ExtensionContext): {
  text: string;
  color: "dim" | "warning" | "error";
} {
  const usage = ctx.getContextUsage();
  if (!usage) return { text: "?", color: "dim" };

  const used = usage.tokens == null ? "?" : formatTokens(usage.tokens);
  const total = formatTokens(usage.contextWindow);
  const pct = usage.percent == null ? "?" : `${Math.round(usage.percent)}%`;
  let color: "dim" | "warning" | "error" = "dim";
  if (usage.tokens != null && usage.tokens >= 100_000) {
    color = "error";
  } else if (usage.tokens != null && usage.tokens >= 75_000) {
    color = "warning";
  }

  return { text: `${used}/${total} ${pct}`, color };
}

function installFooter(pi: ExtensionAPI, ctx: ExtensionContext) {
  if (!ctx.hasUI) return;

  ctx.ui.setFooter((_tui, theme) => ({
    invalidate() {},
    render(width: number): string[] {
      const path = formatPath(ctx.cwd);
      const context = formatContextUsage(ctx);
      const model = ctx.model?.id ?? "no-model";
      const thinking = pi.getThinkingLevel();
      const line = `${theme.fg("dim", `${path}  ${model}  ${thinking}  `)}${theme.fg(
        context.color,
        context.text,
      )}`;

      return [truncateToWidth(line, width)];
    },
    dispose: () => {},
  }));
}

export default function (pi: ExtensionAPI) {
  function update(ctx: ExtensionContext) {
    installFooter(pi, ctx);
  }

  pi.on("session_start", async (_event, ctx) => update(ctx));
  pi.on("model_select", async (_event, ctx) => update(ctx));
  pi.on("message_end", async (_event, ctx) => update(ctx));
  pi.on("turn_end", async (_event, ctx) => update(ctx));
  pi.on("agent_end", async (_event, ctx) => update(ctx));
}
