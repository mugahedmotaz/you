#!/bin/bash

# Script to ensure yt-dlp is available
echo "Checking for yt-dlp..."

# Create bin directory if it doesn't exist
mkdir -p /app/bin

# Check if yt-dlp exists
if [ ! -f "/app/bin/yt-dlp" ]; then
    echo "yt-dlp not found, downloading..."
    curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /app/bin/yt-dlp
    chmod +x /app/bin/yt-dlp
    echo "yt-dlp downloaded and made executable"
else
    echo "yt-dlp found, ensuring it's executable..."
    chmod +x /app/bin/yt-dlp
fi

# Test yt-dlp
echo "Testing yt-dlp..."
/app/bin/yt-dlp --version

echo "yt-dlp setup complete!"
