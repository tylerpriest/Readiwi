"use client";

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import ReaderView from '@/plugins/reader/components/ReaderView';

export default function ReadPage() {
  const params = useParams();
  const router = useRouter();
  const [redirecting, setRedirecting] = useState(false);
  
  const bookId = parseInt(params.bookId as string, 10);
  const slug = params.slug as string;

  useEffect(() => {
    // This is a fallback route for /read/[bookId]/[slug]
    // Ideally, we should redirect to the first chapter or user's last position
    const redirectToFirstChapter = async () => {
      if (!isNaN(bookId) && slug && !redirecting) {
        setRedirecting(true);
        
        try {
          // TODO: Get user's last reading position or first chapter
          // For now, redirect to a placeholder chapter
          const firstChapterId = 1;
          const firstChapterSlug = 'chapter-1';
          
          console.log(`Redirecting to first chapter: /read/${bookId}/${slug}/${firstChapterId}/${firstChapterSlug}`);
          router.replace(`/read/${bookId}/${slug}/${firstChapterId}/${firstChapterSlug}`);
        } catch (error) {
          console.error('Failed to redirect to chapter:', error);
          setRedirecting(false);
        }
      }
    };

    redirectToFirstChapter();
  }, [bookId, slug, router, redirecting]);

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

  if (!slug) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Invalid Book URL</h1>
          <p className="text-muted-foreground">Please provide a valid book slug.</p>
        </div>
      </div>
    );
  }

  // Show loading while redirecting to specific chapter
  if (redirecting) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Finding your reading position...</p>
        </div>
      </div>
    );
  }

  // Fallback: render ReaderView without chapter info (for backwards compatibility)
  return <ReaderView bookId={bookId} slug={slug} />;
}