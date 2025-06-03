
import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/lib/context/AuthProvider";
import ScrollToTop from "@/components/ScrollToTop";

const queryClient = new QueryClient();

// Lazy load components
const Index = lazy(() => import("@/pages/Index"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const Reading = lazy(() => import("@/pages/Reading"));
const Community = lazy(() => import("@/pages/Community"));
const CreatePost = lazy(() => import("@/pages/CreatePost"));
const ChurchRoom = lazy(() => import("@/pages/ChurchRoom"));
const ChatWithSupervisor = lazy(() => import("@/pages/ChatWithSupervisor"));
const Profile = lazy(() => import("@/pages/Profile"));
const Register = lazy(() => import("@/pages/Register"));
const Admin = lazy(() => import("@/pages/Admin"));
const AdminInbox = lazy(() => import("@/pages/AdminInbox"));
const NotFound = lazy(() => import("@/pages/NotFound"));

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <BrowserRouter>
            <ScrollToTop />
            <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/reading" element={<Reading />} />
                <Route path="/community" element={<Community />} />
                <Route path="/create-post" element={<CreatePost />} />
                <Route path="/church-room" element={<ChurchRoom />} />
                <Route path="/chat-with-supervisor" element={<ChatWithSupervisor />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/register" element={<Register />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/admin-inbox" element={<AdminInbox />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
