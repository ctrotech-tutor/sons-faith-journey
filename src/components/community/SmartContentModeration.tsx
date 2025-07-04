import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useMLInsights } from '@/lib/hooks/useMLInsights';
import { AlertTriangle, CheckCircle, MessageCircle, TrendingUp } from 'lucide-react';

interface SmartContentModerationProps {
  content: string;
  contentType: 'post' | 'comment';
  onModerationResult?: (result: any) => void;
  onContentAnalysis?: (analysis: any) => void;
}

const SmartContentModeration: React.FC<SmartContentModerationProps> = ({
  content,
  contentType,
  onModerationResult,
  onContentAnalysis
}) => {
  const { analyzeContent, moderateContent } = useMLInsights();
  const [analysis, setAnalysis] = useState<any>(null);
  const [moderation, setModeration] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (content.trim().length > 10) {
      analyzeContentWithML();
    }
  }, [content]);

  const analyzeContentWithML = async () => {
    if (!content.trim()) return;

    setLoading(true);
    try {
      // Analyze content
      const contentAnalysis = await analyzeContent(content, contentType);
      if (contentAnalysis) {
        setAnalysis(contentAnalysis);
        onContentAnalysis?.(contentAnalysis);
      }

      // Moderate content
      const moderationResult = await moderateContent(content);
      setModeration(moderationResult);
      onModerationResult?.(moderationResult);
    } catch (error) {
      console.error('Error in content analysis:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-600 bg-green-50 border-green-200';
      case 'negative': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  const getEngagementLevel = (score: number) => {
    if (score >= 80) return { level: 'High', color: 'bg-green-500' };
    if (score >= 60) return { level: 'Medium', color: 'bg-yellow-500' };
    return { level: 'Low', color: 'bg-red-500' };
  };

  if (!content.trim() || content.length < 10) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Moderation Alert */}
      {moderation && !moderation.isAppropriate && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p><strong>Content may need review:</strong> {moderation.reason}</p>
              {moderation.suggestions && (
                <div>
                  <p className="font-medium">Suggestions:</p>
                  <ul className="list-disc list-inside text-sm">
                    {moderation.suggestions.map((suggestion: string, index: number) => (
                      <li key={index}>{suggestion}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Content Analysis Results */}
      {analysis && (
        <Card className="border-dashed">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <MessageCircle className="h-4 w-4" />
              AI Content Analysis
              {loading && <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Sentiment Analysis */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Sentiment:</span>
              <Badge className={getSentimentColor(analysis.sentiment)}>
                {analysis.sentiment}
              </Badge>
            </div>

            {/* Engagement Potential */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Engagement Potential:</span>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${getEngagementLevel(analysis.engagementPotential).color}`} />
                <span className="text-sm font-medium">
                  {getEngagementLevel(analysis.engagementPotential).level} ({analysis.engagementPotential}%)
                </span>
              </div>
            </div>

            {/* Appropriateness Score */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Appropriateness:</span>
              <div className="flex items-center gap-2">
                {analysis.appropriatenessScore >= 85 ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                )}
                <span className="text-sm font-medium">{analysis.appropriatenessScore}%</span>
              </div>
            </div>

            {/* Topics */}
            {analysis.topics && analysis.topics.length > 0 && (
              <div className="space-y-2">
                <span className="text-sm font-medium">Topics:</span>
                <div className="flex flex-wrap gap-1">
                  {analysis.topics.map((topic: string, index: number) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {topic}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Spiritual Themes */}
            {analysis.spiritualThemes && analysis.spiritualThemes.length > 0 && (
              <div className="space-y-2">
                <span className="text-sm font-medium">Spiritual Themes:</span>
                <div className="flex flex-wrap gap-1">
                  {analysis.spiritualThemes.map((theme: string, index: number) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {theme}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Success Indication */}
      {moderation?.isAppropriate && analysis?.appropriatenessScore >= 85 && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Content looks great! This post promotes positive engagement and aligns with community values.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default SmartContentModeration;