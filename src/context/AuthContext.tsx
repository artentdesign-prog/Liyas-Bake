import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User as FirebaseUser,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import {
  auth,
  BOOTSTRAPPED_ADMIN_EMAIL,
  db,
  googleProvider,
} from '../firebase';

export interface AdminUser {
  username: string;
  isFirstLogin?: boolean;
}

interface AuthContextValue {
  token: string | null;
  adminUser: AdminUser | null;
  user: AdminUser | null;
  isAuthenticated: boolean;
  isFirstLogin: boolean;
  firebaseUser: FirebaseUser | null;
  authReady: boolean;
  isFirebaseAdmin: boolean;
  isBootstrappedAdmin: boolean;
  login: (token: string, user: AdminUser) => void;
  logout: () => void;
  updateAdminInfo: (user: AdminUser) => void;
  signInWithGoogle: (
    requireAdmin?: boolean
  ) => Promise<{ success: boolean; error?: string; isAdmin?: boolean }>;
  signOutFirebase: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

async function checkFirebaseAdminRole(fbUser: FirebaseUser | null): Promise<boolean> {
  if (!fbUser || !fbUser.emailVerified) return false;
  if (
    fbUser.email?.toLowerCase() === BOOTSTRAPPED_ADMIN_EMAIL.toLowerCase()
  ) {
    return true;
  }
  try {
    const adminDoc = await getDoc(doc(db, 'admins', fbUser.uid));
    return adminDoc.exists() && adminDoc.data()?.role === 'admin';
  } catch {
    return false;
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [token, setToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem('liyas_admin_token');
    } catch {
      return null;
    }
  });
  const [adminUser, setAdminUser] = useState<AdminUser | null>(() => {
    try {
      const saved = localStorage.getItem('liyas_admin_user');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      return { username: 'admin' };
    }
    return token ? { username: 'admin' } : null;
  });

  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [isFirebaseAdmin, setIsFirebaseAdmin] = useState(false);
  const [isBootstrappedAdmin, setIsBootstrappedAdmin] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      const bootstrapped = Boolean(
        fbUser &&
          fbUser.emailVerified &&
          fbUser.email?.toLowerCase() === BOOTSTRAPPED_ADMIN_EMAIL.toLowerCase()
      );
      setIsBootstrappedAdmin(bootstrapped);
      const adminRole = bootstrapped || (await checkFirebaseAdminRole(fbUser));
      setIsFirebaseAdmin(adminRole);
      setAuthReady(true);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    try {
      if (token) {
        localStorage.setItem('liyas_admin_token', token);
      } else {
        localStorage.removeItem('liyas_admin_token');
      }
    } catch {
      // ignore storage errors
    }
  }, [token]);

  const login = useCallback((newToken: string, user: AdminUser) => {
    setToken(newToken);
    setAdminUser(user);
    try {
      localStorage.setItem('liyas_admin_token', newToken);
      localStorage.setItem('liyas_admin_user', JSON.stringify(user));
    } catch {
      // ignore storage errors
    }
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setAdminUser(null);
    try {
      localStorage.removeItem('liyas_admin_token');
      localStorage.removeItem('liyas_admin_user');
    } catch {
      // ignore storage errors
    }
    if (auth.currentUser) {
      signOut(auth).catch(() => {});
    }
  }, []);

  const updateAdminInfo = useCallback((user: AdminUser) => {
    setAdminUser(user);
    try {
      localStorage.setItem('liyas_admin_user', JSON.stringify(user));
    } catch {
      // ignore storage errors
    }
  }, []);

  const signInWithGoogle = useCallback(
    async (
      requireAdmin = false
    ): Promise<{ success: boolean; error?: string; isAdmin?: boolean }> => {
      try {
        const cred = await signInWithPopup(auth, googleProvider);
        const fbUser = cred.user;
        const bootstrapped = Boolean(
          fbUser.emailVerified &&
            fbUser.email?.toLowerCase() === BOOTSTRAPPED_ADMIN_EMAIL.toLowerCase()
        );
        const adminRole = bootstrapped || (await checkFirebaseAdminRole(fbUser));
        setFirebaseUser(fbUser);
        setIsBootstrappedAdmin(bootstrapped);
        setIsFirebaseAdmin(adminRole);

        if (requireAdmin && !adminRole) {
          return {
            success: false,
            isAdmin: false,
            error: `Account ${fbUser.email || ''} is not registered as a Firebase admin. Please sign in with ${BOOTSTRAPPED_ADMIN_EMAIL}.`,
          };
        }

        if (adminRole) {
          login('firebase-' + fbUser.uid, {
            username: fbUser.email || fbUser.displayName || 'admin',
            isFirstLogin: false,
          });
        }
        return { success: true, isAdmin: adminRole };
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Google Sign-In failed.';
        return { success: false, error: message };
      }
    },
    [login]
  );

  const signOutFirebase = useCallback(async () => {
    await signOut(auth);
    setFirebaseUser(null);
    setIsBootstrappedAdmin(false);
    setIsFirebaseAdmin(false);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        token,
        adminUser,
        user: adminUser,
        isAuthenticated: !!token,
        isFirstLogin: adminUser?.isFirstLogin || false,
        firebaseUser,
        authReady,
        isFirebaseAdmin,
        isBootstrappedAdmin,
        login,
        logout,
        updateAdminInfo,
        signInWithGoogle,
        signOutFirebase,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
};
