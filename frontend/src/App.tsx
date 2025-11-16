// DemoPage was previously used directly; routes now point to UsersTable and NewlyAddedUsersTable
import { Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect } from 'react';
import NewlyAddedUsersTable from './pages/pageA/users';
import UsersTable from './pages/pageB/products';
import AdminDashboard from './pages/admin/Dashboard';
import Layout from './components/layout/layout';
import NotFound from './pages/NotFound/NotFound';
import LoginPage from './pages/auth/loging';
import SignupPage from './pages/auth/signup';
import UserProfile from './components/user-profile/profile';
import ErrorBoundary from './components/ErrorBoundary';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { PublicRoute } from './components/auth/PublicRoute';
import { Toaster } from 'sonner';
import { useSocket } from './hooks/useSocket';

// Create QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  // Initialize Socket.IO connection
  useSocket();

  // Check for cookies on page refresh and logout if missing
  useEffect(() => {
    const checkCookiesOnRefresh = async () => {
      const hasLocalStorageToken = localStorage.getItem('token_data');
      
      if (hasLocalStorageToken) {
        try {
          // Check if httpOnly cookie exists by making a request
          const response = await fetch('http://localhost:5000/api/auth/verify', {
            method: 'GET',
            credentials: 'include'
          });
          
          if (!response.ok) {
            // Cookie missing or invalid - logout
            localStorage.removeItem('token_data');
            sessionStorage.clear();
            window.location.href = '/';
          }
        } catch (error) {
          // Network error or cookie missing - logout
          localStorage.removeItem('token_data');
          sessionStorage.clear();
          window.location.href = '/';
        }
      }
    };

    checkCookiesOnRefresh();
  }, []);

  return (
    <ErrorBoundary>
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <Toaster
            position="bottom-right"
            duration={4000}
            toastOptions={{
              style: {
                padding: '16px',
                fontSize: '14px',
              },
            }}
          />

          <Routes>
            <Route 
              path="/" 
              element={
                <PublicRoute>
                  <LoginPage />
                </PublicRoute>
              } 
            />
            <Route 
              path="/signup" 
              element={
                <PublicRoute>
                  <SignupPage />
                </PublicRoute>
              } 
            />

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Layout>
                    <AdminDashboard />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/products"
              element={
                <ProtectedRoute>
                  <Layout>
                    <UsersTable />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/users"
              element={
                <ProtectedRoute>
                  <Layout>
                    <NewlyAddedUsersTable />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Layout>
                    <UserProfile />
                  </Layout>
                </ProtectedRoute>
              }
            />
            {/* Catch-all route for 404 errors */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </QueryClientProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
