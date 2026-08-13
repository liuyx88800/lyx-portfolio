@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist node_modules call npm install
echo 正在启动本地预览：http://localhost:3010
echo 请不要关闭这个黑色窗口。关闭窗口即关闭预览网站。
rem 等待 Next.js 启动完成后再打开浏览器，避免出现“Internal Server Error”。
start "" powershell -NoProfile -WindowStyle Hidden -Command "Start-Sleep -Seconds 4; Start-Process 'http://localhost:3010'"
npm run dev -- -p 3010
pause
