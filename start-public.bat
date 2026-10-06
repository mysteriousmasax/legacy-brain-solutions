@echo off
setlocal
cd /d "%~dp0"

set "NPM=C:\Program Files\nodejs\npm.cmd"
set "CLOUDFLARED=C:\PROGRA~2\cloudflared\cloudflared.exe"

if not exist "%NPM%" (
  echo Node.js was not found at %NPM%.
  pause
  exit /b 1
)

if not exist "%CLOUDFLARED%" (
  echo Cloudflare Tunnel was not found at %CLOUDFLARED%.
  pause
  exit /b 1
)

start "Legacy CPA API" /min cmd /k ""%NPM%" run server:dev"
start "Legacy CPA Website" /min cmd /k ""%NPM%" run dev"

echo.
echo Starting Cloudflare Quick Tunnel for Legacy CPA Tanzania...
echo Keep this window open. Cloudflare will print the public https://trycloudflare.com URL below.
echo.
"%CLOUDFLARED%" tunnel --url http://127.0.0.1:5173