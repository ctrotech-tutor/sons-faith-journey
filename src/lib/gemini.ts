import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = "AIzaSyB31sa0q5yE9XMSuJWPmSAiGPs4nQ6SDcI";

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

export interface UserInsight {
  engagementLevel: 'low' | 'medium' | 'high';
  interests: string[];
  recommendations: string[];
  spiritualGrowthStage: 'beginner' | 'growing' | 'mature';
  preferredContentTypes: string[];
}

export interface ContentAnalysis {
  sentiment: 'positive' | 'neutral' | 'negative';
  topics: string[];
  spiritualThemes: string[];
  engagementPotential: number;
  appropriatenessScore: number;
}

export interface ReadingRecommendation {
  passage: string;
  reason: string;
  difficulty: 'easy' | 'medium' | 'hard';
  themes: string[];
}

class GeminiService {
  private model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  async analyzeUserBehavior(userActivity: any): Promise<UserInsight> {
    try {
      const prompt = `
        Analyze this user's spiritual app activity data and provide insights:
        
        Activity Data: ${JSON.stringify(userActivity)}
        
        Based on this data, determine:
        1. Engagement level (low/medium/high)
        2. Main interests and spiritual topics
        3. Personalized recommendations
        4. Spiritual growth stage assessment
        5. Preferred content types
        
        Respond in JSON format with the structure:
        {
          "engagementLevel": "low|medium|high",
          "interests": ["interest1", "interest2"],
          "recommendations": ["rec1", "rec2", "rec3"],
          "spiritualGrowthStage": "beginner|growing|mature",
          "preferredContentTypes": ["type1", "type2"]
        }
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      // Fallback if JSON parsing fails
      return {
        engagementLevel: 'medium',
        interests: ['Bible Reading', 'Community'],
        recommendations: ['Continue daily reading', 'Engage more in community'],
        spiritualGrowthStage: 'growing',
        preferredContentTypes: ['Reading', 'Discussion']
      };
    } catch (error) {
      console.error('Error analyzing user behavior:', error);
      throw error;
    }
  }

  async analyzeContent(content: string, contentType: 'post' | 'comment'): Promise<ContentAnalysis> {
    try {
      const prompt = `
        Analyze this ${contentType} content from a Christian community app:
        
        Content: "${content}"
        
        Provide analysis for:
        1. Sentiment (positive/neutral/negative)
        2. Main topics discussed
        3. Spiritual themes present
        4. Engagement potential (0-100)
        5. Appropriateness score (0-100)
        
        Respond in JSON format:
        {
          "sentiment": "positive|neutral|negative",
          "topics": ["topic1", "topic2"],
          "spiritualThemes": ["theme1", "theme2"],
          "engagementPotential": 85,
          "appropriatenessScore": 95
        }
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      return {
        sentiment: 'neutral',
        topics: ['General'],
        spiritualThemes: ['Faith'],
        engagementPotential: 50,
        appropriatenessScore: 85
      };
    } catch (error) {
      console.error('Error analyzing content:', error);
      throw error;
    }
  }

  async generateReadingRecommendations(userProfile: any, currentProgress: any): Promise<ReadingRecommendation[]> {
    try {
      const prompt = `
        Based on this user's profile and reading progress, recommend 3 Bible passages:
        
        User Profile: ${JSON.stringify(userProfile)}
        Current Progress: ${JSON.stringify(currentProgress)}
        
        Consider:
        - User's spiritual growth stage
        - Reading history and preferences
        - Areas they might need encouragement
        - Appropriate difficulty level
        
        Respond with JSON array:
        [
          {
            "passage": "John 3:16-17",
            "reason": "Perfect for understanding God's love",
            "difficulty": "easy",
            "themes": ["love", "salvation"]
          }
        ]
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      return [
        {
          passage: "Psalm 23",
          reason: "Great for comfort and peace",
          difficulty: "easy",
          themes: ["comfort", "guidance"]
        }
      ];
    } catch (error) {
      console.error('Error generating recommendations:', error);
      throw error;
    }
  }

  async generatePersonalizedInsight(userActivity: any): Promise<string> {
    try {
      const prompt = `
        Generate a personalized, encouraging insight for this user based on their spiritual app activity:
        
        Activity: ${JSON.stringify(userActivity)}
        
        Create a brief, uplifting message (2-3 sentences) that:
        - Acknowledges their progress
        - Provides spiritual encouragement
        - Suggests next steps for growth
        
        Keep it warm, personal, and faith-focused.
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text().trim();
    } catch (error) {
      console.error('Error generating insight:', error);
      return "Keep growing in faith! Your dedication to spiritual growth is inspiring.";
    }
  }

  async moderateContent(content: string): Promise<{ isAppropriate: boolean; reason?: string; suggestions?: string[] }> {
    try {
      const prompt = `
        Review this content for a Christian community app:
        
        Content: "${content}"
        
        Check if it's appropriate based on:
        - Christian values and beliefs
        - Community guidelines
        - Respectful dialogue
        - Constructive contribution
        
        Respond in JSON:
        {
          "isAppropriate": true/false,
          "reason": "explanation if inappropriate",
          "suggestions": ["suggestion1", "suggestion2"] (if inappropriate)
        }
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      return { isAppropriate: true };
    } catch (error) {
      console.error('Error moderating content:', error);
      return { isAppropriate: true };
    }
  }

  async generateCommunityInsights(communityData: any): Promise<any> {
    try {
      const prompt = `
        Analyze this community data and provide insights:
        
        Data: ${JSON.stringify(communityData)}
        
        Provide insights about:
        - Most engaging topics
        - Community growth trends
        - User engagement patterns
        - Content performance
        - Recommendations for community improvement
        
        Respond in JSON format with actionable insights.
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      return {
        trends: ['Growing engagement', 'Active discussions'],
        recommendations: ['Encourage more sharing', 'Create themed discussions']
      };
    } catch (error) {
      console.error('Error generating community insights:', error);
      throw error;
    }
  }

  async generateDynamicHashtags(context: string = ''): Promise<string[]> {
    try {
      const prompt = `
        Generate 15-20 relevant hashtags for a Christian community app based on this context:
        
        Context: "${context}"
        
        Consider:
        - Current Christian trends and topics
        - Seasonal relevance (holidays, events)
        - Biblical themes and concepts
        - Community engagement topics
        - Inspirational and motivational themes
        
        Return only the hashtags as a JSON array, each starting with #:
        ["#hashtag1", "#hashtag2", ...]
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      return ['#faith', '#blessed', '#prayer', '#worship', '#community'];
    } catch (error) {
      console.error('Error generating hashtags:', error);
      return ['#faith', '#blessed', '#prayer', '#worship', '#community'];
    }
  }

  async generateSearchKeywords(type: 'image' | 'video', context: string = ''): Promise<string[]> {
    try {
      console.log(`Generating ${type} keywords with context:`, context);
      
      const prompt = `Generate 5-8 search keywords for finding ${type} content for a Christian community app. 
      
${context ? `Context: "${context}"` : ''}

Requirements:
- Christian themes and biblical concepts
- Inspirational and uplifting content
- Community-relevant topics
- Visual appeal for ${type} content

Respond with ONLY a JSON array of keywords, no other text:
["keyword1", "keyword2", "keyword3"]`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text().trim();
      
      console.log(`Raw ${type} keywords response:`, text);
      
      // Clean up response and extract JSON
      const cleanText = text.replace(/```json\s*/, '').replace(/```\s*$/, '').trim();
      const jsonMatch = cleanText.match(/\[[\s\S]*\]/);
      
      if (jsonMatch) {
        try {
          const keywords = JSON.parse(jsonMatch[0]);
          console.log(`Parsed ${type} keywords:`, keywords);
          if (Array.isArray(keywords) && keywords.length > 0) {
            return keywords;
          }
        } catch (parseError) {
          console.error('Error parsing keywords JSON:', parseError);
        }
      }
      
      throw new Error('Invalid keywords response format');
      
    } catch (error) {
      console.error('Error generating keywords:', error);
      
      // Enhanced fallback keywords
      if (type === 'image') {
        return context.toLowerCase().includes('prayer') ? ['christian prayer', 'hands praying', 'faith inspiration', 'biblical verses'] :
               context.toLowerCase().includes('worship') ? ['christian worship', 'praise music', 'church community', 'spiritual joy'] :
               context.toLowerCase().includes('bible') ? ['open bible', 'scripture reading', 'biblical wisdom', 'holy book'] :
               ['christian inspiration', 'faith quotes', 'biblical scenes', 'worship community', 'spiritual growth'];
      } else {
        return context.toLowerCase().includes('prayer') ? ['christian prayer videos', 'prayer testimonies', 'faith prayers', 'spiritual meditation'] :
               context.toLowerCase().includes('worship') ? ['christian worship songs', 'praise music', 'church worship', 'inspirational music'] :
               context.toLowerCase().includes('bible') ? ['bible study videos', 'scripture teaching', 'biblical sermons', 'christian education'] :
               ['christian worship', 'faith testimonies', 'biblical teachings', 'inspirational stories', 'church community'];
      }
    }
  }

  async generatePostContent(hint: string, includeMedia: 'none' | 'image' | 'video' = 'none'): Promise<{
    content: string;
    suggestedHashtags: string[];
    mediaKeywords?: string[];
  }> {
    try {
      console.log('Starting generatePostContent with hint:', hint);
      
      const prompt = `You are a Christian content creator. Generate engaging social media content based on the following hint. Respond with ONLY a valid JSON object, no other text.

Hint: "${hint}"

Requirements:
- Create inspiring, authentic content (100-300 words)
- Include 3-5 relevant hashtags (starting with #)
- Keep it faith-centered and community-focused
${includeMedia !== 'none' ? `- Include search keywords for ${includeMedia} content` : ''}

JSON format (respond with ONLY this JSON, no markdown or extra text):
{
  "content": "your generated content here",
  "suggestedHashtags": ["#hashtag1", "#hashtag2", "#hashtag3"],
  ${includeMedia !== 'none' ? '"mediaKeywords": ["keyword1", "keyword2", "keyword3"]' : ''}
}`;

      console.log('Sending prompt to Gemini:', prompt);
      
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text().trim();
      
      console.log('Raw Gemini response:', text);
      
      // Clean up the response - remove any markdown formatting
      const cleanText = text.replace(/```json\s*/, '').replace(/```\s*$/, '').trim();
      
      // Try to find JSON in the response
      const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const jsonStr = jsonMatch[0];
        console.log('Extracted JSON:', jsonStr);
        
        try {
          const parsed = JSON.parse(jsonStr);
          console.log('Successfully parsed JSON:', parsed);
          
          // Validate the response has required fields
          if (parsed.content && parsed.suggestedHashtags) {
            return {
              content: parsed.content,
              suggestedHashtags: Array.isArray(parsed.suggestedHashtags) ? parsed.suggestedHashtags : [],
              ...(parsed.mediaKeywords && { mediaKeywords: parsed.mediaKeywords })
            };
          }
        } catch (parseError) {
          console.error('JSON parse error:', parseError);
        }
      }
      
      throw new Error('Invalid response format from Gemini');
      
    } catch (error) {
      console.error('Error generating post content:', error);
      
      // Enhanced fallback content based on hint
      const fallbackContent = this.generateFallbackContent(hint, includeMedia);
      return fallbackContent;
    }
  }

  private generateFallbackContent(hint: string, includeMedia: 'none' | 'image' | 'video'): {
    content: string;
    suggestedHashtags: string[];
    mediaKeywords?: string[];
  } {
    // Create more relevant fallback based on the hint
    const content = `🙏 ${hint.includes('prayer') ? 'Let us join together in prayer' : 
                           hint.includes('bible') || hint.includes('scripture') ? 'The Word of God is our guide and strength' :
                           hint.includes('faith') ? 'Faith moves mountains and transforms hearts' :
                           hint.includes('hope') ? 'Hope anchors our souls in uncertain times' :
                           'God\'s love surrounds us in every moment'}. 

May this message encourage your heart and strengthen your faith journey. Remember, you are loved beyond measure! ✨

Share your thoughts and let's grow together in faith. 💙`;

    const hashtags = hint.includes('prayer') ? ['#Prayer', '#Faith', '#Community', '#Blessed'] :
                    hint.includes('bible') ? ['#Scripture', '#BibleStudy', '#Faith', '#Wisdom'] :
                    hint.includes('worship') ? ['#Worship', '#Praise', '#Faith', '#Joy'] :
                    ['#Faith', '#Blessed', '#Community', '#Hope', '#Love'];

    const result: any = {
      content,
      suggestedHashtags: hashtags
    };

    if (includeMedia !== 'none') {
      result.mediaKeywords = includeMedia === 'image' 
        ? ['christian inspiration', 'faith quotes', 'prayer', 'worship']
        : ['christian worship', 'faith testimonies', 'prayer', 'inspirational music'];
    }

    return result;
  }

  async extractKeywordsFromContent(content: string): Promise<string[]> {
    try {
      const prompt = `
        Extract 3-5 key search terms from this content that would be suitable for finding related images or videos:
        
        Content: "${content}"
        
        Focus on:
        - Main themes and topics
        - Visual concepts that could be represented
        - Emotional tones and feelings
        - Biblical or spiritual elements
        
        Return as JSON array: ["keyword1", "keyword2", ...]
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      return ['christian', 'faith', 'inspiration'];
    } catch (error) {
      console.error('Error extracting keywords:', error);
      return ['christian', 'faith', 'inspiration'];
    }
  }

  async generateTrendingHashtags(): Promise<string[]> {
    try {
      console.log('Making Gemini API call for trending hashtags...');
      
      const prompt = `Generate 15-20 trending Christian hashtags. Respond with ONLY hashtags separated by commas, no other text.

Requirements:
- Each hashtag must start with #
- Mix of general faith and specific biblical terms
- Current spiritual themes and community topics
- Separated by commas only

Example format: #Faith, #Blessed, #Prayer, #Hope, #Scripture, #Worship

Generate hashtags now:`;

      console.log('Sending hashtag prompt to Gemini');
      
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text().trim();
      
      console.log('Raw hashtag response:', text);
      
      // Clean and parse hashtags
      const hashtags = text
        .split(/[,\n]/)
        .map(tag => tag.trim())
        .filter(tag => tag.startsWith('#'))
        .filter(tag => tag.length > 1)
        .slice(0, 20); // Limit to 20 hashtags
      
      console.log('Parsed hashtags:', hashtags);
      
      if (hashtags.length === 0) {
        throw new Error('No valid hashtags found in response');
      }
      
      return hashtags;
    } catch (error) {
      console.error('Error generating trending hashtags:', error);
      
      // Enhanced fallback with more variety
      const currentDate = new Date();
      const month = currentDate.getMonth();
      const seasonalTags = month < 3 ? ['#NewYear', '#Winter', '#Renewal'] :
                          month < 6 ? ['#Spring', '#Easter', '#NewLife'] :
                          month < 9 ? ['#Summer', '#Growth', '#Adventure'] :
                          ['#Autumn', '#Thanksgiving', '#Harvest'];
      
      return [
        '#Faith', '#Blessed', '#Prayer', '#Hope', '#Love', '#Grace',
        '#Worship', '#Scripture', '#Community', '#Inspiration', '#Testimony',
        '#Gratitude', '#ChristianLife', '#Devotion', '#Encouragement',
        '#Faithful', '#Mercy', '#Strength', '#Peace', '#Joy',
        ...seasonalTags
      ];
    }
  }
}

export const geminiService = new GeminiService();
export default geminiService;