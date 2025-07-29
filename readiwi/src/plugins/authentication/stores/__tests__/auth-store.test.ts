import { useAuthStore } from '../auth-store';

describe('useAuthStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useAuthStore.getState().reset();
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const state = useAuthStore.getState();
      
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isAnonymous).toBe(true);
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
      expect(state.sessionExpiresAt).toBeNull();
    });

    it('should allow app usage in anonymous mode', () => {
      const state = useAuthStore.getState();
      
      expect(state.canUseApp).toBe(true);
    });
  });

  describe('Anonymous Mode', () => {
    it('should set anonymous mode correctly', () => {
      const { continueAsAnonymous } = useAuthStore.getState();
      
      continueAsAnonymous();
      
      const state = useAuthStore.getState();
      expect(state.isAnonymous).toBe(true);
      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBeNull();
      expect(state.canUseApp).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should clear error when clearError is called', () => {
      const { clearError } = useAuthStore.getState();
      
      // Simulate an error state
      useAuthStore.setState({ error: 'Test error' });
      
      clearError();
      
      expect(useAuthStore.getState().error).toBeNull();
    });
  });

  describe('Session Validation', () => {
    it('should return false for session validity when not authenticated', () => {
      const state = useAuthStore.getState();
      
      expect(state.isSessionValid).toBe(false);
    });

    it('should return 0 for time until expiry when not authenticated', () => {
      const state = useAuthStore.getState();
      
      expect(state.timeUntilExpiry).toBe(0);
    });
  });
});