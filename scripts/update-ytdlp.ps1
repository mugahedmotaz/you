# PowerShell script to download and update yt-dlp
Write-Host "Downloading latest yt-dlp..." -ForegroundColor Green

# Create bin directory if it doesn't exist
if (!(Test-Path "bin")) {
    New-Item -ItemType Directory -Path "bin"
}

# Download latest yt-dlp
$url = "https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp.exe"
$output = "bin/yt-dlp.exe"

try {
    Invoke-WebRequest -Uri $url -OutFile $output
    Write-Host "yt-dlp downloaded successfully to $output" -ForegroundColor Green
    
    # Test if it works
    Write-Host "Testing yt-dlp..." -ForegroundColor Yellow
    & ".\$output" --version
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "yt-dlp is working correctly!" -ForegroundColor Green
    } else {
        Write-Host "yt-dlp test failed" -ForegroundColor Red
    }
} catch {
    Write-Host "Failed to download yt-dlp: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "Done!" -ForegroundColor Green
