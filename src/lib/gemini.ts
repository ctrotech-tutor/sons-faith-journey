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

  async generateTrendingHashtags(context?: { userInterests?: string[], recentTopics?: string[], seasonalContext?: string }): Promise<string[]> {
    try {
      const prompt = `
        Generate 15 trending and relevant hashtags for a Christian community app.
        
        Context: ${JSON.stringify(context || {})}
        
        Consider:
        - Current spiritual seasons (Advent, Lent, Easter, etc.)
        - Popular Christian topics and themes
        - Community engagement patterns
        - User interests and recent discussions
        
        Generate hashtags that are:
        - Spiritually uplifting and meaningful
        - Relevant to Christian faith and life
        - Engaging for community interaction
        - Mix of popular and niche topics
        
        Return as JSON array of hashtag strings (with # symbol):
        ["#Faith", "#Prayer", "#Grace", "#Community", "#Hope", ...]
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      return [
        '#Faith', '#Prayer', '#Grace', '#Hope', '#Love', '#Community',
        '#Worship', '#Bible', '#Jesus', '#God', '#Blessed', '#Testimony',
        '#ChristianLife', '#Devotion', '#Encouragement'
      ];
    } catch (error) {
      console.error('Error generating trending hashtags:', error);
      return [
        '#Faith', '#Prayer', '#Grace', '#Hope', '#Love', '#Community',
        '#Worship', '#Bible', '#Jesus', '#God', '#Blessed', '#Testimony'
      ];
    }
  }

  async generateSearchKeywords(type: 'image' | 'video', context?: { userInterests?: string[], currentSeason?: string, recentActivity?: string[] }): Promise<string[]> {
    try {
      const prompt = `
        Generate 8 intelligent search keywords for ${type} content in a Christian community app.
        
        Context: ${JSON.stringify(context || {})}
        
        Consider:
        - Current spiritual seasons and holidays
        - Popular Christian themes
        - User interests and recent activity
        - Visual content that inspires faith
        
        For ${type} content, generate keywords that would find:
        - Inspirational and uplifting content
        - Christian art, nature, worship scenes
        - Biblical themes and stories
        - Community and fellowship moments
        
        Return as JSON array of search terms:
        ["keyword1", "keyword2", "keyword3", ...]
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      // Fallback keywords based on type
      if (type === 'image') {
        return [
          'faith inspiration', 'christian art', 'biblical landscape', 'prayer hands',
          'cross sunset', 'church architecture', 'nature worship', 'bible verses'
        ];
      } else {
        return [
          'christian worship', 'praise music', 'sermon highlights', 'biblical stories',
          'faith testimony', 'prayer service', 'gospel songs', 'christian devotional'
        ];
      }
    } catch (error) {
      console.error('Error generating search keywords:', error);
      // Fallback keywords
      if (type === 'image') {
        return ['faith inspiration', 'christian art', 'biblical landscape', 'prayer'];
      } else {
        return ['christian worship', 'praise music', 'sermon', 'gospel'];
      }
    }
  }
}

export const geminiService = new GeminiService();
export default geminiService;