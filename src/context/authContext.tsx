'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type AdminUser = {
  uid: string;
  phone: string;
  role: string;
  name?: string;
  hospitalId?: string;
  hospitalName?: string;
};

type AuthContextType = {
  user: AdminUser | null;
  loading: boolean;
  logout: () => void;
  setUser: (user: AdminUser | null) => void; // Add setUser to the context
};

const AdminAuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  logout: () => {},
  setUser: () => {},
});

export const AdminAuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const storedUser = localStorage.getItem('adminUser');
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          if (parsedUser.uid && parsedUser.phone && parsedUser.role) {
            setUser(parsedUser);
          } else {
            console.error('Invalid user data in storage');
            localStorage.removeItem('adminUser');
          }
        } catch (error) {
          console.error('Error parsing user data', error);
          localStorage.removeItem('adminUser');
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const logout = () => {
    localStorage.removeItem('adminUser');
    setUser(null);
  };

  return (
    <AdminAuthContext.Provider value={{ user, loading, logout, setUser }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => useContext(AdminAuthContext);
