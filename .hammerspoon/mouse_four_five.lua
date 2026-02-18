local mouse_four_five = hs.eventtap.new({ hs.eventtap.event.types.otherMouseDown }, function(event)
	local button_number = event:getProperty(hs.eventtap.event.properties.mouseEventButtonNumber)

	if button_number == 3 then
		hs.eventtap.keyStroke({ "cmd" }, "[")
		return true
	elseif button_number == 4 then
		hs.eventtap.keyStroke({ "cmd" }, "]")
		return true
	else
		return false
	end
end)

mouse_four_five:start()
