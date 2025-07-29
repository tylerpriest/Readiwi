export interface AuthUser {
  id: string;
  email: string;
  username: string;
  displayName: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
  emailVerified: boolean;
  preferences: UserPreferences;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'sepia' | 'auto';
  language: string;
  timezone: string;
  notifications: {
    email: boolean;
    push: boolean;
    reading: boolean;
  };
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
  displayName: string;
  acceptTerms: boolean;
}

export interface AuthResult {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirm {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  sessionExpiresAt: number | null;
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface AuthError extends Error {
  code: string;
  statusCode?: number;
  validationErrors?: ValidationError[];
}