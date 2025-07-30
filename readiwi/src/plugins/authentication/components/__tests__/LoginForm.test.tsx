import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginForm from '../LoginForm';
import { useAuthStore } from '../../stores/auth-store';

// Mock the auth store
jest.mock('../../stores/auth-store');
const mockUseAuthStore = useAuthStore as jest.MockedFunction<typeof useAuthStore>;

// Mock the auth service to avoid network calls in tests
jest.mock('../../services/auth-service');

describe('LoginForm', () => {
  const mockLogin = jest.fn();
  const mockClearError = jest.fn();
  const mockOnSuccess = jest.fn();
  const mockOnRegisterClick = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockUseAuthStore.mockReturnValue({
      login: mockLogin,
      loading: false,
      error: null,
      clearError: mockClearError,
      user: null,
      isAuthenticated: false,
      lastUpdated: 0,
      sessionExpiresAt: null,
      register: jest.fn(),
      logout: jest.fn(),
      refreshSession: jest.fn(),
      reset: jest.fn(),
      isSessionValid: false,
      timeUntilExpiry: 0,
    });
  });

  describe('Rendering', () => {
    it('should render login form with all required fields', () => {
      render(<LoginForm />);
      
      expect(screen.getByRole('heading', { name: /welcome back/i })).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByTestId('login-password-input')).toBeInTheDocument();
      expect(screen.getByLabelText(/remember me/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
      expect(screen.getByText(/don't have an account/i)).toBeInTheDocument();
    });

    it('should render with custom test id', () => {
      render(<LoginForm data-testid="custom-login-form" />);
      
      expect(screen.getByTestId('custom-login-form')).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      render(<LoginForm className="custom-class" />);
      
      const form = screen.getByRole('main');
      expect(form).toHaveClass('custom-class');
    });
  });

  describe('Form Interactions', () => {
    it('should update email field when typed in', async () => {
      const user = userEvent.setup();
      render(<LoginForm />);
      
      const emailInput = screen.getByLabelText(/email/i);
      await user.type(emailInput, 'test@example.com');
      
      expect(emailInput).toHaveValue('test@example.com');
    });

    it('should update password field when typed in', async () => {
      const user = userEvent.setup();
      render(<LoginForm />);
      
      const passwordInput = screen.getByLabelText(/password/i);
      await user.type(passwordInput, 'testpassword');
      
      expect(passwordInput).toHaveValue('testpassword');
    });

    it('should toggle password visibility', async () => {
      const user = userEvent.setup();
      render(<LoginForm />);
      
      const passwordInput = screen.getByLabelText(/password/i) as HTMLInputElement;
      const toggleButton = screen.getByTestId('toggle-password-visibility');
      
      expect(passwordInput.type).toBe('password');
      
      await user.click(toggleButton);
      expect(passwordInput.type).toBe('text');
      
      await user.click(toggleButton);
      expect(passwordInput.type).toBe('password');
    });

    it('should toggle remember me checkbox', async () => {
      const user = userEvent.setup();
      render(<LoginForm />);
      
      const checkbox = screen.getByLabelText(/remember me/i) as HTMLInputElement;
      
      expect(checkbox.checked).toBe(false);
      
      await user.click(checkbox);
      expect(checkbox.checked).toBe(true);
    });
  });

  describe('Form Submission', () => {
    it('should call login with correct credentials on submit', async () => {
      const user = userEvent.setup();
      mockLogin.mockResolvedValue(undefined);
      
      render(<LoginForm onSuccess={mockOnSuccess} />);
      
      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/password/i), 'testpassword');
      await user.click(screen.getByLabelText(/remember me/i));
      
      await user.click(screen.getByRole('button', { name: /sign in/i }));
      
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'testpassword',
        rememberMe: true,
      });
    });

    it('should call onSuccess callback when login succeeds', async () => {
      const user = userEvent.setup();
      mockLogin.mockResolvedValue(undefined);
      
      render(<LoginForm onSuccess={mockOnSuccess} />);
      
      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/password/i), 'testpassword');
      await user.click(screen.getByRole('button', { name: /sign in/i }));
      
      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalled();
      });
    });

    it('should disable submit button when loading', () => {
      mockUseAuthStore.mockReturnValue({
        login: mockLogin,
        loading: true,
        error: null,
        clearError: mockClearError,
        user: null,
        isAuthenticated: false,
        lastUpdated: 0,
        sessionExpiresAt: null,
        register: jest.fn(),
        logout: jest.fn(),
        refreshSession: jest.fn(),
        reset: jest.fn(),
        isSessionValid: false,
        timeUntilExpiry: 0,
      });
      
      render(<LoginForm />);
      
      expect(screen.getByRole('button', { name: /signing in/i })).toBeDisabled();
    });

    it('should disable submit button when fields are empty', () => {
      render(<LoginForm />);
      
      expect(screen.getByRole('button', { name: /sign in/i })).toBeDisabled();
    });
  });

  describe('Error Handling', () => {
    it('should display global error message', () => {
      mockUseAuthStore.mockReturnValue({
        login: mockLogin,
        loading: false,
        error: 'Invalid credentials',
        clearError: mockClearError,
        user: null,
        isAuthenticated: false,
        lastUpdated: 0,
        sessionExpiresAt: null,
        register: jest.fn(),
        logout: jest.fn(),
        refreshSession: jest.fn(),
        reset: jest.fn(),
        isSessionValid: false,
        timeUntilExpiry: 0,
      });
      
      render(<LoginForm />);
      
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });

    it('should clear error when user types in field', async () => {
      const user = userEvent.setup();
      mockUseAuthStore.mockReturnValue({
        login: mockLogin,
        loading: false,
        error: 'Invalid credentials',
        clearError: mockClearError,
        user: null,
        isAuthenticated: false,
        lastUpdated: 0,
        sessionExpiresAt: null,
        register: jest.fn(),
        logout: jest.fn(),
        refreshSession: jest.fn(),
        reset: jest.fn(),
        isSessionValid: false,
        timeUntilExpiry: 0,
      });
      
      render(<LoginForm />);
      
      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      
      expect(mockClearError).toHaveBeenCalled();
    });
  });

  describe('Navigation', () => {
    it('should call onRegisterClick when register link is clicked', async () => {
      const user = userEvent.setup();
      render(<LoginForm onRegisterClick={mockOnRegisterClick} />);
      
      await user.click(screen.getByTestId('register-link'));
      
      expect(mockOnRegisterClick).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels and descriptions', () => {
      render(<LoginForm />);
      
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      
      expect(emailInput).toHaveAttribute('aria-invalid', 'false');
      expect(passwordInput).toHaveAttribute('aria-invalid', 'false');
    });

    it('should mark invalid fields with proper ARIA attributes', async () => {
      const user = userEvent.setup();
      const mockError = {
        validationErrors: [
          { field: 'email', message: 'Email is required', code: 'REQUIRED' }
        ]
      };
      mockLogin.mockRejectedValue(mockError);
      
      render(<LoginForm />);
      
      await user.click(screen.getByRole('button', { name: /sign in/i }));
      
      await waitFor(() => {
        const emailInput = screen.getByLabelText(/email/i);
        expect(emailInput).toHaveAttribute('aria-invalid', 'true');
        expect(emailInput).toHaveAttribute('aria-describedby', 'email-error');
      });
    });
  });
});