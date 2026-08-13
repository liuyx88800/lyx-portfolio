@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo 正在检查网站更新...
for /f "delims=" %%R in ('git remote get-url origin 2^>nul') do set "LYX_REMOTE=%%R"
echo %LYX_REMOTE% | findstr /i "Giats2498/giats-portfolio" >nul
if not errorlevel 1 (
  echo.
  echo 尚未连接到你自己的 GitHub 仓库，为防止误操作，本次没有发布。
  echo 请先按“新手使用说明.md”完成第一次上线。
  pause
  exit /b 1
)
git add -A
git diff --cached --quiet
if not errorlevel 1 (
  echo 没有发现需要发布的修改。
) else (
  git commit -m "更新网站内容"
  if errorlevel 1 (
    echo 提交失败，请把窗口中的错误信息截图发给维护人员。
    pause
    exit /b 1
  )
  git push
  if errorlevel 1 (
    echo 上传失败，请检查网络或 GitHub 登录状态后重试。
    pause
    exit /b 1
  )
)
echo.
echo 发布完成。线上网站通常需要 1 到 3 分钟自动更新。
pause
