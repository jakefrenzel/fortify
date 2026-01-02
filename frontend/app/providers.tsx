'use client';

import { useEffect } from 'react';
import { AuthProvider } from '@/context/AuthContext';
import { initializeCsrfToken } from '@/lib/axios';

export function Providers({ children }: { children: React.ReactNode }) {

  useEffect(() => {
    // Initialize CSRF token when app loads
    initializeCsrfToken();
  }, []);

  return (
    <>
      <AuthProvider>
        {children}
      </AuthProvider>
    </>
  );
}