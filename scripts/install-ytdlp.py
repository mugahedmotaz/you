#!/usr/bin/env python3
"""
Script to install yt-dlp and check system requirements
"""

import subprocess
import sys
import os

def run_command(command):
    """Run a command and return success status"""
    try:
        result = subprocess.run(command, shell=True, capture_output=True, text=True)
        return result.returncode == 0, result.stdout, result.stderr
    except Exception as e:
        return False, "", str(e)

def check_python():
    """Check Python version"""
    print("🐍 Checking Python version...")
    version = sys.version_info
    if version.major >= 3 and version.minor >= 7:
        print(f"✅ Python {version.major}.{version.minor}.{version.micro} - OK")
        return True
    else:
        print(f"❌ Python {version.major}.{version.minor}.{version.micro} - Need Python 3.7+")
        return False

def check_pip():
    """Check if pip is available"""
    print("📦 Checking pip...")
    success, stdout, stderr = run_command("pip --version")
    if success:
        print(f"✅ pip is available: {stdout.strip()}")
        return True
    else:
        print("❌ pip is not available")
        return False

def install_ytdlp():
    """Install yt-dlp"""
    print("⬇️  Installing yt-dlp...")
    success, stdout, stderr = run_command("pip install yt-dlp")
    if success:
        print("✅ yt-dlp installed successfully")
        return True
    else:
        print(f"❌ Failed to install yt-dlp: {stderr}")
        return False

def check_ytdlp():
    """Check if yt-dlp is working"""
    print("🔍 Checking yt-dlp installation...")
    success, stdout, stderr = run_command("yt-dlp --version")
    if success:
        print(f"✅ yt-dlp is working: {stdout.strip()}")
        return True
    else:
        print(f"❌ yt-dlp is not working: {stderr}")
        return False

def check_ffmpeg():
    """Check if ffmpeg is available (optional)"""
    print("🎬 Checking ffmpeg (optional)...")
    success, stdout, stderr = run_command("ffmpeg -version")
    if success:
        print("✅ ffmpeg is available - Advanced features enabled")
        return True
    else:
        print("⚠️  ffmpeg not found - Some features may be limited")
        print("   Install ffmpeg for better audio/video processing")
        return False

def main():
    """Main installation process"""
    print("🚀 YouTube Downloader Setup")
    print("=" * 40)
    
    # Check requirements
    python_ok = check_python()
    pip_ok = check_pip()
    
    if not python_ok or not pip_ok:
        print("\n❌ System requirements not met")
        sys.exit(1)
    
    # Install yt-dlp
    if not install_ytdlp():
        print("\n❌ Installation failed")
        sys.exit(1)
    
    # Verify installation
    if not check_ytdlp():
        print("\n❌ Installation verification failed")
        sys.exit(1)
    
    # Check optional dependencies
    check_ffmpeg()
    
    print("\n🎉 Setup completed successfully!")
    print("You can now use the YouTube Downloader with real downloads.")
    print("\nNext steps:")
    print("1. Start the application: npm run dev")
    print("2. Open http://localhost:3000")
    print("3. Try downloading a YouTube video!")

if __name__ == "__main__":
    main()
