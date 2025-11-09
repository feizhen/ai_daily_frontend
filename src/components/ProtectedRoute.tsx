import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * Protected route wrapper that redirects to home if not authenticated
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        fontSize: '18px',
        color: '#666'
      }}>
        <div>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #667eea',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }}></div>
          Loading...
        </div>
      </div>
    );
  }

  // Show login prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: '20px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '40px',
          maxWidth: '400px',
          width: '100%',
          textAlign: 'center',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
        }}>
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>🔒</div>
          <h1 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '12px' }}>
            Admin Access Required
          </h1>
          <p style={{ color: '#666', marginBottom: '24px' }}>
            Please sign in with an admin account to access this page
          </p>
          <Button
            onClick={() => window.location.href = '/'}
            className="w-full"
            size="lg"
          >
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  // Check if user has admin role
  if (user?.role !== 'admin') {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: '20px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '40px',
          maxWidth: '400px',
          width: '100%',
          textAlign: 'center',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
        }}>
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>⛔</div>
          <h1 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '12px' }}>
            Access Denied
          </h1>
          <p style={{ color: '#666', marginBottom: '24px' }}>
            You don't have permission to access this page. Admin role is required.
          </p>
          <Button
            onClick={() => window.location.href = '/'}
            className="w-full"
            size="lg"
          >
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  // Render children if authenticated and has admin role
  return <>{children}</>;
};

export default ProtectedRoute;
