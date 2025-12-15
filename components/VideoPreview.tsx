import React from 'react';
import { Exercise } from '../data/exercises';

interface VideoPreviewProps {
  exercise: Exercise;
  className?: string;
}

function getYouTubeId(url?: string): string | null {
  if (!url) return null;
  try {
    const u = new URL(url, 'https://example.com');
    const v = u.searchParams.get('v');
    if (v && v.length >= 8) return v.substring(0, 11);
  } catch {}

  try {
    const re = /(?:youtube(?:-nocookie)?\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([A-Za-z0-9_-]{7,})(?:[?&\/]|$)/i;
    const m = String(url).match(re);
    if (m && m[1]) return m[1].length > 11 ? m[1].slice(0, 11) : m[1];
  } catch {}

  return null;
}

function extractYouTubeUrlFromText(text?: string): string | undefined {
  if (!text) return undefined;
  const urlRe = /(https?:\/\/[\s\S]*?youtube[\s\S]*?|https?:\/\/youtu\.be\/[\s\S]*?)/ig;
  const match = urlRe.exec(text);
  if (match && match[0]) return match[0];
  const urlRe2 = /(www\.youtube[\s\S]*?|youtu\.be\/[\s\S]*?)/ig;
  const match2 = urlRe2.exec(text);
  if (match2 && match2[0]) return `https://${match2[0]}`;
  return undefined;
}

export const VideoPreview: React.FC<VideoPreviewProps> = ({ exercise, className = '' }) => {
  const extracted = extractYouTubeUrlFromText((exercise as any).overview ?? (exercise as any).description);
  const effective = (exercise.video as string) ?? extracted ?? '';
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
      />
    );
  }

  return <img src={exercise.image} className={className} alt={exercise.name} loading="lazy" />;
};

export default VideoPreview;
