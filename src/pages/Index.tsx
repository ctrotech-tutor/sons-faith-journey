
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, Users, MessageCircle, Heart, CheckCircle, LogIn, Calendar, Target, Trophy, Star, Flame } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import CountdownTimer from '@/components/CountdownTimer';
import Layout from '@/components/Layout';
import { Footer } from '@/components/Footer';
import FeaturesSection from '@/components/FeaturesSection';
import QuoteCard from '@/components/DailyQuote';
import CTASection from '@/components/CTASection';
import JourneyPath from '@/components/JourneyPath';
import Navigation from '@/components/Navigation';

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
    <>
      <Navigation />
      {/* Hero Section */}
      <section className="relative overflow-hidden text-white rounded-b-[50px] dark:rounded-none pt-5 bg-purple-600 dark:bg-gray-900">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
          <div className="absolute top-16 left-10 w-72 h-72 bg-gradient-to-r from-purple-400 to-indigo-400 rounded-full mix-blend-multiply filter blur-3xl animate-[pulse_8s_ease-in-out_infinite]" />
          <div className="absolute top-32 right-10 w-80 h-80 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full mix-blend-multiply filter blur-3xl animate-[pulse_10s_ease-in-out_infinite] delay-1000" />
          <div className="absolute bottom-10 left-1/3 w-72 h-72 bg-gradient-to-r from-indigo-400 to-blue-400 rounded-full mix-blend-multiply filter blur-3xl animate-[pulse_12s_ease-in-out_infinite] delay-2000" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black border-none mb-8 px-6 py-2 text-sm font-semibold">
                <Flame className="inline-block mr-2" /> 90-Day Challenge • Starting June 1st
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

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl px-4 sm:px-6 mx-auto mt-16"
            >
              {[
                { value: "90", label: "Days of Growth" },
                { value: "3", label: "Months Journey" },
                { value: "∞", label: "Lasting Impact" },
                { value: "1", label: "Brethren in Christ" },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.03 }}
                  className="bg-white/10 dark:bg-white/5 backdrop-blur-md border border-white/20 dark:border-purple-300/10 rounded-2xl shadow-md p-6 text-center transition-all duration-300 hover:shadow-xl"
                >
                  <div className="text-4xl sm:text-5xl font-extrabold text-white drop-shadow-sm tracking-tight">
                    {stat.value}
                  </div>
                  <div className="mt-2 text-sm text-purple-200 dark:text-purple-300 font-medium tracking-wide uppercase">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </motion.div>


            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className=""
            >

              <CountdownTimer />
            </motion.div>
          </div>
        </div>
      </section>
      <section className="bg-white dark:bg-gray-900 text-center px-4 pt-16 dark:pt-0 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className=""
        >
          {user ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className=""
            >
              <div className="bg-white/70 dark:bg-gray-800/50 backdrop-blur-md border border-purple-300/30 dark:border-gray-600/20 shadow-md hover:shadow-xl rounded-2xl p-6 text-center cursor-pointer transition-all duration-300 ease-in-out">
                <Avatar className="w-24 h-24 mx-auto mb-5 shadow-lg ring-2 ring-white/80 dark:ring-white/30">
                  <AvatarImage
                    src={userProfile?.profilePhoto || '/default-avatar.png'}
                    alt={userProfile?.displayName || 'User Avatar'}
                  />
                  <AvatarFallback>
                    {userProfile?.displayName?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>

                <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  Welcome back, {userProfile?.displayName || 'Warrior'}!
                </h3>
                <p className="text-purple-600 dark:text-purple-200 text-sm md:text-base mb-6">
                  Ready to continue your spiritual journey?
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    asChild
                    size="lg"
                    className="bg-purple-600 text-white hover:bg-purple-700 shadow-md transition"
                  >
                    <Link to="/reading">Continue Reading</Link>
                  </Button>
                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="border-purple-600 text-purple-700 dark:border-purple-300 dark:text-purple-200 hover:bg-purple-50 dark:hover:bg-purple-900 transition"
                  >
                    <Link to="/community">Join Discussion</Link>
                  </Button>
                </div>
              </div>
            </motion.div>

          ) : (
            <div className="space-y-6 bg-white/70 dark:bg-gray-800/50 backdrop-blur-md border border-purple-300/30 dark:border-gray-600/20 shadow-md hover:shadow-xl rounded-2xl p-6 text-center cursor-pointer transition-all duration-300 ease-in-out">
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

        </motion.div>
      </section>
      {/* Features Section */}
      <section
        id="features"
        className="bg-white dark:bg-gray-900 py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
      >

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <Badge className="bg-purple-100 dark:bg-gray-800 text-purple-700 mb-4 hover:text-white">What We Offer</Badge>
          <h2 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Your Journey Awaits
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Experience transformation through structured study, meaningful community, and accountability that actually works.
          </p>
        </motion.div>

        <FeaturesSection features={features} />

        <JourneyPath />

        <div className="mt-20 mb-2">
          <QuoteCard />
        </div>

        <CTASection
          headline="Ready to Transform Your Life?"
          description="Join hundreds of men who are discovering purpose, building character, and growing in faith. Your transformation starts with one decision."
        />
      </section>

      <Footer withLinks />
    </>
  );
};

export default Index;
