# ThemeManager

Synchronize theme-dependent settings with the current macOS appearance.

## Current behavior

- Updates pi settings files:
  - `~/.pi/agent/settings.json`
  - `~/.pi-work/agent/settings.json`
  - light mode -> `rose-pine-dawn`
  - dark mode -> `rose-pine-moon`
- Reloads Sketchybar when macOS appearance changes

## Usage

Add this to `~/.hammerspoon/init.lua`:

```lua
ThemeManager = hs.loadSpoon("ThemeManager")
ThemeManager:start()
```

## Configuration

Optional settings before `:start()`:

```lua
ThemeManager.piSettingsPath = os.getenv("HOME") .. "/.pi/agent/settings.json"
ThemeManager.piWorkSettingsPath = os.getenv("HOME") .. "/.pi-work/agent/settings.json"
ThemeManager.lightTheme = "rose-pine-dawn"
ThemeManager.darkTheme = "rose-pine-moon"
ThemeManager.reloadSketchybarOnAppearanceChange = true
ThemeManager.sketchybarPath = "/opt/homebrew/bin/sketchybar"
```
