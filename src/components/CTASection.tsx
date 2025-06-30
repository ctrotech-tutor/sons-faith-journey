import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useAuth } from '@/lib/hooks/useAuth';

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
  guestButtonLink = '/signup',
  className = '',
}) => {
  const { user } = useAuth();

  return (
    <motion.div
  initial={{ opacity: 0, y: 40, scale: 0.95 }}
  whileInView={{ opacity: 1, y: 0, scale: 1 }}
  transition={{ duration: 0.9, ease: 'easeOut', bounce: 0.2 }}
  viewport={{ once: true }}
  className={`bg-white/70 dark:bg-gray-800/50 backdrop-blur-md border border-purple-300/30 dark:border-gray-600/20 shadow-md hover:shadow-xl rounded-2xl p-6 text-center cursor-pointer transition-all duration-300 ease-in-out
    ${className}`}
    style={{ position: 'relative', overflow: 'hidden' }}
>
  {/* Optional sparkles or light rays */}
  <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-500/10 via-transparent to-transparent" />

  <h3 className="text-3xl sm:text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-purple-500 via-purple-700 to-fuchsia-600 bg-clip-text text-transparent mb-6 tracking-tight leading-tight drop-shadow-md">
    {headline}
  </h3>

  <p className="text-md sm:text-lg md:text-xl text-purple-900  dark:text-purple-100 mb-10 leading-relaxed max-w-xl mx-auto">
    {description}
  </p>

  <motion.div
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.98 }}
    transition={{ type: "spring", stiffness: 300 }}
  >
    <Button
      asChild
      size="lg"
      className="relative bg-white text-purple-900 font-bold hover:bg-purple-100 hover:text-purple-800 dark:bg-gray-700 dark:text-white dark:shadow-lg dark:hover:shadow-2xl shadow transition-all duration-300 ease-in-out px-10 py-4 rounded-xl tracking-wide"
    >
      <Link to={user ? userButtonLink : guestButtonLink}>
        {user ? userButtonText : guestButtonText}
      </Link>
    </Button>
  </motion.div>
</motion.div>

  );
};

export default CTASection;
