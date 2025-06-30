'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { subscribeToAuthChanges } from '@/config/auth';
import { Route } from 'next';
import { Route } from 'next';

interface AuthGuardProps {
  children: ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges((user) => {
      if (!user) {
        // Clear any existing user data
        localStorage.removeItem('adminUser');
        router.push('/auth/login' as Route);
      } else {
        // Store the user data in localStorage
        localStorage.setItem('adminUser', JSON.stringify(user));
        setLoading(false);
      }
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <span className="text-sky-600 font-semibold">Loading...</span>
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthGuard;
