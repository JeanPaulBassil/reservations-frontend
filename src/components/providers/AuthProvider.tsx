import { getIdToken, onAuthStateChanged, User } from 'firebase/auth';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';

import { auth } from '@/lib/firebase';
import { fetchUserData } from '@/services/authService';

// Define a type for our user with role
interface ExtendedUser extends User {
  role?: string | null;
}

// Define a type for our context
interface AuthContextType {
  user: ExtendedUser | null;
  isInitializing: boolean;
  userRole: string | null;
  isAdmin: boolean;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isInitializing: true,
  userRole: null,
  isAdmin: false,
  refreshUserData: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<ExtendedUser | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  // Function to get user data from localStorage
  const getUserDataFromStorage = () => {
    if (typeof window === 'undefined') return null;
    
    const userData = localStorage.getItem('userData');
    if (!userData) return null;
    
    try {
      return JSON.parse(userData);
    } catch (error) {
      return null;
    }
  };

  // Helper function to extract role from various data structures
  const extractRole = (data: any): string | null => {
    if (!data) return null;
    
    // Check direct role property
    if (data.role) return data.role;
    
    // Check nested user.role
    if (data.user && data.user.role) return data.user.role;
    
    // Check nested payload.user.role (from your backend response)
    if (data.payload && data.payload.user && data.payload.user.role) {
      return data.payload.user.role;
    }
    
    return null;
  };

  // Function to refresh user data from the backend
  const refreshUserData = async () => {
    if (!user) return;

    try {
      const userData = await fetchUserData(user);
      
      if (userData) {
        const role = extractRole(userData);
        
        const extendedUser = {
          ...user,
          role: role,
        };
        
        setUser(extendedUser);
        setUserRole(role);
      }
    } catch (error) {
      // Silent error handling
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Get user data from localStorage (including role)
        const userData = getUserDataFromStorage();
        
        // If we have userData with role, extend the firebase user
        if (userData) {
          const role = extractRole(userData);
          
          const extendedUser = {
            ...firebaseUser,
            role: role,
          };
          setUser(extendedUser);
          setUserRole(role);
        } else {
          // If no userData in localStorage but we have a firebase user,
          // fetch fresh data from backend
          setUser(firebaseUser); // Set the basic user first
          
          try {
            const backendData = await fetchUserData(firebaseUser);
            
            if (backendData) {
              const role = extractRole(backendData);
              
              const extendedUser = {
                ...firebaseUser,
                role: role,
              };
              
              setUser(extendedUser);
              setUserRole(role);
            }
          } catch (error) {
            // Silent error handling
          }
        }
      } else {
        setUser(null);
        setUserRole(null);
      }
      
      setIsInitializing(false);
    });

    return () => unsubscribe();
  }, []);

  const value = useMemo(
    () => ({
      user,
      isInitializing,
      userRole,
      isAdmin: userRole === 'ADMIN',
      refreshUserData,
    }),
    [user, isInitializing, userRole]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth() {
  return useContext(AuthContext);
}
