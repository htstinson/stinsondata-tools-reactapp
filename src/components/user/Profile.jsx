import React, { useState, useEffect } from 'react';
import { Button } from '@progress/kendo-react-buttons';
import { Input } from '@progress/kendo-react-inputs';
import { Error } from '@progress/kendo-react-labels';
import { useNavigate } from 'react-router-dom';
import PageLayout from '../PageLayout.jsx';
import { api } from '../../api';

const IMG2 = api.cdn('/bg2.jpeg');

export const Profile = () => {
  const navigate = useNavigate();

  const [user, setUser]             = useState({ username: '', ip_address: '' });
  const [username, setName]         = useState('');
  const [ipAddress, setIpAddress]   = useState('');
  const [ipError, setIpError]       = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const jsonData = await api.get('/api/v1/profile');
      if (jsonData.username || jsonData.ip_address) {
        setName(jsonData.username || '');
        setIpAddress(jsonData.ip_address || '');
        setUser(jsonData);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const validateIpAddress = (ip) => {
    const ipv4Pattern = /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    return ipv4Pattern.test(ip);
  };

  const handleIpChange = (e) => {
    const value = e.value;
    setIpAddress(value);
    setIpError(value && !validateIpAddress(value)
      ? 'Please enter a valid IPv4 address (e.g. 192.168.1.1)'
      : '');
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
      if (!token) throw new Error('No authentication token found');

      const updatedUser = { username, ip_address: ipAddress };
      if (user.id) updatedUser.id = user.id;

      const response = await fetch(`https://thousandhillsdigital.net/api/v1/users/${user.id}`, {
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
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.message);
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
    <PageLayout bgImage={IMG2} bgOpacity={0.7}>
      <div className="py-18 px-4 sm:px-6 lg:px-8">

        <h1 className="text-2xl font-bold mb-6 text-center" style={{ color: 'var(--color-text-primary)' }}>
          My Profile
        </h1>

        <div className="max-w-md mx-auto p-8 rounded-lg shadow-md"
          style={{ background: 'var(--color-form-background)' }}>

          {error && (
            <div className="mb-4 p-3 rounded bg-red-100 text-red-700">{error}</div>
          )}
          {successMessage && (
            <div className="mb-4 p-3 rounded bg-green-100 text-green-700">{successMessage}</div>
          )}

          {loading ? (
            <div style={{ color: 'var(--color-text-primary)' }}>Loading...</div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1"
                  style={{ color: 'var(--color-text-primary)' }}>
                  Name
                </label>
                <Input
                  value={username}
                  onChange={(e) => setName(e.value)}
                  required
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1"
                  style={{ color: 'var(--color-text-primary)' }}>
                  IP Address
                </label>
                <Input
                  value={ipAddress}
                  onChange={handleIpChange}
                  placeholder="e.g. 192.168.1.1"
                  className="w-full"
                  valid={!ipError}
                />
                {ipError && <Error>{ipError}</Error>}
              </div>

              <div className="flex justify-between pt-4">
                <Button type="button" themeColor="light" onClick={handleReset}>Reset</Button>
                <Button type="button" themeColor="light" onClick={fetchData}>Refresh</Button>
                <Button type="submit" themeColor="primary" disabled={loading}>Save</Button>
              </div>
            </form>
          )}

          {user.username && (
            <div className="mt-8 pt- border-t border-gray-200">
              <h2 className="text-lg font-semibold mb-3"
                style={{ color: 'var(--color-text-primary)' }}>
                Current User
              </h2>
              <div className="p-4 rounded" style={{ background: 'var(--color-surface)' }}>
                <p style={{ color: 'var(--color-text-primary)' }}>
                  <strong>Name:</strong> {user.username}
                </p>
                <p style={{ color: 'var(--color-text-primary)' }}>
                  <strong>IP Address:</strong> {user.ip_address}
                </p>
              </div>
            </div>
          )}

        </div>
      </div>
    </PageLayout>
  );
};

export default Profile;