import React, { useState } from 'react';
import { Mail, Lock } from 'lucide-react';

interface LoginData {
  email: string;
  password: string;
}

interface LogingProps {
  onLogin?: (data: LoginData) => void;
  onRegisterClick?: () => void;
}

function loging({ onLogin, onRegisterClick }: LogingProps) {
  const [formData, setFormData] = useState<LoginData>({
    email: '',
    password: ''
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (onLogin) {
        await onLogin(formData);
      }
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Login Form Card */}
        <div className="bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-3xl shadow-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-black mb-2">Login</h1>
            <p className="text-gray-700 text-sm">Please sign in to continue</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Input */}
            <div className="relative">
              <div className="flex items-center bg-white/60 backdrop-blur-sm rounded-2xl px-4 py-4 border border-gray-300/50 focus-within:border-black focus-within:ring-2 focus-within:ring-gray-200/50 transition-all">
                <Mail className="w-5 h-5 text-black mr-3" />
                <input
                  type="email"
                  name="email"
                  placeholder="Email id"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="flex-1 bg-transparent outline-none text-black placeholder-gray-600"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="relative">
              <div className="flex items-center bg-white/60 backdrop-blur-sm rounded-2xl px-4 py-4 border border-gray-300/50 focus-within:border-black focus-within:ring-2 focus-within:ring-gray-200/50 transition-all">
                <Lock className="w-5 h-5 text-black mr-3" />
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="flex-1 bg-transparent outline-none text-black placeholder-gray-600"
                  required
                />
              </div>
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
                onClick={onRegisterClick}
                className="text-black hover:text-gray-700 font-medium text-sm transition-colors underline"
              >
                Register
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default loging;
