import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
  DrawerClose
} from "@/components/ui/drawer"; // adjust the path if needed
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { LogOut, User, Menu } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Assets } from '@/assets/assets';

export default function MobileSidebar({ isOpen, setIsOpen, user, userProfile, navItems, adminItems, isActive, handleLogout }) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Prevent SSR issues
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <>
      {/* Drawer Trigger for mobile */}
      <div className="lg:hidden fixed top-4 left-4 z-[60]">
        <DrawerTrigger asChild>
          <Button variant="ghost" size="icon" onClick={() => setIsOpen(true)}>
            <Menu className="w-6 h-6" />
          </Button>
        </DrawerTrigger>
      </div>

      {/* Drawer */}
      <Drawer open={isOpen} onOpenChange={setIsOpen}>
        <DrawerContent className="p-0 max-w-[260px] rounded-none border-r border-purple-200 dark:border-gray-800 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-lg">
          <div className="flex flex-col h-screen overflow-y-auto">

            {/* Logo Section */}
            <div className="px-4 py-[5.5px] border-b border-purple-200 dark:border-gray-800 flex items-center w-full">
              <Link to="/" className="flex items-center gap-3" onClick={() => setIsOpen(false)}>
                <img src={Assets.Logo4} alt="THE SONS Logo" className="h-8 w-8 rounded-lg object-cover" />
                <div className="flex flex-col items-start">
                  <h1 className="text-xl font-bold text-gray-800 dark:text-purple-200">THE SONS</h1>
                  <p className="text-xs text-purple-600 dark:text-purple-400">Faith Journey</p>
                </div>
              </Link>
            </div>

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
                    {userProfile?.displayName || 'User'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-200 truncate">{user.email}</p>
                </div>
              </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors relative ${
                    isActive(item.path)
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
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive('/profile')
                    ? 'bg-purple-100 text-purple-700'
                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
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
                      className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                        isActive(item.path)
                          ? 'bg-purple-100 text-purple-700 dark:bg-gray-800 dark:text-purple-200'
                          : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
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
}
