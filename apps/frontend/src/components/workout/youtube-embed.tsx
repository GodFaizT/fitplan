'use client';

import { Youtube } from 'lucide-react';
import { youtubeId, youtubeSearchUrl } from '@/lib/youtube';

export function YouTubeEmbed({
  url,
  name,
}: {
  url: string | null;
  name: string;
}) {
  const id = youtubeId(url);
  if (!id) {
    return (
      <a
        href={youtubeSearchUrl(name)}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-2 text-sm text-accent hover:underline"
      >
        <Youtube className="h-4 w-4" /> Procurar no YouTube
      </a>
    );
  }
  return (
    <div className="aspect-video w-full overflow-hidden rounded-xl border border-line">
      <iframe
        className="h-full w-full"
        src={`https://www.youtube.com/embed/${id}`}
        title={name}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}
