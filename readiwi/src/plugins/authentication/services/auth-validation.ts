import { LoginCredentials, RegisterData, PasswordResetConfirm, ValidationError } from '../types/auth-types';

interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

class AuthValidation {
  validateLogin(credentials: LoginCredentials): ValidationResult {
    const errors: ValidationError[] = [];
    
    // Email validation
    if (!credentials.email) {
      errors.push({
        field: 'email',
        message: 'Email is required',
        code: 'REQUIRED',
      });
    } else if (!this.isValidEmail(credentials.email)) {
      errors.push({
        field: 'email',
        message: 'Please enter a valid email address',
        code: 'INVALID_FORMAT',
      });
    }
    
    // Password validation
    if (!credentials.password) {
      errors.push({
        field: 'password',
        message: 'Password is required',
        code: 'REQUIRED',
      });
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  }
  
  validateRegistration(data: RegisterData): ValidationResult {
    const errors: ValidationError[] = [];
    
    // Email validation
    if (!data.email) {
      errors.push({
        field: 'email',
        message: 'Email is required',
        code: 'REQUIRED',
      });
    } else if (!this.isValidEmail(data.email)) {
      errors.push({
        field: 'email',
        message: 'Please enter a valid email address',
        code: 'INVALID_FORMAT',
      });
    }
    
    // Username validation
    if (!data.username) {
      errors.push({
        field: 'username',
        message: 'Username is required',
        code: 'REQUIRED',
      });
    } else if (!this.isValidUsername(data.username)) {
      errors.push({
        field: 'username',
        message: 'Username must be 3-20 characters, letters, numbers, and underscores only',
        code: 'INVALID_FORMAT',
      });
    }
    
    // Display name validation
    if (!data.displayName) {
      errors.push({
        field: 'displayName',
        message: 'Display name is required',
        code: 'REQUIRED',
      });
    } else if (data.displayName.length < 2 || data.displayName.length > 50) {
      errors.push({
        field: 'displayName',
        message: 'Display name must be 2-50 characters',
        code: 'INVALID_LENGTH',
      });
    }
    
    // Password validation
    const passwordValidation = this.validatePassword(data.password);
    if (!passwordValidation.isValid) {
      errors.push(...passwordValidation.errors);
    }
    
    // Confirm password validation
    if (!data.confirmPassword) {
      errors.push({
        field: 'confirmPassword',
        message: 'Please confirm your password',
        code: 'REQUIRED',
      });
    } else if (data.password !== data.confirmPassword) {
      errors.push({
        field: 'confirmPassword',
        message: 'Passwords do not match',
        code: 'PASSWORD_MISMATCH',
      });
    }
    
    // Terms acceptance validation
    if (!data.acceptTerms) {
      errors.push({
        field: 'acceptTerms',
        message: 'Please accept the terms and conditions',
        code: 'REQUIRED',
      });
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  }
  
  validatePassword(password: string): ValidationResult {
    const errors: ValidationError[] = [];
    
    if (!password) {
      errors.push({
        field: 'password',
        message: 'Password is required',
        code: 'REQUIRED',
      });
      return { isValid: false, errors };
    }
    
    if (password.length < 8) {
      errors.push({
        field: 'password',
        message: 'Password must be at least 8 characters long',
        code: 'TOO_SHORT',
      });
    }
    
    if (password.length > 128) {
      errors.push({
        field: 'password',
        message: 'Password must be less than 128 characters',
        code: 'TOO_LONG',
      });
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push({
        field: 'password',
        message: 'Password must contain at least one lowercase letter',
        code: 'MISSING_LOWERCASE',
      });
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push({
        field: 'password',
        message: 'Password must contain at least one uppercase letter',
        code: 'MISSING_UPPERCASE',
      });
    }
    
    if (!/\d/.test(password)) {
      errors.push({
        field: 'password',
        message: 'Password must contain at least one number',
        code: 'MISSING_NUMBER',
      });
    }
    
    // Check for common weak passwords
    const commonPasswords = ['password', '12345678', 'qwerty123', 'password123'];
    if (commonPasswords.includes(password.toLowerCase())) {
      errors.push({
        field: 'password',
        message: 'Password is too common, please choose a stronger password',
        code: 'TOO_COMMON',
      });
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  }
  
  validateEmail(email: string): ValidationResult {
    const errors: ValidationError[] = [];
    
    if (!email) {
      errors.push({
        field: 'email',
        message: 'Email is required',
        code: 'REQUIRED',
      });
    } else if (!this.isValidEmail(email)) {
      errors.push({
        field: 'email',
        message: 'Please enter a valid email address',
        code: 'INVALID_FORMAT',
      });
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  }
  
  validatePasswordReset(data: PasswordResetConfirm): ValidationResult {
    const errors: ValidationError[] = [];
    
    // Token validation
    if (!data.token) {
      errors.push({
        field: 'token',
        message: 'Reset token is required',
        code: 'REQUIRED',
      });
    }
    
    // New password validation
    const passwordValidation = this.validatePassword(data.newPassword);
    if (!passwordValidation.isValid) {
      errors.push(...passwordValidation.errors.map(error => ({
        ...error,
        field: 'newPassword',
      })));
    }
    
    // Confirm password validation
    if (!data.confirmPassword) {
      errors.push({
        field: 'confirmPassword',
        message: 'Please confirm your new password',
        code: 'REQUIRED',
      });
    } else if (data.newPassword !== data.confirmPassword) {
      errors.push({
        field: 'confirmPassword',
        message: 'Passwords do not match',
        code: 'PASSWORD_MISMATCH',
      });
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  }
  
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 254;
  }
  
  private isValidUsername(username: string): boolean {
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    return usernameRegex.test(username);
  }
}

export const authValidation = new AuthValidation();