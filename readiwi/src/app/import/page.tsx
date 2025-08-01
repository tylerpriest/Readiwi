/**
 * Import Page - Readiwi v4.0
 * Dedicated page for importing books from web sources
 */

'use client';

import ImportView from '@/plugins/book-import/components/ImportView';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ImportPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <Button 
            onClick={() => router.back()} 
            variant="ghost" 
            className="mb-4 -ml-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Library
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Import Book</h1>
          <p className="text-muted-foreground mt-2">
            Import books from supported web novel platforms
          </p>
        </div>
        <ImportView />
      </div>
    </div>
  );
}