import type {
  ExtensionAPI,
  ExtensionContext,
} from "@mariozechner/pi-coding-agent";

type FastModeState = {
  enabled: boolean;
  lastModel?: string;
  lastServiceTier?: string;
  lastAppliedAt?: number;
  lastSkippedReason?: string;
};

const FAST_MODE_STATE_KEY = "__piOpenAICodexFastModeState";

function getFastModeState(): FastModeState {
  const globalWithState = globalThis as typeof globalThis & {
    [FAST_MODE_STATE_KEY]?: FastModeState;
  };
  globalWithState[FAST_MODE_STATE_KEY] ??= { enabled: false };
  return globalWithState[FAST_MODE_STATE_KEY];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function publishFastMode(ctx: ExtensionContext, state: FastModeState) {
  if (ctx.hasUI) {
    ctx.ui.setStatus("openai-codex-fast", state.enabled ? "fast" : undefined);
  }
}

function formatFastStatus(state: FastModeState): string {
  const mode = `Fast mode is ${state.enabled ? "on" : "off"}.`;
  if (!state.enabled) return mode;

  if (state.lastAppliedAt) {
    const ageSeconds = Math.max(0, Math.round((Date.now() - state.lastAppliedAt) / 1000));
    return `${mode} Last applied ${ageSeconds}s ago to ${state.lastModel} with service_tier=${state.lastServiceTier}.`;
  }

  if (state.lastSkippedReason) {
    return `${mode} Not applied yet: ${state.lastSkippedReason}.`;
  }

  return `${mode} Not applied yet; send a message with gpt-5.5 selected.`;
}

function notify(ctx: ExtensionContext, message: string) {
  if (ctx.hasUI) {
    ctx.ui.notify(message, "info");
  }
}

export default function (pi: ExtensionAPI) {
  const state = getFastModeState();

  pi.registerCommand("fast", {
    description: "Toggle OpenAI Codex priority service tier for gpt-5.5",
    handler: async (args, ctx) => {
      const value = args.trim().toLowerCase();
      if (value === "") {
        state.enabled = !state.enabled;
        publishFastMode(ctx, state);
        notify(ctx, `Fast mode is ${state.enabled ? "on" : "off"}.`);
        return;
      }

      if (value === "status") {
        publishFastMode(ctx, state);
        notify(ctx, formatFastStatus(state));
        return;
      }

      if (["on", "true", "1", "yes"].includes(value)) {
        state.enabled = true;
        publishFastMode(ctx, state);
        notify(ctx, "Fast mode is on for openai-codex/gpt-5.5.");
        return;
      }

      if (["off", "false", "0", "no"].includes(value)) {
        state.enabled = false;
        publishFastMode(ctx, state);
        notify(ctx, "Fast mode is off.");
        return;
      }

      notify(ctx, "Usage: /fast on, /fast off, or /fast status");
    },
  });

  pi.on("session_start", async (_event, ctx) => {
    publishFastMode(ctx, state);
  });

  pi.on("before_provider_request", async (event) => {
    if (!state.enabled) return;

    if (!isRecord(event.payload)) {
      state.lastSkippedReason = "provider payload was not an object";
      return;
    }

    const model = typeof event.payload.model === "string" ? event.payload.model : undefined;
    state.lastModel = model;

    if (model !== "gpt-5.5") {
      state.lastSkippedReason = model == null
        ? "provider payload did not include a model"
        : `selected model was ${model}, not gpt-5.5`;
      return;
    }

    state.lastServiceTier = "priority";
    state.lastAppliedAt = Date.now();
    state.lastSkippedReason = undefined;

    return {
      ...event.payload,
      service_tier: "priority",
    };
  });
}
