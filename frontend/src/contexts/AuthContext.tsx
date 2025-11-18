import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService, AuthResponse, LoginCredentials, RegisterCredentials } from '../services/authService';

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  tokenData: any;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  getTokenData: () => any;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [tokenData, setTokenData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Auto-logout function
  const performAutoLogout = useCallback(async () => {
    console.log('Cookie deleted - performing auto logout');
    try {
      await authService.logout();
    } catch (error) {
      console.error('Auto logout error:', error);
    } finally {
      setUser(null);
      setTokenData(null);
      navigate('/', { replace: true });
    }
  }, [navigate]);

  // Check cookie status
  const checkCookieStatus = useCallback(async () => {
    if (user && tokenData) {
      try {
        const response = await fetch('http://localhost:5001/api/auth/verify', {
          method: 'GET',
          credentials: 'include'
        });
        
        if (!response.ok) {
          performAutoLogout();
        }
      } catch (error) {
        performAutoLogout();
      }
    }
  }, [user, tokenData, performAutoLogout]);

  useEffect(() => {
    const initializeAuth = () => {
      try {
        const currentTokenData = authService.getTokenData();
        if (currentTokenData && authService.isAuthenticated()) {
          const userData = authService.getUserFromToken();
          if (userData) {
            setUser(userData);
            setTokenData(currentTokenData);
          }
        } else if (currentTokenData) {
          authService.removeTokenData();
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Cookie monitoring
  useEffect(() => {
    if (!user || !tokenData) return;

    const cookieCheckInterval = setInterval(() => {
      checkCookieStatus();
    }, 2000);

    return () => clearInterval(cookieCheckInterval);
  }, [user, tokenData, checkCookieStatus]);

  const login = async (credentials: LoginCredentials): Promise<void> => {
    try {
      setLoading(true);
      const response: AuthResponse = await authService.login(credentials);
      
      setUser(response.user);
      setTokenData(response.tokenData);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (credentials: RegisterCredentials): Promise<{ success: boolean; message: string }> => {
    try {
      setLoading(true);
      const result = await authService.register(credentials);
      
      return result;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await authService.logout();
      setUser(null);
      setTokenData(null);
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
      setUser(null);
      setTokenData(null);
      navigate('/', { replace: true });
    }
  };

  const getTokenData = () => {
    return authService.getTokenData();
  };

  const value: AuthContextType = {
    user,
    tokenData,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user && !!tokenData,
    getTokenData,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};