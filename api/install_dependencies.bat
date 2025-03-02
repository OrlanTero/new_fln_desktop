@echo off
echo Installing PHP dependencies...

REM Check if Composer is installed
where composer >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Composer is not installed or not in your PATH.
    echo Please install Composer from https://getcomposer.org/download/
    exit /b 1
)

REM Install dependencies
composer install

echo Dependencies installed successfully!
echo You can now start the API server using the start_api_server script.
pause 