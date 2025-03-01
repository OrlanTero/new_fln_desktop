import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navigation from './Navigation';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Get initials for avatar fallback
  const getInitials = (name) => {
    return name
      ?.split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase() || '?';
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top Navigation Bar */}
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link to="/dashboard" className="flex flex-col items-center">
                  <span className="text-xl font-bold text-indigo-600">FLN Services</span>
                  <span className="text-sm text-gray-500">Corporation</span>
                </Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                {user?.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.name}
                    className="h-8 w-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {getInitials(user?.name)}
                    </span>
                  </div>
                )}
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-700">
                    {user?.name || 'User'}
                  </span>
                  <span className="text-xs text-gray-500">
                    {user?.email}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="ml-4 inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Area with Navigation */}
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Sidebar Navigation */}
        <Navigation />
        
        {/* Main Content */}
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout; 