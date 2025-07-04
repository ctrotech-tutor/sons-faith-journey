import { useEffect } from 'react';

interface MetaData {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
  tags?: string[];
}

export const useDynamicLinks = () => {
  const updateMetaTags = (metadata: MetaData) => {
    // Update document title
    if (metadata.title) {
      document.title = `${metadata.title} | THE SONS Challenge`;
    }

    // Helper function to update meta tag
    const updateMetaTag = (property: string, content: string, isOg = true) => {
      const attributeName = isOg ? 'property' : 'name';
      let element = document.querySelector(`meta[${attributeName}="${property}"]`);
      
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attributeName, property);
        document.head.appendChild(element);
      }
      
      element.setAttribute('content', content);
    };

    // Update Open Graph tags
    if (metadata.title) {
      updateMetaTag('og:title', metadata.title);
    }
    
    if (metadata.description) {
      updateMetaTag('og:description', metadata.description);
      updateMetaTag('description', metadata.description, false);
    }
    
    if (metadata.image) {
      updateMetaTag('og:image', metadata.image);
      updateMetaTag('twitter:image', metadata.image);
    }
    
    if (metadata.url) {
      updateMetaTag('og:url', metadata.url);
    }
    
    if (metadata.type) {
      updateMetaTag('og:type', metadata.type);
    }

    // Twitter Card tags
    updateMetaTag('twitter:card', 'summary_large_image');
    if (metadata.title) {
      updateMetaTag('twitter:title', metadata.title);
    }
    if (metadata.description) {
      updateMetaTag('twitter:description', metadata.description);
    }

    // Article tags for blog posts
    if (metadata.author) {
      updateMetaTag('article:author', metadata.author);
    }
    if (metadata.publishedTime) {
      updateMetaTag('article:published_time', metadata.publishedTime);
    }
    if (metadata.modifiedTime) {
      updateMetaTag('article:modified_time', metadata.modifiedTime);
    }
    if (metadata.section) {
      updateMetaTag('article:section', metadata.section);
    }
    if (metadata.tags) {
      metadata.tags.forEach(tag => {
        updateMetaTag('article:tag', tag);
      });
    }
  };

  const generatePostMetadata = (post: any): MetaData => {
    const baseUrl = window.location.origin;
    const postUrl = `${baseUrl}/community/post/${post.id}`;
    
    return {
      title: `${post.authorName}'s Post`,
      description: post.content.slice(0, 160),
      image: post.mediaUrl || `${baseUrl}/default-post-image.jpg`,
      url: postUrl,
      type: 'article',
      author: post.authorName,
      publishedTime: post.timestamp?.toDate?.()?.toISOString(),
      section: 'Community',
      tags: post.hashtags || []
    };
  };

  const generateUserMetadata = (user: any): MetaData => {
    const baseUrl = window.location.origin;
    const userUrl = `${baseUrl}/profile/${user.id}`;
    
    return {
      title: `${user.displayName}'s Profile`,
      description: user.bio || `${user.displayName} is part of THE SONS Challenge community. Reading streak: ${user.readingStreak} days.`,
      image: user.profilePhoto || `${baseUrl}/default-avatar.jpg`,
      url: userUrl,
      type: 'profile',
      author: user.displayName
    };
  };

  const generateBibleMetadata = (book: string, chapter?: number): MetaData => {
    const baseUrl = window.location.origin;
    const title = chapter ? `${book} Chapter ${chapter}` : book;
    const url = chapter ? `${baseUrl}/bible/${book}/${chapter}` : `${baseUrl}/bible/${book}`;
    
    return {
      title: `${title} - Bible Reading`,
      description: chapter 
        ? `Read ${book} Chapter ${chapter} in THE SONS Challenge Bible reading plan.`
        : `Explore the book of ${book} in THE SONS Challenge Bible reading plan.`,
      image: `${baseUrl}/bible-og-image.jpg`,
      url,
      type: 'article',
      section: 'Bible Reading'
    };
  };

  const generateReadingMetadata = (day: number): MetaData => {
    const baseUrl = window.location.origin;
    
    return {
      title: `Day ${day} Reading`,
      description: `Complete your Day ${day} Bible reading in THE SONS Challenge. Stay consistent and build your reading streak!`,
      image: `${baseUrl}/reading-og-image.jpg`,
      url: `${baseUrl}/reading?day=${day}`,
      type: 'article',
      section: 'Reading Plan'
    };
  };

  const resetToDefault = () => {
    updateMetaTags({
      title: 'THE SONS Challenge',
      description: 'Join THE SONS Challenge - A 90-day spiritual growth journey with Bible reading, community engagement, and personal transformation.',
      image: `${window.location.origin}/default-og-image.jpg`,
      url: window.location.origin,
      type: 'website'
    });
  };

  // Generate structured data for better SEO
  const generateStructuredData = (type: 'article' | 'profile' | 'organization', data: any) => {
    let structuredData: any = {
      "@context": "https://schema.org"
    };

    switch (type) {
      case 'article':
        structuredData = {
          ...structuredData,
          "@type": "Article",
          "headline": data.title,
          "description": data.description,
          "image": data.image,
          "author": {
            "@type": "Person",
            "name": data.author
          },
          "publisher": {
            "@type": "Organization",
            "name": "THE SONS Challenge",
            "logo": {
              "@type": "ImageObject",
              "url": `${window.location.origin}/logo.jpg`
            }
          },
          "datePublished": data.publishedTime,
          "dateModified": data.modifiedTime || data.publishedTime
        };
        break;
      
      case 'profile':
        structuredData = {
          ...structuredData,
          "@type": "Person",
          "name": data.name,
          "description": data.description,
          "image": data.image,
          "url": data.url
        };
        break;
      
      case 'organization':
        structuredData = {
          ...structuredData,
          "@type": "Organization",
          "name": "THE SONS Challenge",
          "description": "A 90-day spiritual growth journey with Bible reading, community engagement, and personal transformation.",
          "url": window.location.origin,
          "logo": `${window.location.origin}/logo.jpg`,
          "sameAs": [
            // Add social media URLs here
          ]
        };
        break;
    }

    // Remove existing structured data
    const existingScript = document.querySelector('script[type="application/ld+json"]');
    if (existingScript) {
      existingScript.remove();
    }

    // Add new structured data
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(structuredData);
    document.head.appendChild(script);
  };

  // Track page views with UTM parameters
  const trackPageView = (additionalData?: any) => {
    const urlParams = new URLSearchParams(window.location.search);
    const analyticsData = {
      page: window.location.pathname,
      timestamp: Date.now(),
      referrer: document.referrer,
      userAgent: navigator.userAgent,
      utm_source: urlParams.get('utm_source'),
      utm_medium: urlParams.get('utm_medium'),
      utm_campaign: urlParams.get('utm_campaign'),
      utm_term: urlParams.get('utm_term'),
      utm_content: urlParams.get('utm_content'),
      ...additionalData
    };

    // Send to analytics service
    if ((window as any).gtag) {
      (window as any).gtag('event', 'page_view', analyticsData);
    }

    return analyticsData;
  };

  return {
    updateMetaTags,
    generatePostMetadata,
    generateUserMetadata,
    generateBibleMetadata,
    generateReadingMetadata,
    resetToDefault,
    generateStructuredData,
    trackPageView
  };
};

// Hook for automatic meta tag updates based on route
export const useRouteMetadata = (routeData: any) => {
  const { updateMetaTags, generateStructuredData } = useDynamicLinks();

  useEffect(() => {
    if (routeData) {
      updateMetaTags(routeData.metadata);
      if (routeData.structuredData) {
        generateStructuredData(routeData.structuredData.type, routeData.structuredData.data);
      }
    }
  }, [routeData, updateMetaTags, generateStructuredData]);
};