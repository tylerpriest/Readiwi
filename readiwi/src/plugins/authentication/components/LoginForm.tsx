"use client";

import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/core/utils/cn';
import { useAuthStore } from '../stores/auth-store';
import { LoginCredentials, ValidationError } from '../types/auth-types';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

interface LoginFormProps {
  onSuccess?: () => void; // @description Callback when login succeeds
  onRegisterClick?: () => void; // @description Callback when register link is clicked
  className?: string; // @description Additional CSS classes
  'data-testid'?: string; // @description Test identifier for testing
}

const LoginForm: React.FC<LoginFormProps> = ({
  onSuccess,
  onRegisterClick,
  className,
  'data-testid': testId,
  ...props
}) => {
  // 1. State hooks
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  
  // 2. Store subscriptions
  const { login, loading, error, clearError } = useAuthStore();
  
  // 3. Event handlers with useCallback for performance
  const handleInputChange = useCallback((field: keyof LoginCredentials) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    try {
      const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
      
      setCredentials(prev => ({
        ...prev,
        [field]: value,
      }));
      
      // Clear field error when user starts typing
      if (fieldErrors[field]) {
        setFieldErrors(prev => ({
          ...prev,
          [field]: '',
        }));
      }
      
      // Clear global error
      if (error) {
        clearError();
      }
    } catch (error) {
      console.error(`Error in LoginForm.handleInputChange:`, error);
    }
  }, [fieldErrors, error, clearError]);
  
  const handleTogglePassword = useCallback(() => {
    try {
      setShowPassword(prev => !prev);
    } catch (error) {
      console.error(`Error in LoginForm.handleTogglePassword:`, error);
    }
  }, []);
  
  const handleSubmit = useCallback(async (event: React.FormEvent) => {
    event.preventDefault();
    
    try {
      // Clear previous errors
      setFieldErrors({});
      clearError();
      
      await login(credentials);
      onSuccess?.();
    } catch (error) {
      console.error(`Error in LoginForm.handleSubmit:`, error);
      
      // Handle validation errors
      if (error && typeof error === 'object' && 'validationErrors' in error) {
        const validationErrors = (error as any).validationErrors as ValidationError[];
        const newFieldErrors: Record<string, string> = {};
        
        validationErrors.forEach(validationError => {
          newFieldErrors[validationError.field] = validationError.message;
        });
        
        setFieldErrors(newFieldErrors);
      }
    }
  }, [credentials, login, onSuccess, clearError]);
  
  const handleRegisterClick = useCallback((event: React.MouseEvent) => {
    try {
      event.preventDefault();
      onRegisterClick?.();
    } catch (error) {
      console.error(`Error in LoginForm.handleRegisterClick:`, error);
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
          Welcome Back
        </CardTitle>
        <CardDescription>
          Sign in to your Readiwi account to continue reading
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {/* Email Field */}
          <div className="space-y-2">
            <label 
              htmlFor="login-email"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Email
            </label>
            <Input
              id="login-email"
              type="email"
              placeholder="Enter your email"
              value={credentials.email}
              onChange={handleInputChange('email')}
              disabled={loading}
              aria-invalid={!!fieldErrors.email}
              aria-describedby={fieldErrors.email ? "email-error" : undefined}
              className={cn(
                fieldErrors.email && "border-destructive focus-visible:ring-destructive"
              )}
              data-testid="login-email-input"
            />
            {fieldErrors.email && (
              <p 
                id="email-error"
                className="text-sm text-destructive"
                role="alert"
                aria-live="polite"
              >
                {fieldErrors.email}
              </p>
            )}
          </div>
          
          {/* Password Field */}
          <div className="space-y-2">
            <label 
              htmlFor="login-password"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Password
            </label>
            <div className="relative">
              <Input
                id="login-password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={credentials.password}
                onChange={handleInputChange('password')}
                disabled={loading}
                aria-invalid={!!fieldErrors.password}
                aria-describedby={fieldErrors.password ? "password-error" : undefined}
                className={cn(
                  "pr-10",
                  fieldErrors.password && "border-destructive focus-visible:ring-destructive"
                )}
                data-testid="login-password-input"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={handleTogglePassword}
                disabled={loading}
                aria-label={showPassword ? "Hide password" : "Show password"}
                data-testid="toggle-password-visibility"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Eye className="h-4 w-4" aria-hidden="true" />
                )}
              </Button>
            </div>
            {fieldErrors.password && (
              <p 
                id="password-error"
                className="text-sm text-destructive"
                role="alert"
                aria-live="polite"
              >
                {fieldErrors.password}
              </p>
            )}
          </div>
          
          {/* Remember Me */}
          <div className="flex items-center space-x-2">
            <input
              id="remember-me"
              type="checkbox"
              checked={credentials.rememberMe}
              onChange={handleInputChange('rememberMe')}
              disabled={loading}
              className="peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
              data-testid="remember-me-checkbox"
            />
            <label
              htmlFor="remember-me"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Remember me for 30 days
            </label>
          </div>
          
          {/* Global Error */}
          {error && (
            <div 
              className="p-3 rounded-md bg-destructive/10 border border-destructive/20"
              role="alert"
              aria-live="polite"
            >
              <p className="text-sm text-destructive font-medium">
                {error}
              </p>
            </div>
          )}
          
          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            disabled={loading || !credentials.email || !credentials.password}
            data-testid="login-submit-button"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </Button>
          
          {/* Register Link */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Don&apos;t have an account?{' '}
              <button
                type="button"
                onClick={handleRegisterClick}
                className="font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
                disabled={loading}
                data-testid="register-link"
              >
                Create one here
              </button>
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

LoginForm.displayName = 'LoginForm';
export default LoginForm;