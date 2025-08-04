import path from 'path';
import { existsSync } from 'fs';

/**
 * Get the correct yt-dlp path based on environment and platform
 */
export function getYtdlpPath(): string {
  // First, check if YTDLP_PATH is set in environment
  if (process.env.YTDLP_PATH) {
    return process.env.YTDLP_PATH;
  }

  // Try local binary paths
  const localPaths = [
    process.platform === 'win32' ? 'bin/yt-dlp.exe' : 'bin/yt-dlp',
    process.platform === 'win32' ? './bin/yt-dlp.exe' : './bin/yt-dlp',
    process.platform === 'win32' ? path.join(process.cwd(), 'bin', 'yt-dlp.exe') : path.join(process.cwd(), 'bin', 'yt-dlp'),
  ];

  for (const localPath of localPaths) {
    if (existsSync(localPath)) {
      console.log(`Found yt-dlp at: ${localPath}`);
      return localPath;
    }
  }

  // Fallback to system yt-dlp
  console.log('Using system yt-dlp (make sure it\'s installed)');
  return 'yt-dlp';
}
