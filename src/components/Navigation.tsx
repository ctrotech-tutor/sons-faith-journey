
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import AuthModal from '@/components/AuthModal;
import {
  Home,
  BookOpen,
  Calendar,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  Shield,
  MessageCircle,
  Heart,
  User
} from 'lucide-react';

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
	 const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, userProfile, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const navItems = [
    { path: '/dashboard', icon: Home, label: 'Dashboard' },
    { path: '/community', icon: Users, label: 'Community' },
    { path: '/church-room', icon: MessageCircle, label: 'Church Room', badge: 'Chat' },
    { path: '/chat-supervisor', icon: Shield, label: 'Support Chat', badge: 'Private' },
    { path: '/calendar', icon: Calendar, label: 'Calendar' },
    { path: '/readings', icon: BookOpen, label: 'Readings' },
  ];

  const adminItems = [
    { path: '/admin', icon: Settings, label: 'Admin Panel' },
    { path: '/admin-inbox', icon: Heart, label: 'Admin Inbox' },
  ];

  if (!user) {
    return (
      <div className="hidden fixed top-4 right-4 z-50">
        <Button onClick={() => setIsAuthModalOpen(true)} className="bg-[#FF9606] hover:bg-[#FF9606]/90">
          Sign In
        </Button>
      </div>
    );
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="bg-white/90 backdrop-blur-sm border-purple-200"
        >
          {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {/* Sidebar */}
      <motion.div
        initial={{ x: -300 }}
        animate={{ x: isOpen || window.innerWidth >= 1024 ? 0 : -300 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="fixed left-0 top-0 h-full w-64 bg-white/95 backdrop-blur-md border-r border-purple-200 shadow-lg z-40 lg:relative lg:translate-x-0"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-purple-200">
            <Link to="/dashboard" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">THE SONS</h1>
                <p className="text-sm text-purple-600">Faith Journey</p>
              </div>
            </Link>
          </div>

          {/* User Info */}
          <div className="p-4 border-b border-purple-200">
            <Link to="/profile" className="flex items-center space-x-3 hover:bg-gray-50 rounded-lg p-2 transition-colors">
              <Avatar>
                <AvatarImage src={userProfile?.profilePhoto} />
                <AvatarFallback>
                  {userProfile?.displayName?.charAt(0) || user.email?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">
                  {userProfile?.displayName || 'User'}
                </p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
              </div>
            </Link>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 p-4 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive(item.path)
                    ? 'bg-purple-100 text-purple-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <Badge 
                    variant={item.badge === 'Private' ? 'secondary' : 'default'}
                    className={item.badge === 'Private' ? 'bg-blue-100 text-blue-800' : 'bg-[#FF9606] text-white'}
                  >
                    {item.badge}
                  </Badge>
                )}
              </Link>
            ))}

            <Link
              to="/profile"
              onClick={() => setIsOpen(false)}
              className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                isActive('/profile')
                  ? 'bg-purple-100 text-purple-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <User className="h-5 w-5" />
              <span>Profile</span>
            </Link>

            {/* Admin Section */}
            {userProfile?.isAdmin && (
              <>
                <div className="pt-4 mt-4 border-t border-purple-200">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-2 px-3">
                    Administration
                  </p>
                  {adminItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                        isActive(item.path)
                          ? 'bg-purple-100 text-purple-700'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.label}</span>
                    </Link>
                  ))}
                </div>
              </>
            )}
          </nav>

          {/* Logout Button */}
          <div className="p-4 border-t border-purple-200">
            <Button
              onClick={handleLogout}
              variant="ghost"
              className="w-full justify-start text-gray-600 hover:text-red-600 hover:bg-red-50"
            >
              <LogOut className="h-5 w-5 mr-3" />
              Sign Out
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default Navigation;
