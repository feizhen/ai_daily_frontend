import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Home.css';

export const Home = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="home-container">
      <div className="home-card">
        <div className="home-header">
          <h1 className="home-title">Welcome, {user?.name}!</h1>
          <button onClick={handleLogout} className="btn btn-logout">
            Logout
          </button>
        </div>

        <div className="welcome-section">
          <div className="user-avatar">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="welcome-message">
            <h2>🎉 Login Successful!</h2>
            <p>Welcome to our full-stack application example</p>
            <p className="tech-stack">
              React + TypeScript + NestJS + PostgreSQL
            </p>
          </div>
        </div>

        <div className="user-info">
          <div className="info-item">
            <span className="info-label">Name</span>
            <span className="info-value">{user?.name}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Email</span>
            <span className="info-value">{user?.email}</span>
          </div>
          <div className="info-item">
            <span className="info-label">User ID</span>
            <span className="info-value">{user?.id}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Registration Date</span>
            <span className="info-value">
              {user?.createdAt
                ? new Date(user.createdAt).toLocaleString('en-US')
                : '-'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

