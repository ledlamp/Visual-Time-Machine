Dim WinScriptHost
Set WinScriptHost = CreateObject("WScript.Shell")
WinScriptHost.Run Chr(34) & "node" & Chr(34) & "vtm.js", 0
Set WinScriptHost = Nothing