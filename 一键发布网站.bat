@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo ============================================
echo    一键发布：GitHub + Vercel + Netlify
echo ============================================
echo.

rem ---------- 1. 检查是否连接了自己的仓库 ----------
for /f "delims=" %%R in ('git remote get-url origin 2^>nul') do set "LYX_REMOTE=%%R"
echo %LYX_REMOTE% | findstr /i "Giats2498/giats-portfolio" >nul
if not errorlevel 1 (
  echo [错误] 尚未连接到自己的 GitHub 仓库，为防止误操作，本次没有发布。
  echo        请先按 "新手使用说明.md" 完成第一次上线。
  pause
  exit /b 1
)

rem ---------- 2. 检测系统代理（用于 git push）----------
set "GIT_PROXY="
set "PSKEY=HKCU\Software\Microsoft\Windows\CurrentVersion\Internet Settings"
for /f "tokens=3" %%A in ('reg query "%PSKEY%" /v ProxyEnable 2^>nul ^| findstr /i "ProxyEnable"') do set "PROXY_ENABLE=%%A"
if "%PROXY_ENABLE%"=="0x1" (
  for /f "tokens=3" %%B in ('reg query "%PSKEY%" /v ProxyServer 2^>nul ^| findstr /i "ProxyServer"') do set "GIT_PROXY=%%B"
  if defined GIT_PROXY echo [代理] 检测到系统代理 %GIT_PROXY%，git push 将使用该代理。
)

rem ---------- 3. 提交本地修改 ----------
git add -A
git diff --cached --quiet
if not errorlevel 1 (
  echo [提示] 没有发现需要发布的修改，直接进入发布步骤。
) else (
  git commit -m "更新网站内容"
  if errorlevel 1 (
    echo [错误] 提交失败，请把窗口中的错误信息截图发给维护人员。
    pause
    exit /b 1
  )
)

rem ---------- 4. 推送到 GitHub ----------
if defined GIT_PROXY (
  git -c http.proxy=%GIT_PROXY% -c https.proxy=%GIT_PROXY% push
) else (
  git push
)
if errorlevel 1 (
  echo.
  echo [错误] 上传失败。若提示连接超时，请检查系统代理是否开启或网络状况。
  pause
  exit /b 1
)
echo [完成] GitHub 上传成功，Vercel 正在自动构建部署...

rem ---------- 5. 同步部署 Netlify ----------
echo.
echo [Netlify] 正在同步发布国内备用地址 https://liuyx-portfolio.netlify.app ...
echo          请耐心等待（首次构建约 5-10 分钟）。
where netlify >nul 2>nul
if errorlevel 1 (
  echo [警告] 当前电脑未安装 Netlify CLI，已跳过 Netlify。
  echo        GitHub 与 Vercel 不受影响。如需 Netlify 请先安装：npm i -g netlify-cli
) else (
  call netlify deploy --prod
  if errorlevel 1 (
    echo [错误] Netlify 同步失败，但 GitHub 和 Vercel 已更新。请截图本窗口以便排查。
  ) else (
    echo [完成] Netlify 同步成功：https://liuyx-portfolio.netlify.app
  )
)

echo.
echo ============================================
echo    全部发布流程结束
echo ============================================
pause
