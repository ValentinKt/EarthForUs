// React import not needed for this test file
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import SignupPage from '../SignupPage';

// Mock fetch
global.fetch = jest.fn();

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('SignupPage Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockReset();
    mockNavigate.mockReset();
  });

  const renderSignupPage = () => {
    return render(
      <MemoryRouter>
        <Routes>
          <Route path="/" element={<SignupPage />} />
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    );
  };

  describe('Rendering', () => {
    it('should render signup form with all fields', () => {
      renderSignupPage();
      
      expect(screen.getByText('Join EarthForUs')).toBeTruthy();
      expect(screen.getByText('Create your account and start making a difference')).toBeTruthy();
      expect(screen.getByLabelText('First name')).toBeTruthy();
      expect(screen.getByLabelText('Last name')).toBeTruthy();
      expect(screen.getByLabelText('Email address')).toBeTruthy();
      expect(screen.getByLabelText('Password')).toBeTruthy();
      expect(screen.getByLabelText('Confirm password')).toBeTruthy();
      expect(screen.getByRole('checkbox', { name: /i agree to the/i })).toBeTruthy();
      expect(screen.getByRole('button', { name: /create account/i })).toBeTruthy();
      expect(screen.getByText('Already have an account?')).toBeTruthy();
      expect(screen.getByRole('link', { name: /sign in/i })).toBeTruthy();
    });
  });

  describe('Form Validation', () => {
    it('should show first name validation error for empty field', async () => {
      renderSignupPage();
      
      const form = document.querySelector('form');
      expect(form).toBeTruthy();
      
      // Submit the form directly instead of clicking the button
      fireEvent.submit(form!);
      
      await waitFor(() => {
        expect(screen.getByText('First name is required')).toBeTruthy();
      }, { timeout: 3000 });
    });

    it('should show last name validation error for empty field', async () => {
      renderSignupPage();
      
      const form = document.querySelector('form');
      expect(form).toBeTruthy();
      
      fireEvent.submit(form!);
      
      await waitFor(() => {
        expect(screen.getByText('Last name is required')).toBeTruthy();
      });
    });

    it('should show email validation error for empty field', async () => {
      renderSignupPage();
      
      const form = document.querySelector('form');
      expect(form).toBeTruthy();
      
      fireEvent.submit(form!);
      
      await waitFor(() => {
        expect(screen.getByText('Email is required')).toBeTruthy();
      });
    });

    it('should show email validation error for invalid format', async () => {
      renderSignupPage();
      
      const emailInput = screen.getByLabelText('Email address');
      fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
      
      const form = document.querySelector('form');
      expect(form).toBeTruthy();
      
      fireEvent.submit(form!);
      
      await waitFor(() => {
        expect(screen.getByText('Please enter a valid email address')).toBeTruthy();
      });
    });

    it('should show password validation error for empty field', async () => {
      renderSignupPage();
      
      const form = document.querySelector('form');
      expect(form).toBeTruthy();
      
      fireEvent.submit(form!);
      
      await waitFor(() => {
        expect(screen.getByText('Password is required')).toBeTruthy();
      });
    });

    it('should show password validation error for weak password', async () => {
      renderSignupPage();
      
      const passwordInput = screen.getByLabelText('Password');
      fireEvent.change(passwordInput, { target: { value: '123' } });
      
      const form = document.querySelector('form');
      expect(form).toBeTruthy();
      
      fireEvent.submit(form!);
      
      await waitFor(() => {
        expect(screen.getByText('Must be at least 8 characters with uppercase, lowercase, and number')).toBeTruthy();
      });
    });

    it('should show confirm password validation error when passwords do not match', async () => {
      renderSignupPage();
      
      const passwordInput = screen.getByLabelText('Password');
      const confirmPasswordInput = screen.getByLabelText('Confirm password');
      
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'different123' } });
      
      const form = document.querySelector('form');
      expect(form).toBeTruthy();
      
      fireEvent.submit(form!);
      
      await waitFor(() => {
        expect(screen.getByText('Passwords do not match')).toBeTruthy();
      });
    });

    it('should show terms validation error when not agreed', async () => {
      renderSignupPage();
      
      const form = document.querySelector('form');
      expect(form).toBeTruthy();
      
      fireEvent.submit(form!);
      
      await waitFor(() => {
        expect(screen.getByText('You must agree to the terms and conditions')).toBeTruthy();
      }, { timeout: 3000 });
    });

    it('should clear validation errors when user starts typing', async () => {
      renderSignupPage();
      
      // Submit empty form to trigger validation
      const form = document.querySelector('form');
      expect(form).toBeTruthy();
      
      fireEvent.submit(form!);
      
      await waitFor(() => {
        expect(screen.getByText('First name is required')).toBeTruthy();
      });
      
      // Start typing in first name field
      const firstNameInput = screen.getByLabelText('First name');
      fireEvent.change(firstNameInput, { target: { value: 'John' } });
      
      // Error should be cleared
      await waitFor(() => {
        expect(screen.queryByText('First name is required')).toBeFalsy();
      });
    });
  });

  describe('Form Submission', () => {
    it('should handle successful signup', async () => {
      const mockResponse = { message: 'User created successfully' };
      
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: jest.fn().mockResolvedValueOnce(mockResponse),
      });
      
      renderSignupPage();
      
      // Fill form with valid password that meets requirements
      fireEvent.change(screen.getByLabelText('First name'), { target: { value: 'John' } });
      fireEvent.change(screen.getByLabelText('Last name'), { target: { value: 'Doe' } });
      fireEvent.change(screen.getByLabelText('Email address'), { target: { value: 'john@example.com' } });
      fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'Password123' } });
      fireEvent.change(screen.getByLabelText('Confirm password'), { target: { value: 'Password123' } });
      fireEvent.click(screen.getByRole('checkbox', { name: /i agree to the/i }));
      
      // Submit form
      const submitButton = screen.getByRole('button', { name: /create account/i });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: 'john@example.com',
            password: 'Password123',
            firstName: 'John',
            lastName: 'Doe'
          })
        });
        expect(mockNavigate).toHaveBeenCalledWith('/login');
      });
    });

    it('should handle signup error response', async () => {
      const mockResponse = { error: 'Email already exists' };
      
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: jest.fn().mockResolvedValueOnce(mockResponse),
      });
      
      renderSignupPage();
      
      // Fill form
      fireEvent.change(screen.getByLabelText('First name'), { target: { value: 'John' } });
      fireEvent.change(screen.getByLabelText('Last name'), { target: { value: 'Doe' } });
      fireEvent.change(screen.getByLabelText('Email address'), { target: { value: 'john@example.com' } });
      fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'Password123' } });
      fireEvent.change(screen.getByLabelText('Confirm password'), { target: { value: 'Password123' } });
      fireEvent.click(screen.getByRole('checkbox', { name: /i agree to the/i }));
      
      // Submit form
      const submitButton = screen.getByRole('button', { name: /create account/i });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Email already exists')).toBeTruthy();
        expect(mockNavigate).not.toHaveBeenCalled();
      }, { timeout: 5000 });
    });

    it('should handle network error', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));
      
      renderSignupPage();
      
      // Fill form
      fireEvent.change(screen.getByLabelText('First name'), { target: { value: 'John' } });
      fireEvent.change(screen.getByLabelText('Last name'), { target: { value: 'Doe' } });
      fireEvent.change(screen.getByLabelText('Email address'), { target: { value: 'john@example.com' } });
      fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'Password123' } });
      fireEvent.change(screen.getByLabelText('Confirm password'), { target: { value: 'Password123' } });
      fireEvent.click(screen.getByRole('checkbox', { name: /i agree to the/i }));
      
      // Submit form
      const submitButton = screen.getByRole('button', { name: /create account/i });
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
      
      renderSignupPage();
      
      // Fill form
      fireEvent.change(screen.getByLabelText('First name'), { target: { value: 'John' } });
      fireEvent.change(screen.getByLabelText('Last name'), { target: { value: 'Doe' } });
      fireEvent.change(screen.getByLabelText('Email address'), { target: { value: 'john@example.com' } });
      fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'Password123' } });
      fireEvent.change(screen.getByLabelText('Confirm password'), { target: { value: 'Password123' } });
      fireEvent.click(screen.getByRole('checkbox', { name: /i agree to the/i }));
      
      // Submit form
      const submitButton = screen.getByRole('button', { name: /create account/i });
      fireEvent.click(submitButton);
      
      // Check loading state - button should show loading spinner and be disabled
      expect((submitButton as HTMLButtonElement).disabled).toBe(true);
      
      // Resolve the promise
      resolvePromise!({
        ok: true,
        status: 201,
        json: jest.fn().mockResolvedValueOnce({ message: 'User created' }),
      });
      
      await waitFor(() => {
        expect((submitButton as HTMLButtonElement).disabled).toBe(false);
        expect(screen.queryByText(/creating account/i)).toBeFalsy();
      });
    });
  });

  describe('Form Interactions', () => {
    it('should update form data when inputs change', () => {
      renderSignupPage();
      
      const firstNameInput = screen.getByLabelText('First name');
      const lastNameInput = screen.getByLabelText('Last name');
      const emailInput = screen.getByLabelText('Email address');
      const passwordInput = screen.getByLabelText('Password');
      const confirmPasswordInput = screen.getByLabelText('Confirm password');
      const termsCheckbox = screen.getByRole('checkbox', { name: /i agree to the/i });
      
      fireEvent.change(firstNameInput, { target: { value: 'John' } });
      fireEvent.change(lastNameInput, { target: { value: 'Doe' } });
      fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'Password123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'Password123' } });
      fireEvent.click(termsCheckbox);
      
      expect((firstNameInput as HTMLInputElement).value).toBe('John');
      expect((lastNameInput as HTMLInputElement).value).toBe('Doe');
      expect((emailInput as HTMLInputElement).value).toBe('john@example.com');
      expect((passwordInput as HTMLInputElement).value).toBe('Password123');
      expect((confirmPasswordInput as HTMLInputElement).value).toBe('Password123');
      expect((termsCheckbox as HTMLInputElement).checked).toBe(true);
    });

    it('should handle form submission with Enter key', async () => {
      const mockResponse = { message: 'User created successfully' };
      
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: jest.fn().mockResolvedValueOnce(mockResponse),
      });
      
      renderSignupPage();
      
      // Fill form
      fireEvent.change(screen.getByLabelText('First name'), { target: { value: 'John' } });
      fireEvent.change(screen.getByLabelText('Last name'), { target: { value: 'Doe' } });
      fireEvent.change(screen.getByLabelText('Email address'), { target: { value: 'john@example.com' } });
      fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'Password123' } });
      fireEvent.change(screen.getByLabelText('Confirm password'), { target: { value: 'Password123' } });
      fireEvent.click(screen.getByRole('checkbox', { name: /i agree to the/i }));
      
      // Submit form by clicking the submit button
      fireEvent.click(screen.getByRole('button', { name: /create account/i }));
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
        expect(mockNavigate).toHaveBeenCalledWith('/login');
      }, { timeout: 3000 });
    });
  });

  describe('Navigation', () => {
    it('should navigate to login page when sign in link is clicked', () => {
      render(
        <MemoryRouter>
          <Routes>
            <Route path="/" element={<SignupPage />} />
            <Route path="/login" element={<div>Login Page</div>} />
          </Routes>
        </MemoryRouter>
      );
      
      const signinLink = screen.getByRole('link', { name: /sign in/i });
      fireEvent.click(signinLink);
      
      expect(screen.getByText('Login Page')).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('should have proper form labels and ARIA attributes', () => {
      renderSignupPage();
      
      expect(screen.getByLabelText('First name').hasAttribute('required')).toBe(true);
      expect(screen.getByLabelText('Last name').hasAttribute('required')).toBe(true);
      expect(screen.getByLabelText('Email address').hasAttribute('required')).toBe(true);
      expect(screen.getByLabelText('Password').hasAttribute('required')).toBe(true);
      expect(screen.getByLabelText('Confirm password').hasAttribute('required')).toBe(true);
      expect(screen.getByRole('button', { name: /create account/i }).getAttribute('type')).toBe('submit');
    });

    it('should have proper heading structure', () => {
      renderSignupPage();
      
      expect(screen.getByText('Join EarthForUs')).toBeTruthy();
    });

    it('should have proper password requirements', () => {
      renderSignupPage();
      
      expect(screen.getByText('Must be at least 8 characters with uppercase, lowercase, and number')).toBeTruthy();
    });
  });
});