import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Button } from '@progress/kendo-react-buttons';
import { Input } from '@progress/kendo-react-inputs';
import { IntlProvider, LocalizationProvider } from '@progress/kendo-react-intl';
import Dashboard from './Dashboard';
import ContactUs from './components/ContactUs';
import Users from './components/Users';
import Admin from './Admin';
import Navbar from './components/Navbar';
import { UserProvider, useUser } from './components/UserContext.jsx';
import JWTDebugger from './components/JWTDebugger'; // Import the debugger component

import './App.css';

// Protected Route Component with useUser integration
const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useUser();
  
  // Show loading state while checking authentication
  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  
  // Redirect to login if no user found
  return currentUser ? children : <Navigate to="/login" replace />;
};

// Item Edit Form Component
const ItemForm = ({ item, onSubmit, onCancel }) => {
  const [name, setName] = useState(item?.name || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ ...item, name });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Name</label>
        <Input
          value={name}
          onChange={(e) => setName(e.value)}
          required
          className="mt-1"
        />
      </div>
      <div className="flex justify-end space-x-2">
        <Button onClick={onCancel} themeColor="light">
          Cancel
        </Button>
        <Button type="submit" themeColor="primary">
          Save
        </Button>
      </div>
    </form>
  );
};

// Login Component with useUser integration
const Login = () => {
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const { login, currentUser } = useUser();

  useEffect(() => {
    // Redirect if already logged in
    if (currentUser) {
      navigate('/');
    }
  }, [currentUser, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const username = formData.get('username');
    const password = formData.get('password');

    try {
      const response = await fetch('https://stinsondemo.com/api/v1/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        console.log(username);
        console.log(response.status);
        console.log(response.headers);
        throw new Error('Invalid credentials');
      }

      const data = await response.json();
      
      // Use the login function from context instead of directly setting localStorage
      login(data.token);
      
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
        </div>
        {error && (
          <div className="bg-red-50 border border-red-200 rounded p-4 text-red-600">
            {error}
          </div>
        )}
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">Email address</label>
              <input
                id="email"
                name="username"
                type="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Password"
              />
            </div>
          </div>

          <div>
            <Button
              type="submit"
              themeColor="primary"
              className="group relative w-full"
            >
              Sign in
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Debug Page Component
const DebugPage = () => {
  return (
    <div className="container mx-auto pt-20">
      <Navbar />
      <div className="p-4 mt-16">
        <h1 className="text-2xl font-bold mb-4">Authentication Debugging</h1>
        <JWTDebugger />
      </div>
    </div>
  );
};

// Public Layout Component
const PublicLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Navbar />
      <nav className="bg-white shadow mb-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold">Stinson Data LLC</h1>
            </div>
            <div className="flex items-center">
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          <h2 className="text-2xl font-bold mb-4">Welcome</h2>
          <p className="mb-4">Please login to manage your items.</p>
        </div>
      </main>
    </div>
  );
};

// Main App Component
const App = () => {
  return (
    <LocalizationProvider>
      <IntlProvider locale="en">
        {/* Wrap everything with UserProvider */}
        <UserProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<PublicLayout />} />
              <Route path="/login" element={<Login />} />
              <Route path="/contact" element={<ContactUs />} />
              
              {/* Debug Route */}
              <Route path="/debug" element={<DebugPage />} />
              
              {/* Protected Routes */}
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/users" element={<ProtectedRoute><Users /></ProtectedRoute>} />
              <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />

              {/* Catch all unmatched routes */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </UserProvider>
      </IntlProvider>
    </LocalizationProvider>
  );
};

export default App;