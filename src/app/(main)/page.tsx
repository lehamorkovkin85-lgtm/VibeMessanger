'use client';

import { useUser } from '@/components/UserProvider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function RootIndex() {
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        // Redirect to a specific chat, but in this root level it will just be managed by (main)/layout
      } else {
        router.push('/login');
      }
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  // If user is authenticated, we return null because we will be using a (main) layout
  // Actually, we should redirect to a specific default page inside (main), like /chat or just let (main) handle it.
  // Wait, if Next.js app router uses `page.tsx` at the root, we want to show the main chat UI here for authenticated users.
  // So instead of a layout doing redirect, the root `page.tsx` will be a dashboard/empty state for chat.
  
  if (!user) return null;

  return (
    <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
      <div className="w-16 h-16 mb-4 opacity-50 bg-primary/20 rounded-2xl flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      </div>
      <p>Выберите друга слева, чтобы начать общение</p>
    </div>
  );
}
