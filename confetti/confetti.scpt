tell application "System Events"
    set frontApp to name of first application process whose frontmost is true
end tell

if frontApp is not "Ghostty" then
    do shell script "open \"raycast://extensions/raycast/raycast/confetti\""
    delay 0.02

    -- Map process names to application names
    set appName to frontApp
    if frontApp is "MSTeams" then
        set appName to "Microsoft Teams"
    end if

    tell application appName
        activate
    end tell
end if
