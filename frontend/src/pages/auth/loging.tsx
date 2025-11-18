import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, AlertCircle, Eye, EyeOff, LogIn } from 'lucide-react';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

// Zod schema for login validation
const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters long'),
  role: z.enum(['user', 'admin']).optional(),
});

interface LoginData {
  email: string;
  password: string;
  role?: 'user' | 'admin';
}

interface ValidationErrors {
  email?: string;
  password?: string;
}

interface LogingProps {
  onLogin?: (data: LoginData) => void;
}

function loging({ onLogin }: LogingProps) {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState<LoginData>({
    email: '',
    password: '',
    role: 'user',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target as HTMLInputElement | HTMLSelectElement;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error for this field when user starts typing
    if (errors[name as keyof ValidationErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form data with Zod
    const result = loginSchema.safeParse(formData);

    if (!result.success) {
      const validationErrors: ValidationErrors = {};
      result.error.issues.forEach((issue) => {
        const fieldName = issue.path[0] as keyof ValidationErrors;
        validationErrors[fieldName] = issue.message;
      });
      setErrors(validationErrors);
      return;
    }

    // Clear any existing errors
    setErrors({});
    setIsLoading(true);

    try {
      // Call onLogin callback if provided
      if (onLogin) {
        await onLogin(formData);
      }

      // Use JWT authentication
      await login({
        email: formData.email,
        password: formData.password,
        role: formData.role,
      });

      // Show success message
      toast.success('Login successful!');

      // Navigate to dashboard after successful login
      navigate('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed. Please check your credentials and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-white p-6">
      <div className="w-full max-w-120">
        {/* Login Form Card */}
        <div className="rounded-3xl border border-gray-200/50 bg-white/80 p-8 shadow-2xl backdrop-blur-sm">
          {/* Header */}
          <div className="mb-8 text-center">
            <LogIn className="mx-auto mb-4 h-12 w-12 text-black" />
            <h1 className="mb-2 text-3xl font-bold text-black">Login</h1>
            <p className="text-sm text-gray-700">Please sign in to continue</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Input */}
            <div className="relative">
              <div
                className={`flex items-center rounded-2xl border bg-white/60 px-4 py-4 backdrop-blur-sm transition-all ${
                  errors.email
                    ? 'border-red-500 focus-within:border-red-500 focus-within:ring-2 focus-within:ring-red-100'
                    : 'border-gray-300/50 focus-within:border-black focus-within:ring-2 focus-within:ring-gray-200/50'
                }`}
              >
                <Mail className="mr-3 h-5 w-5 text-black" />
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="flex-1 bg-transparent text-black placeholder-gray-600 outline-none"
                />
              </div>
              {errors.email && (
                <div className="mt-1 flex items-center text-sm text-red-500">
                  <AlertCircle className="mr-1 h-4 w-4" />
                  {errors.email}
                </div>
              )}
            </div>

            {/* Password Input */}
            <div className="relative">
              <div
                className={`flex items-center rounded-2xl border bg-white/60 px-4 py-4 backdrop-blur-sm transition-all ${
                  errors.password
                    ? 'border-red-500 focus-within:border-red-500 focus-within:ring-2 focus-within:ring-red-100'
                    : 'border-gray-300/50 focus-within:border-black focus-within:ring-2 focus-within:ring-gray-200/50'
                }`}
              >
                <Lock className="mr-3 h-5 w-5 text-black" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="flex-1 bg-transparent text-black placeholder-gray-600 outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="ml-2 text-black transition-colors hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <div className="mt-1 flex items-center text-sm text-red-500">
                  <AlertCircle className="mr-1 h-4 w-4" />
                  {errors.password}
                </div>
              )}
            </div>

            {/* Role Select */}
            <div className="relative">
              <div
                className={`flex items-center rounded-2xl border bg-white/60 px-4 py-3 backdrop-blur-sm transition-all`}
              >
                <select
                  name="role"
                  aria-label="Role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="flex-1 bg-transparent text-black placeholder-gray-600 outline-none"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>

            {/* Forgot Password */}
            <div className="text-left">
              <button
                type="button"
                className="text-sm font-medium text-black transition-colors hover:text-gray-700"
              >
                Forgot password?
              </button>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-2xl bg-black py-4 font-semibold text-white shadow-lg transition-all duration-200 hover:bg-gray-800 focus:ring-4 focus:ring-gray-300/50 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? 'Please wait...' : 'Login'}
            </button>

            {/* Register Link */}
            <div className="pt-4 text-center">
              <span className="text-sm text-gray-700">
                Don't have an account?{' '}
              </span>
              <button
                type="button"
                onClick={() => navigate('/signup')}
                className="text-sm font-medium text-black underline transition-colors hover:text-gray-700"
              >
                Sign Up
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default loging;
