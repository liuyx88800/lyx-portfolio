@echo off
cd /d "%~dp0"
echo 正在打开作品管理器：http://127.0.0.1:4174
echo 请不要关闭这个黑色窗口。关闭窗口即关闭管理器。
npm run manage
pause
