
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Users, MessageCircle, Heart, CheckCircle, LogIn } from 'lucide-react';
import CountdownTimer from '@/components/CountdownTimer';
import AuthModal from '@/components/AuthModal';
import Layout from '@/components/Layout';

const Index = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [showWhatsAppLink, setShowWhatsAppLink] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    // Check if user just registered
    if (location.state?.showWhatsAppLink || localStorage.getItem('isRegistered')) {
      setShowWhatsAppLink(true);
    }
  }, [location]);

  const features = [
    {
      icon: BookOpen,
      title: 'Daily Scripture Readings',
      description: 'Carefully curated passages to guide your spiritual journey'
    },
    {
      icon: Heart,
      title: 'Reflections & Encouragement',
      description: 'Thoughtful insights to deepen your understanding'
    },
    {
      icon: MessageCircle,
      title: 'Honest Conversations',
      description: 'Open dialogue about faith, struggles, and victories'
    },
    {
      icon: Users,
      title: 'Accountability & Support',
      description: 'A brotherhood committed to growth and purpose'
    }
  ];

  const openWhatsApp = () => {
    window.open('https://chat.whatsapp.com/Bxu5l4wv77nJZqfVxGktPI', '_blank');
  };

  return (
    <Layout>
      {/* Hero Section */}
      <section className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-purple-800 text-white relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-2000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Badge className="bg-white/20 text-white border-white/30 mb-6">
                90-Day Challenge Starting June 1st
              </Badge>
              <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                THE SONS
              </h1>
              <p className="text-xl md:text-2xl text-purple-100 mb-8 max-w-3xl mx-auto">
                Rooted in Faith, Purpose, and Growth.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mb-12"
            >
              <h2 className="text-2xl md:text-3xl font-semibold mb-8 text-purple-100">
                Challenge Begins In:
              </h2>
              <CountdownTimer />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="space-y-4"
            >
              {user ? (
                <div className="space-y-4">
                  <p className="text-purple-100 mb-4">
                    Welcome back, {user.displayName || 'Brother'}!
                  </p>
                  <Button asChild size="lg" className="bg-white text-purple-700 hover:bg-purple-50 text-lg px-8 py-4">
                    <Link to="/dashboard">Go to Dashboard</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button asChild size="lg" className="bg-white text-purple-700 hover:bg-purple-50 text-lg px-8 py-4">
                      <Link to="/register">Join the Challenge</Link>
                    </Button>
                    <Button 
                      onClick={() => setIsAuthModalOpen(true)}
                      size="lg" 
                      variant="outline" 
                      className="border-white text-purple-700 hover:bg-white text-lg px-8 py-4"
                    >
                      <LogIn className="h-5 w-5 mr-2" />
                      Sign In
                    </Button>
                  </div>
                </div>
              )}
              
              {showWhatsAppLink && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-6 p-4 bg-green-600/20 border border-green-400/30 rounded-lg backdrop-blur-sm"
                >
                  <div className="flex items-center justify-center space-x-2 mb-3">
                    <CheckCircle className="h-5 w-5 text-green-300" />
                    <span className="text-green-200 font-medium">Registration Successful!</span>
                  </div>
                  <Button
                    onClick={openWhatsApp}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    Join WhatsApp Group
                  </Button>
                </motion.div>
              )}
              
              <div className="mt-8">
                <button
                  onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}
                  className="text-purple-200 hover:text-white transition-colors"
                >
                  Learn More ↓
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              What to Expect
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Join a community of men committed to spiritual growth, accountability, and purposeful living
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow duration-300 border-0 shadow-md">
                  <CardContent className="p-6 text-center">
                    <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <feature.icon className="h-8 w-8 text-purple-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Inspirational Quote */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200 max-w-4xl mx-auto">
              <CardContent className="p-8">
                <blockquote className="text-2xl md:text-3xl font-semibold text-purple-800 mb-4 italic">
                  "Iron sharpens iron, and one man sharpens another."
                </blockquote>
                <cite className="text-purple-600 font-medium">— Proverbs 27:17</cite>
              </CardContent>
            </Card>
          </motion.div>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h3 className="text-3xl font-bold text-gray-900 mb-6">
              Ready to Begin Your Journey?
            </h3>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Take the first step towards deeper faith, stronger character, and purposeful living
            </p>
            {user ? (
              <Button asChild size="lg" className="bg-purple-600 hover:bg-purple-700 text-lg px-8 py-4">
                <Link to="/dashboard">Continue Your Journey</Link>
              </Button>
            ) : (
              <Button asChild size="lg" className="bg-purple-600 hover:bg-purple-700 text-lg px-8 py-4">
                <Link to="/register">Register Now</Link>
              </Button>
            )}
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="bg-gradient-to-r from-purple-600 to-purple-800 p-2 rounded-lg">
              <Heart className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold">THE SONS</span>
          </div>
          <p className="text-gray-400 mb-4">
            Rooted in Faith, Purpose, and Growth.
          </p>
          <p className="text-gray-500 text-sm">
            © 2024 THE SONS. All rights reserved.
          </p>
        </div>
      </footer>

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />
    </Layout>
  );
};

export default Index;
