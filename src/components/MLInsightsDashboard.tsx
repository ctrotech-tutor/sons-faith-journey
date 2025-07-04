import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { useMLInsights } from '@/lib/hooks/useMLInsights';
import { Brain, BookOpen, TrendingUp, Users, Sparkles, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MLInsightsDashboard = () => {
  const { userInsights, personalizedMessage, recommendations, loading, refreshInsights } = useMLInsights();
  const navigate = useNavigate();

  const getEngagementColor = (level: string) => {
    switch (level) {
      case 'high': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getGrowthStageInfo = (stage: string) => {
    switch (stage) {
      case 'beginner':
        return { color: 'bg-blue-500', progress: 25, description: 'Starting your spiritual journey' };
      case 'growing':
        return { color: 'bg-purple-500', progress: 65, description: 'Developing spiritual maturity' };
      case 'mature':
        return { color: 'bg-green-500', progress: 90, description: 'Spiritually mature and growing' };
      default:
        return { color: 'bg-gray-500', progress: 50, description: 'Growing in faith' };
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-72" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Personalized Message */}
      {personalizedMessage && (
        <Card className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              Your Spiritual Journey Insight
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
              {personalizedMessage}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Main Insights */}
      {userInsights && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Engagement Level */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <TrendingUp className="h-4 w-4" />
                Engagement Level
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${getEngagementColor(userInsights.engagementLevel)}`} />
                <span className="text-lg font-semibold capitalize">
                  {userInsights.engagementLevel}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Your current engagement with the app
              </p>
            </CardContent>
          </Card>

          {/* Spiritual Growth Stage */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Brain className="h-4 w-4" />
                Growth Stage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${getGrowthStageInfo(userInsights.spiritualGrowthStage).color}`} />
                  <span className="text-lg font-semibold capitalize">
                    {userInsights.spiritualGrowthStage}
                  </span>
                </div>
                <Progress value={getGrowthStageInfo(userInsights.spiritualGrowthStage).progress} className="h-2" />
                <p className="text-sm text-muted-foreground">
                  {getGrowthStageInfo(userInsights.spiritualGrowthStage).description}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Interests */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4" />
                Your Interests
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {userInsights.interests.slice(0, 3).map((interest, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {interest}
                  </Badge>
                ))}
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Based on your activity patterns
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Personalized Reading Recommendations
            </CardTitle>
            <CardDescription>
              Scripture passages tailored to your spiritual journey
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recommendations.map((rec, index) => (
                <Card key={index} className="p-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-sm">{rec.passage}</h4>
                      <Badge variant={rec.difficulty === 'easy' ? 'default' : rec.difficulty === 'medium' ? 'secondary' : 'destructive'}>
                        {rec.difficulty}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{rec.reason}</p>
                    <div className="flex flex-wrap gap-1">
                      {rec.themes?.map((theme: string, i: number) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {theme}
                        </Badge>
                      ))}
                    </div>
                    <Button 
                      size="sm" 
                      className="w-full mt-2"
                      onClick={() => navigate(`/bible?search=${encodeURIComponent(rec.passage)}`)}
                    >
                      Read Now
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Recommendations */}
      {userInsights?.recommendations && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              AI-Powered Recommendations
            </CardTitle>
            <CardDescription>
              Personalized suggestions to enhance your spiritual growth
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {userInsights.recommendations.map((rec, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                  <p className="text-sm">{rec}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Refresh Button */}
      <div className="flex justify-center">
        <Button 
          onClick={refreshInsights} 
          variant="outline" 
          className="flex items-center gap-2"
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh Insights
        </Button>
      </div>
    </div>
  );
};

export default MLInsightsDashboard;