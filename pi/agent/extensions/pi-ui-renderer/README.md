# pi-ui-renderer

Standalone CLI for rendering Pi UI surfaces as ANSI terminal text, intended for agents editing Pi extensions.

## Usage

```bash
node .pi/agent/extensions/pi-ui-renderer/src/cli.mjs fixture.json
```

From this dotfiles repo before stowing:

```bash
node pi/agent/extensions/pi-ui-renderer/src/cli.mjs \
  pi/agent/extensions/pi-ui-renderer/fixtures/bash-execute.json \
  --extensions-dir pi/agent/extensions \
  --metadata
```

## Fixture shape

Tool fixture:

```json
{
  "surface": "tool",
  "tool": "bash",
  "mode": "execute",
  "cwd": ".",
  "width": 100,
  "expanded": "both",
  "args": { "command": "echo hello" }
}
```

Message fixture:

```json
{
  "surface": "message",
  "role": "assistant",
  "width": 100,
  "content": "Here is **markdown** with `code`."
}
```

Custom message fixture:

```json
{
  "surface": "message",
  "customType": "my-extension",
  "width": 100,
  "expanded": "both",
  "content": "Custom message text",
  "details": {}
}
```

- Tool `mode: "fixture"` renders a supplied `result` object.
- Tool `mode: "execute"` executes the selected tool with `args`, including mutating tools.
- Message rendering supports built-in user/assistant messages and extension `registerMessageRenderer` custom renderers.
- `expanded` defaults to `false`; use `true` or `"both"` to inspect expanded output.
- stdout is the ANSI render. Use `--metadata` for diagnostics on stderr.

The CLI loads Pi built-in tools plus global extensions from `~/.pi/agent/extensions` by default. Override with `--extensions-dir` or `PI_UI_RENDER_EXTENSIONS_DIR`.

## Validation

Run:

```bash
npm run validate
```

The validation checks that global extension patches are active, including the `pi-simple` assistant message chrome (`AGENT`, `┃`, and `╱╱╱`) and tool renderer styling.
