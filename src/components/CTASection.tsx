import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface CTAProps {
  headline: string;
  description: string;
  userButtonText?: string;
  userButtonLink?: string;
  guestButtonText?: string;
  guestButtonLink?: string;
  className?: string; // for extra container styling
}

const CTASection: React.FC<CTAProps> = ({
  headline,
  description,
  userButtonText = 'Continue Your Journey',
  userButtonLink = '/dashboard',
  guestButtonText = 'Register Now',
  guestButtonLink = '/register',
  className = '',
}) => {
  const { user } = useAuth();

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      viewport={{ once: true }}
      className={`max-w-xl mx-auto mt-20 mb-20 p-10 bg-gradient-to-tr from-purple-700 via-purple-800 to-purple-900 rounded-3xl shadow-lg text-center ${className}`}
    >
      <h3 className="text-4xl md:text-5xl font-extrabold text-white mb-6 tracking-wide drop-shadow-md">
        {headline}
      </h3>
      <p className="text-lg md:text-xl text-purple-200 mb-10 max-w-lg mx-auto leading-relaxed">
        {description}
      </p>
      <Button
        asChild
        size="lg"
        className="bg-white text-purple-900 font-semibold hover:bg-purple-50 shadow-md hover:shadow-lg transform hover:scale-105 transition-transform duration-300 px-10 py-4 rounded-xl"
      >
        <Link to={user ? userButtonLink : guestButtonLink}>
          {user ? userButtonText : guestButtonText}
        </Link>
      </Button>
    </motion.div>
  );
};

export default CTASection;
