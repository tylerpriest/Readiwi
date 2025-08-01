"use client";

import { useParams } from 'next/navigation';
import ReaderView from '@/plugins/reader/components/ReaderView';

export default function ChapterReadPage() {
  const params = useParams();
  const bookId = parseInt(params.bookId as string, 10);
  const slug = params.slug as string;
  const chapterId = parseInt(params.chapterId as string, 10);
  const chapterSlug = params.chapterSlug as string;

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

  if (!chapterSlug) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Invalid Chapter URL</h1>
          <p className="text-muted-foreground">Please provide a valid chapter slug.</p>
        </div>
      </div>
    );
  }

  return (
    <ReaderView 
      bookId={bookId} 
      slug={slug}
      chapterId={chapterId}
      chapterSlug={chapterSlug}
    />
  );
}