"use client";

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function ChapterFallbackPage() {
  const params = useParams();
  const router = useRouter();
  const [redirecting, setRedirecting] = useState(false);
  
  const bookId = parseInt(params.bookId as string, 10);
  const slug = params.slug as string;
  const chapterId = parseInt(params.chapterId as string, 10);

  useEffect(() => {
    // This is a fallback route for /read/[bookId]/[slug]/[chapterId] only
    // We need to get the chapter slug and redirect to proper URL
    const redirectToChapterWithSlug = async () => {
      if (!isNaN(bookId) && slug && !isNaN(chapterId) && !redirecting) {
        setRedirecting(true);
        
        try {
          // TODO: Get chapter details from database to get slug
          // For now, generate a placeholder slug
          const placeholderChapterSlug = `chapter-${chapterId}`;
          
          console.log(`Redirecting to chapter with slug: /read/${bookId}/${slug}/${chapterId}/${placeholderChapterSlug}`);
          router.replace(`/read/${bookId}/${slug}/${chapterId}/${placeholderChapterSlug}`);
        } catch (error) {
          console.error('Failed to redirect to chapter with slug:', error);
          setRedirecting(false);
        }
      }
    };

    redirectToChapterWithSlug();
  }, [bookId, slug, chapterId, router, redirecting]);

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

  if (isNaN(chapterId)) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Invalid Chapter ID</h1>
          <p className="text-muted-foreground">Please provide a valid chapter ID to read.</p>
        </div>
      </div>
    );
  }

  // Show loading while redirecting
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading chapter...</p>
      </div>
    </div>
  );
}