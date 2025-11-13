import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Lock, AlertCircle, Eye, EyeOff, UserPlus } from 'lucide-react';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

// Zod schema for registration validation
const registerSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .min(2, 'Name must be at least 2 characters long')
    .max(50, 'Name must be less than 50 characters'),
  email: z.string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z.string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters long')
    .max(100, 'Password must be less than 100 characters'),
  confirmPassword: z.string()
    .min(1, 'Password confirmation is required'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface ValidationErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
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
    password: '',
    confirmPassword: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field when user starts typing
    if (errors[name as keyof ValidationErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
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
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      });
      
      if (result.success) {
        // Show success message
        toast.success('Account created successfully! Please login with your credentials.');
        
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
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="w-full max-w-120">
        {/* Register Form Card */}
        <div className="bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-3xl shadow-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <UserPlus className="w-12 h-12 text-black mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-black mb-2">Create Account</h1>
            <p className="text-gray-700 text-sm">Please sign up to continue</p>
          </div>

          {/* Register Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Input */}
            <div className="relative">
              <div className={`flex items-center bg-white/60 backdrop-blur-sm rounded-2xl px-4 py-4 border transition-all ${
                errors.name 
                  ? 'border-red-500 focus-within:border-red-500 focus-within:ring-2 focus-within:ring-red-100' 
                  : 'border-gray-300/50 focus-within:border-black focus-within:ring-2 focus-within:ring-gray-200/50'
              }`}>
                <User className="w-5 h-5 text-black mr-3" />
                <input
                  type="text"
                  name="name"
                  placeholder="Name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="flex-1 bg-transparent outline-none text-black placeholder-gray-600"
                />
              </div>
              {errors.name && (
                <div className="flex items-center mt-1 text-red-500 text-sm">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.name}
                </div>
              )}
            </div>

            {/* Email Input */}
            <div className="relative">
              <div className={`flex items-center bg-white/60 backdrop-blur-sm rounded-2xl px-4 py-4 border transition-all ${
                errors.email 
                  ? 'border-red-500 focus-within:border-red-500 focus-within:ring-2 focus-within:ring-red-100' 
                  : 'border-gray-300/50 focus-within:border-black focus-within:ring-2 focus-within:ring-gray-200/50'
              }`}>
                <Mail className="w-5 h-5 text-black mr-3" />
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="flex-1 bg-transparent outline-none text-black placeholder-gray-600"
                />
              </div>
              {errors.email && (
                <div className="flex items-center mt-1 text-red-500 text-sm">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.email}
                </div>
              )}
            </div>

            {/* Password Input */}
            <div className="relative">
              <div className={`flex items-center bg-white/60 backdrop-blur-sm rounded-2xl px-4 py-4 border transition-all ${
                errors.password 
                  ? 'border-red-500 focus-within:border-red-500 focus-within:ring-2 focus-within:ring-red-100' 
                  : 'border-gray-300/50 focus-within:border-black focus-within:ring-2 focus-within:ring-gray-200/50'
              }`}>
                <Lock className="w-5 h-5 text-black mr-3" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="flex-1 bg-transparent outline-none text-black placeholder-gray-600"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-black hover:text-gray-600 transition-colors ml-2"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <div className="flex items-center mt-1 text-red-500 text-sm">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.password}
                </div>
              )}
            </div>

            {/* Confirm Password Input */}
            <div className="relative">
              <div className={`flex items-center bg-white/60 backdrop-blur-sm rounded-2xl px-4 py-4 border transition-all ${
                errors.confirmPassword 
                  ? 'border-red-500 focus-within:border-red-500 focus-within:ring-2 focus-within:ring-red-100' 
                  : 'border-gray-300/50 focus-within:border-black focus-within:ring-2 focus-within:ring-gray-200/50'
              }`}>
                <Lock className="w-5 h-5 text-black mr-3" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="flex-1 bg-transparent outline-none text-black placeholder-gray-600"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="text-black hover:text-gray-600 transition-colors ml-2"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <div className="flex items-center mt-1 text-red-500 text-sm">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.confirmPassword}
                </div>
              )}
            </div>

            {/* Forgot Password */}
            <div className="text-left">
              <button 
                type="button"
                className="text-black hover:text-gray-700 text-sm font-medium transition-colors"
              >
                Forgot password?
              </button>
            </div>

            {/* Create Account Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-black text-white font-semibold py-4 rounded-2xl hover:bg-gray-800 focus:outline-none focus:ring-4 focus:ring-gray-300/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {isLoading ? 'Please wait...' : 'Create Account'}
            </button>

            {/* Login Link */}
            <div className="text-center pt-4">
              <span className="text-gray-700 text-sm">Already have an account? </span>
              <button
                type="button"
                onClick={() => navigate('/')}
                className="text-black hover:text-gray-700 font-medium text-sm transition-colors underline"
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
