// lib/context/AuthProvider.tsx
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
  fetchSignInMethodsForEmail
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  updateDoc
} from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { getUserLocation } from '@/lib/location';

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
  createdAt: Date;
  updatedAt?: Date;
  lastLoginAt?: Date;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  linkGoogleAccount: () => Promise<void>;
  unlinkGoogleAccount: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

const adminEmails = ['ctrotech.devs@gmail.com', 'ctrodev@gmail.com', 'beyondinsightofficial@gmail.com'];

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      setLoading(true);

      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const data = userDoc.data();

          let profile: UserProfile = {
            uid: data.uid,
            email: data.email,
            displayName: data.displayName || 'User',
            phone: data.phone || '',
            location: data.location || '',
            bio: data.bio || '',
            profilePhoto: data.profilePhoto || '',
            isAdmin: data.isAdmin || false,
            joinedWhatsApp: data.joinedWhatsApp || false,
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
            updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : undefined,
            lastLoginAt: new Date()
          };

          if (!profile.location || profile.location === '') {
            try {
              const location = await getUserLocation();
              await updateDoc(userDocRef, { location, updatedAt: new Date() });
              profile = { ...profile, location, updatedAt: new Date() };
            } catch (err) {
              console.error('Failed to update location:', err);
            }
          }

          setUserProfile(profile);
        } else {
          try {
            const location = await getUserLocation();
            const newProfile: UserProfile = {
              uid: user.uid,
              email: user.email || '',
              displayName: user.displayName || 'User',
              phone: '',
              location,
              bio: '',
              profilePhoto: '',
              isAdmin: adminEmails.includes(user.email || ''),
              joinedWhatsApp: false,
              createdAt: new Date(),
              updatedAt: new Date(),
              lastLoginAt: new Date()
            };
            await setDoc(userDocRef, newProfile);
            setUserProfile(newProfile);
          } catch (err) {
            console.error('Failed to create user profile with location:', err);
          }
        }
      } else {
        setUserProfile(null);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const register = async (email: string, password: string, displayName: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const location = await getUserLocation();

    const newProfile: UserProfile = {
      uid: userCredential.user.uid,
      email,
      displayName,
      phone: '',
      location,
      bio: '',
      profilePhoto: '',
      isAdmin: adminEmails.includes(email),
      joinedWhatsApp: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastLoginAt: new Date()
    };

    await setDoc(doc(db, 'users', userCredential.user.uid), newProfile);
  };

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const linkGoogleAccount = async () => {
    if (!auth.currentUser) throw new Error('No user logged in');
    const provider = new GoogleAuthProvider();
    try {
      const result = await linkWithPopup(auth.currentUser, provider);
      const googleEmail = result.user.email;

      if (auth.currentUser.email !== googleEmail) {
        alert(`Note: Your account email (${auth.currentUser.email}) is different from the linked Google email (${googleEmail}).`);
      }

      alert('✅ Google account linked successfully!');
    } catch (error: any) {
      if (error.code === 'auth/credential-already-in-use') {
        alert('⚠️ This Google account is already linked to another user.');
      } else if (error.code === 'auth/provider-already-linked') {
        alert('⚠️ Google account is already linked to your profile.');
      } else if (error.code === 'auth/popup-closed-by-user') {
        alert('Popup closed before linking completed.');
      } else {
        console.error('❌ Failed to link Google account:', error);
        alert('❌ Failed to link Google account. Please try again.');
      }
    }
  };

  const unlinkGoogleAccount = async () => {
    if (!auth.currentUser) throw new Error('No user logged in');
    try {
      await unlink(auth.currentUser, 'google.com');
      alert('🗑️ Google account unlinked successfully!');
    } catch (error: any) {
      if (error.code === 'auth/no-such-provider') {
        alert('⚠️ Google account is not linked.');
      } else {
        console.error('❌ Failed to unlink Google account:', error);
        alert('❌ Failed to unlink Google account. Please try again.');
      }
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        login,
        register,
        loginWithGoogle,
        logout,
        linkGoogleAccount,
        unlinkGoogleAccount
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
