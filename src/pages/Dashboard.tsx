
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Navigate } from 'react-router-dom';
import { collection, getDocs, query, orderBy, limit, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, Check, MessageCircle, Calendar, Heart, Users } from 'lucide-react';
import Layout from '@/components/Layout';
import ReadingTracker from '@/components/ReadingTracker';
import PrayerWall from '@/components/PrayerWall';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Devotional {
  id: string;
  title: string;
  content: string;
  scripture: string;
  date: Date;
  imageUrl?: string;
  reactions?: {
    amen: string[];
    blessed: string[];
    shared: string[];
  };
}

interface VerseOfDay {
  id: string;
  verse: string;
  reference: string;
  date: Date;
}

const Dashboard = () => {
  const { user, userProfile, loading } = useAuth();
  const [dailyReading, setDailyReading] = useState<Devotional | null>(null);
  const [verseOfDay, setVerseOfDay] = useState<VerseOfDay | null>(null);
  const [activeUsers, setActiveUsers] = useState(0);

  useEffect(() => {
    if (user) {
      fetchTodaysContent();
      fetchActiveUsers();
    }
  }, [user]);

  const fetchTodaysContent = async () => {
    try {
      // Fetch today's devotional
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const devotionalsQuery = query(
        collection(db, 'devotionals'),
        where('date', '>=', today),
        orderBy('date', 'asc'),
        limit(1)
      );


      const devotionalSnapshot = await getDocs(devotionalsQuery);

      if (!devotionalSnapshot.empty) {
        const doc = devotionalSnapshot.docs[0];
        setDailyReading({
          id: doc.id,
          ...doc.data()
        } as Devotional);
      } else {
        // Default devotional
        setDailyReading({
          id: 'default',
          title: 'Welcome to Your Journey',
          content: 'Welcome to THE SONS 90-day Bible Reading Challenge! Today marks the beginning of your spiritual journey. Take a moment to pray and ask God to open your heart to His word.',
          scripture: 'Psalm 119:105 - "Your word is a lamp for my feet, a light on my path."',
          date: new Date(),
          reactions: { amen: [], blessed: [], shared: [] }
        });
      }

      // Fetch verse of the day
      const verseQuery = query(
        collection(db, 'versesOfDay'),
        where('date', '>=', today),
        orderBy('date', 'asc'),
        limit(1)
      );
      const verseSnapshot = await getDocs(verseQuery);

      if (!verseSnapshot.empty) {
        const doc = verseSnapshot.docs[0];
        setVerseOfDay({
          id: doc.id,
          ...doc.data()
        } as VerseOfDay);
      } else {
        // Default verse
        setVerseOfDay({
          id: 'default',
          verse: 'For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, to give you hope and a future.',
          reference: 'Jeremiah 29:11',
          date: new Date()
        });
      }
    } catch (error) {
      console.error('Error fetching content:', error);
    }
  };

  const fetchActiveUsers = async () => {
    try {
      const today = new Date().toDateString();
      const usersQuery = query(collection(db, 'users'));
      const usersSnapshot = await getDocs(usersQuery);

      let activeCount = 0;
      usersSnapshot.docs.forEach(doc => {
        const userData = doc.data();
        if (userData.readingProgress && userData.readingProgress[today]) {
          activeCount++;
        }
      });

      setActiveUsers(activeCount);
    } catch (error) {
      console.error('Error fetching active users:', error);
    }
  };

  const openWhatsApp = () => {
    window.open('https://chat.whatsapp.com/Bxu5l4wv77nJZqfVxGktPI', '_blank');
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-6 h-16 w-16 rounded-full border-4 border-purple-300 border-t-purple-600 animate-spin shadow-lg"></div>
            <p className="text-gray-600">Loading your dashboard...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return (
    <Layout>
      <div className="min-h-screen bg-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="text-center mb-8 space-y-2"
          >
            <h1 className="text-2xl md:text-4xl font-extrabold bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 text-transparent bg-clip-text">
              {getGreeting()}, {userProfile?.displayName || 'Beloved'}!
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-sm text-gray-600"
            >
              Continue your faith journey today
            </motion.p>

            {activeUsers > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
              >
                <Badge
                  variant="secondary"
                  className="mt-3 inline-flex items-center gap-1 text-xs bg-purple-100 text-purple-800 dark:bg-purple-800/20 dark:text-purple-300 animate-pulse"
                >
                  <Users className="h-3 w-3" />
                  {activeUsers} others completed today's reading
                </Badge>
              </motion.div>
            )}
          </motion.div>


          <Tabs defaultValue="devotion" className="space-y-6">
            <TabsList className="overflow-x-auto justify-around w-full no-scrollbar">
              <TabsTrigger value="devotion" className="inline-block text-center">Today's Devotion</TabsTrigger>
              <TabsTrigger value="tracker" className="inline-block text-center">Reading Tracker</TabsTrigger>
              <TabsTrigger value="prayer" className="inline-block text-center">Prayer Wall</TabsTrigger>
              <TabsTrigger value="community" className="inline-block text-center">Community</TabsTrigger>
            </TabsList>
            <TabsContent value="devotion" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2">
                  {/* Today's Reading */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <BookOpen className="h-5 w-5 text-purple-600" />
                          <span>Today's Devotion</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {dailyReading && (
                          <div className="space-y-4">
                            <h3 className="text-xl font-semibold text-gray-900">
                              {dailyReading.title}
                            </h3>

                            {dailyReading.imageUrl && (
                              <img
                                src={dailyReading.imageUrl}
                                alt={dailyReading.title}
                                className="w-full h-48 object-cover rounded-lg"
                              />
                            )}

                            <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-600">
                              <p className="text-purple-800 font-medium">
                                {dailyReading.scripture}
                              </p>
                            </div>


                            <div className="prose prose-sm max-w-none">
                              <p className="text-gray-700 hidden leading-relaxed whitespace-pre-wrap">
                                {dailyReading.content}
                              </p>
                              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {dailyReading.content}
                              </ReactMarkdown>
                            </div>

                            {/* Reactions */}
                            <div className="flex items-center gap-4 pt-4 border-t w-full overflow-x-auto">
                              <Button variant="outline" size="sm">
                                <Heart className="h-4 w-4 mr-1" />
                                Amen ({dailyReading.reactions?.amen?.length || 0})
                              </Button>
                              <Button variant="outline" size="sm">
                                ✨ Blessed ({dailyReading.reactions?.blessed?.length || 0})
                              </Button>
                              <Button variant="outline" size="sm">
                                📖 Share ({dailyReading.reactions?.shared?.length || 0})
                              </Button>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  {/* Verse of the Day */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Card className="bg-gradient-to-r from-purple-600 to-purple-700 text-white">
                      <CardContent className="p-6">
                        <h3 className="text-lg font-semibold mb-3">Verse of the Day</h3>
                        {verseOfDay && (
                          <div>
                            <p className="text-purple-100 leading-relaxed italic mb-2">
                              "{verseOfDay.verse}"
                            </p>
                            <p className="text-purple-200 text-sm font-medium">
                              — {verseOfDay.reference}
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>

                  {/* Quick Stats */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <Calendar className="h-5 w-5 text-purple-600" />
                          <span>Challenge Progress</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-center">
                          <div className="text-3xl font-bold text-purple-600 mb-2">
                            Day {Math.ceil((new Date().getTime() - new Date('2025-06-01').getTime()) / (1000 * 60 * 60 * 24)) || 1}
                          </div>
                          <p className="text-gray-600 mb-4">of 90-day challenge</p>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-purple-600 h-2 rounded-full"
                              style={{ width: `${Math.min(((Math.ceil((new Date().getTime() - new Date('2025-06-01').getTime()) / (1000 * 60 * 60 * 24)) || 1) / 90) * 100, 100)}%` }}
                            ></div>
                          </div>
                          <p className="text-sm text-gray-500 mt-2">
                            {Math.min(Math.round(((Math.ceil((new Date().getTime() - new Date('2025-06-01').getTime()) / (1000 * 60 * 60 * 24)) || 1) / 90) * 100), 100)}% Complete
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="tracker">
              <ReadingTracker />
            </TabsContent>

            <TabsContent value="prayer">
              <PrayerWall />
            </TabsContent>

            <TabsContent value="community" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <MessageCircle className="h-5 w-5 text-purple-600" />
                    <span>Community</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center space-y-4">
                    <p className="text-gray-600">
                      Connect with fellow believers on this journey
                    </p>
                    <Button
                      onClick={openWhatsApp}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Join WhatsApp Group
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Encouragement Card */}
              <Card className="bg-yellow-50 border-yellow-200">
                <CardContent className="p-6">
                  <h4 className="font-semibold text-yellow-800 mb-2">
                    Daily Encouragement
                  </h4>
                  <p className="text-yellow-700">
                    Remember, this journey is not about perfection but about progress.
                    God meets you exactly where you are. Keep pressing forward!
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
