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
echo GitHub 上传完成，Vercel 正在自动更新。
echo 正在同步发布 Netlify 国内备用地址，请耐心等待几分钟...
where netlify >nul 2>nul
if errorlevel 1 (
  echo 当前电脑未安装 Netlify CLI，已跳过 Netlify；GitHub 和 Vercel 不受影响。
) else (
  netlify deploy --prod
  if errorlevel 1 (
    echo Netlify 同步失败，但 GitHub 和 Vercel 已更新。请截图本窗口以便排查。
  ) else (
    echo Netlify 同步完成：https://liuyx-portfolio.netlify.app
  )
)
echo.
echo 网站更新流程结束。
pause
