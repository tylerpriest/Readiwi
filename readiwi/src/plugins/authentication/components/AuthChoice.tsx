"use client";

import React, { useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/core/utils/cn';
import { useAuthStore } from '../stores/auth-store';
import { User, BookOpen } from 'lucide-react';

interface AuthChoiceProps {
  onLoginClick?: () => void; // @description Callback when login option is clicked
  onRegisterClick?: () => void; // @description Callback when register option is clicked
  className?: string; // @description Additional CSS classes
  'data-testid'?: string; // @description Test identifier for testing
}

const AuthChoice: React.FC<AuthChoiceProps> = ({
  onLoginClick,
  onRegisterClick,
  className,
  'data-testid': testId,
  ...props
}) => {
  // 2. Store subscriptions
  const { continueAsAnonymous } = useAuthStore();
  
  // 3. Event handlers with useCallback for performance
  const handleContinueAnonymous = useCallback(() => {
    try {
      continueAsAnonymous();
    } catch (error) {
      console.error(`Error in AuthChoice.handleContinueAnonymous:`, error);
    }
  }, [continueAsAnonymous]);
  
  const handleLoginClick = useCallback(() => {
    try {
      onLoginClick?.();
    } catch (error) {
      console.error(`Error in AuthChoice.handleLoginClick:`, error);
    }
  }, [onLoginClick]);
  
  const handleRegisterClick = useCallback(() => {
    try {
      onRegisterClick?.();
    } catch (error) {
      console.error(`Error in AuthChoice.handleRegisterClick:`, error);
    }
  }, [onRegisterClick]);
  
  // 5. Render with accessibility and performance optimization
  return (
    <Card
      className={cn('w-full max-w-md mx-auto', className)}
      data-testid={testId}
      {...props}
    >
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">
          Welcome to Readiwi
        </CardTitle>
        <CardDescription>
          Your personal audiobook reader for web novels
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Continue Anonymously */}
        <Button
          onClick={handleContinueAnonymous}
          variant="outline"
          size="lg"
          className="w-full h-auto p-4 flex flex-col items-center gap-2"
          data-testid="continue-anonymous-button"
        >
          <BookOpen className="h-6 w-6" aria-hidden="true" />
          <div className="text-center">
            <div className="font-semibold">Continue Without Account</div>
            <div className="text-xs text-muted-foreground">
              Start reading immediately - no signup required
            </div>
          </div>
        </Button>
        
        {/* Sign In */}
        <Button
          onClick={handleLoginClick}
          variant="default"
          size="lg"
          className="w-full h-auto p-4 flex flex-col items-center gap-2"
          data-testid="sign-in-button"
        >
          <User className="h-6 w-6" aria-hidden="true" />
          <div className="text-center">
            <div className="font-semibold">Sign In</div>
            <div className="text-xs opacity-90">
              Access your saved books and reading progress
            </div>
          </div>
        </Button>
        
        {/* Create Account */}
        <Button
          onClick={handleRegisterClick}
          variant="secondary"
          size="lg"
          className="w-full h-auto p-4 flex flex-col items-center gap-2"
          data-testid="create-account-button"
        >
          <User className="h-6 w-6" aria-hidden="true" />
          <div className="text-center">
            <div className="font-semibold">Create Free Account</div>
            <div className="text-xs text-muted-foreground">
              Sync across devices and backup your library
            </div>
          </div>
        </Button>
        
        {/* Benefits Info */}
        <div className="text-center text-xs text-muted-foreground space-y-1">
          <p>✓ No account needed to start reading</p>
          <p>✓ Create account later to sync progress</p>
          <p>✓ Always free to use</p>
        </div>
      </CardContent>
    </Card>
  );
};

AuthChoice.displayName = 'AuthChoice';
export default AuthChoice;