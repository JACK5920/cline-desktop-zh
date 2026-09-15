' Cline 中文版智能静默启动器 (零黑框、自动拉起、防冲突)
Set WshShell = CreateObject("WScript.Shell")
Set FSO = CreateObject("Scripting.FileSystemObject")

' 自动推导路径：优先当前脚本所在目录的上级目录
zhDir = FSO.GetParentFolderName(WScript.ScriptFullName)
appDir = FSO.GetParentFolderName(zhDir)
exePath = appDir & "\cline-app.exe"

If Not FSO.FileExists(exePath) Then
    ' 回落到默认安装路径
    If FSO.FileExists("E:\Program Files\Cline\cline-app.exe") Then
        exePath = "E:\Program Files\Cline\cline-app.exe"
        appDir = "E:\Program Files\Cline"
        zhDir = appDir & "\cline-zh"
    ElseIf FSO.FileExists("C:\Program Files\Cline\cline-app.exe") Then
        exePath = "C:\Program Files\Cline\cline-app.exe"
        appDir = "C:\Program Files\Cline"
        zhDir = appDir & "\cline-zh"
    End If
End If

injectScript = zhDir & "\inject.js"

Set objWMIService = GetObject("winmgmts:\\.\root\cimv2")
Set colProcesses = objWMIService.ExecQuery("Select * from Win32_Process Where Name = 'cline-app.exe'")

' 若主程序未运行但残留了孤儿 sidecar 进程，先清理残留
Set colSidecars = objWMIService.ExecQuery("Select * from Win32_Process Where Name = 'code-sidecar.exe'")
If colProcesses.Count = 0 And colSidecars.Count > 0 Then
    For Each objSidecar In colSidecars
        objSidecar.Terminate()
    Next
End If

If colProcesses.Count > 0 Then
    WshShell.AppActivate "Cline"
Else
    Set procEnv = WshShell.Environment("PROCESS")
    procEnv("WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS") = "--remote-debugging-port=9333 --lang=zh-CN"
    procEnv("SILENT") = "1"
    procEnv("CDP_PORT") = "9333"
    
    WshShell.Run """" & exePath & """", 1, False
    WScript.Sleep 1500
End If

Set colNodes = objWMIService.ExecQuery("Select * from Win32_Process Where Name = 'node.exe'")
isNodeRunning = False
For Each objNode In colNodes
    If InStr(1, objNode.CommandLine, "cline-zh\inject.js", 1) > 0 Then
        isNodeRunning = True
        Exit For
    End If
Next

If Not isNodeRunning Then
    Set procEnv = WshShell.Environment("PROCESS")
    procEnv("SILENT") = "1"
    procEnv("CDP_PORT") = "9333"
    
    nodeExe = "D:\Program Files\nodejs\node.exe"
    If Not FSO.FileExists(nodeExe) Then
        nodeExe = "node"
    End If
    WshShell.Run """" & nodeExe & """ """ & injectScript & """", 0, False
End If
