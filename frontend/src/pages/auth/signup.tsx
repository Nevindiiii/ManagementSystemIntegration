import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  AlertCircle,
  UserPlus,
} from 'lucide-react';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import emailjs from '@emailjs/browser';


// Zod schema for registration validation
const registerSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .min(2, 'Name must be at least 2 characters long')
    .max(50, 'Name must be less than 50 characters'),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  role: z.enum(['user', 'admin']).optional(), // role-based registration for permission control
});

interface RegisterData {
  name: string;
  email: string;
  role?: 'user' | 'admin';
}

interface ValidationErrors {
  name?: string;
  email?: string;
}

interface SignupProps {
  onRegister?: (data: RegisterData) => void;
}

function signup({ onRegister }: SignupProps) {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState<RegisterData>({
    name: '',
    email: '',
    role: 'user',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});

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
    const result = registerSchema.safeParse(formData);

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
      if (onRegister) {
        await onRegister(formData);
      }

      // Use JWT authentication for registration
      const result = await register({
        name: formData.name,
        email: formData.email,
        role: formData.role,
      });

      if (result.success) {
        // Send welcome email via EmailJS
        try {
          await emailjs.send(
            import.meta.env.VITE_EMAILJS_SERVICE_ID,
            import.meta.env.VITE_EMAILJS_WELCOME_TEMPLATE_ID,
            {
              app_name: 'Management System',
              to_name: formData.name,
              name: formData.name,
              email: formData.email,
            },
            import.meta.env.VITE_EMAILJS_PUBLIC_KEY
          );
        } catch (emailError) { // Catch email sending errors separately
          console.error('Welcome email failed:', emailError);
        }

        toast.success(
          'Account created! Password sent to your email. Please check your inbox.'
        );
        // Navigate to login after successful registration
        navigate('/');
      } else {
        toast.error(result.message || 'Registration failed. Please try again.');
      }
    } catch (error: any) {
      console.error('Register error:', error);
      toast.error(error.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-white p-6">
      <div className="w-full max-w-120">
        {/* Register Form Card */}
        <div className="rounded-3xl border border-gray-200/50 bg-white/80 p-8 shadow-2xl backdrop-blur-sm">
          {/* Header */}
          <div className="mb-8 text-center">
            <UserPlus className="mx-auto mb-4 h-12 w-12 text-black" />
            <h1 className="mb-2 text-3xl font-bold text-black">
              Create Account
            </h1>
            <p className="text-sm text-gray-700">Please sign up to continue</p>
          </div>

          {/* Register Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Input */}
            <div className="relative">
              <div
                className={`flex items-center rounded-2xl border bg-white/60 px-4 py-4 backdrop-blur-sm transition-all ${
                  errors.name
                    ? 'border-red-500 focus-within:border-red-500 focus-within:ring-2 focus-within:ring-red-100'
                    : 'border-gray-300/50 focus-within:border-black focus-within:ring-2 focus-within:ring-gray-200/50'
                }`}
              >
                <User className="mr-3 h-5 w-5 text-black" />
                <input
                  type="text"
                  name="name"
                  placeholder="Name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="flex-1 bg-transparent text-black placeholder-gray-600 outline-none"
                />
              </div>
              {errors.name && (
                <div className="mt-1 flex items-center text-sm text-red-500">
                  <AlertCircle className="mr-1 h-4 w-4" />
                  {errors.name}
                </div>
              )}
            </div>

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

            {/* Info Message */}
            <div className="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3">
              <p className="text-sm text-blue-800">
                🔒 A secure password will be automatically generated and sent to your email.
              </p>
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

            {/* Create Account Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-2xl bg-black py-4 font-semibold text-white shadow-lg transition-all duration-200 hover:bg-gray-800 focus:ring-4 focus:ring-gray-300/50 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? 'Please wait...' : 'Create Account'}
            </button>

            {/* Login Link */}
            <div className="pt-4 text-center">
              <span className="text-sm text-gray-700">
                Already have an account?{' '}
              </span>
              <button
                type="button"
                onClick={() => navigate('/')}
                className="text-sm font-medium text-black underline transition-colors hover:text-gray-700"
              >
                Login
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default signup;
