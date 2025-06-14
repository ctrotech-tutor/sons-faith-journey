
import { useContext } from 'react';
import { AuthContext } from '@/lib/context/AuthProvider';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Additional utility hooks for specific auth states
export const useAuthUser = () => {
  const { user } = useAuth();
  return user;
};

export const useUserProfile = () => {
  const { userProfile } = useAuth();
  return userProfile;
};

export const useAuthLoading = () => {
  const { loading } = useAuth();
  return loading;
};

export const useAuthError = () => {
  const { error, clearError } = useAuth();
  return { error, clearError };
};

export const useIsAuthenticated = () => {
  const { user } = useAuth();
  return !!user;
};

export const useIsEmailVerified = () => {
  const { user } = useAuth();
  return user?.emailVerified || false;
};

export const useIsAdmin = () => {
  const { userProfile } = useAuth();
  return userProfile?.isAdmin || false;
};
