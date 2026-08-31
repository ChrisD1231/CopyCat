Set WshShell = CreateObject("WScript.Shell")
strDesktop = WshShell.SpecialFolders("Desktop")
Set oShortcut = WshShell.CreateShortcut(strDesktop & "\Copycat.lnk")
oShortcut.TargetPath = "c:\Users\Crips\OneDrive\Desktop\Copycat\launch.bat"
oShortcut.WorkingDirectory = "c:\Users\Crips\OneDrive\Desktop\Copycat"
oShortcut.IconLocation = "c:\Users\Crips\OneDrive\Desktop\Copycat\assets\icon.ico, 0"
oShortcut.Description = "Copycat - Local-First AI Clipboard Manager"
oShortcut.Save
