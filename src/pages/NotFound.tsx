import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-purple-100 px-4">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="bg-white shadow-xl rounded-2xl p-8 max-w-md w-full text-center"
      >
        <div className="flex justify-center mb-4">
          <AlertTriangle className="text-purple-600 w-12 h-12" />
        </div>

        <h1 className="text-5xl font-extrabold text-purple-700 mb-2">404</h1>
        <p className="text-gray-600 text-lg mb-6">
          Oops! The page you're looking for doesn't exist.
        </p>

        <a
          href="/"
          className="inline-block px-6 py-3 rounded-full bg-purple-600 text-white font-medium hover:bg-purple-700 transition"
        >
          Back to Home
        </a>

        <p className="text-sm text-gray-400 mt-4">
          URL tried: <code>{location.pathname}</code>
        </p>
      </motion.div>
    </div>
  );
};

export default NotFound;