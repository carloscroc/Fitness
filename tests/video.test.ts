
import { describe, it, expect } from 'vitest';
import { getYouTubeId, getYouTubeThumbnail } from '../utils/video';

describe('Video Utilities', () => {
  describe('getYouTubeId', () => {
    it('should extract ID from standard URL', () => {
      expect(getYouTubeId('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
    });

    it('should extract ID from short URL', () => {
      expect(getYouTubeId('https://youtu.be/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
    });

    it('should extract ID from embed URL', () => {
      expect(getYouTubeId('https://www.youtube.com/embed/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
    });

    it('should extract ID from shorts URL', () => {
      expect(getYouTubeId('https://www.youtube.com/shorts/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
    });

    it('should return null for invalid URLs', () => {
      expect(getYouTubeId('https://example.com')).toBe(null);
      expect(getYouTubeId('')).toBe(null);
    });

    it('should handle raw IDs', () => {
      expect(getYouTubeId('dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
    });
  });

  describe('getYouTubeThumbnail', () => {
    it('should generate hqdefault thumbnail by default', () => {
      const url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
      expect(getYouTubeThumbnail(url)).toBe('https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg');
    });

    it('should support quality selection', () => {
      const id = 'dQw4w9WgXcQ';
      expect(getYouTubeThumbnail(id, 'maxres')).toBe(`https://img.youtube.com/vi/${id}/maxresdefault.jpg`);
      expect(getYouTubeThumbnail(id, 'sd')).toBe(`https://img.youtube.com/vi/${id}/sddefault.jpg`);
    });

    it('should return null for invalid inputs', () => {
      expect(getYouTubeThumbnail('')).toBe(null);
    });
  });
});
