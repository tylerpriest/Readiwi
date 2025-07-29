// Authentication plugin exports
export { authenticationPlugin } from './plugin';
export { useAuthStore } from './stores/auth-store';
export { authService } from './services/auth-service';
export { authValidation } from './services/auth-validation';

// Components
export { default as LoginForm } from './components/LoginForm';

// Types
export type {
  AuthUser,
  LoginCredentials,
  RegisterData,
  AuthResult,
  AuthState,
  ValidationError,
  AuthError,
} from './types/auth-types';