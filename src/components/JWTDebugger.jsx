import React, { useState, useEffect } from 'react';
import { useUser } from './UserContext';
import { Button } from '@progress/kendo-react-buttons';

const JWTDebugger = () => {
  const [localToken, setLocalToken] = useState(null);
  const [decodedToken, setDecodedToken] = useState(null);
  const [error, setError] = useState(null);
  const { currentUser, login, logout } = useUser();

  useEffect(() => {
    // Get token from localStorage
    const token = localStorage.getItem('token');
    setLocalToken(token);

    if (token) {
      try {
        // Basic manual decoding for display
        const payload = token.split('.')[1];
        const decoded = JSON.parse(atob(payload));
        setDecodedToken(decoded);
      } catch (err) {
        setError("Invalid token format");
      }
    }
  }, []);

  const handleClearToken = () => {
    localStorage.removeItem('token');
    setLocalToken(null);
    setDecodedToken(null);
    logout();
  };

  const handleTestToken = () => {
    // Create a test token (this is just for debugging, not secure)
    const testPayload = {
      name: "Test User",
      email: "test@example.com",
      username: "testuser",
      exp: Math.floor(Date.now() / 1000) + 3600 // 1 hour
    };
    
    // Create a simple encoded token
    const header = btoa(JSON.stringify({ alg: "none", typ: "JWT" }));
    const payload = btoa(JSON.stringify(testPayload));
    const testToken = `${header}.${payload}.testsignature`;
    
    localStorage.setItem('token', testToken);
    setLocalToken(testToken);
    setDecodedToken(testPayload);
    login(testToken);
  };

  return (
    <div className="p-4 border rounded-lg bg-white shadow-md max-w-lg mx-auto mt-4">
      <h2 className="text-xl font-bold mb-4">JWT Token Debugger</h2>
      
      <div className="mb-4">
        <h3 className="font-semibold">Current User Context:</h3>
        <pre className="bg-gray-100 p-2 rounded overflow-auto max-h-40 text-xs">
          {JSON.stringify(currentUser, null, 2) || "No user in context"}
        </pre>
      </div>
      
      <div className="mb-4">
        <h3 className="font-semibold">Token in localStorage:</h3>
        {localToken ? (
          <div className="bg-gray-100 p-2 rounded">
            <p className="overflow-auto text-xs break-all">{localToken}</p>
          </div>
        ) : (
          <p className="text-red-500">No token found</p>
        )}
      </div>
      
      {decodedToken && (
        <div className="mb-4">
          <h3 className="font-semibold">Decoded Token:</h3>
          <pre className="bg-gray-100 p-2 rounded overflow-auto max-h-40 text-xs">
            {JSON.stringify(decodedToken, null, 2)}
          </pre>
          
          <div className="mt-2">
            <h4 className="font-semibold">Token Status:</h4>
            {decodedToken.exp && decodedToken.exp * 1000 < Date.now() ? (
              <p className="text-red-500">Token expired</p>
            ) : (
              <p className="text-green-500">
                Token valid until {decodedToken.exp ? new Date(decodedToken.exp * 1000).toLocaleString() : 'no expiration'}
              </p>
            )}
          </div>
        </div>
      )}
      
      {error && (
        <div className="text-red-500 mb-4">{error}</div>
      )}
      
      <div className="flex space-x-2">
        <Button 
          onClick={handleClearToken}
          themeColor="error"
        >
          Clear Token
        </Button>
        <Button 
          onClick={handleTestToken}
          themeColor="primary"
        >
          Create Test Token
        </Button>
      </div>
      
      <div className="mt-4 p-2 bg-yellow-100 rounded text-sm">
        <p><strong>Note:</strong> This component is for debugging only. 
        Add it temporarily to any page to debug user authentication issues.</p>
      </div>
    </div>
  );
};

export default JWTDebugger;