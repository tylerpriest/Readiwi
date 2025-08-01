/**
 * Navigation Settings - Readiwi v4.0
 * Quick access to all app features and pages
 */

"use client";

import React, { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/core/utils/cn';
import { 
  BookOpen, 
  Download, 
  Library, 
  Settings, 
  LogIn,
  Home,
  ExternalLink,
  FileText,
  Volume2,
  Search
} from 'lucide-react';

interface NavigationSettingsProps {
  className?: string;
  'data-testid'?: string;
}

interface NavigationItem {
  id: string;
  title: string;
  description: string;
  path: string;
  icon: React.ReactNode;
  status: 'ready' | 'beta' | 'coming-soon';
  external?: boolean;
}

const NavigationSettings: React.FC<NavigationSettingsProps> = ({
  className,
  'data-testid': testId,
  ...props
}) => {
  const router = useRouter();

  // Define all available pages and features
  const navigationItems: NavigationItem[] = [
    {
      id: 'home',
      title: 'Home',
      description: 'Main application dashboard',
      path: '/',
      icon: <Home className="w-4 h-4" />,
      status: 'ready'
    },
    {
      id: 'library',
      title: 'Library',
      description: 'Browse and manage your book collection',
      path: '/library',
      icon: <Library className="w-4 h-4" />,
      status: 'ready'
    },
    {
      id: 'import',
      title: 'Import Books',
      description: 'Import books from web novel sites',
      path: '/import',
      icon: <Download className="w-4 h-4" />,
      status: 'ready'
    },
    {
      id: 'reader',
      title: 'Reader',
      description: 'Reading interface with position tracking',
      path: '/read/[bookId]/[slug]',
      icon: <BookOpen className="w-4 h-4" />,
      status: 'ready'
    },
    {
      id: 'settings',
      title: 'Settings',
      description: 'Configure reading preferences and app behavior',
      path: '/settings',
      icon: <Settings className="w-4 h-4" />,
      status: 'ready'
    },
    {
      id: 'login',
      title: 'Authentication',
      description: 'Login and account management',
      path: '/login',
      icon: <LogIn className="w-4 h-4" />,
      status: 'beta'
    }
  ];

  const handleNavigate = useCallback((item: NavigationItem) => {
    if (item.external) {
      window.open(item.path, '_blank');
    } else if (item.path.includes('[')) {
      // Handle dynamic routes - show info instead of navigating
      alert(`This is a dynamic route. Example: ${item.path.replace('[bookId]', '1').replace('[slug]', 'example-book')}`);
    } else {
      router.push(item.path);
    }
  }, [router]);

  const getStatusColor = (status: NavigationItem['status']) => {
    switch (status) {
      case 'ready':
        return 'bg-green-500';
      case 'beta':
        return 'bg-yellow-500';
      case 'coming-soon':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = (status: NavigationItem['status']) => {
    switch (status) {
      case 'ready':
        return 'Ready';
      case 'beta':
        return 'Beta';
      case 'coming-soon':
        return 'Coming Soon';
      default:
        return 'Unknown';
    }
  };

  return (
    <div
      className={cn('space-y-6', className)}
      data-testid={testId}
      {...props}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Quick Navigation
          </CardTitle>
          <CardDescription>
            Access all available features and pages in Readiwi. Click on any item to navigate directly to that feature.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {navigationItems.map((item) => (
              <Card 
                key={item.id} 
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => handleNavigate(item)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      {item.icon}
                      <div>
                        <h4 className="font-medium flex items-center gap-2">
                          {item.title}
                          {item.external && <ExternalLink className="w-3 h-3" />}
                        </h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {item.description}
                        </p>
                      </div>
                    </div>
                    <Badge 
                      variant="secondary"
                      className={cn(
                        'text-white text-xs',
                        getStatusColor(item.status)
                      )}
                    >
                      {getStatusText(item.status)}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground font-mono">
                    {item.path}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Available Features
          </CardTitle>
          <CardDescription>
            Overview of current application capabilities and their status.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b">
              <span className="flex items-center gap-2">
                <Library className="w-4 h-4" />
                Book Library Management
              </span>
              <Badge className="bg-green-500 text-white">Functional</Badge>
            </div>
            <div className="flex items-center justify-between py-2 border-b">
              <span className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                Web Book Import (Royal Road)
              </span>
              <Badge className="bg-green-500 text-white">Functional</Badge>
            </div>
            <div className="flex items-center justify-between py-2 border-b">
              <span className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Reading Interface
              </span>
              <Badge className="bg-green-500 text-white">Functional</Badge>
            </div>
            <div className="flex items-center justify-between py-2 border-b">
              <span className="flex items-center gap-2">
                <Volume2 className="w-4 h-4" />
                Text-to-Speech
              </span>
              <Badge className="bg-green-500 text-white">Functional</Badge>
            </div>
            <div className="flex items-center justify-between py-2 border-b">
              <span className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Position Tracking
              </span>
              <Badge className="bg-yellow-500 text-white">Advanced</Badge>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="flex items-center gap-2">
                <LogIn className="w-4 h-4" />
                User Authentication
              </span>
              <Badge className="bg-yellow-500 text-white">Demo Only</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Development Notes</CardTitle>
          <CardDescription>
            Current development status and known limitations.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm space-y-2">
            <p><strong>✅ Working:</strong> Book import, library management, reading interface, TTS</p>
            <p><strong>🔄 In Progress:</strong> Position tracking persistence, user authentication</p>
            <p><strong>📋 Planned:</strong> Cloud sync, advanced search, reading statistics</p>
            <p><strong>🚨 Known Issues:</strong> Some parsers may fail on certain websites</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

NavigationSettings.displayName = 'NavigationSettings';
export default NavigationSettings;