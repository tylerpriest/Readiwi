import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthUser, LoginCredentials, RegisterData, AuthState } from '../types/auth-types';
import { authService } from '../services/auth-service';

interface AuthStoreState {
  // Data fields with explicit types
  user: AuthUser | null;
  isAuthenticated: boolean;
  isAnonymous: boolean;
  loading: boolean;
  error: string | null;
  lastUpdated: number;
  sessionExpiresAt: number | null;
  
  // Actions
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  continueAsAnonymous: () => void;
  refreshSession: () => Promise<void>;
  clearError: () => void;
  reset: () => void;
  
  // Selectors (computed values)
  get isSessionValid(): boolean;
  get timeUntilExpiry(): number;
  get canUseApp(): boolean;
}

const initialState = {
  user: null,
  isAuthenticated: false,
  isAnonymous: true, // Default to anonymous mode
  loading: false,
  error: null,
  lastUpdated: 0,
  sessionExpiresAt: null,
};

export const useAuthStore = create<AuthStoreState>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      login: async (credentials: LoginCredentials) => {
        set({ loading: true, error: null });
        
        try {
          const result = await authService.login(credentials);
          
          set({
            user: result.user,
            isAuthenticated: true,
            loading: false,
            lastUpdated: Date.now(),
            sessionExpiresAt: result.expiresAt,
            error: null,
          });
        } catch (error) {
          set({
            loading: false,
            error: error instanceof Error ? error.message : 'Login failed',
            isAuthenticated: false,
            isAnonymous: true,
            user: null,
          });
          throw error;
        }
      },
      
      register: async (data: RegisterData) => {
        set({ loading: true, error: null });
        
        try {
          const result = await authService.register(data);
          
          set({
            user: result.user,
            isAuthenticated: true,
            loading: false,
            lastUpdated: Date.now(),
            sessionExpiresAt: result.expiresAt,
            error: null,
          });
        } catch (error) {
          set({
            loading: false,
            error: error instanceof Error ? error.message : 'Registration failed',
            isAuthenticated: false,
            user: null,
          });
          throw error;
        }
      },
      
      logout: async () => {
        set({ loading: true });
        
        try {
          await authService.logout();
          set({
            ...initialState,
            lastUpdated: Date.now(),
          });
        } catch (error) {
          // Even if logout fails, clear local state
          set({
            ...initialState,
            error: error instanceof Error ? error.message : 'Logout failed',
            lastUpdated: Date.now(),
          });
        }
      },
      
      refreshSession: async () => {
        const { user } = get();
        if (!user) return;
        
        set({ loading: true, error: null });
        
        try {
          const result = await authService.refreshSession();
          
          set({
            user: result.user,
            sessionExpiresAt: result.expiresAt,
            loading: false,
            lastUpdated: Date.now(),
            error: null,
          });
        } catch (error) {
          // Session refresh failed, logout user
          set({
            ...initialState,
            error: error instanceof Error ? error.message : 'Session expired',
            lastUpdated: Date.now(),
          });
        }
      },
      
      clearError: () => {
        set({ error: null });
      },
      
      continueAsAnonymous: () => {
        set({
          user: null,
          isAuthenticated: false,
          isAnonymous: true,
          loading: false,
          error: null,
          sessionExpiresAt: null,
          lastUpdated: Date.now(),
        });
      },
      
      reset: () => {
        set({
          ...initialState,
          lastUpdated: Date.now(),
        });
      },
      
      get isSessionValid(): boolean {
        const { sessionExpiresAt } = get();
        if (!sessionExpiresAt) return false;
        return Date.now() < sessionExpiresAt;
      },
      
      get timeUntilExpiry(): number {
        const { sessionExpiresAt } = get();
        if (!sessionExpiresAt) return 0;
        return Math.max(0, sessionExpiresAt - Date.now());
      },
      
      get canUseApp(): boolean {
        const { isAuthenticated, isAnonymous } = get();
        return isAuthenticated || isAnonymous;
      },
    }),
    {
      name: 'readiwi-auth',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        isAnonymous: state.isAnonymous,
        sessionExpiresAt: state.sessionExpiresAt,
        lastUpdated: state.lastUpdated,
      }),
    }
  )
);