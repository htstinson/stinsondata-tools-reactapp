import React, { useState, useEffect } from 'react';
import { Button } from '@progress/kendo-react-buttons';
import { Input } from '@progress/kendo-react-inputs';
import { Error } from '@progress/kendo-react-labels';
import { useNavigate } from 'react-router-dom';
import Navbar from '../Navbar';

export const Profile = () => {
  const navigate = useNavigate();
  
  const [user, setUser] = useState({ username: '', ip_address: '' });
  const [username, setName] = useState('');
  const [ipAddress, setIpAddress] = useState('');
  const [ipError, setIpError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      let url = 'https://stinsondemo.com/api/v1/profile';
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
          throw new Error('Session expired. Please login again.');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const jsonData = await response.json();
      
      // If we get profile data, update the form
      if (jsonData.username || jsonData.ip_address) {
        setName(jsonData.username || '');
        setIpAddress(jsonData.ip_address || '');
        setUser(jsonData);
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const validateIpAddress = (ip) => {
    // IPv4 regex pattern
    const ipv4Pattern = /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    return ipv4Pattern.test(ip);
  };

  const handleIpChange = (e) => {
    const value = e.value;
    setIpAddress(value);
    
    if (value && !validateIpAddress(value)) {
      setIpError('Please enter a valid IPv4 address (e.g. 192.168.1.1)');
    } else {
      setIpError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (ipAddress && !validateIpAddress(ipAddress)) {
      setIpError('Please enter a valid IPv4 address (e.g. 192.168.1.1)');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      const updatedUser = { 
        username, 
        ip_address: ipAddress 
      };
      
      // If the user has an ID, include it in the request
      if (user.id) {
        updatedUser.id = user.id;
      }
      
      const response = await fetch(`https://stinsondemo.com/api/v1/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedUser)
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
          throw new Error('Session expired. Please login again.');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const jsonData = await response.json();
      setUser(jsonData);
      setName(jsonData.username || '');
      setIpAddress(jsonData.ip_address || '');
      setSuccessMessage('Profile updated successfully!');
      
      // Clear the success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
      
    } catch (err) {
      setError(err.message);
      console.error('Error updating profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setName(user.username || '');
    setIpAddress(user.ip_address || '');
    setIpError('');
    setSuccessMessage('');
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <Navbar />
      <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
        <Button onClick={fetchData} themeColor="light">Refresh</Button>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">User Information</h1>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}
        
        {successMessage && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
            {successMessage}
          </div>
        )}
        
        {loading ? (
          <div>Loading...</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <Input
                value={username}
                onChange={(e) => setName(e.value)}
                required
                className="mt-1 w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">IP Address</label>
              <Input
                value={ipAddress}
                onChange={handleIpChange}
                placeholder="e.g. 192.168.1.1"
                className="mt-1 w-full"
                valid={!ipError}
              />
              {ipError && <Error>{ipError}</Error>}
            </div>
            <div className="flex justify-between pt-4">
              <Button onClick={handleReset} type="button" themeColor="light">
                Reset
              </Button>
              <Button type="submit" themeColor="primary" disabled={loading}>
                Save
              </Button>
            </div>
          </form>
        )}
        
        {user.username && (
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Current User</h2>
            <div className="bg-gray-50 p-4 rounded">
              <p><strong>Name:</strong> {user.username}</p>
              <p><strong>IP Address:</strong> {user.ip_address}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;