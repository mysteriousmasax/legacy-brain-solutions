@echo off
setlocal enabledelayedexpansion
cd /d "%~dp0"

title Legacy Brain Solutions Limited - Local Website
echo ================================================
echo   Legacy Brain Solutions Limited
echo   Preparing your local website...
echo ================================================
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js was not found on this computer.
  echo Install it from https://nodejs.org then run this file again.
  pause
  exit /b 1
)

if not exist "node_modules" (
  echo Installing dependencies. This only happens once and may take a few minutes...
  call npm install
  if errorlevel 1 goto :fail
)

if not exist ".env" (
  echo Creating local configuration...
  for /f "delims=" %%i in ('powershell -NoProfile -Command "[guid]::NewGuid().ToString('N') + [guid]::NewGuid().ToString('N')"') do set "JWT_SECRET=%%i"
  (
    echo DATABASE_URL="file:./dev.db"
    echo JWT_SECRET="!JWT_SECRET!"
    echo PORT=4000
    echo CLIENT_ORIGIN="http://localhost:4000"
    echo UPLOAD_DIR="./storage/uploads"
    echo PUBLIC_URL=""
  ) > ".env"
)

findstr /b "PUBLIC_URL=" ".env" >nul 2>nul
if errorlevel 1 echo PUBLIC_URL="">> ".env"

for /f "tokens=1* delims==" %%a in ('findstr /b "PUBLIC_URL=" ".env"') do set "CURRENT_PUBLIC_URL=%%~b"

echo.
if "%CURRENT_PUBLIC_URL%"=="" (
  echo This site currently only accepts connections from this computer.
) else (
  echo This site is currently configured for: %CURRENT_PUBLIC_URL%
)
set /p "DOMAIN=To allow visitors to reach this site through a domain name, type it now (e.g. example.com), or press Enter to keep the current setting: "
if not "%DOMAIN%"=="" (
  powershell -NoProfile -Command "$path='.env'; $value = 'PUBLIC_URL=\"https://%DOMAIN%,https://www.%DOMAIN%,http://%DOMAIN%\"'; $lines = Get-Content $path; if ($lines -match '^PUBLIC_URL=') { $lines = $lines -replace '^PUBLIC_URL=.*$', $value } else { $lines += $value }; Set-Content -Path $path -Value $lines"
)

echo Preparing the local database...
call npm run db:generate
if errorlevel 1 goto :fail
call npx prisma db push
if errorlevel 1 goto :fail
call npm run db:seed
if errorlevel 1 goto :fail

echo Building the website...
call npm run build
if errorlevel 1 goto :fail

set "LAN_IP="
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /R /C:"IPv4 Address"') do set "LAN_IP=%%a"
set "LAN_IP=%LAN_IP: =%"

echo.
echo ================================================
echo   Starting Legacy Brain Solutions Limited
echo.
echo   On this computer:     http://localhost:4000
if not "%LAN_IP%"=="" echo   On your network:      http://%LAN_IP%:4000
if not "%DOMAIN%"=="" echo   Your domain:          https://%DOMAIN%
echo.
echo   To let visitors reach this site from the internet using a
echo   domain, you also need to, outside of this script:
echo     1. Forward port 4000 to this computer in your router settings.
echo     2. Point your domain's DNS A record to your public IP address.
echo     3. Allow this app through Windows Firewall if prompted.
echo     4. Use a reverse proxy (e.g. Caddy, nginx) to add HTTPS for a
echo        production-grade public deployment.
echo.
echo   Keep this window open while you use the site.
echo   Close this window to stop the website.
echo ================================================
echo.

start "" "http://localhost:4000"
call npm run server
goto :eof

:fail
echo.
echo Something went wrong during setup. See the messages above for details.
pause
exit /b 1
