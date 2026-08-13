@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo 正在检查并发布作品更新...
for /f "delims=" %%R in ('git remote get-url origin 2^>nul') do set "LYX_REMOTE=%%R"
echo %LYX_REMOTE% | findstr /i "Giats2498/giats-portfolio" >nul
if not errorlevel 1 (
  echo.
  echo 尚未连接到你自己的 GitHub 仓库，为防止误操作，本次没有发布。
  echo 请先按“新手使用说明.md”完成第一次上线。
  pause
  exit /b 1
)
git add src/constants/projects.js public
git commit -m "更新作品" || echo 没有新的作品需要提交。
git push
echo.
echo 发布完成。Vercel 会自动更新网站，通常需要 1 到 3 分钟。
pause
