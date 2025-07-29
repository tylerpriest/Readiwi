import { Plugin } from '@/core/types/plugin';
import { authService } from './services/auth-service';
import { useAuthStore } from './stores/auth-store';
import LoginForm from './components/LoginForm';
import AuthChoice from './components/AuthChoice';

export class AuthenticationPlugin implements Plugin {
  readonly id = 'authentication';
  readonly name = 'Authentication System';
  readonly version = '1.0.0';
  readonly dependencies: string[] = [];
  readonly enabled = true;

  async initialize(): Promise<void> {
    console.log(`[${this.name}] Initializing authentication plugin...`);
    
    // Initialize authentication state - default is anonymous mode
    const { refreshSession, isAuthenticated, isSessionValid, continueAsAnonymous } = useAuthStore.getState();
    
    // If user was previously authenticated, try to refresh session
    if (isAuthenticated) {
      if (!isSessionValid) {
        try {
          await refreshSession();
        } catch (error) {
          console.warn(`[${this.name}] Session expired, continuing in anonymous mode:`, error);
          continueAsAnonymous();
        }
      }
    } else {
      // Ensure we're in anonymous mode by default
      continueAsAnonymous();
    }
  }

  async activate(): Promise<void> {
    console.log(`[${this.name}] Activating authentication plugin...`);
    
    // Set up session monitoring
    this.startSessionMonitoring();
  }

  async deactivate(): Promise<void> {
    console.log(`[${this.name}] Deactivating authentication plugin...`);
    
    // Clean up session monitoring
    if (this.sessionCheckInterval) {
      clearInterval(this.sessionCheckInterval);
      this.sessionCheckInterval = null;
    }
  }

  async cleanup(): Promise<void> {
    console.log(`[${this.name}] Cleaning up authentication plugin...`);
    
    // Reset authentication state
    const { reset } = useAuthStore.getState();
    reset();
    
    // Clear any persisted session data
    if (typeof window !== 'undefined') {
      localStorage.removeItem('readiwi-auth-tokens');
    }
  }

  registerComponents(): Record<string, React.ComponentType<any>> {
    return {
      'auth.AuthChoice': AuthChoice,
      'auth.LoginForm': LoginForm,
    };
  }

  registerRoutes(): Record<string, any> {
    return {
      '/settings/account': {
        component: 'auth.AuthChoice',
        title: 'Account Settings - Readiwi',
        description: 'Manage your Readiwi account or continue anonymously',
        requiresAuth: false,
      },
      '/settings/login': {
        component: 'auth.LoginForm',
        title: 'Sign In - Readiwi',
        description: 'Sign in to your Readiwi account',
        requiresAuth: false,
      },
    };
  }

  registerStores(): Record<string, any> {
    return {
      auth: useAuthStore,
    };
  }

  registerServices(): Record<string, any> {
    return {
      authService,
    };
  }

  // Private session monitoring
  private sessionCheckInterval: NodeJS.Timeout | null = null;

  private startSessionMonitoring(): void {
    // Check session validity every 5 minutes
    this.sessionCheckInterval = setInterval(() => {
      const { isAuthenticated, isSessionValid, refreshSession, timeUntilExpiry } = useAuthStore.getState();
      
      if (isAuthenticated) {
        if (!isSessionValid) {
          // Session expired, attempt refresh
          refreshSession().catch(error => {
            console.warn(`[${this.name}] Automatic session refresh failed:`, error);
          });
        } else if (timeUntilExpiry < 5 * 60 * 1000) {
          // Session expires in less than 5 minutes, proactively refresh
          refreshSession().catch(error => {
            console.warn(`[${this.name}] Proactive session refresh failed:`, error);
          });
        }
      }
    }, 5 * 60 * 1000); // 5 minutes
  }
}

export const authenticationPlugin = new AuthenticationPlugin();