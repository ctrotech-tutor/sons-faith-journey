
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Assets } from '@/assets/assets';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Home,
  LayoutDashboard,
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
  User,
} from 'lucide-react';


const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
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

  const isActive = (path: string) => location.pathname.split('/')[1] === path.split('/')[1];

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
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

 const getCurrentNavLabel = () => {
  if (location.pathname === '/') return 'THE SONS';

  const allItems = [
    ...navItems,
    ...adminItems,
    { path: '/profile', label: 'Profile' },
  ];

  // Sort by descending path length so /dashboard comes before /
  allItems.sort((a, b) => b.path.length - a.path.length);

  const current = allItems.find(item => location.pathname.startsWith(item.path));
  return current?.label || 'THE SONS';
};

const currentLabel = getCurrentNavLabel();


  // Render for unauthenticated users
  if (!user) {
    return (
      <>
        <div className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-2">
              <Link to="/" className="flex items-center space-x-2">
                <div className="">
                  <img src={Assets.Logo4} alt="THE SONS Logo" className='h-10 w-10 rounded-lg object-cover'/>
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
                  THE SONS
                </span>
              </Link>
              <Button onClick={() => navigate('/auth/login')} className="bg-purple-800 hover:bg-purple-900">
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Mobile Toggle Button */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-sm shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-2">
            <Link to="/" className="flex items-center gap-2">
              <div className="shadow-sm bg-gradient-to-r from-purple-600 to-purple-800 rounded-lg">
                <img src={Assets.Logo4} alt="THE SONS Logo" className="h-10 w-10 rounded-lg object-cover" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
                {currentLabel.toUpperCase()}
              </span>
            </Link>
            <Button
              size="sm"
              onClick={() => setIsOpen(!isOpen)}
              className="bg-white/90 backdrop-blur-sm border-purple-200 text-black hover:bg-purple-50 lg:hidden"
            >
              {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <motion.div
        initial={{ x: -300 }}
        animate={{
          x: isOpen || typeof window !== 'undefined' && window.innerWidth >= 1024 ? 0 : -300,
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="sm:hidden fixed left-0 top-0 h-full w-64 bg-white/95 backdrop-blur-md border-r border-purple-200 shadow-lg z-50 lg:relative"
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-4 border-b border-purple-200">
            <Link to="/" className="flex items-center space-x-3">
              <div className="">
                <img src={Assets.Logo4} alt="THE SONS Logo" className="h-10 w-10 rounded-lg object-cover" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">THE SONS</h1>
                <p className="text-xs text-purple-600">Faith Journey</p>
              </div>
            </Link>
          </div>

          {/* User Info */}
          <div className="p-4 border-b border-purple-200  hover:bg-gray-100 transition-colors">
            <Link to="/profile" className="flex items-center gap-3 rounded-lg">
              <Avatar>
                <AvatarImage src={userProfile?.profilePhoto || undefined} />
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

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${isActive(item.path)
                  ? 'bg-purple-100 text-purple-700'
                  : 'text-gray-600 hover:bg-gray-100'
                  }`}
              >
                <item.icon className="h-5 w-5" />
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <Badge
                    variant={item.badge === 'Private' ? 'secondary' : 'default'}
                    className={
                      item.badge === 'Private'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-[#FF9606] text-white'
                    }
                  >
                    {item.badge}
                  </Badge>
                )}
              </Link>
            ))}

            {/* Profile */}
            <Link
              to="/profile"
              onClick={() => setIsOpen(false)}
              className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${isActive('/profile')
                ? 'bg-purple-100 text-purple-700'
                : 'text-gray-600 hover:bg-gray-100'
                }`}
            >
              <User className="h-5 w-5" />
              <span>Profile</span>
            </Link>

            {/* Admin Area */}
            {userProfile?.isAdmin && (
              <div className="pt-4 mt-4 border-t border-purple-200">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-2 px-3">Administration</p>
                {adminItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${isActive(item.path)
                      ? 'bg-purple-100 text-purple-700'
                      : 'text-gray-600 hover:bg-gray-100'
                      }`}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Link>
                ))}
              </div>
            )}
          </nav>

          {/* Logout */}
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
          className="fixed inset-0 bg-black/50 z-30 lg:hidden backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

    </>
  );
};

export default Navigation;