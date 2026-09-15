@echo off
chcp 65001 >nul
title Cline ZH Launcher
echo [cline-zh] Starting Cline with Chinese localization...
set WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS=--remote-debugging-port=9333 --lang=zh-CN
set CLINE_EXE=%~dp0..\cline-app.exe

if not exist "%CLINE_EXE%" (
  echo [cline-zh] ERROR: cline-app.exe not found!
  pause
  exit /b 1
)

start "" "%CLINE_EXE%"
where node >nul 2>nul
if %errorlevel%==0 (
  set NODE_CMD=node
) else (
  echo [cline-zh] ERROR: Node.js not found in PATH.
  pause
  exit /b 1
)
"%NODE_CMD%" "%~dp0inject.js"
pause
