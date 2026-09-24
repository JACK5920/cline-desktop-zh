' Cline 中文版智能静默启动器 (零黑框、自动拉起、防冲突)
Set WshShell = CreateObject("WScript.Shell")
Set FSO = CreateObject("Scripting.FileSystemObject")

' 自动推导路径：优先当前脚本所在目录的上级目录
zhDir = FSO.GetParentFolderName(WScript.ScriptFullName)
appDir = FSO.GetParentFolderName(zhDir)
exePath = appDir & "\cline-app.exe"

If Not FSO.FileExists(exePath) Then
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
targetPort = "19333"

Set objWMIService = GetObject("winmgmts:\\.\root\cimv2")
Set colProcesses = objWMIService.ExecQuery("Select * from Win32_Process Where Name = 'cline-app.exe'")

' 若主程序未运行但残留了孤儿 sidecar 进程，先清理残留
Set colSidecars = objWMIService.ExecQuery("Select * from Win32_Process Where Name = 'code-sidecar.exe'")
If colProcesses.Count = 0 And colSidecars.Count > 0 Then
    For Each objSidecar In colSidecars
        objSidecar.Terminate()
    Next
End If

' 检查当前运行中的 cline-app 是否已开启远程调试端口
needsLaunch = True
If colProcesses.Count > 0 Then
    Set colWebViews = objWMIService.ExecQuery("Select * from Win32_Process Where Name = 'msedgewebview2.exe' and CommandLine like '%--remote-debugging-port=%'")
    If colWebViews.Count > 0 Then
        ' 已经开启了调试模式，直接激活窗口
        WshShell.AppActivate "Cline"
        needsLaunch = False
    Else
        ' 运行中的是未带调试参数的原版，先关闭旧进程以便热切换到中文版
        For Each objProc In colProcesses
            objProc.Terminate()
        Next
        WScript.Sleep 800
        needsLaunch = True
    End If
End If

If needsLaunch Then
    Set procEnv = WshShell.Environment("PROCESS")
    procEnv("WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS") = "--remote-debugging-port=" & targetPort & " --lang=zh-CN"
    procEnv("SILENT") = "1"
    procEnv("CDP_PORT") = targetPort
    
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
    procEnv("CDP_PORT") = targetPort
    
    nodeExe = "D:\Program Files\nodejs\node.exe"
    If Not FSO.FileExists(nodeExe) Then
        nodeExe = "node"
    End If
    WshShell.Run """" & nodeExe & """ """ & injectScript & """", 0, False
End If
