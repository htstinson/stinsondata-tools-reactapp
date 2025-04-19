import React, { createContext, useState, useEffect, useContext } from 'react';
import * as jwtDecode from 'jwt-decode';
import { current } from '@reduxjs/toolkit';

// Create a context to hold the user information
export const UserContext = createContext(null);

// Provider component that will wrap your application
export const UserProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get the token from localStorage on component mount
    const token = localStorage.getItem('token');
    
    if (token) {
      try {
        // Decode the JWT token to get user information
        const decodedToken = jwtDecode.jwtDecode(token);
       
        // Check if token is expired
        const currentTime = Date.now() / 1000;
        if (decodedToken.exp && decodedToken.exp < currentTime) {
          // Token is expired, clear it from localStorage
          localStorage.removeItem('token');
          setCurrentUser(null);
        } else {
          // Token is valid, set the user information
          setCurrentUser(decodedToken);
        }
      } catch (error) {
        console.error('Error decoding token:', error);
        localStorage.removeItem('jtoken');
      }
    }
    
    setLoading(false);
  }, []);

  // Function to handle user logout
  const logout = () => {
    localStorage.removeItem('token');
    setCurrentUser(null);
    window.location.href = '/'; // Redirect to login page after logout
  };

  // Function to handle user login
  const login = (token) => {
    localStorage.setItem('token', token);
    const decodedToken = jwtDecode.jwtDecode(token);
    console.log('ip_address', decodedToken.ip_address);
    setCurrentUser(decodedToken);
  };

  return (
    <UserContext.Provider value={{ currentUser, loading, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};

// Custom hook to use the user context
export const useUser = () => useContext(UserContext);