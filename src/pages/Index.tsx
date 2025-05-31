import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Users, MessageCircle, Heart, CheckCircle, LogIn } from 'lucide-react';

import CountdownTimer from '@/components/CountdownTimer';
import Layout from '@/components/Layout';
import { Footer } from '@/components/Footer';
import FeaturesSection from '@/components/FeaturesSection';
import QuoteCard from '@/components/DailyQuote';
import CTASection from '@/components/CTASection';

const Index = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [showWhatsAppLink, setShowWhatsAppLink] = useState(false);

  useEffect(() => {
    if (location.state?.showWhatsAppLink || localStorage.getItem('isRegistered')) {
      setShowWhatsAppLink(true);
    }
  }, [location]);

  const features = [
    {
      icon: BookOpen,
      title: 'Daily Scripture Readings',
      description: 'Carefully curated passages to guide your spiritual journey',
    },
    {
      icon: Heart,
      title: 'Reflections & Encouragement',
      description: 'Thoughtful insights to deepen your understanding',
    },
    {
      icon: MessageCircle,
      title: 'Honest Conversations',
      description: 'Open dialogue about faith, struggles, and victories',
    },
    {
      icon: Users,
      title: 'Accountability & Support',
      description: 'A brotherhood committed to growth and purpose',
    },
  ];

  const openWhatsApp = () => {
    window.open('https://chat.whatsapp.com/Bxu5l4wv77nJZqfVxGktPI', '_blank');
  };

  return (
    <Layout>
   
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-purple-700 via-purple-800 to-purple-900 text-white relative overflow-hidden rounded-b-[50px] pt-10">
        {/* Background decorative elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full mix-blend-multiply filter blur-xl animate-pulse" />
          <div className="absolute top-40 right-10 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000" />
          <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-2000" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center space-y-10">
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
              <p className="text-xl md:text-2xl text-purple-100 max-w-3xl mx-auto">
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
              className="space-y-6"
            >
              {user ? (
                <div className="space-y-4">
                  <p className="text-purple-100">
                    Welcome back, {user.displayName || 'Brother'}!
                  </p>
                  <Button
                    asChild
                    size="lg"
                    className="bg-white text-purple-700 hover:bg-purple-50 text-lg px-8 py-4"
                  >
                    <Link to="/dashboard">Go to Dashboard</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-6 justify-center">
                    <Button
                      asChild
                      size="lg"
                      className="bg-white text-purple-700 hover:bg-purple-50 text-lg px-8 py-4"
                    >
                      <Link to="/register">Join the Challenge</Link>
                    </Button>
                    <Button
                      onClick={() => navigate('/auth/login')}
                      size="lg"
                      variant="outline"
                      className="border-white text-purple-700 hover:bg-white text-lg px-8 py-4 flex items-center justify-center gap-2"
                    >
                      <LogIn className="h-5 w-5" />
                      Sign In
                    </Button>
                  </div>
                </div>
              )}

              {showWhatsAppLink && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-8 p-5 bg-green-600/20 border border-green-400/30 rounded-lg backdrop-blur-sm"
                >
                  <div className="flex items-center justify-center space-x-3 mb-4">
                    <CheckCircle className="h-5 w-5 text-green-300" />
                    <span className="text-green-200 font-semibold">
                      Registration Successful!
                    </span>
                  </div>
                  <Button
                    onClick={openWhatsApp}
                    className="bg-green-600 hover:bg-green-700 text-white w-full"
                    size="lg"
                  >
                    Join WhatsApp Group
                  </Button>
                </motion.div>
              )}

              <div className="mt-10">
                <button
                  onClick={() =>
                    document
                      .getElementById('about')
                      ?.scrollIntoView({ behavior: 'smooth' })
                  }
                  className="text-purple-200 hover:text-white transition-colors text-lg font-medium"
                >
                  Learn More ↓
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section
        id="about"
        className="bg-white mt-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
      >
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
            Join a community of men committed to spiritual growth, accountability,
            and purposeful living
          </p>
        </motion.div>

        <FeaturesSection features={features} />

        <div className="mt-16">
          <QuoteCard />
        </div>

        {/* CTA Section */}
        <CTASection
          headline="Ready to Begin Your Journey?"
          description="Take the first step towards deeper faith, stronger character, and purposeful living. Your transformation starts here."
        />
      </section>

      {/* Footer */}
      <Footer withLinks />
    </Layout>
  );
};

export default Index;