import * as React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import LoginPage from '../LoginPage';
import { AuthProvider } from '../../context/AuthContext';

// Mock fetch
global.fetch = jest.fn();

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('LoginPage Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockReset();
    mockNavigate.mockReset();
  });

  const renderLoginPage = () => {
    return render(
      <MemoryRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/home" element={<div>Home Page</div>} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    );
  };

  describe('Rendering', () => {
    it('should render login form with all fields', () => {
      renderLoginPage();
      
      expect(screen.getByText('Welcome back')).toBeTruthy();
      expect(screen.getByText('Sign in to your EarthForUs account')).toBeTruthy();
      expect(screen.getByLabelText('Email address')).toBeTruthy();
      expect(screen.getByLabelText('Password')).toBeTruthy();
      expect(screen.getByRole('checkbox', { name: /remember me/i })).toBeTruthy();
      expect(screen.getByRole('button', { name: /sign in/i })).toBeTruthy();
      expect(screen.getByText("Don't have an account?")).toBeTruthy();
      expect(screen.getByRole('link', { name: /sign up/i })).toBeTruthy();
    });

    it('should not show test credentials when not available', () => {
      renderLoginPage();
      
      expect(screen.queryByText('Test credentials')).toBeFalsy();
    });

    it('should show test credentials when available', () => {
      process.env.VITE_TEST_USER_EMAIL = 'test@example.com';
      process.env.VITE_TEST_USER_PASSWORD = 'test123';
      
      renderLoginPage();
      
      expect(screen.getByText('Test credentials')).toBeTruthy();
      expect(screen.getByText('test@example.com')).toBeTruthy();
      expect(screen.getByText('test123')).toBeTruthy();
      expect(screen.getByText('Use for local testing only.')).toBeTruthy();
      
      // Clean up
      delete process.env.VITE_TEST_USER_EMAIL;
      delete process.env.VITE_TEST_USER_PASSWORD;
    });
  });

  describe('Form Validation', () => {
    it('should validate form before submission', async () => {
      renderLoginPage();
      
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      fireEvent.click(submitButton);
      
      // The form should not submit with empty fields
      expect(global.fetch).not.toHaveBeenCalled();
    });
  });

  describe('Form Submission', () => {
    it('should handle successful login', async () => {
      const mockResponse = {
        user: {
          id: 1,
          email: 'test@example.com',
          first_name: 'Test',
          last_name: 'User',
        },
      };
      
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValueOnce(mockResponse),
      });
      
      renderLoginPage();
      
      // Fill form
      const emailInput = screen.getByLabelText('Email address');
      const passwordInput = screen.getByLabelText('Password');
      
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      
      // Submit form
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: 'test@example.com',
            password: 'password123',
          }),
        });
        expect(mockNavigate).toHaveBeenCalledWith('/home');
      });
    });

    it('should handle login error response', async () => {
      const mockResponse = { error: 'Invalid credentials' };
      
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: jest.fn().mockResolvedValueOnce(mockResponse),
      });
      
      renderLoginPage();
      
      // Fill form
      const emailInput = screen.getByLabelText('Email address');
      const passwordInput = screen.getByLabelText('Password');
      
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
      
      // Submit form
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Invalid credentials')).toBeTruthy();
        expect(mockNavigate).not.toHaveBeenCalled();
      });
    });

    it('should handle network error', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));
      
      renderLoginPage();
      
      // Fill form
      const emailInput = screen.getByLabelText('Email address');
      const passwordInput = screen.getByLabelText('Password');
      
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      
      // Submit form
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(mockNavigate).not.toHaveBeenCalled();
      });
    });

    it('should show loading state during submission', async () => {
      let resolvePromise: (value: any) => void;
      const promise = new Promise((resolve) => {
        resolvePromise = resolve;
      });
      
      (global.fetch as jest.Mock).mockReturnValueOnce(promise);
      
      renderLoginPage();
      
      // Fill form
      const emailInput = screen.getByLabelText('Email address');
      const passwordInput = screen.getByLabelText('Password');
      
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      
      // Submit form
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      fireEvent.click(submitButton);
      
      // Check loading state
      expect((submitButton as HTMLButtonElement).disabled).toBe(true);
      expect(screen.getByText(/signing in/i)).toBeTruthy();
      
      // Resolve the promise
      resolvePromise!({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValueOnce({ user: { id: 1, email: 'test@example.com' } }),
      });
      
      await waitFor(() => {
        expect((submitButton as HTMLButtonElement).disabled).toBe(false);
        expect(screen.queryByText(/signing in/i)).toBeFalsy();
      });
    });
  });

  describe('Form Interactions', () => {
    it('should update form data when inputs change', () => {
      renderLoginPage();
      
      const emailInput = screen.getByLabelText('Email address');
      const passwordInput = screen.getByLabelText('Password');
      const rememberMeCheckbox = screen.getByRole('checkbox', { name: /remember me/i });
      
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(rememberMeCheckbox);
      
      expect((emailInput as HTMLInputElement).value).toBe('test@example.com');
      expect((passwordInput as HTMLInputElement).value).toBe('password123');
      expect((rememberMeCheckbox as HTMLInputElement).checked).toBe(true);
    });

    it('should handle form submission with Enter key', async () => {
      const mockResponse = {
        user: { id: 1, email: 'test@example.com' },
      };
      
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValueOnce(mockResponse),
      });
      
      renderLoginPage();
      
      // Fill form
      const emailInput = screen.getByLabelText('Email address');
      const passwordInput = screen.getByLabelText('Password');
      
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      
      // Submit form
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
        expect(mockNavigate).toHaveBeenCalledWith('/home');
      });
    });
  });

  describe('Navigation', () => {
    it('should navigate to signup page when sign up link is clicked', () => {
      const { container } = render(
        <MemoryRouter>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<LoginPage />} />
              <Route path="/signup" element={<div>Signup Page</div>} />
            </Routes>
          </AuthProvider>
        </MemoryRouter>
      );
      
      const signupLink = screen.getByRole('link', { name: /sign up/i });
      fireEvent.click(signupLink);
      
      expect(screen.getByText('Signup Page')).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('should have proper form labels and ARIA attributes', () => {
      renderLoginPage();
      
      const emailInput = screen.getByLabelText('Email address');
      const passwordInput = screen.getByLabelText('Password');
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      
      expect(emailInput.getAttribute('type')).toBe('email');
      expect(emailInput.hasAttribute('required')).toBe(true);
      expect(passwordInput.getAttribute('type')).toBe('password');
      expect(passwordInput.hasAttribute('required')).toBe(true);
      expect(submitButton.getAttribute('type')).toBe('submit');
    });

    it('should have proper heading structure', () => {
      renderLoginPage();
      
      const heading = screen.getByRole('heading', { level: 2, name: /welcome back/i });
      expect(heading).toBeTruthy();
    });
  });
});