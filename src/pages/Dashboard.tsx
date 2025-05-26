
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Check, MessageCircle, Calendar } from 'lucide-react';
import Layout from '@/components/Layout';

interface Devotional {
  id: string;
  title: string;
  content: string;
  scripture: string;
  date: Date;
}

const Dashboard = () => {
  const [dailyReading, setDailyReading] = useState<Devotional | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [verseOfDay] = useState("'For I know the plans I have for you,' declares the Lord, 'plans to prosper you and not to harm you, to give you hope and a future.' - Jeremiah 29:11");

  useEffect(() => {
    const fetchTodaysReading = async () => {
      try {
        const devotionalsQuery = query(
          collection(db, 'devotionals'),
          orderBy('date', 'desc'),
          limit(1)
        );
        const querySnapshot = await getDocs(devotionalsQuery);
        
        if (!querySnapshot.empty) {
          const doc = querySnapshot.docs[0];
          setDailyReading({
            id: doc.id,
            ...doc.data()
          } as Devotional);
        } else {
          // Default devotional if none exists
          setDailyReading({
            id: 'default',
            title: 'Welcome to Your Journey',
            content: 'Welcome to THE SONS 90-day Bible Reading Challenge! Today marks the beginning of your spiritual journey. Take a moment to pray and ask God to open your heart to His word.',
            scripture: 'Psalm 119:105 - "Your word is a lamp for my feet, a light on my path."',
            date: new Date()
          });
        }
      } catch (error) {
        console.error('Error fetching devotional:', error);
      }
    };

    fetchTodaysReading();

    // Check if today's reading is completed
    const today = new Date().toDateString();
    const completed = localStorage.getItem(`reading-${today}`) === 'true';
    setIsCompleted(completed);
  }, []);

  const markAsCompleted = () => {
    const today = new Date().toDateString();
    localStorage.setItem(`reading-${today}`, 'true');
    setIsCompleted(true);
  };

  const openWhatsApp = () => {
    window.open('https://chat.whatsapp.com/Bxu5l4wv77nJZqfVxGktPI', '_blank');
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Welcome Back to THE SONS
            </h1>
            <p className="text-gray-600">Continue your faith journey today</p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Today's Reading */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center space-x-2">
                        <BookOpen className="h-5 w-5 text-purple-600" />
                        <span>Today's Reading</span>
                      </CardTitle>
                      {isCompleted && (
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          <Check className="h-4 w-4 mr-1" />
                          Completed
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {dailyReading && (
                      <div className="space-y-4">
                        <h3 className="text-xl font-semibold text-gray-900">
                          {dailyReading.title}
                        </h3>
                        <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-600">
                          <p className="text-purple-800 font-medium">
                            {dailyReading.scripture}
                          </p>
                        </div>
                        <p className="text-gray-700 leading-relaxed">
                          {dailyReading.content}
                        </p>
                        {!isCompleted && (
                          <Button
                            onClick={markAsCompleted}
                            className="bg-purple-600 hover:bg-purple-700"
                          >
                            Mark as Completed
                          </Button>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Verse of the Day */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="bg-gradient-to-r from-purple-600 to-purple-700 text-white">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-3">Verse of the Day</h3>
                    <p className="text-purple-100 leading-relaxed italic">
                      {verseOfDay}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Progress Card */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Calendar className="h-5 w-5 text-purple-600" />
                      <span>Progress</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-purple-600 mb-2">
                        Day 1
                      </div>
                      <p className="text-gray-600 mb-4">of 90-day challenge</p>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-purple-600 h-2 rounded-full"
                          style={{ width: '1.1%' }}
                        ></div>
                      </div>
                      <p className="text-sm text-gray-500 mt-2">1.1% Complete</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Community Card */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <MessageCircle className="h-5 w-5 text-purple-600" />
                      <span>Community</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">
                      Connect with fellow believers on this journey
                    </p>
                    <Button
                      onClick={openWhatsApp}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      Join WhatsApp Group
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Encouragement Card */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Card className="bg-yellow-50 border-yellow-200">
                  <CardContent className="p-4">
                    <h4 className="font-semibold text-yellow-800 mb-2">
                      Daily Encouragement
                    </h4>
                    <p className="text-yellow-700 text-sm">
                      Remember, this journey is not about perfection but about progress. 
                      God meets you exactly where you are.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
