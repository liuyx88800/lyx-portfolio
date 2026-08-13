@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo 正在打开作品管理器，请不要关闭这个黑色窗口...
npm run manage
pause

