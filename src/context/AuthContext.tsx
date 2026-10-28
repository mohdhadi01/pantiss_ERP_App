import React, { createContext, useState, useEffect } from 'react';
import { AuthContextValue, AuthUser } from '../types/auth';
import { dummyUsers } from '../data/dummyUsers';
import { storage } from '../utils/storage';

const AUTH_USER_KEY = 'auth_user';

export const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    storage.get<AuthUser | null>(AUTH_USER_KEY, null).then((savedUser) => {
      if (savedUser) {
        setUser(savedUser);
      }
      setIsLoading(false);
    });
  }, []);

  const login = async (id: string, password: string, remember: boolean = true) => {
    const trimmedId = id.trim().toLowerCase();
    const found = dummyUsers.find(
      (u) => u.id.toLowerCase() === trimmedId && u.password === password
    );

    if (found) {
      const authUser: AuthUser = {
        id: found.id,
        name: found.name,
        initials: found.initials,
        role: found.role,
        roleLabel: found.roleLabel,
        moduleId: found.moduleId,
        allowedSections: found.allowedSections,
      };

      setUser(authUser);
      if (remember) {
        await storage.set(AUTH_USER_KEY, authUser);
      }
      return { success: true, user: authUser };
    }

    return { success: false, error: 'Invalid user email or password. Please select a demo account or verify credentials.' };
  };

  const logout = async () => {
    setUser(null);
    await storage.remove(AUTH_USER_KEY);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
