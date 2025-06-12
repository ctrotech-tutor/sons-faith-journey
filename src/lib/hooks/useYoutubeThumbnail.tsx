import { useEffect, useState } from 'react';

export function useYouTubeThumbnail(videoId: string, apiKey: string) {
  const [thumbnail, setThumbnail] = useState<string | null>(null);

  useEffect(() => {
    const fetchThumbnail = async () => {
      try {
        const res = await fetch(
          `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${apiKey}`
        );
        const data = await res.json();
        const thumbUrl =
          data?.items?.[0]?.snippet?.thumbnails?.maxres?.url ||
          data?.items?.[0]?.snippet?.thumbnails?.high?.url;

        setThumbnail(thumbUrl || null);
      } catch (err) {
        console.error('Failed to fetch thumbnail:', err);
      }
    };

    if (videoId) fetchThumbnail();
  }, [videoId, apiKey]);

  return thumbnail;
}
