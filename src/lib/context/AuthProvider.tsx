
import {
  useState,
  useEffect,
  createContext,
  ReactNode
} from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  linkWithPopup,
  unlink,
  sendEmailVerification,
  sendPasswordResetEmail,
  confirmPasswordReset,
  applyActionCode,
  checkActionCode,
  verifyPasswordResetCode,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  updateDoc
} from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { getUserLocation } from '@/lib/location';

interface UserSettings {
  notifications?: boolean;
  soundEnabled?: boolean;
  language?: string;
  autoSync?: boolean;
}

interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  phone?: string;
  location?: string;
  bio?: string;
  profilePhoto?: string;
  isAdmin: boolean;
  joinedWhatsApp: boolean;
  isRegistered: boolean;
  createdAt: Date;
  updatedAt?: Date;
  lastLoginAt?: Date;
  settings?: UserSettings;
  emailVerified: boolean;
}

interface AuthError {
  code: string;
  message: string;
}

interface AuthContextType {
  // User state
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  
  // Authentication methods
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  
  // Email verification
  sendEmailVerification: () => Promise<void>;
  verifyEmail: (actionCode: string) => Promise<void>;
  
  // Password reset
  sendPasswordReset: (email: string) => Promise<void>;
  verifyPasswordResetCode: (actionCode: string) => Promise<string>;
  confirmPasswordReset: (actionCode: string, newPassword: string) => Promise<void>;
  
  // Password update
  updatePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  
  // Account linking
  linkGoogleAccount: () => Promise<void>;
  unlinkGoogleAccount: () => Promise<void>;
  
  // Profile management
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>;
  refreshUserProfile: () => Promise<void>;
  
  // Error handling
  clearError: () => void;
  error: AuthError | null;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

const adminEmails = ['ctrotech.devs@gmail.com', 'ctrodev@gmail.com', 'beyondinsightofficial@gmail.com'];

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<AuthError | null>(null);

  // Error handling utility
  const handleAuthError = (error: any): AuthError => {
    console.error('Auth error:', error);
    
    let message = 'An unexpected error occurred. Please try again.';
    
    switch (error.code) {
      case 'auth/user-not-found':
        message = 'No account found with this email address.';
        break;
      case 'auth/wrong-password':
        message = 'Incorrect password. Please try again.';
        break;
      case 'auth/email-already-in-use':
        message = 'An account with this email already exists.';
        break;
      case 'auth/weak-password':
        message = 'Password must be at least 6 characters long.';
        break;
      case 'auth/invalid-email':
        message = 'Please enter a valid email address.';
        break;
      case 'auth/too-many-requests':
        message = 'Too many failed attempts. Please try again later.';
        break;
      case 'auth/network-request-failed':
        message = 'Network error. Please check your connection.';
        break;
      case 'auth/popup-closed-by-user':
        message = 'Sign-in popup was closed. Please try again.';
        break;
      case 'auth/account-exists-with-different-credential':
        message = 'An account with this email exists with different sign-in method.';
        break;
      case 'auth/credential-already-in-use':
        message = 'This Google account is already linked to another user.';
        break;
      case 'auth/provider-already-linked':
        message = 'Google account is already linked to your profile.';
        break;
      case 'auth/no-such-provider':
        message = 'Google account is not linked to your profile.';
        break;
      case 'auth/requires-recent-login':
        message = 'Please sign in again to complete this action.';
        break;
      case 'auth/expired-action-code':
        message = 'This verification link has expired. Please request a new one.';
        break;
      case 'auth/invalid-action-code':
        message = 'This verification link is invalid or has already been used.';
        break;
      default:
        message = error.message || message;
    }
    
    return { code: error.code || 'unknown', message };
  };

  // Clear error
  const clearError = () => setError(null);

  // Create or update user profile
  const createUserProfile = async (user: User, additionalData: Partial<UserProfile> = {}) => {
    try {
      const location = await getUserLocation();
      const userDocRef = doc(db, 'users', user.uid);
      
      const newProfile: UserProfile = {
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || additionalData.displayName || 'User',
        phone: additionalData.phone || '',
        location: additionalData.location || location,
        bio: additionalData.bio || '',
        profilePhoto: user.photoURL || additionalData.profilePhoto || '',
        isAdmin: adminEmails.includes(user.email || ''),
        joinedWhatsApp: false,
        isRegistered: Boolean(additionalData.displayName),
        emailVerified: user.emailVerified,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLoginAt: new Date(),
        settings: {
          notifications: true,
          soundEnabled: true,
          language: 'en',
          autoSync: true
        },
        ...additionalData
      };

      await setDoc(userDocRef, newProfile);
      return newProfile;
    } catch (err) {
      console.error('Failed to create user profile:', err);
      throw err;
    }
  };

  // Update user profile
  const updateUserProfile = async (updates: Partial<UserProfile>) => {
    if (!user) throw new Error('No user logged in');
    
    try {
      const userDocRef = doc(db, 'users', user.uid);
      const updateData = {
        ...updates,
        updatedAt: new Date()
      };
      
      await updateDoc(userDocRef, updateData);
      
      if (userProfile) {
        setUserProfile({ ...userProfile, ...updateData });
      }
    } catch (err) {
      const authError = handleAuthError(err);
      setError(authError);
      throw authError;
    }
  };

  // Refresh user profile
  const refreshUserProfile = async () => {
    if (!user) return;
    
    try {
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const data = userDoc.data();
        const profile: UserProfile = {
          uid: data.uid,
          email: data.email,
          displayName: data.displayName || 'User',
          phone: data.phone || '',
          location: data.location || '',
          bio: data.bio || '',
          profilePhoto: data.profilePhoto || '',
          isAdmin: data.isAdmin || false,
          joinedWhatsApp: data.joinedWhatsApp || false,
          emailVerified: user.emailVerified,
          isRegistered: data.isRegistered || false,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
          updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : undefined,
          lastLoginAt: new Date(),
          settings: data.settings || {
            notifications: true,
            soundEnabled: true,
            language: 'en',
            autoSync: true
          }
        };
        
        setUserProfile(profile);
      }
    } catch (err) {
      console.error('Failed to refresh user profile:', err);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      setLoading(true);
      clearError();

      if (user) {
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            const data = userDoc.data();
            const profile: UserProfile = {
              uid: data.uid,
              email: data.email,
              displayName: data.displayName || 'User',
              phone: data.phone || '',
              location: data.location || '',
              bio: data.bio || '',
              profilePhoto: data.profilePhoto || '',
              isAdmin: data.isAdmin || false,
              joinedWhatsApp: data.joinedWhatsApp || false,
              emailVerified: user.emailVerified,
              isRegistered: data.isRegistered || false,
              createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
              updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : undefined,
              lastLoginAt: new Date(),
              settings: data.settings || {
                notifications: true,
                soundEnabled: true,
                language: 'en',
                autoSync: true
              }
            };

            // Update last login time
            await updateDoc(userDocRef, { 
              lastLoginAt: new Date(),
              emailVerified: user.emailVerified 
            });
            
            setUserProfile(profile);
          } else {
            // Create new profile for existing user without profile
            const newProfile = await createUserProfile(user);
            setUserProfile(newProfile);
          }
        } catch (err) {
          console.error('Error loading user profile:', err);
          setError(handleAuthError(err));
        }
      } else {
        setUserProfile(null);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Authentication methods
  const login = async (email: string, password: string) => {
    try {
      clearError();
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      const authError = handleAuthError(err);
      setError(authError);
      throw authError;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, displayName: string) => {
    try {
      clearError();
      setLoading(true);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await createUserProfile(userCredential.user, { displayName, isRegistered: true });
    } catch (err) {
      const authError = handleAuthError(err);
      setError(authError);
      throw authError;
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    try {
      clearError();
      setLoading(true);
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err) {
      const authError = handleAuthError(err);
      setError(authError);
      throw authError;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      clearError();
      await signOut(auth);
    } catch (err) {
      const authError = handleAuthError(err);
      setError(authError);
      throw authError;
    }
  };

  // Email verification methods
  const sendEmailVerificationMethod = async () => {
    if (!auth.currentUser) throw new Error('No user logged in');
    
    try {
      clearError();
      await sendEmailVerification(auth.currentUser);
    } catch (err) {
      const authError = handleAuthError(err);
      setError(authError);
      throw authError;
    }
  };

  const verifyEmail = async (actionCode: string) => {
    try {
      clearError();
      await applyActionCode(auth, actionCode);
      await refreshUserProfile();
    } catch (err) {
      const authError = handleAuthError(err);
      setError(authError);
      throw authError;
    }
  };

  // Password reset methods
  const sendPasswordReset = async (email: string) => {
    try {
      clearError();
      await sendPasswordResetEmail(auth, email);
    } catch (err) {
      const authError = handleAuthError(err);
      setError(authError);
      throw authError;
    }
  };

  const verifyPasswordResetCodeMethod = async (actionCode: string): Promise<string> => {
    try {
      clearError();
      return await verifyPasswordResetCode(auth, actionCode);
    } catch (err) {
      const authError = handleAuthError(err);
      setError(authError);
      throw authError;
    }
  };

  const confirmPasswordResetMethod = async (actionCode: string, newPassword: string) => {
    try {
      clearError();
      await confirmPasswordReset(auth, actionCode, newPassword);
    } catch (err) {
      const authError = handleAuthError(err);
      setError(authError);
      throw authError;
    }
  };

  // Password update
  const updatePasswordMethod = async (currentPassword: string, newPassword: string) => {
    if (!auth.currentUser || !auth.currentUser.email) throw new Error('No user logged in');
    
    try {
      clearError();
      // Re-authenticate user before password change
      const credential = EmailAuthProvider.credential(auth.currentUser.email, currentPassword);
      await reauthenticateWithCredential(auth.currentUser, credential);
      await updatePassword(auth.currentUser, newPassword);
    } catch (err) {
      const authError = handleAuthError(err);
      setError(authError);
      throw authError;
    }
  };

  // Account linking methods
  const linkGoogleAccount = async () => {
    if (!auth.currentUser) throw new Error('No user logged in');
    
    try {
      clearError();
      const provider = new GoogleAuthProvider();
      await linkWithPopup(auth.currentUser, provider);
    } catch (err) {
      const authError = handleAuthError(err);
      setError(authError);
      throw authError;
    }
  };

  const unlinkGoogleAccount = async () => {
    if (!auth.currentUser) throw new Error('No user logged in');
    
    try {
      clearError();
      await unlink(auth.currentUser, 'google.com');
    } catch (err) {
      const authError = handleAuthError(err);
      setError(authError);
      throw authError;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        // User state
        user,
        userProfile,
        loading,
        error,
        
        // Authentication methods
        login,
        register,
        loginWithGoogle,
        logout,
        
        // Email verification
        sendEmailVerification: sendEmailVerificationMethod,
        verifyEmail,
        
        // Password reset
        sendPasswordReset,
        verifyPasswordResetCode: verifyPasswordResetCodeMethod,
        confirmPasswordReset: confirmPasswordResetMethod,
        
        // Password update
        updatePassword: updatePasswordMethod,
        
        // Account linking
        linkGoogleAccount,
        unlinkGoogleAccount,
        
        // Profile management
        updateUserProfile,
        refreshUserProfile,
        
        // Error handling
        clearError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
