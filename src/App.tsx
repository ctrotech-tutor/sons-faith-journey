
import React, { Suspense } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import Layout from '@/components/Layout';
import ScrollToTop from '@/components/ScrollToTop';

// Pages
import Home from '@/pages/Home';
import Dashboard from '@/pages/Dashboard';
import Reading from '@/pages/Reading';
import Profile from '@/pages/Profile';
import Community from '@/pages/Community';
import Admin from '@/pages/Admin';
import Signin from '@/pages/Signin';
import Signup from '@/pages/Signup';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import Error404 from '@/pages/Error404';
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
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/signin" replace />} />
            <Route path="/reading" element={user ? <Reading /> : <Navigate to="/signin" replace />} />
            <Route path="/profile" element={user ? <Profile /> : <Navigate to="/signin" replace />} />
            <Route path="/community" element={user ? <Community /> : <Navigate to="/signin" replace />} />
            <Route path="/admin" element={user ? <Admin /> : <Navigate to="/signin" replace />} />
            <Route path="/signin" element={<Signin />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/bible/:passage/:day" element={user ? <BiblePage /> : <Navigate to="/signin" replace />} />
            <Route path="*" element={<Error404 />} />
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
    <AppContent />
  );
}

export default App;
