/**
 * Video Utility Functions
 * 
 * Helper functions for handling video URLs, extracting IDs, and generating thumbnails.
 */

/**
 * Extracts the YouTube Video ID from a variety of URL formats.
 * Supports:
 * - standard: youtube.com/watch?v=ID
 * - short: youtu.be/ID
 * - embed: youtube.com/embed/ID
 * - shorts: youtube.com/shorts/ID
 * - live: youtube.com/live/ID
 */
export const getYouTubeId = (url?: string): string | null => {
  if (!url) return null;
  const raw = url.trim();
  if (!raw) return null;

  // Direct ID check (11 chars Alphanumeric + -_)
  if (/^[A-Za-z0-9_-]{11}$/.test(raw)) return raw;

  try {
    const u = new URL(raw.startsWith('http') ? raw : `https://${raw}`);
    
    // Check 'v' query param
    const v = u.searchParams.get('v');
    if (v && v.length >= 11) return v.substring(0, 11);

    // Check path segments
    const pathSegments = u.pathname.split('/').filter(Boolean);
    
    // direct short link: youtu.be/ID
    if (u.hostname.includes('youtu.be') && pathSegments.length > 0) {
      return pathSegments[0].substring(0, 11);
    }
    
    // youtube.com/embed/ID, /shorts/ID, /live/ID, /v/ID
    if (u.hostname.includes('youtube') || u.hostname.includes('youtu')) {
      const specialPaths = ['embed', 'shorts', 'live', 'v'];
      if (specialPaths.includes(pathSegments[0]) && pathSegments.length > 1) {
        return pathSegments[1].substring(0, 11);
      }
    }
  } catch (e) {
    // URL parsing failed, fall back to regex
  }

  // Regex fallback for robust matching
  const re = /(?:youtube(?:-nocookie)?\.com\/(?:watch\?v=|embed\/|v\/|shorts\/|live\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/;
  const m = raw.match(re);
  return m ? m[1] : null;
};

/**
 * Generates a YouTube thumbnail URL from a video URL or ID.
 * Defaults to the high-quality 'maxresdefault' or 'hqdefault'.
 * 
 * @param videoUrlOrId The full video URL or the 11-char ID
 * @param quality 'maxres' | 'hq' | 'mq' | 'sd'
 */
export const getYouTubeThumbnail = (
  videoUrlOrId?: string, 
  quality: 'maxres' | 'hq' | 'mq' | 'sd' = 'hq'
): string | null => {
  const id = getYouTubeId(videoUrlOrId);
  if (!id) return null;

  // Quality mapping
  // maxresdefault.jpg (1280x720) - Not always available
  // sddefault.jpg (640x480)
  // hqdefault.jpg (480x360) - Reliable
  // mqdefault.jpg (320x180)
  // default.jpg (120x90)

  switch (quality) {
    case 'maxres':
      return `https://img.youtube.com/vi/${id}/maxresdefault.jpg`;
    case 'sd':
      return `https://img.youtube.com/vi/${id}/sddefault.jpg`;
    case 'mq':
      return `https://img.youtube.com/vi/${id}/mqdefault.jpg`;
    case 'hq':
    default:
      return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
  }
};

/**
 * Checks if a string is a valid video URL (simple check).
 */
export const isVideoUrl = (url?: string): boolean => {
  if (!url) return false;
  return !!getYouTubeId(url);
};
