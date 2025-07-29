import { AuthUser, LoginCredentials, RegisterData, AuthResult, PasswordResetRequest, PasswordResetConfirm, AuthError } from '../types/auth-types';
import { authValidation } from './auth-validation';

// Mock authentication service - in production this would connect to a backend API
class AuthService {
  private readonly STORAGE_KEY = 'readiwi-auth-tokens';
  
  async login(credentials: LoginCredentials): Promise<AuthResult> {
    // Validate credentials
    const validation = authValidation.validateLogin(credentials);
    if (!validation.isValid) {
      throw this.createValidationError('Invalid credentials', validation.errors);
    }
    
    // Simulate API call delay
    await this.simulateNetworkDelay();
    
    // Mock authentication logic - in production, this would call your backend
    if (credentials.email === 'demo@readiwi.com' && credentials.password === 'demo123') {
      const user: AuthUser = {
        id: 'demo-user-123',
        email: credentials.email,
        username: 'demo_user',
        displayName: 'Demo User',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date(),
        emailVerified: true,
        preferences: {
          theme: 'auto',
          language: 'en',
          timezone: 'UTC',
          notifications: {
            email: true,
            push: false,
            reading: true,
          },
        },
      };
      
      const accessToken = this.generateMockToken();
      const refreshToken = this.generateMockToken();
      const expiresAt = Date.now() + (credentials.rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000);
      
      // Store tokens securely
      this.storeTokens({ accessToken, refreshToken });
      
      return {
        user,
        accessToken,
        refreshToken,
        expiresAt,
      };
    }
    
    throw this.createAuthError('Invalid email or password', 'INVALID_CREDENTIALS', 401);
  }
  
  async register(data: RegisterData): Promise<AuthResult> {
    // Validate registration data
    const validation = authValidation.validateRegistration(data);
    if (!validation.isValid) {
      throw this.createValidationError('Registration validation failed', validation.errors);
    }
    
    // Simulate API call delay
    await this.simulateNetworkDelay();
    
    // Mock registration logic - check if email already exists
    if (data.email === 'demo@readiwi.com') {
      throw this.createAuthError('Email already registered', 'EMAIL_EXISTS', 409);
    }
    
    const user: AuthUser = {
      id: `user-${Date.now()}`,
      email: data.email,
      username: data.username,
      displayName: data.displayName,
      createdAt: new Date(),
      updatedAt: new Date(),
      emailVerified: false,
      preferences: {
        theme: 'auto',
        language: 'en',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        notifications: {
          email: true,
          push: false,
          reading: true,
        },
      },
    };
    
    const accessToken = this.generateMockToken();
    const refreshToken = this.generateMockToken();
    const expiresAt = Date.now() + (24 * 60 * 60 * 1000); // 24 hours
    
    // Store tokens securely
    this.storeTokens({ accessToken, refreshToken });
    
    return {
      user,
      accessToken,
      refreshToken,
      expiresAt,
    };
  }
  
  async logout(): Promise<void> {
    // Simulate API call delay
    await this.simulateNetworkDelay();
    
    // Clear stored tokens
    this.clearTokens();
    
    // In production, would call backend to invalidate tokens
  }
  
  async refreshSession(): Promise<AuthResult> {
    const tokens = this.getStoredTokens();
    if (!tokens?.refreshToken) {
      throw this.createAuthError('No refresh token available', 'NO_REFRESH_TOKEN', 401);
    }
    
    // Simulate API call delay
    await this.simulateNetworkDelay();
    
    // Mock refresh logic - in production, validate refresh token with backend
    const user: AuthUser = {
      id: 'demo-user-123',
      email: 'demo@readiwi.com',
      username: 'demo_user',
      displayName: 'Demo User',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date(),
      emailVerified: true,
      preferences: {
        theme: 'auto',
        language: 'en',
        timezone: 'UTC',
        notifications: {
          email: true,
          push: false,
          reading: true,
        },
      },
    };
    
    const accessToken = this.generateMockToken();
    const refreshToken = this.generateMockToken();
    const expiresAt = Date.now() + (24 * 60 * 60 * 1000); // 24 hours
    
    // Update stored tokens
    this.storeTokens({ accessToken, refreshToken });
    
    return {
      user,
      accessToken,
      refreshToken,
      expiresAt,
    };
  }
  
  async requestPasswordReset(request: PasswordResetRequest): Promise<void> {
    const validation = authValidation.validateEmail(request.email);
    if (!validation.isValid) {
      throw this.createValidationError('Invalid email address', validation.errors);
    }
    
    // Simulate API call delay
    await this.simulateNetworkDelay();
    
    // Mock password reset request - in production, would send email
    console.log(`Password reset email would be sent to: ${request.email}`);
  }
  
  async confirmPasswordReset(data: PasswordResetConfirm): Promise<void> {
    const validation = authValidation.validatePasswordReset(data);
    if (!validation.isValid) {
      throw this.createValidationError('Password reset validation failed', validation.errors);
    }
    
    // Simulate API call delay
    await this.simulateNetworkDelay();
    
    // Mock password reset confirmation
    console.log('Password reset completed successfully');
  }
  
  private generateMockToken(): string {
    return btoa(JSON.stringify({
      iat: Date.now(),
      exp: Date.now() + (24 * 60 * 60 * 1000),
      sub: 'demo-user-123',
      iss: 'readiwi-auth',
    }));
  }
  
  private storeTokens(tokens: { accessToken: string; refreshToken: string }): void {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(tokens));
      }
    } catch (error) {
      console.error('Failed to store auth tokens:', error);
    }
  }
  
  private getStoredTokens(): { accessToken: string; refreshToken: string } | null {
    try {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem(this.STORAGE_KEY);
        return stored ? JSON.parse(stored) : null;
      }
    } catch (error) {
      console.error('Failed to retrieve auth tokens:', error);
    }
    return null;
  }
  
  private clearTokens(): void {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(this.STORAGE_KEY);
      }
    } catch (error) {
      console.error('Failed to clear auth tokens:', error);
    }
  }
  
  private async simulateNetworkDelay(): Promise<void> {
    // Simulate realistic network delay
    const delay = Math.random() * 500 + 200; // 200-700ms
    await new Promise(resolve => setTimeout(resolve, delay));
  }
  
  private createAuthError(message: string, code: string, statusCode?: number): AuthError {
    const error = new Error(message) as AuthError;
    error.code = code;
    error.statusCode = statusCode;
    return error;
  }
  
  private createValidationError(message: string, validationErrors: any[]): AuthError {
    const error = new Error(message) as AuthError;
    error.code = 'VALIDATION_ERROR';
    error.statusCode = 400;
    error.validationErrors = validationErrors;
    return error;
  }
}

export const authService = new AuthService();