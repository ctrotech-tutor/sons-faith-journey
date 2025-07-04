import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { useAuth } from '@/lib/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Assets } from '@/assets/assets';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { db } from '@/lib/firebase';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
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
  CheckCircle2,
  Pencil,
  PencilLine
} from 'lucide-react';
import { cn } from '@/lib/utils';


const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, userProfile, logout } = useAuth();
  const [unreadCounts, setUnreadCounts] = useState<{ [key: string]: number }>({});
  const [hideOnScroll, setHideOnScroll] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [ isScrolled, setIsScrolled ] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 1050)
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
    {
      path: '/community',
      icon: Users,
      label: 'Community',
      unreadCount: unreadCounts.community
    },
    // { 
    //   path: '/church-room', 
    //   icon: MessageCircle, 
    //   label: 'Church Room', 
    //   badge: 'Chat',
    //   unreadCount: unreadCounts.chat
    // },
    // { path: '/chat-supervisor', icon: Shield, label: 'Support Chat', badge: 'Private' },
    // { path: '/calendar', icon: Calendar, label: 'Calendar' },
    { path: '/reading', icon: BookOpen, label: 'Readings' },
    { path: '/bible', icon: BookOpen, label: 'Bible' },
    { path: '/post-manager', icon: Pencil, label: 'Manage Post' },
    { path: '/create-post', icon: PencilLine, label: 'Create Post' },
    { path: '/favorites', icon: Heart, label: 'Favorites', unreadCount: unreadCounts.favorites },
  ];

  const adminItems = [
    { path: '/admin', icon: Settings, label: 'Admin Panel' },
    { path: '/admin-inbox', icon: Heart, label: 'Admin Inbox' },
    { path: '/post-approval', icon: CheckCircle2, label: 'Post Approval' },
    { path: '/ml-analytics', icon: Users, label: 'ML Analytics' },
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

  // Listen for unread notifications
  useEffect(() => {
    if (!user) return;

    // Check for new community posts
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const communityQuery = query(
      collection(db, 'communityPosts'),
      where('timestamp', '>', oneDayAgo),
      where('authorId', '!=', user.uid),
      where('status', '==', 'approved')
    );

    const unsubscribeCommunity = onSnapshot(communityQuery, (snapshot) => {
      setUnreadCounts(prev => ({ ...prev, community: snapshot.docs.length }));
    });

    // Check for new chat messages
    const chatQuery = query(
      collection(db, 'churchMessages'),
      where('timestamp', '>', oneDayAgo),
      where('senderId', '!=', user.uid)
    );

    const unsubscribeChat = onSnapshot(chatQuery, (snapshot) => {
      setUnreadCounts(prev => ({ ...prev, chat: snapshot.docs.length }));
    });

    return () => {
      unsubscribeCommunity();
      unsubscribeChat();
    };
  }, [user]);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY && currentScrollY > 60) {
        setHideOnScroll(true); // scrolling down
      } else {
        setHideOnScroll(false); // scrolling up
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  // Render for unauthenticated users
  if (!user) {
    return (
      <>
        <motion.div
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className={cn("fixed top-0 left-0 w-full z-40 backdrop-blur-md dark:bg-gray-900/60 ", isScrolled ? "" : "")}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-3">
              {/* Logo and Brand */}
              <Link
                to="/"
                className="flex items-center gap-3 group"
                aria-label="Go to home"
              >
                <div className="rounded-md bg-gradient-to-br from-purple-600 to-purple-800 shadow-sm transition group-hover:scale-105">
                  <img
                    src={Assets.Logo4}
                    alt="THE SONS Logo"
                    className="h-[35px] w-[35px] rounded-md object-cover"
                  />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-purple-500 via-purple-700 to-fuchsia-600 bg-clip-text text-transparent">
                  THE SONS
                </span>
              </Link>

              {/* Sign In Button */}
              <Button
                onClick={() => navigate("/login")}
                className="bg-purple-800 active:bg-purple-900 text-white px-4 py-2 rounded-md transition ripple-effect"
              >
                Get Started
              </Button>
            </div>
          </div>
        </motion.div>
      </>
    );
  }

  return (
    <>

      <motion.div
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className={cn("fixed top-0 left-0 w-full z-40 backdrop-blur-md dark:bg-gray-900/60", isScrolled ? "border-white/20 dark:border-white/10 shadow-sm bg-white/60" : "")}
      >
        <div className="max-w-7xl mx-auto pr-2 pl-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-3">

            {/* Logo + Label */}
            <Link
              to="/"
              className="flex items-center gap-3 group"
              onClick={() => setIsOpen(false)}
            >
              <div className="bg-gradient-to-r from-purple-600 to-purple-800 rounded-lg shadow-sm transition duration-300 group-hover:scale-105">
                <img
                  src={Assets.Logo4}
                  alt="THE SONS Logo"
                  className="h-[35px] w-[35px] rounded-md object-cover"
                />
              </div>
              <h2 className={cn("text-xl font-bold bg-gradient-to-r from-purple-500 via-purple-700 to-fuchsia-600 bg-clip-text text-transparent")}>
                {currentLabel.toUpperCase()}
              </h2>
            </Link>

            {/* Drawer Toggle Button */}
            <Button
              size="icon"
              variant="ghost"
              //className=""
              className={cn("ripple-effect rounded-full w-8 h-8 bg-transparent active:bg-purple-600 active:text-white transition-colors duration-200", isScrolled ? "text-gray-900 dark:text-white" : "text-white" )}
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle navigation menu"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Sidebar */}
      <Drawer open={isOpen} onOpenChange={setIsOpen} direction='left'>
        <DrawerContent className="max-w-64 border-purple-200 dark:border-gray-800 bg-white/95 dark:bg-gray-900/95">
          <div className="flex flex-col h-screen overflow-y-auto">

            {/* Logo */}
            <DrawerHeader className="border-b border-purple-200 dark:border-gray-800 px-4 py-[5.5px]">
              <DrawerTitle asChild>
                <Link
                  to="/"
                  className="flex items-center gap-3"
                  onClick={() => setIsOpen(false)}
                >
                  <img
                    src={Assets.Logo4}
                    alt="THE SONS Logo"
                    className="h-8 w-8 rounded-lg object-cover"
                  />
                  <div className="flex flex-col items-start">
                    <h1 className="text-xl font-bold text-gray-800 dark:text-purple-200">
                      THE SONS
                    </h1>
                    <p className="text-xs text-purple-600 dark:text-purple-400">
                      Faith Journey
                    </p>
                  </div>
                </Link>
              </DrawerTitle>
            </DrawerHeader>

            {/* User Info */}
            <div className="px-4 py-3 border-b border-purple-200 dark:border-gray-800">
              <Link to="/profile" className="flex items-center gap-3" onClick={() => setIsOpen(false)}>
                <Avatar>
                  <AvatarImage src={userProfile?.profilePhoto || undefined} />
                  <AvatarFallback>
                    {userProfile?.displayName?.charAt(0) || user.email?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 dark:text-purple-200 truncate">
                    {userProfile?.displayName || "User"}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-200 truncate">{user.email}</p>
                </div>
              </Link>
            </div>

            {/* Nav Items */}
            <nav className="flex-1 p-4 space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors relative ${isActive(item.path)
                    ? 'bg-purple-100 text-purple-700 dark:bg-gray-800  dark:text-purple-200'
                    : 'text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-300'
                    }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="flex-1">{item.label}</span>
                  {item.unreadCount && item.unreadCount > 0 && (
                    <Badge
                      variant="destructive"
                      className="h-5 w-5 p-0 text-xs flex items-center justify-center animate-pulse"
                    >
                      {item.unreadCount > 9 ? '9+' : item.unreadCount}
                    </Badge>
                  )}
                </Link>
              ))}

              {/* Profile */}
              <Link
                to="/profile"
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive("/profile")
                  ? "bg-purple-100 text-purple-700"
                  : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                  }`}
              >
                <User className="h-5 w-5" />
                <span>Profile</span>
              </Link>

              {/* Admin Area */}
              {userProfile?.isAdmin && (
                <div className="pt-4 mt-4 border-t border-purple-200 dark:border-gray-800">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-2 px-3">Administration</p>
                  {adminItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${isActive(item.path)
                        ? "bg-purple-100 text-purple-700 dark:bg-gray-800 dark:text-purple-200"
                        : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
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
            <div className="p-4 border-t border-purple-200 dark:border-gray-800">
              <Button
                onClick={() => {
                  handleLogout();
                  setIsOpen(false);
                }}
                variant="ghost"
                className="w-full justify-start text-gray-600 hover:text-red-600 hover:bg-red-50 dark:hover:bg-gray-950 transition-colors"
              >
                <LogOut className="h-5 w-5 mr-3" />
                Sign Out
              </Button>
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default Navigation;
