import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { AuthProvider } from "@/lib/context/AuthProvider";
import { ThemeProvider } from "@/lib/context/ThemeContext";
import { useShield } from './lib/hooks/useShield';
import {useMobileGuard} from './lib/hooks/useMobileGuard';
import ScrollToTop from "@/components/ScrollToTop";

const Index = lazy(() => import("./pages/Index"));
const Register = lazy(() => import("./pages/Register"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Admin = lazy(() => import("./pages/Admin"));
const Community = lazy(() => import("./pages/Community"));
const ChurchRoom = lazy(() => import("./pages/ChurchRoom"));
const ChatWithSupervisor = lazy(() => import("./pages/ChatWithSupervisor"));
const AdminInbox = lazy(() => import("./pages/AdminInbox"));
const Profile = lazy(() => import("./pages/Profile"));
const NotFound = lazy(() => import("./pages/NotFound"));
const AuthModal = lazy(() => import("@/components/AuthModal"));
const Reading = lazy(() => import("./pages/Reading"));
const CreatePost = lazy(() => import("./pages/CreatePost"));
const Bible = lazy(() => import("./pages/Bible"));

const queryClient = new QueryClient();

const AppContent = () => {
  //useShield();
  const location = useLocation();
  const navigate = useNavigate();

  // Detect if current path is for auth modal
  const authMatch = location.pathname.startsWith("/auth/");
  const mode = location.pathname.endsWith("register") ? "register" : "login";

  // Close modal handler
  const closeModal = () => {
    navigate("/", { replace: true });
  };

  const { showBlock, BlockUI } = useMobileGuard();

  if (showBlock) {
    return <BlockUI />;
  }

  const LoadingFallback = () => (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="mx-auto mb-6 h-16 w-16 rounded-full border-4 border-purple-300 border-t-purple-600 animate-spin shadow-md"></div>
        <p className="text-gray-600 dark:text-gray-300">Please wait...</p>
      </div>
    </div>
  );

  return (
    <Suspense fallback={<LoadingFallback />}>
      <ScrollToTop />
    
      {/* Main Routes */}
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dashboard/:userId" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/community" element={<Community />} />
        <Route path="/church-room" element={<ChurchRoom />} />
        <Route path="/chat/:chatId" element={<ChurchRoom />} />
        <Route path="/chat-supervisor" element={<ChatWithSupervisor />} />
        <Route path="/admin-inbox" element={<AdminInbox />} />
        <Route path="/reading" element={<Reading />} />
        <Route path="/create-post" element={<CreatePost />} />
        <Route path="/bible/:passage/:day" element={<Bible />} />
        
        <Route path="*" element={<NotFound />} />
      </Routes>

      {authMatch && (
        <AuthModal isOpen={true} onClose={closeModal} initialMode={mode} />
      )}
    </Suspense>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
