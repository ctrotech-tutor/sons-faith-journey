import { useEffect } from 'react';
import { useMLInsights } from '@/lib/hooks/useMLInsights';

interface MetaUpdaterProps {
  title?: string;
  description?: string;
  content?: string;
  generateFromContent?: boolean;
}

const MetaUpdater: React.FC<MetaUpdaterProps> = ({ 
  title, 
  description, 
  content,
  generateFromContent = false 
}) => {
  const { analyzeContent } = useMLInsights();

  useEffect(() => {
    const updateMeta = async () => {
      let finalTitle = title;
      let finalDescription = description;

      // Generate title and description using ML if content is provided
      if (generateFromContent && content) {
        try {
          const analysis = await analyzeContent(content, 'post');
          if (analysis) {
            // Generate title from content analysis
            if (!finalTitle && analysis.topics && analysis.topics.length > 0) {
              finalTitle = `${analysis.topics[0]} - Community Discussion`;
            }
            
            // Generate description from content
            if (!finalDescription) {
              const cleanContent = content.replace(/[#*\[\]]/g, '').trim();
              finalDescription = cleanContent.length > 150 
                ? cleanContent.substring(0, 150) + '...'
                : cleanContent;
            }
          }
        } catch (error) {
          console.error('Error generating meta from content:', error);
        }
      }

      // Update document title
      if (finalTitle) {
        document.title = `${finalTitle} | Son's Faith Journey`;
      }

      // Update meta description
      if (finalDescription) {
        let metaDescription = document.querySelector('meta[name="description"]');
        if (!metaDescription) {
          metaDescription = document.createElement('meta');
          metaDescription.setAttribute('name', 'description');
          document.head.appendChild(metaDescription);
        }
        metaDescription.setAttribute('content', finalDescription);
      }

      // Update Open Graph tags
      const updateOrCreateMetaTag = (property: string, content: string) => {
        let tag = document.querySelector(`meta[property="${property}"]`);
        if (!tag) {
          tag = document.createElement('meta');
          tag.setAttribute('property', property);
          document.head.appendChild(tag);
        }
        tag.setAttribute('content', content);
      };

      if (finalTitle) {
        updateOrCreateMetaTag('og:title', finalTitle);
        updateOrCreateMetaTag('twitter:title', finalTitle);
      }

      if (finalDescription) {
        updateOrCreateMetaTag('og:description', finalDescription);
        updateOrCreateMetaTag('twitter:description', finalDescription);
      }

      updateOrCreateMetaTag('og:type', 'article');
      updateOrCreateMetaTag('og:site_name', "Son's Faith Journey");
      updateOrCreateMetaTag('twitter:card', 'summary');
    };

    updateMeta();

    // Cleanup function to reset title when component unmounts
    return () => {
      document.title = "Son's Faith Journey";
    };
  }, [title, description, content, generateFromContent, analyzeContent]);

  return null;
};

export default MetaUpdater;