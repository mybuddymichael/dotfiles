--- === ThemeManager ===
---
--- Synchronize theme-dependent settings with macOS appearance.

local ThemeManager = {}
ThemeManager.__index = ThemeManager

ThemeManager.name = "ThemeManager"
ThemeManager.version = "0.1"
ThemeManager.author = "Michael Hanson"
ThemeManager.license = "MIT - https://opensource.org/licenses/MIT"

ThemeManager.logger = hs.logger.new(ThemeManager.name)

ThemeManager.piSettingsPath = os.getenv("HOME") and (os.getenv("HOME") .. "/.pi/agent/settings.json") or nil
ThemeManager.lightTheme = "rose-pine-dawn"
ThemeManager.darkTheme = "rose-pine-moon"
ThemeManager.reloadSketchybarOnAppearanceChange = true
ThemeManager.sketchybarPath = "/opt/homebrew/bin/sketchybar"
ThemeManager.notifyOnError = true

ThemeManager.appearanceWatcher = nil

local function fileExists(path)
	return path and hs.fs.attributes(path) ~= nil
end

local function readFile(path)
	local file, err = io.open(path, "r")
	if not file then
		return nil, err
	end

	local contents = file:read("*a")
	file:close()
	return contents
end

local function writeFile(path, contents)
	local file, err = io.open(path, "w")
	if not file then
		return false, err
	end

	file:write(contents)
	file:close()
	return true
end

function ThemeManager:_currentAppearance()
	if hs.host.interfaceStyle() == "Dark" then
		return "dark"
	end
	return "light"
end

function ThemeManager:_themeForAppearance(appearance)
	if appearance == "dark" then
		return self.darkTheme
	end
	return self.lightTheme
end

function ThemeManager:_showError(message)
	self.logger.ef("%s", message)
	if self.notifyOnError then
		hs.alert.show(message)
	end
end

function ThemeManager:_replaceThemeSetting(contents, theme)
	local updated, count = contents:gsub('("theme"%s*:%s*")[^"]*(")', function(prefix, suffix)
		return prefix .. theme .. suffix
	end, 1)
	return updated, count > 0
end

function ThemeManager:_syncPiTheme(appearance)
	local path = self.piSettingsPath
	if not path or path == "" then
		return false, "ThemeManager.piSettingsPath is not configured"
	end

	if not fileExists(path) then
		return false, "pi settings file not found: " .. path
	end

	local desiredTheme = self:_themeForAppearance(appearance)
	local contents, readErr = readFile(path)
	if not contents then
		return false, string.format("failed reading %s: %s", path, tostring(readErr))
	end

	local currentTheme = contents:match('"theme"%s*:%s*"([^"]*)"')
	if currentTheme == desiredTheme then
		self.logger.df("pi theme already %s for %s appearance", desiredTheme, appearance)
		return true
	end

	local updated, replaced = self:_replaceThemeSetting(contents, desiredTheme)
	if replaced then
		local ok, writeErr = writeFile(path, updated)
		if not ok then
			return false, string.format("failed writing %s: %s", path, tostring(writeErr))
		end

		self.logger.i(string.format("updated pi theme to %s (%s appearance)", desiredTheme, appearance))
		return true
	end

	local data = hs.json.read(path)
	if type(data) ~= "table" then
		return false, "theme key was not found and JSON parsing failed for: " .. path
	end

	data.theme = desiredTheme
	local ok = hs.json.write(data, path, true, true)
	if not ok then
		return false, "failed rewriting JSON file: " .. path
	end

	self.logger.w(string.format("theme key missing in %s; rewrote file via hs.json", path))
	return true
end

function ThemeManager:_reloadSketchybar()
	if not self.reloadSketchybarOnAppearanceChange then
		return true
	end

	if not fileExists(self.sketchybarPath) then
		self.logger.w(string.format("sketchybar binary not found at %s", self.sketchybarPath))
		return false
	end

	local task = hs.task.new(self.sketchybarPath, nil, nil, { "--reload" })
	if not task then
		self.logger.w("failed to create sketchybar reload task")
		return false
	end

	task:start()
	return true
end

function ThemeManager:syncAppearance(opts)
	opts = opts or {}

	local appearance = self:_currentAppearance()
	local ok, err = self:_syncPiTheme(appearance)
	if not ok then
		self:_showError("ThemeManager: " .. err)
	end

	if opts.reloadSketchybar then
		self:_reloadSketchybar()
	end

	return self
end

function ThemeManager:start()
	self:stop()
	self:syncAppearance({ reloadSketchybar = false })

	self.appearanceWatcher = hs.distributednotifications.new(function(name, _, _)
		if name == "AppleInterfaceThemeChangedNotification" then
			self:syncAppearance({ reloadSketchybar = true })
		end
	end, "AppleInterfaceThemeChangedNotification")

	self.appearanceWatcher:start()
	return self
end

function ThemeManager:stop()
	if self.appearanceWatcher then
		self.appearanceWatcher:stop()
		self.appearanceWatcher = nil
	end

	return self
end

return ThemeManager
