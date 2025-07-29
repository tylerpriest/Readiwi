"use client";

import { useParams } from 'next/navigation';
import ReaderView from '@/plugins/reader/components/ReaderView';

export default function ReadPage() {
  const params = useParams();
  const bookId = parseInt(params.bookId as string, 10);

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

  return <ReaderView bookId={bookId} />;
}