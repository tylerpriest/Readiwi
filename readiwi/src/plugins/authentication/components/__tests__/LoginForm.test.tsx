import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
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

  describe('User Story: Login Form Renders Correctly for Users', () => {
    test('User can see all essential login elements', () => {
      // Given: User visits the login page
      render(<LoginForm />);
      
      // Then: All essential elements are visible and accessible
      expect(screen.getByRole('heading', { name: /welcome back/i })).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByTestId('login-password-input')).toBeInTheDocument();
      expect(screen.getByLabelText(/remember me/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
      expect(screen.getByText(/don't have an account/i)).toBeInTheDocument();
    });

    test('User can identify the form with custom test identifier', () => {
      // Given: Login form with custom identifier
      render(<LoginForm data-testid="custom-login-form" />);
      
      // Then: Form can be found by the custom identifier
      expect(screen.getByTestId('custom-login-form')).toBeInTheDocument();
    });

    test('User interface styling can be customized properly', () => {
      // Given: Login form with custom styling
      render(<LoginForm className="custom-class" />);
      
      // Then: Custom styling is applied to the form container
      const formContainer = screen.getByTestId('login-form-container') || screen.getByRole('main');
      expect(formContainer).toHaveClass('custom-class');
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

    test('User can enter password securely', async () => {
      // Given: User needs to enter password
      const user = userEvent.setup();
      render(<LoginForm />);
      
      // When: User types in password field
      const passwordInput = screen.getByTestId('login-password-input');
      await user.type(passwordInput, 'testpassword');
      
      // Then: Password is captured securely
      expect(passwordInput).toHaveValue('testpassword');
    });

    test('User can toggle password visibility for security and convenience', async () => {
      // Given: User wants to see their password while typing
      const user = userEvent.setup();
      render(<LoginForm />);
      
      // When: User clicks password visibility toggle
      const passwordInput = screen.getByTestId('login-password-input') as HTMLInputElement;
      const toggleButton = screen.getByTestId('toggle-password-visibility');
      
      // Then: Password visibility toggles appropriately
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

  describe('User Story: Successful Login Process', () => {
    test('User can login with correct credentials and system processes them', async () => {
      // Given: User has valid credentials and successful login response
      const user = userEvent.setup();
      mockLogin.mockResolvedValue(undefined);
      
      render(<LoginForm onSuccess={mockOnSuccess} />);
      
      // When: User enters credentials and submits form
      await user.type(screen.getByTestId('login-email-input'), 'test@example.com');
      await user.type(screen.getByTestId('login-password-input'), 'testpassword');
      await user.click(screen.getByLabelText(/remember me/i));
      
      await user.click(screen.getByRole('button', { name: /sign in/i }));
      
      // Then: Login service is called with correct credentials
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'testpassword',
        rememberMe: true,
      });
    });

    test('User receives success confirmation when login completes', async () => {
      // Given: User submits login form with valid credentials
      const user = userEvent.setup();
      mockLogin.mockResolvedValue(undefined);
      
      render(<LoginForm onSuccess={mockOnSuccess} />);
      
      // When: User completes login process
      await user.type(screen.getByTestId('login-email-input'), 'test@example.com');
      await user.type(screen.getByTestId('login-password-input'), 'testpassword');
      await user.click(screen.getByRole('button', { name: /sign in/i }));
      
      // Then: Success callback is triggered
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

  describe('User Story: Accessible Form Experience', () => {
    test('User with screen reader can understand form field states', () => {
      // Given: User with assistive technology accesses form
      render(<LoginForm />);
      
      // Then: Form fields have proper accessibility attributes
      const emailInput = screen.getByTestId('login-email-input');
      const passwordInput = screen.getByTestId('login-password-input');
      
      expect(emailInput).toHaveAttribute('aria-invalid', 'false');
      expect(passwordInput).toHaveAttribute('aria-invalid', 'false');
    });

    test('User receives clear feedback when form has validation errors', async () => {
      // Given: User submits form with invalid data
      const user = userEvent.setup();
      const mockError = {
        validationErrors: [
          { field: 'email', message: 'Email is required', code: 'REQUIRED' }
        ]
      };
      mockLogin.mockRejectedValue(mockError);
      
      render(<LoginForm />);
      
      // When: User fills form with invalid data and submits
      await user.type(screen.getByTestId('login-email-input'), 'invalid-email');
      await user.type(screen.getByTestId('login-password-input'), 'password123');
      await user.click(screen.getByRole('button', { name: /sign in/i }));
      
      // Then: Accessibility attributes indicate error state
      await waitFor(() => {
        const emailInput = screen.getByTestId('login-email-input');
        expect(emailInput).toHaveAttribute('aria-invalid', 'true');
        expect(emailInput).toHaveAttribute('aria-describedby', 'email-error');
      });
    });
  });
});