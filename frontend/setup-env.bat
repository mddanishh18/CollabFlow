@echo off
echo ========================================
echo CollabFlow - Frontend Environment Setup
echo ========================================
echo.

cd /d "%~dp0"

if exist .env.local (
    echo .env.local already exists!
    choice /C YN /M "Do you want to overwrite it?"
    if errorlevel 2 goto :end
    if errorlevel 1 goto :create
) else (
    goto :create
)

:create
echo Creating .env.local file...
(
echo NEXT_PUBLIC_API_URL=http://localhost:5000
echo NEXT_PUBLIC_APP_NAME=CollabFlow
echo NEXT_PUBLIC_APP_URL=http://localhost:3000
) > .env.local

echo.
echo ✅ .env.local file created successfully!
echo.
echo Configuration:
echo   - API URL: http://localhost:5000
echo   - App Name: CollabFlow
echo   - App URL: http://localhost:3000
echo.
echo You can now run: npm run dev
echo.

:end
pause
