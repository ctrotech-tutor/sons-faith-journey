
import React from 'react';

export const formatPostContent = (content: string, onHashtagClick?: (hashtag: string) => void) => {
  // Split content by spaces to process each word
  const words = content.split(' ');
  
  return words.map((word, index) => {
    // Check if word is a hashtag
    if (word.startsWith('#') && word.length > 1) {
      return React.createElement(
        'span',
        { key: index },
        React.createElement(
          'button',
          {
            onClick: () => onHashtagClick?.(word),
            className: "text-purple-600 dark:text-purple-400 hover:underline font-medium"
          },
          word
        ),
        index < words.length - 1 ? ' ' : ''
      );
    }
    
    // Check if word is a URL
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    if (urlRegex.test(word)) {
      return React.createElement(
        'span',
        { key: index },
        React.createElement(
          'a',
          {
            href: word,
            target: "_blank",
            rel: "noopener noreferrer",
            className: "text-blue-600 dark:text-blue-400 hover:underline"
          },
          word
        ),
        index < words.length - 1 ? ' ' : ''
      );
    }
    
    // Regular word
    return word + (index < words.length - 1 ? ' ' : '');
  });
};

export const extractHashtags = (content: string): string[] => {
  const hashtags = content.match(/#\w+/g);
  return hashtags ? hashtags.map(tag => tag.toLowerCase()) : [];
};

export const isYouTubeUrl = (url: string): boolean => {
  return url.includes('youtube.com/embed/') || url.includes('youtu.be/');
};

export const getYouTubeEmbedUrl = (url: string): string => {
  if (url.includes('youtube.com/embed/')) {
    return url;
  }
  
  if (url.includes('youtu.be/')) {
    const videoId = url.split('youtu.be/')[1];
    return `https://www.youtube.com/embed/${videoId}`;
  }
  
  if (url.includes('youtube.com/watch?v=')) {
    const videoId = url.split('watch?v=')[1].split('&')[0];
    return `https://www.youtube.com/embed/${videoId}`;
  }
  
  return url;
};

export const getYouTubeThumbnail = (url: string) => {
  const match = url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg` : null;
};

export const extractYouTubeId = (url: string) => {
  const match = url.match(/(?:v=|\/)([0-9A-Za-z_-]{11})(?:\?|&|$)/);
  return match ? match[1] : null;
}

