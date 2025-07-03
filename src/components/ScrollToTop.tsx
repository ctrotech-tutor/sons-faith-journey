import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const location = useLocation();

  useEffect(() => {
    // Smooth scroll to top when route changes
    window.scrollTo({ 
      top: 0, 
      left: 0,
    });
  }, [location]);

  return null;
};

export default ScrollToTop;