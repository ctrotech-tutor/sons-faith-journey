
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, Users, MessageCircle, Heart, CheckCircle, LogIn, Calendar, Target, Trophy, Star } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import CountdownTimer from '@/components/CountdownTimer';
import Layout from '@/components/Layout';
import { Footer } from '@/components/Footer';
import FeaturesSection from '@/components/FeaturesSection';
import QuoteCard from '@/components/DailyQuote';
import CTASection from '@/components/CTASection';

const Index = () => {
  const { user, userProfile } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [showWhatsAppLink, setShowWhatsAppLink] = useState(false);

  useEffect(() => {
    if (location.state?.showWhatsAppLink || (user && userProfile?.joinedWhatsApp)) {
      setShowWhatsAppLink(true);
    }
  }, [location.state, user, userProfile]);

  const features = [
    {
      icon: BookOpen,
      title: 'Structured Bible Reading',
      description: '90-day journey through carefully selected passages designed for spiritual growth and understanding',
    },
    {
      icon: Target,
      title: 'Progress Tracking',
      description: 'Monitor your reading streaks, completion rates, and spiritual milestones with detailed analytics',
    },
    {
      icon: MessageCircle,
      title: 'Community Discussions',
      description: 'Engage in meaningful conversations about faith, share insights, and support one another',
    },
    {
      icon: Users,
      title: 'Brotherhood & Accountability',
      description: 'Connect with like-minded men committed to growth, purpose, and authentic relationships',
    },
  ];

  const openWhatsApp = () => {
    window.open('https://chat.whatsapp.com/Bxu5l4wv77nJZqfVxGktPI', '_blank');
  };

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 text-white dark:bg-gradient-to-br dark:from-purple-900 dark:via-purple-800 dark:to-indigo-900 rounded-b-[50px] pt-16 pb-20 px-4 md:px-12">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
          <div className="absolute top-16 left-10 w-72 h-72 bg-gradient-to-r from-purple-400 to-indigo-400 rounded-full mix-blend-multiply filter blur-3xl animate-[pulse_8s_ease-in-out_infinite] dark:from-purple-500 dark:to-indigo-500" />
          <div className="absolute top-32 right-10 w-80 h-80 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full mix-blend-multiply filter blur-3xl animate-[pulse_10s_ease-in-out_infinite] delay-1000 dark:from-blue-500 dark:to-purple-500" />
          <div className="absolute bottom-10 left-1/3 w-72 h-72 bg-gradient-to-r from-indigo-400 to-blue-400 rounded-full mix-blend-multiply filter blur-3xl animate-[pulse_12s_ease-in-out_infinite] delay-2000 dark:from-indigo-500 dark:to-blue-500" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center space-y-12">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black border-none mb-8 px-6 py-2 text-sm font-semibold">
                🔥 90-Day Challenge • Starting June 1st
              </Badge>
              <h1 className="text-6xl md:text-8xl font-bold mb-8 bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent">
                THE SONS
              </h1>
              <p className="text-2xl md:text-3xl text-purple-100 max-w-4xl mx-auto leading-relaxed">
                Rooted in Faith. Built for Purpose. Growing Together.
              </p>
              <p className="text-lg text-purple-200 max-w-2xl mx-auto mt-4">
                Join a brotherhood of men committed to spiritual growth, authentic relationships, and purposeful living through God's Word.
              </p>
            </motion.div>

            {/* Stats Section */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto"
            >
              <div className="text-center p-4 bg-white/10 backdrop-blur-sm rounded-xl">
                <div className="text-3xl font-bold">90</div>
                <div className="text-sm text-purple-200">Days of Growth</div>
              </div>
              <div className="text-center p-4 bg-white/10 backdrop-blur-sm rounded-xl">
                <div className="text-3xl font-bold">3</div>
                <div className="text-sm text-purple-200">Months Journey</div>
              </div>
              <div className="text-center p-4 bg-white/10 backdrop-blur-sm rounded-xl">
                <div className="text-3xl font-bold">∞</div>
                <div className="text-sm text-purple-200">Lasting Impact</div>
              </div>
              <div className="text-center p-4 bg-white/10 backdrop-blur-sm rounded-xl">
                <div className="text-3xl font-bold">1</div>
                <div className="text-sm text-purple-200">Brother/Sisterhood</div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className=""
            >

              <CountdownTimer />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className=""
            >
              {user ? (
                <div className="space-y-6">
                  <div className="text-center p-6 bg-white/10 backdrop-blur-sm rounded-2xl">
                    <Avatar className="w-24 h-24 mx-auto mb-4 shadow-sm">
                      <AvatarImage src={userProfile?.profilePhoto || '/default-avatar.png'} alt={userProfile?.displayName || 'User Avatar'} />
                      <AvatarFallback>{userProfile?.displayName?.charAt(0) || 'U'}</AvatarFallback>
                    </Avatar>
                    <h3 className="text-2xl font-bold mb-2">Welcome back, {userProfile?.displayName || 'Warrior'}!</h3>
                    <p className="text-purple-200 mb-4">Ready to continue your spiritual journey?</p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <Button asChild size="lg" className="bg-white text-purple-700 hover:bg-purple-50">
                        <Link to="/reading">Continue Reading</Link>
                      </Button>
                      <Button asChild size="lg" variant="outline" className="border-white text-purple-700 hover:bg-white hover:text-purple-700">
                        <Link to="/community">Join Discussion</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row gap-6 justify-center">
                    <Button
                      onClick={() => navigate('/auth/login')}
                      size="lg"
                      className="bg-white text-purple-700 hover:bg-purple-50 text-lg py-4 px-8 gap-2"
                    >
                      <LogIn className="h-5 w-5" />
                      Continue Your Journey
                    </Button>
                    <Button
                      onClick={() => navigate('/auth/register')}
                      size="lg"
                      variant="outline"
                      className="border-white text-purple-700 hover:bg-white hover:text-purple-700 text-lg py-4 px-8"
                    >
                      Join The Sons
                    </Button>
                  </div>
                </div>
              )}

              {showWhatsAppLink && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-8 p-6 bg-green-600/20 border border-green-400/30 rounded-xl backdrop-blur-sm"
                >
                  <div className="flex items-center justify-center space-x-3 mb-4">
                    <CheckCircle className="h-6 w-6 text-purple-300" />
                    <span className="text-purple-200 font-semibold text-lg">
                      Registration Successful!
                    </span>
                  </div>
                  <Button
                    onClick={openWhatsApp}
                    className="bg-purple-600 hover:bg-purple-700 text-white w-full"
                    size="lg"
                  >
                    Join WhatsApp Community
                  </Button>
                </motion.div>
              )}

              <div className="mt-12">
                <button
                  onClick={() =>
                    document
                      .getElementById('features')
                      ?.scrollIntoView({ behavior: 'smooth' })
                  }
                  className="text-purple-200 hover:text-white transition-colors text-lg font-medium flex items-center mx-auto gap-2"
                >
                  Discover More <span className="animate-bounce">↓</span>
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="bg-gradient-to-br from-white to-purple-50 py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <Badge className="bg-purple-100 text-purple-700 mb-4 hover:text-white">What We Offer</Badge>
          <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Your Journey Awaits
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Experience transformation through structured study, meaningful community, and accountability that actually works.
          </p>
        </motion.div>

        <FeaturesSection features={features} />

        {/* Journey Path */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mt-20"
        >
          <h3 className="text-3xl font-bold text-center mb-12 text-gray-900">Your 90-Day Path</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center p-6 border-2 border-purple-100">
              <CardContent className="p-6">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="h-8 w-8 text-purple-600" />
                </div>
                <h4 className="text-xl font-bold mb-2">Month 1: Knowing God</h4>
                <p className="text-gray-600">Foundation building through understanding God's character and nature</p>
              </CardContent>
            </Card>
            <Card className="text-center p-6 border-2 border-blue-100">
              <CardContent className="p-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="h-8 w-8 text-blue-600" />
                </div>
                <h4 className="text-xl font-bold mb-2">Month 2: Walking with God</h4>
                <p className="text-gray-600">Developing daily practices and deepening your relationship</p>
              </CardContent>
            </Card>
            <Card className="text-center p-6 border-2 border-green-100">
              <CardContent className="p-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-green-600" />
                </div>
                <h4 className="text-xl font-bold mb-2">Month 3: Serving God</h4>
                <p className="text-gray-600">Living out your faith through service and community impact</p>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        <div className="mt-20 mb-2">
          <QuoteCard />
        </div>

        <CTASection
          headline="Ready to Transform Your Life?"
          description="Join hundreds of men who are discovering purpose, building character, and growing in faith. Your transformation starts with one decision."
        />
      </section>

      <Footer withLinks />
    </Layout>
  );
};

export default Index;
