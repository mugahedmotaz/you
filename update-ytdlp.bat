@echo off
echo Downloading latest yt-dlp...

if not exist "bin" mkdir bin

curl -L -o "bin/yt-dlp.exe" "https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp.exe"

if %errorlevel% equ 0 (
    echo yt-dlp downloaded successfully!
    echo Testing yt-dlp...
    bin\yt-dlp.exe --version
    if %errorlevel% equ 0 (
        echo yt-dlp is working correctly!
    ) else (
        echo yt-dlp test failed
    )
) else (
    echo Failed to download yt-dlp
)

pause
