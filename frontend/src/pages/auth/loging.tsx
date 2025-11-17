import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, AlertCircle, Eye, EyeOff, LogIn } from 'lucide-react';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

// Zod schema for login validation
const loginSchema = z.object({
  email: z.string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z.string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters long'),
});

interface LoginData {
  email: string;
  password: string;
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
    password: ''
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [showPassword, setShowPassword] = useState(false);

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
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="w-full max-w-120">
        {/* Login Form Card */}
        <div className="bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-3xl shadow-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <LogIn className="w-12 h-12 text-black mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-black mb-2">Login</h1>
            <p className="text-gray-700 text-sm">Please sign in to continue</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">

            
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

            {/* Forgot Password */}
            <div className="text-left">
              <button 
                type="button"
                className="text-black hover:text-gray-700 text-sm font-medium transition-colors"
              >
                Forgot password?
              </button>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-black text-white font-semibold py-4 rounded-2xl hover:bg-gray-800 focus:outline-none focus:ring-4 focus:ring-gray-300/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {isLoading ? 'Please wait...' : 'Login'}
            </button>

            {/* Register Link */}
            <div className="text-center pt-4">
              <span className="text-gray-700 text-sm">Don't have an account? </span>
              <button
                type="button"
                onClick={() => navigate('/signup')}
                className="text-black hover:text-gray-700 font-medium text-sm transition-colors underline"
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
