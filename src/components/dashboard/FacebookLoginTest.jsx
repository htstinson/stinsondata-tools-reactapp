import React, { useState, useEffect } from 'react';
import { Button } from '@progress/kendo-react-buttons'

const FacebookLoginTest = () => {
  const [loginResult, setLoginResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fbReady, setFbReady] = useState(false);

  useEffect(() => {
    // Check if Facebook SDK is loaded
    const checkFacebookSDK = () => {
      if (window.FB) {
        setFbReady(true);
      } else {
        // Wait a bit and check again
        setTimeout(checkFacebookSDK, 100);
      }
    };
    
    checkFacebookSDK();
  }, []);

  const handleFacebookLogin = () => {
    if (!window.FB) {
      setLoginResult({
        success: false,
        error: 'Facebook SDK not loaded'
      });
      return;
    }

    setIsLoading(true);
    setLoginResult(null);

    window.FB.login((response) => {
      setIsLoading(false);
      
      if (response.authResponse) {
        // Login successful
        setLoginResult({
          success: true,
          accessToken: response.authResponse.accessToken,
          userID: response.authResponse.userID,
          expiresIn: response.authResponse.expiresIn,
          signedRequest: response.authResponse.signedRequest
        });
      } else {
        // Login failed or cancelled
        setLoginResult({
          success: false,
          error: response.status || 'Login cancelled or failed'
        });
      }
    }, {
      scope: 'email,public_profile' // Request basic permissions
    });
  };

  const handleLogout = () => {
    if (window.FB) {
      window.FB.logout(() => {
        setLoginResult(null);
      });
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h2>Facebook Login Test</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <p>Facebook SDK Status: {fbReady ? '✅ Ready' : '⏳ Loading...'}</p>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <Button 
          onClick={handleFacebookLogin}
          disabled={!fbReady || isLoading}
          primary={true}
          style={{ marginRight: '10px' }}
        >
          {isLoading ? 'Logging in...' : 'Login with Facebook'}
        </Button>
        
        {loginResult?.success && (
          <Button 
            onClick={handleLogout}
            fillMode="outline"
          >
            Logout
          </Button>
        )}
      </div>

      {loginResult && (
        <div style={{ 
          padding: '15px', 
          border: '1px solid #ccc', 
          borderRadius: '5px',
          backgroundColor: loginResult.success ? '#d4edda' : '#f8d7da',
          borderColor: loginResult.success ? '#c3e6cb' : '#f5c6cb'
        }}>
          <h3>{loginResult.success ? 'Login Successful!' : 'Login Failed'}</h3>
          
          {loginResult.success ? (
            <div>
              <p><strong>Access Token:</strong></p>
              <div style={{ 
                backgroundColor: '#f8f9fa', 
                padding: '10px', 
                borderRadius: '3px',
                fontSize: '12px',
                wordBreak: 'break-all',
                fontFamily: 'monospace'
              }}>
                {loginResult.accessToken}
              </div>
              
              <p style={{ marginTop: '10px' }}>
                <strong>User ID:</strong> {loginResult.userID}
              </p>
              <p>
                <strong>Expires In:</strong> {loginResult.expiresIn} seconds
              </p>
              {loginResult.signedRequest && (
                <p>
                  <strong>Signed Request:</strong> {loginResult.signedRequest.substring(0, 50)}...
                </p>
              )}
            </div>
          ) : (
            <div>
              <p><strong>Error:</strong> {loginResult.error}</p>
            </div>
          )}
        </div>
      )}

      <div style={{ marginTop: '30px', fontSize: '12px', color: '#666' }}>
        <h4>Test Instructions:</h4>
        <ul>
          <li>Make sure you're testing with a Facebook account that has access to your app</li>
          <li>If testing in development, ensure your domain is added to Facebook App settings</li>
          <li>The token displayed above is a real access token - don't share it publicly</li>
        </ul>
      </div>
    </div>
  );
};

export default FacebookLoginTest;