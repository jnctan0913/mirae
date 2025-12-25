'use client';

import React from 'react';
import { FloatingChat } from './chat/FloatingChat';
import { usePathname } from 'next/navigation';

export const ClientProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();

  // Don't show chat on login page or onboarding page
  const hideChat = pathname === '/login' || pathname === '/onboarding';

  return (
    <>
      {children}
      {!hideChat && <FloatingChat />}
    </>
  );
};
