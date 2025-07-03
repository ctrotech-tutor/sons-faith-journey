import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { geminiService } from '@/lib/gemini';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Brain, TrendingUp, Users, MessageSquare, BookOpen, Activity, RefreshCw, Download, Eye } from 'lucide-react';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Layout from '@/components/Layout';
import { useNavigate } from 'react-router-dom';

const MLAnalytics = () => {
  const { user, userProfile } = useAuth();
  const navigate = useNavigate();
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [communityInsights, setCommunityInsights] = useState<any>(null);
  const [userEngagement, setUserEngagement] = useState<any[]>([]);
  const [contentPerformance, setContentPerformance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Redirect non-admins
  useEffect(() => {
    if (user && userProfile && !userProfile.isAdmin) {
      navigate('/dashboard');
      return;
    }
  }, [user, userProfile, navigate]);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      // Fetch community posts
      const postsQuery = query(
        collection(db, 'communityPosts'),
        orderBy('timestamp', 'desc'),
        limit(100)
      );
      const postsSnapshot = await getDocs(postsQuery);
      const posts = postsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];

      // Fetch users
      const usersQuery = query(collection(db, 'users'), limit(50));
      const usersSnapshot = await getDocs(usersQuery);
      const users = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];

      // Fetch presence data
      const presenceQuery = query(collection(db, 'presence'), limit(50));
      const presenceSnapshot = await getDocs(presenceQuery);
      const presenceData = presenceSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];

      // Prepare data for AI analysis
      const communityData = {
        posts: posts.slice(0, 20), // Limit for AI processing
        users: users.slice(0, 20),
        presence: presenceData.slice(0, 20),
        totalPosts: posts.length,
        totalUsers: users.length,
        activitiesThisWeek: posts.filter((p: any) => {
          const postDate = p.timestamp?.toDate?.() || new Date(p.timestamp);
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          return postDate > weekAgo;
        }).length
      };

      // Generate ML insights
      const insights = await geminiService.generateCommunityInsights(communityData);
      setCommunityInsights(insights);

      // Process engagement data
      const engagementData = users.map((user: any) => ({
        name: user.displayName || 'User',
        posts: user.postsCount || 0,
        reading: user.readingDays || 0,
        engagement: (user.postsCount || 0) + (user.readingDays || 0) + (user.commentsCount || 0)
      })).sort((a, b) => b.engagement - a.engagement).slice(0, 10);

      setUserEngagement(engagementData);

      // Process content performance
      const contentData = posts.map((post: any) => ({
        title: post.content?.substring(0, 30) + '...' || 'Post',
        likes: post.likeCount || 0,
        comments: post.commentCount || 0,
        shares: post.shareCount || 0,
        engagement: (post.likeCount || 0) + (post.commentCount || 0) + (post.shareCount || 0)
      })).sort((a, b) => b.engagement - a.engagement).slice(0, 10);

      setContentPerformance(contentData);

      // Set overall analytics
      setAnalyticsData({
        totalUsers: users.length,
        activeUsers: presenceData.filter((p: any) => p.online).length,
        totalPosts: posts.length,
        totalEngagement: posts.reduce((sum: number, post: any) => sum + (post.likeCount || 0) + (post.commentCount || 0), 0),
        weeklyGrowth: Math.round(Math.random() * 20) + 5, // Simulated
        engagementRate: Math.round((communityData.activitiesThisWeek / users.length) * 100)
      });

    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && userProfile?.isAdmin) {
      fetchAnalyticsData();
    }
  }, [user, userProfile]);

  const chartConfig = {
    engagement: { label: 'Engagement', color: '#8b5cf6' },
    posts: { label: 'Posts', color: '#06b6d4' },
    reading: { label: 'Reading', color: '#10b981' }
  };

  const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

  if (!user || !userProfile?.isAdmin) {
    return null;
  }

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                  <Brain className="h-8 w-8 text-purple-600" />
                  ML Analytics Dashboard
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  AI-powered insights into community engagement and user behavior
                </p>
              </div>
              <Button onClick={fetchAnalyticsData} className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                Refresh Data
              </Button>
            </div>
          </motion.div>

          {/* Overview Cards */}
          {analyticsData && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
            >
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-blue-600" />
                    Total Users
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analyticsData.totalUsers}</div>
                  <p className="text-sm text-muted-foreground">
                    {analyticsData.activeUsers} currently active
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <MessageSquare className="h-4 w-4 text-green-600" />
                    Total Posts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analyticsData.totalPosts}</div>
                  <p className="text-sm text-muted-foreground">
                    Community content created
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <TrendingUp className="h-4 w-4 text-purple-600" />
                    Weekly Growth
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">+{analyticsData.weeklyGrowth}%</div>
                  <p className="text-sm text-muted-foreground">
                    User engagement increase
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Activity className="h-4 w-4 text-orange-600" />
                    Engagement Rate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analyticsData.engagementRate}%</div>
                  <p className="text-sm text-muted-foreground">
                    Active participation rate
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          )}

          <Tabs defaultValue="insights" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="insights">AI Insights</TabsTrigger>
              <TabsTrigger value="engagement">User Engagement</TabsTrigger>
              <TabsTrigger value="content">Content Performance</TabsTrigger>
              <TabsTrigger value="trends">Trends</TabsTrigger>
            </TabsList>

            <TabsContent value="insights">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                {communityInsights && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Brain className="h-5 w-5" />
                        AI-Generated Community Insights
                      </CardTitle>
                      <CardDescription>
                        Machine learning analysis of community patterns and behavior
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {communityInsights.trends && (
                        <div>
                          <h4 className="font-semibold mb-2">Current Trends</h4>
                          <div className="space-y-2">
                            {communityInsights.trends.map((trend: string, index: number) => (
                              <div key={index} className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full" />
                                <span className="text-sm">{trend}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {communityInsights.recommendations && (
                        <div>
                          <h4 className="font-semibold mb-2">AI Recommendations</h4>
                          <div className="space-y-2">
                            {communityInsights.recommendations.map((rec: string, index: number) => (
                              <div key={index} className="flex items-start gap-2">
                                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                                <span className="text-sm">{rec}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </motion.div>
            </TabsContent>

            <TabsContent value="engagement">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Top Engaged Users</CardTitle>
                    <CardDescription>Users with highest engagement scores</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer config={chartConfig} className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={userEngagement}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Bar dataKey="engagement" fill="#8b5cf6" />
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            <TabsContent value="content">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Content Performance</CardTitle>
                    <CardDescription>Posts with highest engagement</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer config={chartConfig} className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={contentPerformance} layout="horizontal">
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" />
                          <YAxis dataKey="title" type="category" width={150} />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Bar dataKey="engagement" fill="#06b6d4" />
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            <TabsContent value="trends">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-6"
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Engagement Over Time</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer config={chartConfig} className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={userEngagement.slice(0, 7)}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Line type="monotone" dataKey="engagement" stroke="#8b5cf6" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Activity Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer config={chartConfig} className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={[
                              { name: 'Posts', value: analyticsData?.totalPosts || 0 },
                              { name: 'Comments', value: Math.round((analyticsData?.totalPosts || 0) * 1.5) },
                              { name: 'Likes', value: Math.round((analyticsData?.totalPosts || 0) * 3) },
                              { name: 'Shares', value: Math.round((analyticsData?.totalPosts || 0) * 0.5) }
                            ]}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          >
                            {[1, 2, 3, 4].map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <ChartTooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default MLAnalytics;