@echo off
chcp 65001 >nul
echo 正在停止 Cline 后台汉化注入器...
for /f "tokens=2" %%i in ('wmic process where "name='node.exe' and commandline like '%%cline-zh\\inject.js%%'" get processid ^| findstr [0-9]') do (
  taskkill /f /pid %%i >nul 2>nul
)
echo 已停止。
timeout /t 2 >nul
