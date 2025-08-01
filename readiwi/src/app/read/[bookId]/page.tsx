"use client";

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function BookFallbackPage() {
  const params = useParams();
  const router = useRouter();
  const [redirecting, setRedirecting] = useState(false);
  
  const bookId = parseInt(params.bookId as string, 10);

  useEffect(() => {
    // This is a fallback route for /read/[bookId] only
    // We need to get the book slug and redirect to proper URL
    const redirectToBookWithSlug = async () => {
      if (!isNaN(bookId) && !redirecting) {
        setRedirecting(true);
        
        try {
          // TODO: Get book details from database to get slug
          // For now, generate a placeholder slug
          const placeholderSlug = `book-${bookId}`;
          
          console.log(`Redirecting to book with slug: /read/${bookId}/${placeholderSlug}`);
          router.replace(`/read/${bookId}/${placeholderSlug}`);
        } catch (error) {
          console.error('Failed to redirect to book with slug:', error);
          setRedirecting(false);
        }
      }
    };

    redirectToBookWithSlug();
  }, [bookId, router, redirecting]);

  if (isNaN(bookId)) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Invalid Book ID</h1>
          <p className="text-muted-foreground">Please provide a valid book ID to read.</p>
        </div>
      </div>
    );
  }

  // Show loading while redirecting
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading book...</p>
      </div>
    </div>
  );
}