
import React, { Suspense } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import Layout from '@/components/Layout';
import ScrollToTop from '@/components/ScrollToTop';
import { AuthProvider } from '@/lib/context/AuthProvider';

// Pages
import Index from '@/pages/Index';
import Dashboard from '@/pages/Dashboard';
import Reading from '@/pages/Reading';
import Profile from '@/pages/Profile';
import Community from '@/pages/Community';
import Admin from '@/pages/Admin';
import Register from '@/pages/Register';
import NotFound from '@/pages/NotFound';
import { useAuth } from '@/lib/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import BiblePage from '@/pages/Bible';

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Layout>
        <Suspense fallback={
          <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading...</p>
            </div>
          </div>
        }>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/register" replace />} />
            <Route path="/reading" element={user ? <Reading /> : <Navigate to="/register" replace />} />
            <Route path="/profile" element={user ? <Profile /> : <Navigate to="/register" replace />} />
            <Route path="/community" element={user ? <Community /> : <Navigate to="/register" replace />} />
            <Route path="/admin" element={user ? <Admin /> : <Navigate to="/register" replace />} />
            <Route path="/register" element={<Register />} />
            <Route path="/bible/:passage/:day" element={user ? <BiblePage /> : <Navigate to="/register" replace />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </Layout>
      <ScrollToTop />
      <Toaster />
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
