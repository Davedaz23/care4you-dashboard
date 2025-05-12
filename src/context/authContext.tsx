'use client'; // Add this directive at the top

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

// Define the AdminUser type with required properties
type AdminUser = {
  uid: string;
  phone: string;
  role: string;
};

// Create the context with initial values
const AdminAuthContext = createContext<{
  user: AdminUser | null;
  loading: boolean;
  logout: () => void;
}>({
  user: null,
  loading: true,
  logout: () => {},
});

// AdminAuthProvider component to wrap around your application and provide context
export const AdminAuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('adminUser');
    if (stored) {
      setUser(JSON.parse(stored));
    }
    setLoading(false);
  }, []);

  const logout = () => {
    localStorage.removeItem('adminUser');
    setUser(null);
  };

  return (
    <AdminAuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

// Custom hook to access the context values
export const useAdminAuth = () => useContext(AdminAuthContext);
