import React from 'react';
import { Exercise } from '../data/exercises';

interface VideoPreviewProps {
  exercise: Exercise;
  className?: string;
}

function getYouTubeId(url?: string): string | null {
  if (!url) return null;
  const raw = url.trim();
  if (!raw) return null;

  // Support passing a raw YouTube video id directly.
  if (/^[A-Za-z0-9_-]{11}$/.test(raw)) return raw;
  try {
    const u = new URL(raw, 'https://example.com');
    const v = u.searchParams.get('v');
    if (v && v.length >= 8) return v.substring(0, 11);

    // Support common path-based formats like /shorts/<id>, /live/<id>, /embed/<id>, /v/<id>, and youtu.be/<id>
    const pathMatch = u.pathname.match(/\/(?:shorts|live|embed|v)\/([A-Za-z0-9_-]{7,})(?:[?&\/]|$)/i);
    if (pathMatch?.[1]) return pathMatch[1].length > 11 ? pathMatch[1].slice(0, 11) : pathMatch[1];
    if (u.hostname.toLowerCase().includes('youtu.be')) {
      const id = u.pathname.split('/').filter(Boolean)[0];
      if (id) return id.length > 11 ? id.slice(0, 11) : id;
    }
  } catch {}

  try {
    const re = /(?:youtube(?:-nocookie)?\.com\/(?:watch\?v=|embed\/|v\/|shorts\/|live\/)|youtu\.be\/)([A-Za-z0-9_-]{7,})(?:[?&\/]|$)/i;
    const m = String(raw).match(re);
    if (m && m[1]) return m[1].length > 11 ? m[1].slice(0, 11) : m[1];
  } catch {}

  return null;
}

function extractYouTubeUrlFromText(text?: string): string | undefined {
  if (!text) return undefined;

  // Match common YouTube URL formats (with or without protocol), stopping at whitespace/quotes.
  const match = text.match(/\b(?:https?:\/\/)?(?:[\w-]+\.)*(?:youtube(?:-nocookie)?\.com|youtu\.be)\/[^\s<>"']+/i);
  if (!match?.[0]) return undefined;

  let url = match[0].replace(/[)\]}>.,!?]+$/, '');
  if (!/^https?:\/\//i.test(url)) url = `https://${url}`;
  return url;
}

export const VideoPreview: React.FC<VideoPreviewProps> = ({ exercise, className = '' }) => {
  const extracted =
    extractYouTubeUrlFromText((exercise as any).overview) ?? extractYouTubeUrlFromText((exercise as any).description);
  const explicitVideo = typeof exercise.video === 'string' ? exercise.video.trim() : '';
  const effective = explicitVideo || extracted || '';
  const yt = getYouTubeId(effective);

  if (yt) {
    const src = `https://www.youtube.com/embed/${yt}?rel=0&modestbranding=1&origin=${encodeURIComponent(typeof window !== 'undefined' ? window.location.origin : '')}`;
    return (
      <iframe
        title={exercise.name}
        src={src}
        className={className}
        frameBorder="0"
        allow="autoplay; encrypted-media; picture-in-picture"
        allowFullScreen
        // Make preview iframe non-interactive so parent card click opens modal
        style={{ pointerEvents: 'none' }}
        aria-hidden="true"
        tabIndex={-1}
      />
    );
  }

  return <img src={exercise.image} className={className} alt={exercise.name} loading="lazy" />;
};

export default VideoPreview;
